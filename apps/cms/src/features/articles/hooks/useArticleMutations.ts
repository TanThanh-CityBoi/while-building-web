import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreateArticleInput, ManagedArticle, UpdateArticleInput } from '@while-building/types';
import { articleKeys } from '../api/articles';
import { useArticlesDependencies } from '../context';

/** After a change: the article's cache is up to date; lists and totals refetch. */
function useArticleCache() {
  const queryClient = useQueryClient();
  return {
    stored(article: ManagedArticle) {
      queryClient.setQueryData(articleKeys.detail(article.id), article);
      void queryClient.invalidateQueries({ queryKey: articleKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: articleKeys.stats() });
    },
    removed(id: string) {
      queryClient.removeQueries({ queryKey: articleKeys.detail(id) });
      void queryClient.invalidateQueries({ queryKey: articleKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: articleKeys.stats() });
    },
  };
}

export function useCreateArticle() {
  const { client } = useArticlesDependencies();
  const cache = useArticleCache();
  return useMutation({
    mutationFn: (input: CreateArticleInput) => client.create(input),
    onSuccess: cache.stored,
  });
}

export function useUpdateArticle() {
  const { client } = useArticlesDependencies();
  const cache = useArticleCache();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateArticleInput }) =>
      client.update(id, input),
    onSuccess: cache.stored,
  });
}

export function usePublishArticle() {
  const { client } = useArticlesDependencies();
  const cache = useArticleCache();
  return useMutation({
    mutationFn: (id: string) => client.publish(id),
    onSuccess: cache.stored,
  });
}

export function useUnpublishArticle() {
  const { client } = useArticlesDependencies();
  const cache = useArticleCache();
  return useMutation({
    mutationFn: (id: string) => client.unpublish(id),
    onSuccess: cache.stored,
  });
}

export function useDeleteArticle() {
  const { client } = useArticlesDependencies();
  const cache = useArticleCache();
  return useMutation({
    mutationFn: async (id: string) => {
      await client.remove(id);
      return id;
    },
    onSuccess: cache.removed,
  });
}
