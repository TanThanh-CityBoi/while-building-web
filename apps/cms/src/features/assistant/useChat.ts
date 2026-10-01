import { getErrorMessage, type AiApi } from '@while-building/api-client';
import {
  CHAT_LIMITS,
  type ChatMessage,
  type ChatRole,
  type ChatSource,
  type ChatStreamEvent,
} from '@while-building/types';
import { useEffect, useReducer, useRef } from 'react';
import { api } from '@/lib/api';

/** The part of the API client the chat needs (tests pass a fake). */
export type ChatClient = Pick<AiApi, 'chat' | 'isConfigured'>;

export type TurnStatus = 'streaming' | 'done' | 'error' | 'stopped';

export interface ChatTurn {
  id: number;
  role: ChatRole;
  content: string;
  /** User turns are always `done`. */
  status: TurnStatus;
  sources: ChatSource[];
  /** A message safe to show, when `status` is `error`. */
  error?: string;
}

/** What the assistant is doing while no text is arriving. */
export type Activity = { kind: 'thinking' } | { kind: 'tool'; tool: string } | null;

interface State {
  turns: ChatTurn[];
  activity: Activity;
  streaming: boolean;
  nextId: number;
}

type Action =
  | { type: 'send'; content: string }
  | { type: 'retry' }
  | { type: 'event'; event: ChatStreamEvent }
  | { type: 'failed'; message: string }
  | { type: 'stopped' }
  | { type: 'reset' };

const initialState: State = { turns: [], activity: null, streaming: false, nextId: 1 };

function assistantTurn(id: number): ChatTurn {
  return { id, role: 'assistant', content: '', status: 'streaming', sources: [] };
}

/** Applies `change` to the last turn if it is the assistant's answer in progress. */
function updateAnswer(state: State, change: Partial<ChatTurn>): ChatTurn[] {
  const last = state.turns.at(-1);
  if (!last || last.role !== 'assistant' || last.status !== 'streaming') return state.turns;
  return [...state.turns.slice(0, -1), { ...last, ...change }];
}

function finish(state: State, change: Partial<ChatTurn>): State {
  return { ...state, turns: updateAnswer(state, change), streaming: false, activity: null };
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'send': {
      const question: ChatTurn = {
        id: state.nextId,
        role: 'user',
        content: action.content,
        status: 'done',
        sources: [],
      };
      return {
        turns: [...state.turns, question, assistantTurn(state.nextId + 1)],
        activity: { kind: 'thinking' },
        streaming: true,
        nextId: state.nextId + 2,
      };
    }
    case 'retry':
      return {
        turns: [...state.turns.slice(0, -1), assistantTurn(state.nextId)],
        activity: { kind: 'thinking' },
        streaming: true,
        nextId: state.nextId + 1,
      };
    case 'event': {
      const { event } = action;
      switch (event.type) {
        case 'status':
          if (event.phase === 'thinking') return { ...state, activity: { kind: 'thinking' } };
          if (event.phase === 'tool_start' && event.tool) {
            return { ...state, activity: { kind: 'tool', tool: event.tool } };
          }
          return state;
        case 'text': {
          const last = state.turns.at(-1);
          return {
            ...state,
            turns: updateAnswer(state, { content: (last?.content ?? '') + event.delta }),
            activity: null,
          };
        }
        case 'sources':
          return { ...state, turns: updateAnswer(state, { sources: event.sources }) };
        case 'done':
          return finish(state, { status: 'done' });
        case 'error':
          return finish(state, { status: 'error', error: event.message });
      }
      return state;
    }
    case 'failed':
      return finish(state, { status: 'error', error: action.message });
    case 'stopped':
      return finish(state, { status: 'stopped' });
    case 'reset':
      return { ...initialState, nextId: state.nextId };
  }
}

/** The conversation as the assistant sees it: questions and completed answers, as plain text. */
function toHistory(turns: ChatTurn[]): ChatMessage[] {
  return turns
    .filter((turn) => turn.role === 'user' || (turn.status === 'done' && turn.content.trim()))
    .map(({ role, content }) => ({ role, content }));
}

/** Keeps the most recent messages that fit the assistant's limits, starting with a question. */
export function fitToLimits(messages: ChatMessage[]): ChatMessage[] {
  const kept: ChatMessage[] = [];
  let total = 0;
  for (const message of [...messages].reverse()) {
    if (kept.length === CHAT_LIMITS.maxMessages) break;
    if (total + message.content.length > CHAT_LIMITS.maxTotalLength) break;
    kept.unshift(message);
    total += message.content.length;
  }
  while (kept.length > 0 && kept[0]?.role !== 'user') kept.shift();
  return kept;
}

/**
 * Chat with the While Building assistant: the conversation lives in memory (gone on reload or
 * sign-out). Answers stream in; `stop` cancels the request (and the answer on the server).
 */
export function useChat(client: ChatClient = api.ai) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const controller = useRef<AbortController | null>(null);

  // Leaving the page cancels an answer in progress.
  useEffect(() => () => controller.current?.abort(), []);

  async function ask(history: ChatMessage[]) {
    const current = new AbortController();
    controller.current = current;
    let finished = false;
    try {
      for await (const event of client.chat(
        { messages: fitToLimits(history) },
        { signal: current.signal },
      )) {
        dispatch({ type: 'event', event });
        if (event.type === 'done' || event.type === 'error') finished = true;
      }
      if (!finished && !current.signal.aborted) {
        dispatch({ type: 'failed', message: 'The answer was interrupted. Try again.' });
      }
    } catch (error) {
      // `stop` already marked the answer as stopped.
      if (current.signal.aborted) return;
      dispatch({
        type: 'failed',
        message: getErrorMessage(error, 'The assistant could not answer.'),
      });
    } finally {
      if (controller.current === current) controller.current = null;
    }
  }

  const last = state.turns.at(-1);
  const canRetry =
    !state.streaming &&
    last?.role === 'assistant' &&
    (last.status === 'error' || last.status === 'stopped');

  return {
    turns: state.turns,
    activity: state.activity,
    streaming: state.streaming,
    canRetry,
    isConfigured: client.isConfigured,

    send(text: string) {
      const content = text.trim();
      // `controller` is set synchronously by `ask`: catches a second send in the same render.
      if (!content || state.streaming || controller.current) return;
      dispatch({ type: 'send', content });
      void ask([...toHistory(state.turns), { role: 'user', content }]);
    },

    stop() {
      if (!state.streaming) return;
      controller.current?.abort();
      dispatch({ type: 'stopped' });
    },

    retry() {
      if (!canRetry || controller.current) return;
      dispatch({ type: 'retry' });
      void ask(toHistory(state.turns.slice(0, -1)));
    },

    reset() {
      controller.current?.abort();
      dispatch({ type: 'reset' });
    },
  };
}
