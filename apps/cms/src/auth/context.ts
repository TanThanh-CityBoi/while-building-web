import { createContext } from 'react';
import type { ApiClient } from '@while-building/api-client';
import type { AuthUser, LoginCredentials, Permission } from '@while-building/types';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated' | 'error';

/**
 * Why the current session ended, if it did:
 * - `expired`: the access token could not be refreshed mid-session.
 * - `logout`: the user signed out.
 * - `logout-incomplete`: signed out locally, but the API couldn't be reached to end the session.
 */
export type SignOutReason = 'expired' | 'logout' | 'logout-incomplete';

export interface AuthContextValue {
  status: AuthStatus;
  user: AuthUser | null;
  isAuthenticated: boolean;
  /** True while the session is being restored on startup. */
  isLoading: boolean;
  /** Why restoring the session failed (e.g. the API is unreachable) when `status` is `error`. */
  error: unknown;
  /** Set when a session ends; cleared on the next successful login. */
  signOutReason: SignOutReason | null;
  login(credentials: LoginCredentials): Promise<AuthUser>;
  /** Always signs out locally; `serverConfirmed` is false if the API call failed. */
  logout(): Promise<{ serverConfirmed: boolean }>;
  /** Re-runs session restoration (refresh cookie → current user). */
  refreshSession(): Promise<void>;
  /** UX only — the API enforces every permission itself. */
  can(permission: Permission): boolean;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

/** The part of the API client the auth layer needs (lets tests pass a fake). */
export interface AuthClient {
  auth: Pick<ApiClient['auth'], 'login' | 'logout' | 'restoreSession'>;
  session: ApiClient['session'];
}

export const sessionQueryKey = ['auth', 'session'] as const;
