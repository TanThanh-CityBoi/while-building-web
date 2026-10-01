import { CHAT_LIMITS } from '@while-building/types';
import { describe, expect, it } from 'vitest';
import { fitToLimits } from './useChat';

describe('fitToLimits', () => {
  it('keeps short conversations as they are', () => {
    const messages = [
      { role: 'user' as const, content: 'Hi' },
      { role: 'assistant' as const, content: 'Hello' },
      { role: 'user' as const, content: 'More?' },
    ];
    expect(fitToLimits(messages)).toEqual(messages);
  });

  it('drops the oldest messages beyond the message limit, starting with a question', () => {
    const messages = Array.from({ length: 25 }, (_, i) => ({
      role: i % 2 === 0 ? ('user' as const) : ('assistant' as const),
      content: `m${i}`,
    }));
    const kept = fitToLimits(messages);
    expect(kept.length).toBeLessThanOrEqual(CHAT_LIMITS.maxMessages);
    expect(kept[0]?.role).toBe('user');
    expect(kept.at(-1)).toEqual({ role: 'user', content: 'm24' });
  });

  it('drops the oldest messages beyond the total length', () => {
    const long = 'x'.repeat(7_000);
    const messages = [
      { role: 'user' as const, content: long },
      { role: 'assistant' as const, content: long },
      { role: 'user' as const, content: long },
      { role: 'assistant' as const, content: long },
      { role: 'user' as const, content: long },
    ];
    const kept = fitToLimits(messages);
    expect(kept.reduce((sum, m) => sum + m.content.length, 0)).toBeLessThanOrEqual(
      CHAT_LIMITS.maxTotalLength,
    );
    expect(kept).toHaveLength(3);
    expect(kept[0]?.role).toBe('user');
  });
});
