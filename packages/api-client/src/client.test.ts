import type { AuthUser } from '@while-building/types';
import { describe, expect, it, vi } from 'vitest';
import { createApiClient } from './client';
import { ApiError, getErrorMessage } from './errors';

const BASE_URL = 'http://api.test/';

const authUser: AuthUser = {
  id: 'u1',
  email: 'ada@example.test',
  name: 'Ada',
  role: 'ADMIN',
  permissions: ['USERS_READ', 'CONTENT_READ'],
};

type Handler = (request: { url: URL; init: RequestInit }) => Response | Promise<Response>;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

/** A fetch stub routed by `METHOD /path`, recording every call. */
function createFetch(routes: Record<string, Handler>) {
  const calls: Array<{ key: string; url: URL; headers: Headers; init: RequestInit }> = [];
  const fetch = vi.fn(async (input: RequestInfo | URL, init: RequestInit = {}) => {
    const url = new URL(String(input));
    const key = `${init.method ?? 'GET'} ${url.pathname}`;
    calls.push({ key, url, headers: new Headers(init.headers), init });
    const handler = routes[key];
    if (!handler) return json({ statusCode: 404, message: `No route ${key}` }, 404);
    return handler({ url, init });
  });
  return { fetch: fetch as unknown as typeof globalThis.fetch, calls };
}

describe('requests', () => {
  it('joins the base URL, encodes query params and sends credentials', async () => {
    const { fetch, calls } = createFetch({
      'GET /users': () =>
        json({ data: [], meta: { page: 2, pageSize: 20, total: 0, totalPages: 0 } }),
    });
    const api = createApiClient({ baseUrl: BASE_URL, credentials: 'include', fetch });

    await api.users.list({ search: 'ada', role: undefined, page: 2 });

    expect(calls[0]!.url.toString()).toBe('http://api.test/users?search=ada&page=2');
    expect(calls[0]!.init.credentials).toBe('include');
    expect(calls[0]!.headers.get('Accept')).toBe('application/json');
  });

  it('sends JSON bodies and unwraps { data } envelopes', async () => {
    const created = { ...authUser, status: 'ACTIVE', createdAt: '', updatedAt: '' };
    const { fetch, calls } = createFetch({ 'POST /users': () => json({ data: created }, 201) });
    const api = createApiClient({ baseUrl: BASE_URL, fetch });

    const user = await api.users.create({
      name: 'Ada',
      email: 'ada@example.test',
      role: 'EDITOR',
      password: 'correct-horse',
    });

    expect(user).toEqual(created);
    expect(calls[0]!.headers.get('Content-Type')).toBe('application/json');
    expect(JSON.parse(String(calls[0]!.init.body))).toMatchObject({ role: 'EDITOR' });
  });
});

describe('errors', () => {
  it('turns NestJS error bodies into ApiError with every message', async () => {
    const { fetch } = createFetch({
      'POST /users': () =>
        json({ statusCode: 400, message: ['email must be an email', 'name is required'] }, 400),
    });
    const api = createApiClient({ baseUrl: BASE_URL, fetch });

    const error = await api.users
      .create({ name: '', email: 'x', role: 'AUTHOR', password: '12345678' })
      .catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ kind: 'http', status: 400 });
    expect(getErrorMessage(error)).toBe('email must be an email name is required');
  });

  it('reports unreachable APIs as network errors', async () => {
    const fetch = vi.fn(async () => {
      throw new TypeError('fetch failed');
    });
    const api = createApiClient({ baseUrl: BASE_URL, fetch });

    const error = await api.health.check().catch((e: unknown) => e);

    expect(error).toMatchObject({ kind: 'network', status: 0 });
    expect(getErrorMessage(error)).toBe('Could not reach the API at http://api.test.');
  });

  it('hides server error details behind a generic message', () => {
    expect(getErrorMessage(ApiError.fromResponse(500, { message: 'stack trace…' }))).toBe(
      'The API ran into a problem. Please try again.',
    );
  });

  it('fails fast without calling fetch when no base URL is configured', async () => {
    const fetch = vi.fn();
    const api = createApiClient({ baseUrl: '  ', fetch });

    await expect(api.health.check()).rejects.toMatchObject({ kind: 'config' });
    expect(api.isConfigured).toBe(false);
    expect(fetch).not.toHaveBeenCalled();
  });
});

