import { createAuthApi } from './endpoints/auth';
import { createHealthApi } from './endpoints/health';
import { createUsersApi } from './endpoints/users';
import { createHttpClient, type HttpClientConfig } from './http';

export type ApiClientConfig = HttpClientConfig;

/**
 * Creates the API client. Each app creates exactly one instance (see `src/lib/api.ts` in each app).
 *
 * Public site:  `createApiClient({ baseUrl })`
 * CMS:          `createApiClient({ baseUrl, credentials: 'include', refreshOnUnauthorized: true })`
 */
export function createApiClient(config: ApiClientConfig) {
  const http = createHttpClient(config);

  return {
    baseUrl: http.baseUrl,
    isConfigured: http.isConfigured,
    auth: createAuthApi(http),
    users: createUsersApi(http),
    health: createHealthApi(http),
    session: {
      /** Notified when a mid-session refresh fails (the user must sign in again). */
      onExpired: http.onSessionExpired,
    },
  };
}

export type ApiClient = ReturnType<typeof createApiClient>;
