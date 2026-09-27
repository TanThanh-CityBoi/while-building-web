import type { Article, ContentStatus, Project } from '@while-building/types';
import { mockArticles, mockProjects } from './mock';

// CMS content source. Reads sample data today; when while-building-api gets content endpoints,
// replace these bodies with api-client calls (e.g. `api.articles.list(params)`). The filter
// params already mirror what a list endpoint would take, so pages won't need to change.

export interface ContentListParams {
  search?: string;
  status?: ContentStatus;
}

const byUpdatedDesc = (a: { updatedAt: string }, b: { updatedAt: string }) =>
  b.updatedAt.localeCompare(a.updatedAt);

function matches(text: string[], search?: string) {
  if (!search) return true;
  const needle = search.toLowerCase();
  return text.some((value) => value.toLowerCase().includes(needle));
}

export async function fetchArticles({ search, status }: ContentListParams = {}) {
  return mockArticles
    .filter((article) => !status || article.status === status)
    .filter((article) => matches([article.title, article.slug, article.category], search))
    .sort(byUpdatedDesc) satisfies Article[];
}

export async function fetchProjects({ search, status }: ContentListParams = {}) {
  return mockProjects
    .filter((project) => !status || project.status === status)
    .filter((project) => matches([project.name, project.slug, ...project.technologies], search))
    .sort(byUpdatedDesc) satisfies Project[];
}
