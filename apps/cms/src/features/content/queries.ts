import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { fetchArticles, fetchProjects, type ContentListParams } from './source';

export const contentKeys = {
  articles: (params: ContentListParams = {}) => ['content', 'articles', params] as const,
  projects: (params: ContentListParams = {}) => ['content', 'projects', params] as const,
};

export function useContentArticles(params: ContentListParams = {}) {
  return useQuery({
    queryKey: contentKeys.articles(params),
    queryFn: () => fetchArticles(params),
    placeholderData: keepPreviousData,
  });
}

export function useContentProjects(params: ContentListParams = {}) {
  return useQuery({
    queryKey: contentKeys.projects(params),
    queryFn: () => fetchProjects(params),
    placeholderData: keepPreviousData,
  });
}
