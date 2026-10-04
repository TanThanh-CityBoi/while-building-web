import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApiError } from '@while-building/api-client';
import type { AuthUser, ManagedArticle, Permission } from '@while-building/types';
import { vi } from 'vitest';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { AuthContext, type AuthContextValue } from '@/auth/context';
import type { ArticlesClient } from '@/features/articles/api/articles';
import { ArticlesContext } from '@/features/articles/context';
import { ArticleCreatePage } from '@/features/articles/pages/ArticleCreatePage';
import { ArticleEditPage } from '@/features/articles/pages/ArticleEditPage';
import { ArticleListPage } from '@/features/articles/pages/ArticleListPage';
import { paragraph } from './blocks';
import { FakeEditor } from './FakeEditor';

// Test harness for the articles feature: the real pages and router, a fake API client,
// a plain textarea instead of BlockNote, and an auth context with chosen permissions.

export const ALL_CONTENT: Permission[] = [
  'CONTENT_READ',
  'CONTENT_CREATE',
  'CONTENT_UPDATE',
  'CONTENT_DELETE',
  'CONTENT_PUBLISH',
];

export { paragraph };

export function makeArticle(overrides: Partial<ManagedArticle> = {}): ManagedArticle {
  return {
    id: 'a1',
    slug: 'running-postgresql-on-my-homelab',
    title: 'Running PostgreSQL on my Homelab',
    excerpt: 'What I learned.',
    category: 'DevOps',
    coverImage: null,
    author: { id: 'u1', name: 'Ada Lovelace' },
    status: 'DRAFT',
    publishedAt: null,
    readingTimeMinutes: 1,
    content: [paragraph('A database in my living room.')],
    createdAt: '2026-10-01T09:00:00.000Z',
    updatedAt: '2026-10-02T09:00:00.000Z',
    ...overrides,
  };
}

/** An in-memory stand-in for `api.content.articles`, with call spies. */
export function createFakeClient(initial: ManagedArticle[] = [makeArticle()]) {
  let articles = [...initial];
  const find = (id: string) => {
    const article = articles.find((a) => a.id === id);
    if (!article)
      throw ApiError.fromResponse(404, { statusCode: 404, message: 'Article not found.' });
    return article;
  };
  const store = (article: ManagedArticle) => {
    articles = articles.map((a) => (a.id === article.id ? article : a));
    return article;
  };
  return {
    list: vi.fn(async (params: Parameters<ArticlesClient['list']>[0] = {}) => {
      const data = articles
        .filter((a) => !params.status || a.status === params.status)
        .map(({ content: _content, ...summary }) => summary);
      return {
        data,
        meta: { page: 1, pageSize: params.pageSize ?? 20, total: data.length, totalPages: 1 },
      };
    }),
    get: vi.fn(async (id: string) => find(id)),
    create: vi.fn(async (input: Parameters<ArticlesClient['create']>[0]) => {
      const article = makeArticle({
        id: 'new-1',
        title: input.title,
        slug: input.slug ?? 'derived-slug',
        excerpt: input.excerpt ?? null,
        content: input.content ?? [],
      });
      articles = [...articles, article];
      return article;
    }),
    update: vi.fn(async (id: string, input: Parameters<ArticlesClient['update']>[1]) =>
      store({
        ...find(id),
        ...input,
        excerpt: input.excerpt === undefined ? find(id).excerpt : input.excerpt,
        category: input.category === undefined ? find(id).category : input.category,
        coverImage: input.coverImage === undefined ? find(id).coverImage : input.coverImage,
        content: input.content ?? find(id).content,
        updatedAt: '2026-10-03T09:00:00.000Z',
      } as ManagedArticle),
    ),
    publish: vi.fn(async (id: string) =>
      store({ ...find(id), status: 'PUBLISHED', publishedAt: '2026-10-03T10:00:00.000Z' }),
    ),
    unpublish: vi.fn(async (id: string) =>
      store({ ...find(id), status: 'DRAFT', publishedAt: null }),
    ),
    remove: vi.fn(async (id: string) => {
      find(id);
      articles = articles.filter((a) => a.id !== id);
    }),
  } satisfies ArticlesClient;
}

export type FakeClient = ReturnType<typeof createFakeClient>;

function fakeAuth(permissions: Permission[]): AuthContextValue {
  const user: AuthUser = {
    id: 'u1',
    email: 'ada@example.test',
    name: 'Ada Lovelace',
    role: 'ADMIN',
    permissions,
  };
  return {
    status: 'authenticated',
    user,
    isAuthenticated: true,
    isLoading: false,
    error: null,
    signOutReason: null,
    login: vi.fn(async () => user),
    logout: vi.fn(async () => ({ serverConfirmed: true })),
    refreshSession: vi.fn(async () => {}),
    can: (permission) => permissions.includes(permission),
  };
}

export function renderArticles(
  path: string,
  { client = createFakeClient(), permissions = ALL_CONTENT } = {},
) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const router = createMemoryRouter(
    [
      { path: '/content/articles', element: <ArticleListPage /> },
      { path: '/content/articles/new', element: <ArticleCreatePage /> },
      { path: '/content/articles/:id/edit', element: <ArticleEditPage /> },
      { path: '/dashboard', element: <h1>Dashboard</h1> },
    ],
    { initialEntries: [path] },
  );
  const user = userEvent.setup();
  render(
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={fakeAuth(permissions)}>
        <ArticlesContext.Provider value={{ client, Editor: FakeEditor }}>
          <RouterProvider router={router} />
        </ArticlesContext.Provider>
      </AuthContext.Provider>
    </QueryClientProvider>,
  );
  return { client, router, user, queryClient };
}
