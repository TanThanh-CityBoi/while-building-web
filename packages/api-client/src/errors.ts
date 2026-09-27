import type { ApiErrorBody } from '@while-building/types';

/**
 * - `http`: the API answered with a non-2xx status.
 * - `network`: the API could not be reached (offline, DNS, refused, CORS rejection).
 * - `timeout`: the API did not answer in time.
 * - `config`: the client has no API URL configured.
 */
export type ApiErrorKind = 'http' | 'network' | 'timeout' | 'config';

interface ApiErrorInit {
  kind: ApiErrorKind;
  message: string;
  status?: number;
  messages?: string[];
  body?: unknown;
  cause?: unknown;
}

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  /** HTTP status, or `0` when no response was received. */
  readonly status: number;
  /** All messages from the response (NestJS validation errors arrive as a list). */
  readonly messages: string[];
  /** Parsed response body, if any. */
  readonly body: unknown;

  constructor({ kind, message, status = 0, messages = [message], body, cause }: ApiErrorInit) {
    super(message, { cause });
    this.name = 'ApiError';
    this.kind = kind;
    this.status = status;
    this.messages = messages;
    this.body = body;
  }

  static fromResponse(status: number, body: unknown): ApiError {
    const messages = extractMessages(body);
    return new ApiError({
      kind: 'http',
      status,
      body,
      messages: messages.length > 0 ? messages : [`Request failed with status ${status}.`],
      message: messages[0] ?? `Request failed with status ${status}.`,
    });
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

function isErrorBody(body: unknown): body is Partial<ApiErrorBody> {
  return typeof body === 'object' && body !== null && 'message' in body;
}

function extractMessages(body: unknown): string[] {
  if (typeof body === 'string' && body.trim()) return [body.trim()];
  if (!isErrorBody(body)) return [];
  const { message } = body;
  if (Array.isArray(message)) return message.filter((m): m is string => typeof m === 'string');
  return typeof message === 'string' ? [message] : [];
}

/** A message that is safe and useful to show to a user. */
export function getErrorMessage(error: unknown, fallback = 'Something went wrong.'): string {
  if (isApiError(error)) {
    switch (error.kind) {
      case 'network':
      case 'timeout':
      case 'config':
        return error.message;
      case 'http':
        if (error.status >= 500) return 'The API ran into a problem. Please try again.';
        return error.messages.join(' ');
    }
  }
  return error instanceof Error && error.message ? error.message : fallback;
}
