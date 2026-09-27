import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export type ApiHealth = 'unconfigured' | 'checking' | 'online' | 'degraded' | 'offline';

/** Whether while-building-api's `GET /health` is reachable, and healthy. */
export function useApiHealth(): ApiHealth {
  const query = useQuery({
    queryKey: ['health'],
    queryFn: ({ signal }) => api.health.check({ signal }),
    enabled: api.isConfigured,
  });

  if (!api.isConfigured) return 'unconfigured';
  if (query.isPending) return 'checking';
  if (query.isError) return 'offline';
  return query.data.status === 'ok' ? 'online' : 'degraded';
}
