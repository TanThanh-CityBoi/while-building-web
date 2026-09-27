import { createBrowserRouter } from 'react-router';
import { RootLayout } from '@/layouts/RootLayout';
import { AboutPage } from '@/pages/AboutPage';
import { ArticleDetailPage } from '@/pages/ArticleDetailPage';
import { ArticlesPage } from '@/pages/ArticlesPage';
import { ErrorPage } from '@/pages/ErrorPage';
import { HomePage } from '@/pages/HomePage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { ProjectDetailPage } from '@/pages/ProjectDetailPage';
import { ProjectsPage } from '@/pages/ProjectsPage';

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        // Pathless route so render errors show inside the layout (navbar + footer stay).
        errorElement: <ErrorPage />,
        children: [
          { index: true, element: <HomePage /> },
          { path: 'articles', element: <ArticlesPage /> },
          { path: 'articles/:slug', element: <ArticleDetailPage /> },
          { path: 'projects', element: <ProjectsPage /> },
          { path: 'projects/:slug', element: <ProjectDetailPage /> },
          { path: 'about', element: <AboutPage /> },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
]);
