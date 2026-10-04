import type { AssignableRole, Role, UserStatus } from '@while-building/types';
import type { Tone } from '@/components/ToneBadge';

const ROLE_LABELS: Record<Role, string> = {
  ROOT: 'Root',
  ADMIN: 'Admin',
  EDITOR: 'Editor',
  AUTHOR: 'Author',
};

export const roleLabel = (role: Role) => ROLE_LABELS[role];

/**
 * Roles an admin can assign from the CMS. ROOT is provisioned by the backend and never offered.
 * Descriptions are guidance only — the backend decides what each role may actually do.
 */
export const ASSIGNABLE_ROLES: ReadonlyArray<{ value: AssignableRole; description: string }> = [
  { value: 'ADMIN', description: 'Manages users and all content.' },
  { value: 'EDITOR', description: 'Edits and publishes all content.' },
  { value: 'AUTHOR', description: 'Writes and edits content.' },
];

export const roleTone: Record<Role, Tone> = {
  ROOT: 'brand',
  ADMIN: 'info',
  EDITOR: 'success',
  AUTHOR: 'neutral',
};

export const statusLabel: Record<UserStatus, string> = {
  ACTIVE: 'Active',
  DISABLED: 'Disabled',
};
