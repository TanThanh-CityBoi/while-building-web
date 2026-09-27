import { describe, expect, it } from 'vitest';
import { joinUrl, toQueryString, trimTrailingSlash } from './url';

describe('joinUrl', () => {
  it('joins with exactly one slash', () => {
    expect(joinUrl('http://localhost:3000', '/health')).toBe('http://localhost:3000/health');
    expect(joinUrl('http://localhost:3000/', 'health')).toBe('http://localhost:3000/health');
    expect(joinUrl('https://api.example.com/v1//', '//users')).toBe(
      'https://api.example.com/v1/users',
    );
  });
});

describe('trimTrailingSlash', () => {
  it('removes every trailing slash', () => {
    expect(trimTrailingSlash('http://x.test///')).toBe('http://x.test');
    expect(trimTrailingSlash('http://x.test')).toBe('http://x.test');
  });
});

describe('toQueryString', () => {
  it('skips empty values and encodes the rest', () => {
    expect(toQueryString({ search: 'ada l', role: undefined, status: '', page: 2 })).toBe(
      '?search=ada+l&page=2',
    );
  });

  it('returns an empty string when nothing is set', () => {
    expect(toQueryString({ a: undefined, b: null })).toBe('');
    expect(toQueryString()).toBe('');
  });
});