describe('health', () => {
  it('resolves a 503 health body instead of throwing', async () => {
    const { fetch } = createFetch({
      'GET /health': () => json({ status: 'error', database: 'down' }, 503),
    });
    const api = createApiClient({ baseUrl: BASE_URL, fetch });

    await expect(api.health.check()).resolves.toEqual({ status: 'error', database: 'down' });
  });
});

describe('session handling', () => {
  it('login stores the access token and loads the current user', async () => {
    const { fetch, calls } = createFetch({
      'POST /auth/login': () => json({ accessToken: 'token-1' }),
      'GET /auth/me': () => json({ data: authUser }),
    });
    const api = createApiClient({ baseUrl: BASE_URL, fetch, refreshOnUnauthorized: true });

    await expect(api.auth.login({ email: 'ada@example.test', password: 'pw' })).resolves.toEqual(
      authUser,
    );
    expect(calls.map((c) => c.key)).toEqual(['POST /auth/login', 'GET /auth/me']);
    expect(calls[1]!.headers.get('Authorization')).toBe('Bearer token-1');
  });

  it('does not try to refresh when login itself is rejected', async () => {
    const { fetch, calls } = createFetch({
      'POST /auth/login': () => json({ statusCode: 401, message: 'Invalid credentials' }, 401),
    });
    const api = createApiClient({ baseUrl: BASE_URL, fetch, refreshOnUnauthorized: true });

    await expect(api.auth.login({ email: 'a@b.co', password: 'x' })).rejects.toMatchObject({
      status: 401,
    });
    expect(calls.map((c) => c.key)).toEqual(['POST /auth/login']);
  });

  it('refreshes once on 401 and retries with the new token (single-flight)', async () => {
    let token = 'expired';
    const { fetch, calls } = createFetch({
      'POST /auth/refresh': async () => {
        await new Promise((resolve) => setTimeout(resolve, 5));
        token = 'fresh';
        return json({ accessToken: 'fresh' });
      },
      'GET /users': ({ init }) =>
        new Headers(init.headers).get('Authorization') === `Bearer ${token}` && token === 'fresh'
          ? json({ data: [], meta: { page: 1, pageSize: 20, total: 0, totalPages: 0 } })
          : json({ statusCode: 401, message: 'Unauthorized' }, 401),
    });
    const api = createApiClient({ baseUrl: BASE_URL, fetch, refreshOnUnauthorized: true });

    await Promise.all([api.users.list(), api.users.list(), api.users.list()]);

    expect(calls.filter((c) => c.key === 'POST /auth/refresh')).toHaveLength(1);
    expect(calls.filter((c) => c.key === 'GET /users')).toHaveLength(6);
  });

  it('emits session-expired and rethrows when the refresh is rejected', async () => {
    const { fetch } = createFetch({
      'GET /users': () => json({ statusCode: 401, message: 'Unauthorized' }, 401),
      'POST /auth/refresh': () => json({ statusCode: 401, message: 'Session expired' }, 401),
    });
    const api = createApiClient({ baseUrl: BASE_URL, fetch, refreshOnUnauthorized: true });
    const onExpired = vi.fn();
    api.session.onExpired(onExpired);

    await expect(api.users.list()).rejects.toMatchObject({ status: 401 });
    expect(onExpired).toHaveBeenCalledOnce();
  });

  it('does not treat a network failure during refresh as an expired session', async () => {
    const onExpired = vi.fn();
    const fetch = vi.fn(async (input: RequestInfo | URL) => {
      if (String(input).endsWith('/auth/refresh')) throw new TypeError('offline');
      return json({ statusCode: 401, message: 'Unauthorized' }, 401);
    });
    const api = createApiClient({ baseUrl: BASE_URL, fetch, refreshOnUnauthorized: true });
    api.session.onExpired(onExpired);

    await expect(api.users.list()).rejects.toMatchObject({ kind: 'network' });
    expect(onExpired).not.toHaveBeenCalled();
  });

  it('restoreSession returns null without a valid refresh cookie', async () => {
    const { fetch, calls } = createFetch({
      'POST /auth/refresh': () => json({ statusCode: 401, message: 'No session' }, 401),
    });
    const api = createApiClient({ baseUrl: BASE_URL, fetch, refreshOnUnauthorized: true });

    await expect(api.auth.restoreSession()).resolves.toBeNull();
    expect(calls.map((c) => c.key)).toEqual(['POST /auth/refresh']);
  });

  it('restoreSession returns the user when the refresh succeeds', async () => {
    const { fetch, calls } = createFetch({
      'POST /auth/refresh': () => json({ accessToken: 'restored' }),
      'GET /auth/me': () => json({ data: authUser }),
    });
    const api = createApiClient({ baseUrl: BASE_URL, fetch, refreshOnUnauthorized: true });

    await expect(api.auth.restoreSession()).resolves.toEqual(authUser);
    expect(calls[1]!.headers.get('Authorization')).toBe('Bearer restored');
  });

  it('logout drops the access token even when the request fails', async () => {
    const { fetch, calls } = createFetch({
      'POST /auth/login': () => json({ accessToken: 'token-1' }),
      'GET /auth/me': () => json({ data: authUser }),
      'POST /auth/logout': () => json({ statusCode: 500, message: 'boom' }, 500),
    });
    const api = createApiClient({ baseUrl: BASE_URL, fetch });
    await api.auth.login({ email: 'ada@example.test', password: 'pw' });

    await expect(api.auth.logout()).rejects.toBeInstanceOf(ApiError);
    await api.auth.me().catch(() => undefined);

    expect(calls.at(-1)!.headers.get('Authorization')).toBeNull();
  });
});

