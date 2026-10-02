import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApiError } from '@while-building/api-client';
import type { AiModelOptions, ChatRequest, ChatStreamEvent } from '@while-building/types';
import { describe, expect, it, vi } from 'vitest';
import { AssistantPage } from './AssistantPage';
import type { ChatClient } from './useChat';

type Script = (signal?: AbortSignal) => AsyncGenerator<ChatStreamEvent>;

/** Plays the given events, then ends. */
const answer = (...events: ChatStreamEvent[]): Script =>
  async function* () {
    for (const event of events) {
      await Promise.resolve();
      yield event;
    }
  };

/** Plays the given events, then waits until the request is aborted. */
const hang = (...events: ChatStreamEvent[]): Script =>
  async function* (signal) {
    for (const event of events) yield event;
    await new Promise((_, reject) =>
      signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError'))),
    );
  };

const failing = (error: Error): Script =>
  // eslint-disable-next-line require-yield
  async function* () {
    throw error;
  };

const MODEL_OPTIONS: AiModelOptions = {
  defaultProvider: 'anthropic',
  providers: [
    {
      id: 'anthropic',
      label: 'Anthropic',
      defaultModel: 'claude-opus-5-5',
      models: [
        { id: 'claude-opus-5-5', label: 'Claude Opus 5.5' },
        { id: 'claude-sonnet-5-5', label: 'Claude Sonnet 5.5' },
      ],
    },
    {
      id: 'openai',
      label: 'OpenAI',
      defaultModel: 'gpt-5.5',
      models: [
        { id: 'gpt-5.5', label: 'GPT-5.5' },
        { id: 'gpt-5.4-mini', label: 'GPT-5.4 mini' },
      ],
    },
    {
      id: 'gemini',
      label: 'Google Gemini',
      defaultModel: 'gemini-pro-latest',
      models: [
        { id: 'gemini-pro-latest', label: 'Gemini Pro (latest)' },
        { id: 'gemini-flash-latest', label: 'Gemini Flash (latest)' },
      ],
    },
  ],
};

function renderPage(client: ChatClient) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <AssistantPage client={client} />
    </QueryClientProvider>,
  );
}

/** A stand-in for `api.ai`: each call plays the next script. */
function createFakeClient(...scripts: Script[]) {
  const signals: Array<AbortSignal | undefined> = [];
  const chat = vi.fn((_request: ChatRequest, options?: { signal?: AbortSignal }) => {
    signals.push(options?.signal);
    const script = scripts.shift();
    if (!script) throw new Error('No scripted answer left');
    return script(options?.signal);
  });
  const models = vi.fn(async (_options?: { signal?: AbortSignal }) => MODEL_OPTIONS);
  const client: ChatClient = { chat, models, isConfigured: true };
  return { client, chat, models, signals };
}

const k3sAnswer = answer(
  { type: 'status', phase: 'thinking' },
  { type: 'status', phase: 'tool_start', tool: 'search_articles' },
  { type: 'status', phase: 'tool_end', tool: 'search_articles', ok: true },
  { type: 'text', delta: 'There is ' },
  { type: 'text', delta: '"My k3s Homelab".' },
  {
    type: 'sources',
    sources: [
      {
        kind: 'article',
        slug: 'k3s-homelab',
        title: 'My k3s Homelab',
        uri: 'article://k3s-homelab',
      },
    ],
  },
  { type: 'done' },
);

/** The model list arrives asynchronously; questions sent after it carry the selection. */
async function modelsLoaded() {
  await screen.findByRole('option', { name: 'OpenAI' });
}

async function ask(user: ReturnType<typeof userEvent.setup>, question: string) {
  await user.type(screen.getByRole('textbox', { name: 'Your question' }), question);
  await user.click(screen.getByRole('button', { name: 'Send' }));
}

