import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { ArticleStatus, ListManagedArticlesParams } from '@while-building/types';
import { articleKeys } from '../api/articles';
import { useArticlesDependencies } from '../context';

/** `GET /content/articles` — keeps the previous page on screen while the next one loads. */
export function useArticles(params: ListManagedArticlesParams, enabled = true) {
  const { client } = useArticlesDependencies();
  return useQuery({
    queryKey: articleKeys.list(params),
    queryFn: ({ signal }) => client.list(params, { signal }),
    placeholderData: keepPreviousData,
    enabled,
  });
}

export type ArticleStats = Record<ArticleStatus | 'total', number>;

/** How many articles there are, in total and per status. */
export function useArticleStats(enabled = true) {
  const { client } = useArticlesDependencies();
  return useQuery({
    queryKey: articleKeys.stats(),
    queryFn: async ({ signal }): Promise<ArticleStats> => {
      const count = async (status?: ArticleStatus) =>
        (await client.list({ status, pageSize: 1 }, { signal })).meta.total;
      const [total, DRAFT, PUBLISHED] = await Promise.all([
        count(),
        count('DRAFT'),
        count('PUBLISHED'),
      ]);
      return { total, DRAFT, PUBLISHED };
    },
    enabled,
  });
}
