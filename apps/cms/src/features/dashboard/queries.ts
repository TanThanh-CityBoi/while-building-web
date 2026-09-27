import { useQuery } from '@tanstack/react-query';
import { fetchDashboardMetrics, fetchRecentContent } from './source';

export const dashboardKeys = {
  metrics: ['dashboard', 'metrics'] as const,
  recent: ['dashboard', 'recent'] as const,
};

export function useDashboardMetrics(enabled: boolean) {
  return useQuery({ queryKey: dashboardKeys.metrics, queryFn: fetchDashboardMetrics, enabled });
}

export function useRecentContent(enabled: boolean) {
  return useQuery({
    queryKey: dashboardKeys.recent,
    queryFn: () => fetchRecentContent(),
    enabled,
  });
}
