import { createApiClient } from '@while-building/api-client';

/**
 * The CMS's API client. Sends cookies (the httpOnly refresh cookie) and transparently refreshes
 * the in-memory access token once when a request comes back 401.
 */
export const api = createApiClient({
  baseUrl: import.meta.env.VITE_API_URL,
  credentials: 'include',
  refreshOnUnauthorized: true,
});
