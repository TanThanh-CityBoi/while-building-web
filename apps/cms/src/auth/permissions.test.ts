import type { Permission } from '@while-building/types';
import { describe, expect, it } from 'vitest';
import { navigation } from '@/layouts/navigation';
import { filterByPermission, hasPermission } from './permissions';

const canOnly =
  (...granted: Permission[]) =>
  (permission: Permission) =>
    granted.includes(permission);

describe('hasPermission', () => {
  it('only trusts permissions returned by the API', () => {
    const user = { permissions: ['CONTENT_READ'] satisfies Permission[] };
    expect(hasPermission(user, 'CONTENT_READ')).toBe(true);
    expect(hasPermission(user, 'USERS_READ')).toBe(false);
    expect(hasPermission(null, 'CONTENT_READ')).toBe(false);
  });
});

describe('filterByPermission (sidebar navigation)', () => {
  const labels = (items: typeof navigation): string[] =>
    items.flatMap((item) => [item.label, ...labels(item.children ?? [])]);

  it('shows everything to an admin', () => {
    expect(labels(filterByPermission(navigation, canOnly('USERS_READ', 'CONTENT_READ')))).toEqual([
      'Dashboard',
      'Content',
      'Articles',
      'Projects',
      'Users',
      'Settings',
    ]);
  });

  it('hides Users from someone without USERS_READ', () => {
    expect(labels(filterByPermission(navigation, canOnly('CONTENT_READ')))).toEqual([
      'Dashboard',
      'Content',
      'Articles',
      'Projects',
      'Settings',
    ]);
  });

  it('hides a whole section when none of its items are allowed', () => {
    expect(labels(filterByPermission(navigation, canOnly()))).toEqual(['Dashboard', 'Settings']);
  });

  it('drops parents left without visible children', () => {
    interface Item {
      label: string;
      permission?: Permission;
      children?: Item[];
    }
    const items: Item[] = [
      { label: 'Parent', children: [{ label: 'Child', permission: 'USERS_READ' }] },
    ];
    expect(filterByPermission(items, canOnly())).toEqual([]);
  });
});
