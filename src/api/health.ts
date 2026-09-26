import { apiGet } from './client';

export interface HealthResponse {
  /** `"ok"` when the API is healthy. */
  status: string;
}

export const healthQueryKey = ['health'] as const;

export function getHealth(signal?: AbortSignal): Promise<HealthResponse> {
  return apiGet<HealthResponse>('/health', { signal });
}
