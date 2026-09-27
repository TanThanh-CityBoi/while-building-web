import { describe, expect, it } from 'vitest';
import { formatDate, formatRelativeTime } from './date';

describe('formatDate', () => {
  it('formats date-only ISO strings without shifting the day', () => {
    expect(formatDate('2026-09-12')).toBe('Sep 12, 2026');
    expect(formatDate('2026-01-01')).toBe('Jan 1, 2026');
  });
});

describe('formatRelativeTime', () => {
  const now = new Date('2026-09-27T12:00:00Z');

  it('treats the last few seconds as "just now"', () => {
    expect(formatRelativeTime('2026-09-27T11:59:30Z', now)).toBe('just now');
  });

  it('picks the largest sensible unit', () => {
    expect(formatRelativeTime('2026-09-27T11:55:00Z', now)).toBe('5 minutes ago');
    expect(formatRelativeTime('2026-09-27T09:00:00Z', now)).toBe('3 hours ago');
    expect(formatRelativeTime('2026-09-26T12:00:00Z', now)).toBe('yesterday');
    expect(formatRelativeTime('2026-09-13T12:00:00Z', now)).toBe('2 weeks ago');
    expect(formatRelativeTime('2025-09-27T12:00:00Z', now)).toBe('last year');
  });

  it('handles future dates', () => {
    expect(formatRelativeTime('2026-09-27T14:00:00Z', now)).toBe('in 2 hours');
  });
});
