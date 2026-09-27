import type {
  ApiResponse,
  AuthTokenResponse,
  AuthUser,
  LoginCredentials,
} from '@while-building/types';
import { isApiError } from '../errors';
import type { HttpClient } from '../http';

interface CallOptions {
  signal?: AbortSignal;
}

export function createAuthApi(http: HttpClient) {
  async function me({ signal }: CallOptions = {}): Promise<AuthUser> {
    const response = await http.request<ApiResponse<AuthUser>>('/auth/me', { signal });
    return response.data;
  }

  return {
    /** `POST /auth/login`, then `GET /auth/me` so callers always get permissions. */
    async login(credentials: LoginCredentials): Promise<AuthUser> {
      const result = await http.request<AuthTokenResponse | undefined>('/auth/login', {
        method: 'POST',
        body: credentials,
        skipAuthRefresh: true,
      });
      http.setAccessToken(result?.accessToken ?? null);
      return me();
    },

    /**
     * `POST /auth/logout`. The backend identifies the session by its refresh cookie and clears it.
     * The in-memory token is dropped even if the request fails.
     */
    async logout(): Promise<void> {
      try {
        await http.request<void>('/auth/logout', { method: 'POST', skipAuthRefresh: true });
      } finally {
        http.setAccessToken(null);
      }
    },

    /** `GET /auth/me` (refreshes the session once if the access token has expired). */
    me,

    /**
     * Restores a session on app start: refresh cookie → access token → current user.
     * Resolves `null` when there is no valid session; rejects on network/server errors.
     */
    async restoreSession({ signal }: CallOptions = {}): Promise<AuthUser | null> {
      if (!(await http.refreshSession())) return null;
      try {
        const response = await http.request<ApiResponse<AuthUser>>('/auth/me', {
          signal,
          skipAuthRefresh: true,
        });
        return response.data;
      } catch (error) {
        if (isApiError(error) && error.status === 401) return null;
        throw error;
      }
    },
  };
}

export type AuthApi = ReturnType<typeof createAuthApi>;
