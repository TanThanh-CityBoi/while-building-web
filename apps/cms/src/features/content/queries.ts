import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { fetchProjects, type ProjectListParams } from './source';

export const contentKeys = {
  projects: (params: ProjectListParams = {}) => ['content', 'projects', params] as const,
};

export function useContentProjects(params: ProjectListParams = {}) {
  return useQuery({
    queryKey: contentKeys.projects(params),
    queryFn: () => fetchProjects(params),
    placeholderData: keepPreviousData,
  });
}
