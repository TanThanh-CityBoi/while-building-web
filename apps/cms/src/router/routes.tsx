import { Navigate, type RouteObject } from 'react-router';
import { RedirectIfAuthenticated, RequireAuth, RequirePermission } from '@/auth/guards';
import { ArticleCreatePage } from '@/features/articles/pages/ArticleCreatePage';
import { ArticleEditPage } from '@/features/articles/pages/ArticleEditPage';
import { ArticleListPage } from '@/features/articles/pages/ArticleListPage';
import { AssistantPage } from '@/features/assistant/AssistantPage';
import { LoginPage } from '@/features/auth/LoginPage';
import { ContentOverviewPage } from '@/features/content/ContentOverviewPage';
import { ProjectsPage } from '@/features/content/ProjectsPage';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { SettingsPage } from '@/features/settings/SettingsPage';
import { UsersPage } from '@/features/users/UsersPage';
import { AppLayout } from '@/layouts/AppLayout';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { RouteErrorPage } from '@/pages/RouteErrorPage';

export const routes: RouteObject[] = [
  {
    // Public: /login (signed-in users are sent on to the app).
    element: <RedirectIfAuthenticated />,
    children: [{ path: '/login', element: <LoginPage /> }],
  },
  {
    // Everything else requires a session.
    path: '/',
    element: <RequireAuth />,
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            errorElement: <RouteErrorPage />,
            children: [
              { index: true, element: <Navigate to="/dashboard" replace /> },
              { path: 'dashboard', element: <DashboardPage /> },
              {
                path: 'content',
                element: (
                  <RequirePermission permission="CONTENT_READ">
                    <ContentOverviewPage />
                  </RequirePermission>
                ),
              },
              {
                path: 'content/articles',
                element: (
                  <RequirePermission permission="CONTENT_READ">
                    <ArticleListPage />
                  </RequirePermission>
                ),
              },
              {
                path: 'content/articles/new',
                element: (
                  <RequirePermission permission="CONTENT_CREATE">
                    <ArticleCreatePage />
                  </RequirePermission>
                ),
              },
              {
                // Read-only without CONTENT_UPDATE.
                path: 'content/articles/:id/edit',
                element: (
                  <RequirePermission permission="CONTENT_READ">
                    <ArticleEditPage />
                  </RequirePermission>
                ),
              },
              {
                path: 'content/projects',
                element: (
                  <RequirePermission permission="CONTENT_READ">
                    <ProjectsPage />
                  </RequirePermission>
                ),
              },
              {
                path: 'assistant',
                element: (
                  <RequirePermission permission="CONTENT_READ">
                    <AssistantPage />
                  </RequirePermission>
                ),
              },
              {
                path: 'users',
                element: (
                  <RequirePermission permission="USERS_READ">
                    <UsersPage />
                  </RequirePermission>
                ),
              },
              { path: 'settings', element: <SettingsPage /> },
              { path: '*', element: <NotFoundPage /> },
            ],
          },
        ],
      },
    ],
  },
];
