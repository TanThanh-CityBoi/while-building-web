import type { AuthUser, Permission } from '@while-building/types';

/**
 * Permission checks drive UX only (hiding navigation, disabling actions, guarding pages).
 * They are not security: the API must authorize every request on its own.
 */
export function hasPermission(user: Pick<AuthUser, 'permissions'> | null, permission: Permission) {
  return user?.permissions.includes(permission) ?? false;
}

export interface PermissionScoped<T> {
  permission?: Permission;
  children?: T[];
}

/** Drops items (and nested children) the user may not see; parents left empty are dropped too. */
export function filterByPermission<T extends PermissionScoped<T>>(
  items: T[],
  can: (permission: Permission) => boolean,
): T[] {
  return items.flatMap((item) => {
    if (item.permission && !can(item.permission)) return [];
    if (!item.children) return [item];
    const children = filterByPermission(item.children, can);
    return children.length > 0 ? [{ ...item, children }] : [];
  });
}
