import { createAiApi } from './endpoints/ai';
import { createArticlesApi } from './endpoints/articles';
import { createAuthApi } from './endpoints/auth';
import { createContentArticlesApi } from './endpoints/content-articles';
import { createHealthApi } from './endpoints/health';
import { createUsersApi } from './endpoints/users';
import { createHttpClient, type HttpClientConfig } from './http';

export interface ApiClientConfig extends HttpClientConfig {
  /** Base URL of the assistant (`apps/ai`), e.g. `import.meta.env.VITE_AI_URL`. CMS only. */
  aiBaseUrl?: string;
}

/**
 * Creates the API client. Each app creates exactly one instance (see `src/lib/api.ts` in each app).
 *
 * Public site:  `createApiClient({ baseUrl })`
 * CMS:          `createApiClient({ baseUrl, aiBaseUrl, credentials: 'include', refreshOnUnauthorized: true })`
 */
export function createApiClient(config: ApiClientConfig) {
  const http = createHttpClient(config);

  return {
    baseUrl: http.baseUrl,
    isConfigured: http.isConfigured,
    auth: createAuthApi(http),
    users: createUsersApi(http),
    /** Published articles (public site). */
    articles: createArticlesApi(http),
    /** Content management (CMS). */
    content: { articles: createContentArticlesApi(http) },
    health: createHealthApi(http),
    ai: createAiApi(http, config.aiBaseUrl),
    session: {
      /** Notified when a mid-session refresh fails (the user must sign in again). */
      onExpired: http.onSessionExpired,
    },
  };
}

export type ApiClient = ReturnType<typeof createApiClient>;
