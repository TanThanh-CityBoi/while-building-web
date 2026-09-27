import type { Article, Project } from '@while-building/types';
import { mockArticles } from './mock/articles';
import { mockProjects } from './mock/projects';

// The public site's content source. It reads local mock data today; once while-building-api
// exposes content endpoints, swap these bodies for `api.articles.*` / `api.projects.*` calls.
// Nothing else in the app imports the mock data directly.

const isPublished = (item: { status: string }) => item.status === 'PUBLISHED';

const byNewest = (a: Article, b: Article) =>
  (b.publishedAt ?? '').localeCompare(a.publishedAt ?? '');

export async function fetchArticles(): Promise<Article[]> {
  return mockArticles.filter(isPublished).sort(byNewest);
}

export async function fetchArticle(slug: string): Promise<Article | null> {
  return mockArticles.find((article) => article.slug === slug && isPublished(article)) ?? null;
}

export async function fetchProjects(): Promise<Project[]> {
  return mockProjects.filter(isPublished);
}

export async function fetchProject(slug: string): Promise<Project | null> {
  return mockProjects.find((project) => project.slug === slug && isPublished(project)) ?? null;
}
