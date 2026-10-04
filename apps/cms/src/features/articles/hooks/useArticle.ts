import { useQuery } from '@tanstack/react-query';
import { articleKeys } from '../api/articles';
import { useArticlesDependencies } from '../context';

/** `GET /content/articles/:id` — any status, with its content. */
export function useArticle(id: string) {
  const { client } = useArticlesDependencies();
  return useQuery({
    queryKey: articleKeys.detail(id),
    queryFn: ({ signal }) => client.get(id, { signal }),
  });
}
