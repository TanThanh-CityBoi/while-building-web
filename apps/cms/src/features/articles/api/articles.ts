import type { ContentArticlesApi } from '@while-building/api-client';
import type { ListManagedArticlesParams } from '@while-building/types';

/** The article calls the CMS makes (lets tests pass a fake). */
export type ArticlesClient = Pick<
  ContentArticlesApi,
  'list' | 'get' | 'create' | 'update' | 'publish' | 'unpublish' | 'remove'
>;

export const articleKeys = {
  all: ['articles'] as const,
  lists: () => [...articleKeys.all, 'list'] as const,
  list: (params: ListManagedArticlesParams) => [...articleKeys.lists(), params] as const,
  /** Per-status totals (dashboard, content overview). */
  stats: () => [...articleKeys.all, 'stats'] as const,
  details: () => [...articleKeys.all, 'detail'] as const,
  detail: (id: string) => [...articleKeys.details(), id] as const,
};
