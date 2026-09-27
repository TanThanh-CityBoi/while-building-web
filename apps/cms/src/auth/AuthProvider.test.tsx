import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApiError } from '@while-building/api-client';
import type { AuthUser, LoginCredentials } from '@while-building/types';
import { describe, expect, it, vi } from 'vitest';
import { createMemoryRouter, Outlet, RouterProvider, type RouteObject } from 'react-router';
import { LoginPage } from '@/features/auth/LoginPage';
import { UserMenu } from '@/layouts/UserMenu';
import { AuthProvider } from './AuthProvider';
import { sessionQueryKey, type AuthClient } from './context';
import { RedirectIfAuthenticated, RequireAuth, RequirePermission } from './guards';

const admin: AuthUser = {
  id: 'u1',
  email: 'ada@example.test',
  name: 'Ada Lovelace',
  role: 'ADMIN',
  permissions: ['USERS_READ', 'CONTENT_READ'],
};

const author: AuthUser = {
  id: 'u2',
  email: 'grace@example.test',
  name: 'Grace Hopper',
  role: 'AUTHOR',
  permissions: ['CONTENT_READ'],
};

/** A stand-in for the API client: just the calls the auth layer makes. */
function createFakeApi({ session = null }: { session?: AuthUser | null } = {}) {
  const expiredListeners = new Set<() => void>();
  return {
    auth: {
      restoreSession: vi.fn(async (_options?: { signal?: AbortSignal }) => session),
      login: vi.fn(async (_credentials: LoginCredentials) => admin),
      logout: vi.fn(async () => {}),
    },
    session: {
      onExpired: (listener: () => void) => {
        expiredListeners.add(listener);
        return () => {
          expiredListeners.delete(listener);
        };
      },
    },
    /** Simulates the API client failing to refresh mid-session. */
    expireSession: () => expiredListeners.forEach((listener) => listener()),
  } satisfies AuthClient & { expireSession: () => void };
}

const Page = ({ name }: { name: string }) => <h1>{name} page</h1>;

// The real guards, login page and user menu, with placeholder pages.
const routes: RouteObject[] = [
  {
    element: <RedirectIfAuthenticated />,
    children: [{ path: '/login', element: <LoginPage /> }],
  },
  {
    path: '/',
    element: <RequireAuth />,
    children: [
      {
        element: (
          <>
            <UserMenu />
            <Outlet />
          </>
        ),
        children: [
          { path: 'dashboard', element: <Page name="Dashboard" /> },
          {
            path: 'users',
            element: (
              <RequirePermission permission="USERS_READ">
                <Page name="Users" />
              </RequirePermission>
            ),
          },
        ],
      },
    ],
  },
];

function renderApp(api: AuthClient, path: string) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider api={api}>
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryClientProvider>,
  );
  return { router, queryClient, user: userEvent.setup() };
}

async function signIn(user: ReturnType<typeof userEvent.setup>) {
  await user.type(await screen.findByLabelText('Email'), 'ada@example.test');
  await user.type(screen.getByLabelText('Password'), 'correct-horse');
  await user.click(screen.getByRole('button', { name: 'Sign in' }));
}

describe('session restoration', () => {
  it('shows a loading state (and no protected content) until the session resolves', async () => {
    const api = createFakeApi();
    let resolveSession!: (user: AuthUser | null) => void;
    api.auth.restoreSession.mockImplementation(
      () => new Promise((resolve) => (resolveSession = resolve)),
    );
    const { router } = renderApp(api, '/dashboard');

    expect(screen.getByText('Restoring your session…')).toBeTruthy();
    expect(screen.queryByText('Dashboard page')).toBeNull();

    await act(async () => resolveSession(null));

    expect(await screen.findByRole('heading', { name: 'Sign in' })).toBeTruthy();
    expect(router.state.location.pathname).toBe('/login');
  });

  it('restores an existing session on startup without showing the login page', async () => {
    const api = createFakeApi({ session: admin });
    renderApp(api, '/dashboard');

    expect(await screen.findByRole('heading', { name: 'Dashboard page' })).toBeTruthy();
    expect(screen.queryByRole('heading', { name: 'Sign in' })).toBeNull();
    expect(api.auth.restoreSession).toHaveBeenCalledOnce();
  });

  it('shows a retryable error when the API is unreachable', async () => {
    const api = createFakeApi();
    api.auth.restoreSession.mockRejectedValueOnce(
      new ApiError({ kind: 'network', message: 'Could not reach the API at http://api.test.' }),
    );
    const { user } = renderApp(api, '/dashboard');

    expect(await screen.findByText("Can't reach the While Building API")).toBeTruthy();
    expect(screen.getByText('Could not reach the API at http://api.test.')).toBeTruthy();

    api.auth.restoreSession.mockResolvedValueOnce(admin);
    await user.click(screen.getByRole('button', { name: 'Try again' }));

    expect(await screen.findByRole('heading', { name: 'Dashboard page' })).toBeTruthy();
  });

  it('sends an already signed-in user from /login to the dashboard', async () => {
    const { router } = renderApp(createFakeApi({ session: admin }), '/login');

    expect(await screen.findByRole('heading', { name: 'Dashboard page' })).toBeTruthy();
    expect(router.state.location.pathname).toBe('/dashboard');
  });
});

