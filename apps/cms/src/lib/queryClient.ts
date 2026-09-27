import { QueryClient } from '@tanstack/react-query';
import { isApiError } from '@while-building/api-client';

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        // Retrying a 4xx (bad request, forbidden, not found…) won't change the answer.
        retry: (failureCount, error) =>
          isApiError(error) && error.kind === 'http' && error.status < 500
            ? false
            : failureCount < 1,
      },
      mutations: { retry: false },
    },
  });
}
