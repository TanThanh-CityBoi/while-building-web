import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { AuthUser, LoginCredentials, Permission } from '@while-building/types';
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  AuthContext,
  sessionQueryKey,
  type AuthClient,
  type AuthContextValue,
  type AuthStatus,
  type SignOutReason,
} from './context';
import { hasPermission } from './permissions';

interface AuthProviderProps {
  api: AuthClient;
  children: ReactNode;
}

/**
 * Owns the CMS session. The current user is React Query server state (`['auth', 'session']`),
 * restored once on startup from the httpOnly refresh cookie. Nothing auth-related is persisted
 * in localStorage/sessionStorage.
 */
export function AuthProvider({ api, children }: AuthProviderProps) {
  const queryClient = useQueryClient();
  // React state (not the query cache) so a sign-out takes effect in the very next render;
  // React Query notifies observers asynchronously, which would briefly leave the old user around.
  const [signOutReason, setSignOutReason] = useState<SignOutReason | null>(null);

  const session = useQuery({
    queryKey: sessionQueryKey,
    queryFn: ({ signal }) => api.auth.restoreSession({ signal }),
    staleTime: Infinity,
    gcTime: Infinity,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  /** Forget the user and every cached server response (users, content…). */
  const clearClientState = useCallback(() => {
    queryClient.setQueryData<AuthUser | null>(sessionQueryKey, null);
    queryClient.removeQueries({ predicate: (query) => query.queryKey[0] !== sessionQueryKey[0] });
  }, [queryClient]);

  useEffect(
    () =>
      api.session.onExpired(() => {
        // Only a session that existed can "expire"; during startup it's simply signed out.
        if (queryClient.getQueryData(sessionQueryKey)) setSignOutReason('expired');
        clearClientState();
      }),
    [api, queryClient, clearClientState],
  );

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      const user = await api.auth.login(credentials);
      queryClient.setQueryData<AuthUser | null>(sessionQueryKey, user);
      setSignOutReason(null);
      return user;
    },
    [api, queryClient],
  );

  const logout = useCallback(async () => {
    let serverConfirmed = true;
    try {
      await api.auth.logout();
    } catch {
      // Still sign out locally; the caller can tell the user the server wasn't reached.
      serverConfirmed = false;
    }
    setSignOutReason(serverConfirmed ? 'logout' : 'logout-incomplete');
    clearClientState();
    return { serverConfirmed };
  }, [api, clearClientState]);

  const refreshSession = useCallback(async () => {
    await queryClient.refetchQueries({ queryKey: sessionQueryKey, exact: true });
  }, [queryClient]);

  const user = signOutReason ? null : (session.data ?? null);
  const status: AuthStatus = user
    ? 'authenticated'
    : session.isPending
      ? 'loading'
      : session.isError
        ? 'error'
        : 'unauthenticated';

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      isAuthenticated: status === 'authenticated',
      isLoading: status === 'loading',
      error: session.error,
      signOutReason,
      login,
      logout,
      refreshSession,
      can: (permission: Permission) => hasPermission(user, permission),
    }),
    [status, user, session.error, signOutReason, login, logout, refreshSession],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}
