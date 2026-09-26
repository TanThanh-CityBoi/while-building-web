const DEFAULT_TIMEOUT_MS = 5_000;

/** API base URL without a trailing slash. Empty when `VITE_API_URL` is not set. */
export const apiBaseUrl = (import.meta.env.VITE_API_URL ?? '').trim().replace(/\/+$/, '');

export const isApiConfigured = apiBaseUrl !== '';

export class ApiError extends Error {
  readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

interface RequestOptions {
  signal?: AbortSignal;
  timeoutMs?: number;
}

/**
 * GET a JSON resource from the API. Rejects on network errors, timeouts,
 * and non-2xx responses so callers (React Query) can treat them uniformly.
 */
export async function apiGet<T>(
  path: string,
  { signal, timeoutMs = DEFAULT_TIMEOUT_MS }: RequestOptions = {},
): Promise<T> {
  if (!isApiConfigured) {
    throw new ApiError('VITE_API_URL is not configured.');
  }

  const timeout = AbortSignal.timeout(timeoutMs);
  const response = await fetch(`${apiBaseUrl}${path}`, {
    headers: { Accept: 'application/json' },
    signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
  });

  if (!response.ok) {
    throw new ApiError(`GET ${path} failed with status ${response.status}.`, response.status);
  }

  // Trusts the API contract; add runtime validation here if responses become complex.
  return (await response.json()) as T;
}
