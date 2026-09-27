import { describe, expect, it } from 'vitest';
import { getInitials, pluralize } from './string';

describe('getInitials', () => {
  it('uses the first and last word', () => {
    expect(getInitials('Ada Lovelace')).toBe('AL');
    expect(getInitials('  grace   brewster  hopper ')).toBe('GH');
  });

  it('handles single names and empty input', () => {
    expect(getInitials('ada')).toBe('A');
    expect(getInitials('   ')).toBe('?');
  });
});

describe('pluralize', () => {
  it('chooses singular or plural', () => {
    expect(pluralize(1, 'article')).toBe('1 article');
    expect(pluralize(0, 'article')).toBe('0 articles');
    expect(pluralize(2, 'entry', 'entries')).toBe('2 entries');
  });
});