describe('AssistantPage', () => {
  it('sends a question and shows the streamed answer with its sources', async () => {
    const user = userEvent.setup();
    const { client, chat } = createFakeClient(
      k3sAnswer,
      answer({ type: 'text', delta: 'Sure.' }, { type: 'done' }),
    );
    renderPage(client);
    await modelsLoaded();

    await ask(user, 'Any k3s articles?');

    expect(await screen.findByText('There is "My k3s Homelab".')).toBeTruthy();
    expect(screen.getByText('Any k3s articles?')).toBeTruthy();
    expect(screen.getByText('Article · My k3s Homelab')).toBeTruthy();
    expect(chat).toHaveBeenCalledWith(
      {
        messages: [{ role: 'user', content: 'Any k3s articles?' }],
        provider: 'anthropic',
        model: 'claude-opus-5-5',
      },
      expect.objectContaining({ signal: expect.any(AbortSignal) as AbortSignal }),
    );
    expect(
      (screen.getByRole('textbox', { name: 'Your question' }) as HTMLTextAreaElement).value,
    ).toBe('');

    // Follow-up questions carry the conversation so far.
    await ask(user, 'And projects?');
    expect(await screen.findByText('Sure.')).toBeTruthy();
    expect(chat.mock.calls[1]?.[0]).toEqual({
      messages: [
        { role: 'user', content: 'Any k3s articles?' },
        { role: 'assistant', content: 'There is "My k3s Homelab".' },
        { role: 'user', content: 'And projects?' },
      ],
      provider: 'anthropic',
      model: 'claude-opus-5-5',
    });
  });

  it('shows what the assistant is doing, and Stop cancels the request', async () => {
    const user = userEvent.setup();
    const { client, signals } = createFakeClient(
      hang(
        { type: 'status', phase: 'thinking' },
        { type: 'status', phase: 'tool_start', tool: 'search_articles' },
      ),
    );
    renderPage(client);

    await ask(user, 'Any k3s articles?');

    expect(await screen.findByText('Searching articles…')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Send' })).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Stop' }));

    expect(signals[0]?.aborted).toBe(true);
    expect(await screen.findByText('Stopped.')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Send' })).toBeTruthy();
  });

  it('shows errors from before the stream and retries the same question', async () => {
    const user = userEvent.setup();
    const { client, chat } = createFakeClient(
      failing(
        new ApiError({
          kind: 'http',
          status: 429,
          message: 'Too many questions in a short time. Try again in a few minutes.',
        }),
      ),
      answer({ type: 'text', delta: 'Here you go.' }, { type: 'done' }),
    );
    renderPage(client);
    await modelsLoaded();

    await ask(user, 'Hi');

    expect(
      await screen.findByText('Too many questions in a short time. Try again in a few minutes.'),
    ).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Try again' }));

    expect(await screen.findByText('Here you go.')).toBeTruthy();
    expect(chat).toHaveBeenCalledTimes(2);
    expect(chat.mock.calls[1]?.[0]).toEqual(chat.mock.calls[0]?.[0]);
  });

  it('keeps a partial answer and shows an error event', async () => {
    const user = userEvent.setup();
    const { client } = createFakeClient(
      answer(
        { type: 'text', delta: 'Partial answer' },
        { type: 'error', code: 'timeout', message: 'The assistant took too long to answer.' },
      ),
    );
    renderPage(client);

    await ask(user, 'Hi');

    expect(await screen.findByText('The assistant took too long to answer.')).toBeTruthy();
    expect(screen.getByText('Partial answer')).toBeTruthy();
  });

  it('reports a stream that ends without finishing', async () => {
    const user = userEvent.setup();
    const { client } = createFakeClient(answer({ type: 'text', delta: 'Half' }));
    renderPage(client);

    await ask(user, 'Hi');

    expect(await screen.findByText('The answer was interrupted. Try again.')).toBeTruthy();
  });

  it('sends with Enter and adds a line with Shift+Enter', async () => {
    const user = userEvent.setup();
    const { client, chat } = createFakeClient(answer({ type: 'done' }));
    renderPage(client);
    await modelsLoaded();
    const box = screen.getByRole('textbox', { name: 'Your question' });

    await user.type(box, 'Line one{Shift>}{Enter}{/Shift}Line two');
    expect(chat).not.toHaveBeenCalled();
    await user.type(box, '{Enter}');

    expect(chat.mock.calls[0]?.[0]).toEqual({
      messages: [{ role: 'user', content: 'Line one\nLine two' }],
      provider: 'anthropic',
      model: 'claude-opus-5-5',
    });
  });

  it('sends a suggestion and starts a new conversation', async () => {
    const user = userEvent.setup();
    const { client, chat } = createFakeClient(k3sAnswer);
    renderPage(client);

    await user.click(screen.getByRole('button', { name: 'Which articles are about Kubernetes?' }));
    expect(await screen.findByText('There is "My k3s Homelab".')).toBeTruthy();
    expect(chat).toHaveBeenCalledOnce();

    await user.click(screen.getByRole('button', { name: 'New conversation' }));
    expect(screen.queryByText('There is "My k3s Homelab".')).toBeNull();
    expect(screen.getByText('Ask about your content')).toBeTruthy();
  });

  it('explains when the assistant is not configured', () => {
    const client: ChatClient = { chat: vi.fn(), models: vi.fn(), isConfigured: false };
    renderPage(client);

    expect(screen.getByText('The assistant is not configured')).toBeTruthy();
    expect(
      (screen.getByRole('textbox', { name: 'Your question' }) as HTMLTextAreaElement).disabled,
    ).toBe(true);
  });

  it('cancels an answer in progress when leaving the page', async () => {
    const user = userEvent.setup();
    const { client, signals } = createFakeClient(hang({ type: 'status', phase: 'thinking' }));
    const { unmount } = renderPage(client);

    await ask(user, 'Hi');
    act(() => unmount());

    expect(signals[0]?.aborted).toBe(true);
  });

  describe('provider and model', () => {
    const providerSelect = () => screen.getByRole('combobox', { name: 'Provider' });
    const modelSelect = () => screen.getByRole('combobox', { name: 'Model' });
    const optionLabels = (select: HTMLElement) =>
      within(select)
        .getAllByRole('option')
        .map((option) => option.textContent);

    it('offers the server providers and only the models of the selected one', async () => {
      const { client } = createFakeClient();
      renderPage(client);

      await modelsLoaded();
      expect(optionLabels(providerSelect())).toEqual(['Anthropic', 'OpenAI', 'Google Gemini']);
      expect((providerSelect() as HTMLSelectElement).value).toBe('anthropic');
      expect(optionLabels(modelSelect())).toEqual(['Claude Opus 5.5', 'Claude Sonnet 5.5']);
      expect((modelSelect() as HTMLSelectElement).value).toBe('claude-opus-5-5');
    });

    it('resets the model when the provider changes and sends the selection', async () => {
      const user = userEvent.setup();
      const { client, chat } = createFakeClient(
        answer({ type: 'text', delta: 'Hi from GPT' }, { type: 'done' }),
      );
      renderPage(client);
      await modelsLoaded();

      await user.selectOptions(providerSelect(), 'openai');
      expect(optionLabels(modelSelect())).toEqual(['GPT-5.5', 'GPT-5.4 mini']);
      expect((modelSelect() as HTMLSelectElement).value).toBe('gpt-5.5');
      await user.selectOptions(modelSelect(), 'gpt-5.4-mini');
      await ask(user, 'Hello');

      expect(await screen.findByText('Hi from GPT')).toBeTruthy();
      expect(chat.mock.calls[0]?.[0]).toEqual({
        messages: [{ role: 'user', content: 'Hello' }],
        provider: 'openai',
        model: 'gpt-5.4-mini',
      });
      // The answer says which model wrote it.
      expect(screen.getByText('Assistant · GPT-5.4 mini')).toBeTruthy();
    });

    it('lets the user pick a Gemini model', async () => {
      const user = userEvent.setup();
      const { client, chat } = createFakeClient(
        answer({ type: 'text', delta: 'Hi from Gemini' }, { type: 'done' }),
      );
      renderPage(client);
      await modelsLoaded();

      await user.selectOptions(providerSelect(), 'gemini');
      expect(optionLabels(modelSelect())).toEqual(['Gemini Pro (latest)', 'Gemini Flash (latest)']);
      expect((modelSelect() as HTMLSelectElement).value).toBe('gemini-pro-latest');
      await user.selectOptions(modelSelect(), 'gemini-flash-latest');
      await ask(user, 'Hello');

      expect(await screen.findByText('Hi from Gemini')).toBeTruthy();
      expect(chat.mock.calls[0]?.[0]).toEqual({
        messages: [{ role: 'user', content: 'Hello' }],
        provider: 'gemini',
        model: 'gemini-flash-latest',
      });
      expect(screen.getByText('Assistant · Gemini Flash (latest)')).toBeTruthy();
    });

    it('locks the selection while an answer streams', async () => {
      const user = userEvent.setup();
      const { client } = createFakeClient(hang({ type: 'status', phase: 'thinking' }));
      renderPage(client);
      await modelsLoaded();

      await ask(user, 'Hi');

      expect((providerSelect() as HTMLSelectElement).disabled).toBe(true);
      expect((modelSelect() as HTMLSelectElement).disabled).toBe(true);
    });

    it('still answers with the server default when the models cannot be loaded', async () => {
      const user = userEvent.setup();
      const { client, chat, models } = createFakeClient(answer({ type: 'done' }));
      models.mockRejectedValue(
        new ApiError({ kind: 'network', message: 'Could not reach http://ai.test.' }),
      );
      renderPage(client);

      expect(
        await screen.findByText("Couldn't load the models: questions use the server's default."),
      ).toBeTruthy();
      await ask(user, 'Hi');

      expect(chat.mock.calls[0]?.[0]).toEqual({ messages: [{ role: 'user', content: 'Hi' }] });
    });
  });
});