describe('login', () => {
  it('validates the form before calling the API', async () => {
    const api = createFakeApi();
    const { user } = renderApp(api, '/login');

    await user.click(await screen.findByRole('button', { name: 'Sign in' }));

    expect(screen.getByText('Enter your email address.')).toBeTruthy();
    expect(screen.getByText('Enter your password.')).toBeTruthy();
    expect(api.auth.login).not.toHaveBeenCalled();
  });

  it('signs in and returns to the page that was originally requested', async () => {
    const api = createFakeApi();
    const { router, user } = renderApp(api, '/users');

    await signIn(user);

    expect(await screen.findByRole('heading', { name: 'Users page' })).toBeTruthy();
    expect(router.state.location.pathname).toBe('/users');
    expect(api.auth.login).toHaveBeenCalledWith({
      email: 'ada@example.test',
      password: 'correct-horse',
    });
  });

  it('goes to /dashboard when /login was opened directly', async () => {
    const { router, user } = renderApp(createFakeApi(), '/login');

    await signIn(user);

    expect(await screen.findByRole('heading', { name: 'Dashboard page' })).toBeTruthy();
    expect(router.state.location.pathname).toBe('/dashboard');
  });

  it('shows an authentication error for wrong credentials', async () => {
    const api = createFakeApi();
    api.auth.login.mockRejectedValueOnce(
      ApiError.fromResponse(401, { statusCode: 401, message: 'Unauthorized' }),
    );
    const { router, user } = renderApp(api, '/login');

    await signIn(user);

    expect(await screen.findByText('Incorrect email or password.')).toBeTruthy();
    expect(router.state.location.pathname).toBe('/login');
  });
});

describe('permissions', () => {
  it('shows a no-access state for pages the user lacks permission for', async () => {
    renderApp(createFakeApi({ session: author }), '/users');

    expect(await screen.findByText("You don't have access to this page")).toBeTruthy();
    expect(screen.queryByRole('heading', { name: 'Users page' })).toBeNull();
  });
});

describe('logout and expiry', () => {
  it('logs out from the user menu and clears the session even if the API call fails', async () => {
    const api = createFakeApi({ session: admin });
    api.auth.logout.mockRejectedValueOnce(new Error('network down'));
    const { router, queryClient, user } = renderApp(api, '/dashboard');

    await user.click(await screen.findByRole('button', { name: 'Account menu for Ada Lovelace' }));
    await user.click(screen.getByRole('menuitem', { name: 'Log out' }));

    expect(await screen.findByRole('heading', { name: 'Sign in' })).toBeTruthy();
    expect(router.state.location.pathname).toBe('/login');
    expect(screen.getByText(/the server couldn’t be reached/)).toBeTruthy();
    expect(api.auth.logout).toHaveBeenCalledOnce();
    expect(queryClient.getQueryData(sessionQueryKey)).toBeNull();
  });

  it('returns to /login with a notice when the session expires mid-use', async () => {
    const api = createFakeApi({ session: admin });
    const { router, user } = renderApp(api, '/dashboard');
    await screen.findByRole('heading', { name: 'Dashboard page' });

    act(() => api.expireSession());

    expect(await screen.findByText('Your session has expired. Please sign in again.')).toBeTruthy();
    expect(router.state.location.pathname).toBe('/login');

    // Signing in again returns to where the user was.
    await signIn(user);
    expect(await screen.findByRole('heading', { name: 'Dashboard page' })).toBeTruthy();
  });
});
