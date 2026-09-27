/**
 * Roles, permissions and the authenticated user as returned by `GET /auth/me`.
 * The backend is the source of truth for which role grants which permission —
 * the frontend only reads `permissions` and never derives them from `role`.
 */

export const ROLES = ['ROOT', 'ADMIN', 'EDITOR', 'AUTHOR'] as const;
export type Role = (typeof ROLES)[number];

export const PERMISSIONS = [
  'USERS_READ',
  'USERS_CREATE',
  'USERS_UPDATE',
  'USERS_DELETE',
  'CONTENT_READ',
  'CONTENT_CREATE',
  'CONTENT_UPDATE',
  'CONTENT_DELETE',
  'CONTENT_PUBLISH',
] as const;
export type Permission = (typeof PERMISSIONS)[number];

export const USER_STATUSES = ['ACTIVE', 'DISABLED'] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

/** Account as exposed by the API. Never contains credentials or tokens. */
export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  status: UserStatus;
  /** ISO 8601 timestamp. */
  createdAt: string;
  /** ISO 8601 timestamp. */
  updatedAt: string;
}

/** The signed-in user (`GET /auth/me`), including the permissions granted by the backend. */
export interface AuthUser extends Pick<User, 'id' | 'email' | 'name' | 'role'> {
  permissions: Permission[];
}

export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Body of `POST /auth/login` and `POST /auth/refresh`. The refresh token itself is an
 * httpOnly cookie and never reaches JavaScript; a short-lived access token may be returned
 * for `Authorization: Bearer` use. Backends using cookie-only sessions may omit it.
 */
export interface AuthTokenResponse {
  accessToken?: string;
}
