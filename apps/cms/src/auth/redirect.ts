import type { Location } from 'react-router';

export const DEFAULT_AUTHENTICATED_PATH = '/dashboard';

export interface LoginLocationState {
  /** The protected page the user tried to open before being sent to /login. */
  from?: Pick<Location, 'pathname' | 'search' | 'hash'>;
}

/** Where to go after signing in: back to the requested page, or the dashboard. */
export function getPostLoginPath(state: unknown): string {
  const from = (state as LoginLocationState | null)?.from;
  // Only same-app paths; never bounce back to /login itself.
  if (!from?.pathname?.startsWith('/') || from.pathname.startsWith('//')) {
    return DEFAULT_AUTHENTICATED_PATH;
  }
  if (from.pathname === '/login') return DEFAULT_AUTHENTICATED_PATH;
  return `${from.pathname}${from.search ?? ''}${from.hash ?? ''}`;
}
