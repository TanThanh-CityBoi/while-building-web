import type { ContentStatus, Project } from '@while-building/types';
import { mockProjects } from './mock';

// Projects source. Reads sample data until while-building-api manages projects; replace these
// bodies with api-client calls then. (Articles come from the API: features/articles.)

export interface ProjectListParams {
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

export async function fetchProjects({ search, status }: ProjectListParams = {}) {
  return mockProjects
    .filter((project) => !status || project.status === status)
    .filter((project) => matches([project.name, project.slug, ...project.technologies], search))
    .sort(byUpdatedDesc) satisfies Project[];
}
