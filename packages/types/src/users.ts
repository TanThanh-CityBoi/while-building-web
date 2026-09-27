import type { Role, UserStatus } from './auth';

/** Roles that can be assigned from the CMS. ROOT is provisioned by the backend only. */
export type AssignableRole = Exclude<Role, 'ROOT'>;

export interface ListUsersParams {
  search?: string;
  role?: AssignableRole;
  status?: UserStatus;
  /** 1-based. */
  page?: number;
  pageSize?: number;
}

export interface CreateUserInput {
  name: string;
  email: string;
  role: AssignableRole;
  /** Initial password; sent once over HTTPS and never stored client-side. */
  password: string;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  role?: AssignableRole;
  /** Sets a new password (admin reset), where the backend supports it. */
  password?: string;
}

export interface UpdateUserStatusInput {
  status: UserStatus;
}
