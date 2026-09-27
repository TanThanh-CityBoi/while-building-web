import { createApiClient } from '@while-building/api-client';

/**
 * The public site's API client. No credentials: the public site never needs a session,
 * so it works even when the API only allows credentialed requests from the CMS origin.
 */
export const api = createApiClient({ baseUrl: import.meta.env.VITE_API_URL });
