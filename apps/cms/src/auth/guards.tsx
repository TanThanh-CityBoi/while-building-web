import { getErrorMessage } from '@while-building/api-client';
import type { Permission } from '@while-building/types';
import { Button, ErrorState, LoadingState } from '@while-building/ui';
import type { ReactNode } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router';
import { ForbiddenState } from '@/components/ForbiddenState';
import { getPostLoginPath, type LoginLocationState } from './redirect';
import { useAuth } from './useAuth';

function RestoringSession() {
  return <LoadingState fullscreen label="Restoring your session…" />;
}

/** Layout route for everything except /login. Renders nothing protected until auth resolves. */
export function RequireAuth() {
  const { status, error, refreshSession, signOutReason } = useAuth();
  const location = useLocation();

  if (status === 'loading') return <RestoringSession />;

  if (status === 'error') {
    return (
      <ErrorState
        fullscreen
        title="Can't reach the While Building API"
        description={getErrorMessage(error)}
        onRetry={() => void refreshSession()}
        action={
          <Button variant="ghost" size="sm" onClick={() => window.location.reload()}>
            Reload page
          </Button>
        }
      />
    );
  }

  if (status === 'unauthenticated') {
    // After an explicit logout start fresh; otherwise come back here after signing in.
    const signedOut = signOutReason === 'logout' || signOutReason === 'logout-incomplete';
    const state: LoginLocationState | undefined = signedOut ? undefined : { from: location };
    return <Navigate to="/login" replace state={state} />;
  }

  return <Outlet />;
}

/** Layout route for /login: signed-in users go straight to the app. */
export function RedirectIfAuthenticated() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'loading') return <RestoringSession />;
  if (status === 'authenticated') {
    return <Navigate to={getPostLoginPath(location.state)} replace />;
  }
  return <Outlet />;
}

interface RequirePermissionProps {
  permission: Permission;
  children: ReactNode;
}

/** Shows a 403 state instead of the page when the user lacks `permission`. */
export function RequirePermission({ permission, children }: RequirePermissionProps) {
  const { can } = useAuth();
  if (!can(permission)) return <ForbiddenState permission={permission} />;
  return children;
}
