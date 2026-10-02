import { useQuery } from '@tanstack/react-query';
import type { ChatClient } from './useChat';

export const assistantKeys = {
  models: ['assistant', 'models'] as const,
};

/** `GET /models` on the assistant: the providers and models it offers. */
export function useModelOptions(client: ChatClient) {
  return useQuery({
    queryKey: assistantKeys.models,
    queryFn: ({ signal }) => client.models({ signal }),
    enabled: client.isConfigured,
    // The server's configuration rarely changes during a session.
    staleTime: 5 * 60_000,
  });
}
