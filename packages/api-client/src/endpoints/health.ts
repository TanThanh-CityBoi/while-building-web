import type { HealthResponse } from '@while-building/types';
import { isApiError } from '../errors';
import type { HttpClient } from '../http';

export function createHealthApi(http: HttpClient) {
  return {
    /**
     * `GET /health`. A 503 still carries a health body (`{ status: 'error', database: 'down' }`),
     * so it resolves instead of rejecting; only unreachable/unknown failures reject.
     */
    async check({ signal }: { signal?: AbortSignal } = {}): Promise<HealthResponse> {
      try {
        return await http.request<HealthResponse>('/health', { signal, skipAuthRefresh: true });
      } catch (error) {
        if (isApiError(error) && error.status === 503 && isHealthBody(error.body)) {
          return error.body;
        }
        throw error;
      }
    },
  };
}

function isHealthBody(body: unknown): body is HealthResponse {
  return typeof body === 'object' && body !== null && 'status' in body;
}
