import { createApiClient } from '@while-building/api-client';

/**
 * The CMS's API client. Sends cookies (the httpOnly refresh cookie) and transparently refreshes
 * the in-memory access token once when a request comes back 401. The assistant (`api.ai`) lives
 * at its own URL and reuses the same access token.
 */
export const api = createApiClient({
  baseUrl: import.meta.env.VITE_API_URL,
  aiBaseUrl: import.meta.env.VITE_AI_URL,
  credentials: 'include',
  refreshOnUnauthorized: true,
});
