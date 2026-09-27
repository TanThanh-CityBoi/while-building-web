import type { AuthTokenResponse } from '@while-building/types';
import { joinUrl, toQueryString, trimTrailingSlash, type QueryParams } from '@while-building/utils';
import { ApiError, isApiError } from './errors';

export interface HttpClientConfig {
  /** Base URL of while-building-api, e.g. `import.meta.env.VITE_API_URL`. */
  baseUrl: string | undefined;
  /**
   * `'include'` sends cookies to the API origin — required for the httpOnly refresh cookie.
   * The API must then answer with `Access-Control-Allow-Credentials: true`. Defaults to `'same-origin'`.
   */
  credentials?: RequestCredentials;
  /** On a 401, refresh the session once (single-flight) and retry the request. */
  refreshOnUnauthorized?: boolean;
  timeoutMs?: number;
  /** Injectable for tests. */
  fetch?: typeof fetch;
}

export type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

export interface RequestOptions {
  method?: HttpMethod;
  query?: QueryParams;
  body?: unknown;
  signal?: AbortSignal;
  /** Never refresh-and-retry this request (used by the auth endpoints themselves). */
  skipAuthRefresh?: boolean;
}

export interface HttpClient {
  readonly baseUrl: string;
  readonly isConfigured: boolean;
  request<T>(path: string, options?: RequestOptions): Promise<T>;
  /** Exchanges the refresh cookie for a new session. Resolves `false` if there is no valid session. */
  refreshSession(): Promise<boolean>;
  setAccessToken(token: string | null): void;
  /** Called when a refresh fails mid-session. Returns an unsubscribe function. */
  onSessionExpired(listener: () => void): () => void;
}

const DEFAULT_TIMEOUT_MS = 10_000;

export function createHttpClient(config: HttpClientConfig): HttpClient {
  const baseUrl = trimTrailingSlash(config.baseUrl?.trim() ?? '');
  const isConfigured = baseUrl !== '';
  const fetchImpl = config.fetch ?? ((input, init) => globalThis.fetch(input, init));
  const timeoutMs = config.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  // The access token lives in memory only. The refresh token is an httpOnly cookie the
  // browser sends to /auth/refresh — it is never readable by (or stored from) JavaScript.
  let accessToken: string | null = null;
  let refreshInFlight: Promise<boolean> | null = null;
  const expiredListeners = new Set<() => void>();

  async function send<T>(path: string, options: RequestOptions): Promise<T> {
    if (!isConfigured) {
      throw new ApiError({
        kind: 'config',
        message: 'The API URL is not configured (set VITE_API_URL).',
      });
    }

    const headers: Record<string, string> = { Accept: 'application/json' };
    if (options.body !== undefined) headers['Content-Type'] = 'application/json';
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

    const timeout = AbortSignal.timeout(timeoutMs);
    let response: Response;
    try {
      response = await fetchImpl(joinUrl(baseUrl, path) + toQueryString(options.query), {
        method: options.method ?? 'GET',
        headers,
        body: options.body === undefined ? undefined : JSON.stringify(options.body),
        credentials: config.credentials ?? 'same-origin',
        signal: options.signal ? AbortSignal.any([options.signal, timeout]) : timeout,
      });
    } catch (error) {
      // Caller cancellation (e.g. React Query) must stay an AbortError so it's not shown as a failure.
      if (options.signal?.aborted) throw error;
      if (timeout.aborted) {
        throw new ApiError({
          kind: 'timeout',
          message: 'The API took too long to respond.',
          cause: error,
        });
      }
      throw new ApiError({
        kind: 'network',
        message: `Could not reach the API at ${baseUrl}.`,
        cause: error,
      });
    }

    const text = await response.text();
    const body = text ? parseJson(text) : undefined;
    if (!response.ok) throw ApiError.fromResponse(response.status, body);
    return body as T;
  }

  function refreshSession(): Promise<boolean> {
    // Single-flight: concurrent 401s (or StrictMode double effects) share one refresh call,
    // which matters when the backend rotates refresh tokens.
    refreshInFlight ??= send<AuthTokenResponse | undefined>('/auth/refresh', {
      method: 'POST',
      skipAuthRefresh: true,
    })
      .then((result) => {
        accessToken = result?.accessToken ?? null;
        return true;
      })
      .catch((error: unknown) => {
        if (isApiError(error) && (error.status === 401 || error.status === 403)) {
          accessToken = null;
          return false;
        }
        throw error; // Network problems are not a logout.
      })
      .finally(() => {
        refreshInFlight = null;
      });
    return refreshInFlight;
  }

  async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    try {
      return await send<T>(path, options);
    } catch (error) {
      const canRefresh =
        config.refreshOnUnauthorized && !options.skipAuthRefresh && isApiError(error);
      if (!canRefresh || error.status !== 401) throw error;

      if (!(await refreshSession())) {
        expiredListeners.forEach((listener) => listener());
        throw error;
      }
      return send<T>(path, options);
    }
  }

  return {
    baseUrl,
    isConfigured,
    request,
    refreshSession,
    setAccessToken(token) {
      accessToken = token;
    },
    onSessionExpired(listener) {
      expiredListeners.add(listener);
      return () => expiredListeners.delete(listener);
    },
  };
}

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
