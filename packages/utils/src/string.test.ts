import { describe, expect, it } from 'vitest';
import { getInitials, isValidSlug, pluralize, slugify } from './string';

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

describe('slugify', () => {
  it.each([
    ['Running PostgreSQL on my Homelab', 'running-postgresql-on-my-homelab'],
    ['Chạy PostgreSQL trên Homelab', 'chay-postgresql-tren-homelab'],
    ['Đường đi của dữ liệu', 'duong-di-cua-du-lieu'],
    ['  k3s: 3 nodes -- 1 cluster!  ', 'k3s-3-nodes-1-cluster'],
    ['!!!', ''],
  ])('%j → %j', (title, slug) => {
    expect(slugify(title)).toBe(slug);
  });

  it('produces valid slugs', () => {
    expect(isValidSlug(slugify('Hello, World'))).toBe(true);
    expect(isValidSlug('Not A Slug')).toBe(false);
    expect(isValidSlug('a'.repeat(201))).toBe(false);
  });
});