describe('assistant (ai.chat)', () => {
  const AI_URL = 'http://ai.test/';
  const sse = (...events: object[]) =>
    new Response(
      events
        .map((e) => `event: ${(e as { type: string }).type}\ndata: ${JSON.stringify(e)}\n\n`)
        .join(': ping\n\n'),
      { headers: { 'Content-Type': 'text/event-stream' } },
    );

  async function collect(stream: AsyncIterable<unknown>) {
    const events: unknown[] = [];
    for await (const event of stream) events.push(event);
    return events;
  }

  it('posts the conversation with the session token and yields the stream events', async () => {
    const { fetch, calls } = createFetch({
      'POST /auth/login': () => json({ accessToken: 'token-1' }),
      'GET /auth/me': () => json({ data: authUser }),
      'POST /chat': () =>
        sse(
          { type: 'status', phase: 'thinking' },
          { type: 'text', delta: 'Hi' },
          { type: 'future_event', x: 1 },
          { type: 'done' },
        ),
    });
    const api = createApiClient({
      baseUrl: BASE_URL,
      aiBaseUrl: AI_URL,
      credentials: 'include',
      fetch,
    });
    await api.auth.login({ email: 'ada@example.test', password: 'pw' });

    const events = await collect(api.ai.chat({ messages: [{ role: 'user', content: 'Hello' }] }));

    expect(events).toEqual([
      { type: 'status', phase: 'thinking' },
      { type: 'text', delta: 'Hi' },
      { type: 'done' },
    ]);
    const chat = calls.find((c) => c.key === 'POST /chat')!;
    expect(chat.url.toString()).toBe('http://ai.test/chat');
    expect(chat.headers.get('Authorization')).toBe('Bearer token-1');
    expect(chat.headers.get('Accept')).toBe('text/event-stream');
    expect(chat.init.credentials).toBe('omit');
    expect(JSON.parse(String(chat.init.body))).toEqual({
      messages: [{ role: 'user', content: 'Hello' }],
    });
  });

  it('refreshes the session once on 401 and retries', async () => {
    let token = 'expired';
    const { fetch, calls } = createFetch({
      'POST /auth/refresh': () => {
        token = 'fresh';
        return json({ accessToken: 'fresh' });
      },
      'POST /chat': ({ init }) =>
        new Headers(init.headers).get('Authorization') === `Bearer fresh` && token === 'fresh'
          ? sse({ type: 'done' })
          : json({ statusCode: 401, message: 'Your session has expired. Sign in again.' }, 401),
    });
    const api = createApiClient({
      baseUrl: BASE_URL,
      aiBaseUrl: AI_URL,
      fetch,
      refreshOnUnauthorized: true,
    });

    await expect(
      collect(api.ai.chat({ messages: [{ role: 'user', content: 'Hi' }] })),
    ).resolves.toEqual([{ type: 'done' }]);
    expect(calls.map((c) => c.key)).toEqual(['POST /chat', 'POST /auth/refresh', 'POST /chat']);
  });

  it('rejects with an ApiError for failures before the stream starts', async () => {
    const { fetch } = createFetch({
      'POST /chat': () =>
        json({ statusCode: 429, message: 'Too many questions in a short time.' }, 429),
    });
    const api = createApiClient({ baseUrl: BASE_URL, aiBaseUrl: AI_URL, fetch });

    const error = await collect(api.ai.chat({ messages: [{ role: 'user', content: 'Hi' }] })).catch(
      (e: unknown) => e,
    );

    expect(error).toMatchObject({ kind: 'http', status: 429 });
    expect(getErrorMessage(error)).toBe('Too many questions in a short time.');
  });

  it('reports an unreachable assistant as a network error', async () => {
    const fetch = vi.fn(async () => {
      throw new TypeError('fetch failed');
    });
    const api = createApiClient({ baseUrl: BASE_URL, aiBaseUrl: AI_URL, fetch });

    await expect(
      collect(api.ai.chat({ messages: [{ role: 'user', content: 'Hi' }] })),
    ).rejects.toMatchObject({ kind: 'network', message: 'Could not reach http://ai.test.' });
  });

  it('keeps the caller’s abort as an AbortError', async () => {
    const controller = new AbortController();
    const fetch = vi.fn(async (_input: RequestInfo | URL, init: RequestInit = {}) => {
      controller.abort();
      throw init.signal?.reason ?? new DOMException('aborted', 'AbortError');
    });
    const api = createApiClient({ baseUrl: BASE_URL, aiBaseUrl: AI_URL, fetch });

    const error = await collect(
      api.ai.chat({ messages: [{ role: 'user', content: 'Hi' }] }, { signal: controller.signal }),
    ).catch((e: unknown) => e);

    expect(error).not.toBeInstanceOf(ApiError);
    expect((error as Error).name).toBe('AbortError');
  });

  it('fails fast when the assistant URL is not configured', async () => {
    const fetch = vi.fn();
    const api = createApiClient({ baseUrl: BASE_URL, fetch });

    expect(api.ai.isConfigured).toBe(false);
    await expect(
      collect(api.ai.chat({ messages: [{ role: 'user', content: 'Hi' }] })),
    ).rejects.toMatchObject({ kind: 'config' });
    expect(fetch).not.toHaveBeenCalled();
  });

  it('lists the models on the assistant with the session token and without cookies', async () => {
    const options = {
      defaultProvider: 'anthropic',
      providers: [
        {
          id: 'anthropic',
          label: 'Anthropic',
          defaultModel: 'claude-opus-5-5',
          models: [{ id: 'claude-opus-5-5', label: 'Claude Opus 5.5' }],
        },
      ],
    };
    const { fetch, calls } = createFetch({
      'POST /auth/login': () => json({ accessToken: 'token-1' }),
      'GET /auth/me': () => json({ data: authUser }),
      'GET /models': () => json({ data: options }),
    });
    const api = createApiClient({
      baseUrl: BASE_URL,
      aiBaseUrl: AI_URL,
      credentials: 'include',
      fetch,
    });
    await api.auth.login({ email: 'ada@example.test', password: 'pw' });

    await expect(api.ai.models()).resolves.toEqual(options);
    const call = calls.find((c) => c.key === 'GET /models')!;
    expect(call.url.toString()).toBe('http://ai.test/models');
    expect(call.headers.get('Authorization')).toBe('Bearer token-1');
    expect(call.init.credentials).toBe('omit');
  });

  it('names the assistant, not the API, when it cannot be reached', async () => {
    const fetch = vi.fn(async () => {
      throw new TypeError('fetch failed');
    });
    const api = createApiClient({ baseUrl: BASE_URL, aiBaseUrl: AI_URL, fetch });

    await expect(api.ai.models()).rejects.toMatchObject({
      kind: 'network',
      message: 'Could not reach http://ai.test.',
    });
    await expect(api.health.check()).rejects.toMatchObject({
      message: 'Could not reach the API at http://api.test.',
    });
  });

  it('sends the chosen provider and model with the conversation', async () => {
    const { fetch, calls } = createFetch({ 'POST /chat': () => sse({ type: 'done' }) });
    const api = createApiClient({ baseUrl: BASE_URL, aiBaseUrl: AI_URL, fetch });

    await collect(
      api.ai.chat({
        messages: [{ role: 'user', content: 'Hi' }],
        provider: 'openai',
        model: 'gpt-5.5',
      }),
    );

    expect(JSON.parse(String(calls[0]!.init.body))).toEqual({
      messages: [{ role: 'user', content: 'Hi' }],
      provider: 'openai',
      model: 'gpt-5.5',
    });
  });

  it('does not ask for models without an assistant URL', async () => {
    const fetch = vi.fn();
    const api = createApiClient({ baseUrl: BASE_URL, fetch });
    await expect(api.ai.models()).rejects.toMatchObject({ kind: 'config' });
    expect(fetch).not.toHaveBeenCalled();
  });
});
