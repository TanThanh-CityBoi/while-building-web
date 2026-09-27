import { useQuery } from '@tanstack/react-query';
import { fetchArticle, fetchArticles, fetchProject, fetchProjects } from './source';

export const contentKeys = {
  articles: ['articles'] as const,
  article: (slug: string) => ['articles', slug] as const,
  projects: ['projects'] as const,
  project: (slug: string) => ['projects', slug] as const,
};

/** Published articles, newest first. */
export function useArticles() {
  return useQuery({ queryKey: contentKeys.articles, queryFn: fetchArticles });
}

/** A published article, or `null` when the slug doesn't exist. */
export function useArticle(slug: string) {
  return useQuery({ queryKey: contentKeys.article(slug), queryFn: () => fetchArticle(slug) });
}

export function useProjects() {
  return useQuery({ queryKey: contentKeys.projects, queryFn: fetchProjects });
}

/** A published project, or `null` when the slug doesn't exist. */
export function useProject(slug: string) {
  return useQuery({ queryKey: contentKeys.project(slug), queryFn: () => fetchProject(slug) });
}
