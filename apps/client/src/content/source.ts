import { isApiError } from '@while-building/api-client';
import type { Article, ArticleSummary, Project } from '@while-building/types';
import { api } from '@/lib/api';
import { mockProjects } from './mock/projects';

// The public site's content source. Articles come from while-building-api, which only ever
// returns published ones (drafts are a 404 there). Projects still read local mock data until
// the API serves them. Nothing else in the app talks to these sources directly.

/** Enough for the list and the older/newer pager until the site paginates. */
const ARTICLES_PAGE_SIZE = 50;

const isPublished = (item: { status: string }) => item.status === 'PUBLISHED';

/** Published articles, newest first. */
export async function fetchArticles(signal?: AbortSignal): Promise<ArticleSummary[]> {
  return (await api.articles.list({ pageSize: ARTICLES_PAGE_SIZE }, { signal })).data;
}

/** A published article, or `null` for drafts and unknown slugs. */
export async function fetchArticle(slug: string, signal?: AbortSignal): Promise<Article | null> {
  try {
    return await api.articles.get(slug, { signal });
  } catch (error) {
    // 404: no such published article; 400: not even a valid slug.
    if (isApiError(error) && (error.status === 404 || error.status === 400)) return null;
    throw error;
  }
}

export async function fetchProjects(): Promise<Project[]> {
  return mockProjects.filter(isPublished);
}

export async function fetchProject(slug: string): Promise<Project | null> {
  return mockProjects.find((project) => project.slug === slug && isPublished(project)) ?? null;
}
