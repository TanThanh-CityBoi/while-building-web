import { useQuery } from '@tanstack/react-query';
import { isApiConfigured } from '@/api/client';
import { getHealth, healthQueryKey } from '@/api/health';

export type ApiHealth = 'unconfigured' | 'checking' | 'online' | 'offline';

/** Reports whether the backend's `GET /health` endpoint is reachable and healthy. */
export function useApiHealth(): ApiHealth {
  const query = useQuery({
    queryKey: healthQueryKey,
    queryFn: ({ signal }) => getHealth(signal),
    enabled: isApiConfigured,
  });

  if (!isApiConfigured) return 'unconfigured';
  if (query.isPending) return 'checking';
  return query.isSuccess && query.data.status === 'ok' ? 'online' : 'offline';
}
