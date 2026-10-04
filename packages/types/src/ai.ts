// The While Building assistant (`apps/ai` in while-building-api, `POST /chat`).
// The answer streams back as server-sent events; this is their contract.

/** Request limits enforced by the AI app. */
export const CHAT_LIMITS = {
  maxMessages: 20,
  maxContentLength: 8_000,
  maxTotalLength: 32_000,
} as const;

export type ChatRole = 'user' | 'assistant';

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

/** `POST /chat` body: the conversation so far, oldest first, starting and ending with the user. */
export interface ChatRequest {
  messages: ChatMessage[];
  /** One of `GET /models`' providers; the server's default when omitted. */
  provider?: string;
  /** One of that provider's models; its default when omitted. The server validates both. */
  model?: string;
}

export interface AiModelOption {
  id: string;
  label: string;
}

export interface AiProviderOption {
  id: string;
  label: string;
  defaultModel: string;
  models: AiModelOption[];
}

/** `GET /models`: the providers enabled on the server and the models each offers. */
export interface AiModelOptions {
  defaultProvider: string;
  providers: AiProviderOption[];
}

/** Published content an answer drew on. */
export interface ChatSource {
  kind: 'article' | 'project';
  slug: string;
  title: string;
  /** MCP resource URI, e.g. `article://my-first-k3s-cluster`. */
  uri: string;
}

export type ChatErrorCode = 'unavailable' | 'rate_limited' | 'refused' | 'timeout' | 'internal';

/** One server-sent event. Every stream ends with exactly one `done` or `error`. */
export type ChatStreamEvent =
  /** `thinking`: waiting for the model; `tool_start` / `tool_end`: a lookup (`ok` on end). */
  | { type: 'status'; phase: 'thinking' | 'tool_start' | 'tool_end'; tool?: string; ok?: boolean }
  /** The next piece of the answer. */
  | { type: 'text'; delta: string }
  | { type: 'sources'; sources: ChatSource[] }
  /** `message` is safe to show. */
  | { type: 'error'; code: ChatErrorCode; message: string }
  | { type: 'done' };
