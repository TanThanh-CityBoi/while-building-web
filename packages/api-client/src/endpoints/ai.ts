import type { ChatRequest, ChatStreamEvent } from '@while-building/types';
import { joinUrl, trimTrailingSlash } from '@while-building/utils';
import { ApiError } from '../errors';
import type { HttpClient } from '../http';
import { parseSse } from '../sse';

const EVENT_TYPES = new Set<ChatStreamEvent['type']>([
  'status',
  'text',
  'sources',
  'error',
  'done',
]);

/**
 * The While Building assistant, served by a separate app (`apps/ai`) at its own base URL.
 * It shares the HTTP client's in-memory access token and session refresh.
 */
export function createAiApi(http: HttpClient, aiBaseUrl: string | undefined) {
  const baseUrl = trimTrailingSlash(aiBaseUrl?.trim() ?? '');

  return {
    baseUrl,
    isConfigured: baseUrl !== '',

    /**
     * `POST /chat` — the assistant's answer as a stream of events. Rejects with an ApiError
     * before the stream starts (401/403/429/400, network…); failures after that arrive as an
     * `error` event. Aborting `signal` cancels the answer on the server.
     */
    async *chat(
      request: ChatRequest,
      { signal }: { signal?: AbortSignal } = {},
    ): AsyncGenerator<ChatStreamEvent> {
      if (!baseUrl) {
        throw new ApiError({
          kind: 'config',
          message: 'The assistant URL is not configured (set VITE_AI_URL).',
        });
      }
      const response = await http.openStream(joinUrl(baseUrl, '/chat'), { body: request, signal });
      if (!response.body) {
        throw new ApiError({ kind: 'network', message: 'The assistant sent an empty response.' });
      }
      for await (const message of parseSse(response.body)) {
        const event = toEvent(message.data);
        if (event) yield event;
      }
    },
  };
}

export type AiApi = ReturnType<typeof createAiApi>;

/** Known events only: unknown types (from a newer server) are skipped. */
function toEvent(data: string): ChatStreamEvent | null {
  try {
    const event = JSON.parse(data) as { type?: unknown };
    return typeof event.type === 'string' && EVENT_TYPES.has(event.type as ChatStreamEvent['type'])
      ? (event as ChatStreamEvent)
      : null;
  } catch {
    return null;
  }
}
