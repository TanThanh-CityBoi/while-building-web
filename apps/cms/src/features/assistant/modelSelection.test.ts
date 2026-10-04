import type { AiModelOptions } from '@while-building/types';
import { describe, expect, it } from 'vitest';
import { resolveSelection } from './modelSelection';

const options: AiModelOptions = {
  defaultProvider: 'openai',
  providers: [
    {
      id: 'anthropic',
      label: 'Anthropic',
      defaultModel: 'claude-sonnet-5-5',
      models: [
        { id: 'claude-opus-5-5', label: 'Claude Opus 5.5' },
        { id: 'claude-sonnet-5-5', label: 'Claude Sonnet 5.5' },
      ],
    },
    {
      id: 'openai',
      label: 'OpenAI',
      defaultModel: 'gpt-5.5',
      models: [{ id: 'gpt-5.5', label: 'GPT-5.5' }],
    },
  ],
};

describe('resolveSelection', () => {
  it('uses the server defaults without a choice', () => {
    expect(resolveSelection(options, null)).toEqual({
      provider: 'openai',
      model: 'gpt-5.5',
      label: 'GPT-5.5',
    });
    expect(resolveSelection(undefined, null)).toBeUndefined();
  });

  it('keeps a choice the server still offers', () => {
    expect(resolveSelection(options, { provider: 'anthropic', model: 'claude-opus-5-5' })).toEqual({
      provider: 'anthropic',
      model: 'claude-opus-5-5',
      label: 'Claude Opus 5.5',
    });
  });

  it('falls back when the server no longer offers the choice', () => {
    expect(resolveSelection(options, { provider: 'anthropic', model: 'claude-haiku' })).toEqual({
      provider: 'anthropic',
      model: 'claude-sonnet-5-5',
      label: 'Claude Sonnet 5.5',
    });
    expect(resolveSelection(options, { provider: 'mistral', model: 'x' })).toEqual({
      provider: 'openai',
      model: 'gpt-5.5',
      label: 'GPT-5.5',
    });
  });
});
