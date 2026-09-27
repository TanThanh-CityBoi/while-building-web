import type {
  ApiResponse,
  CreateUserInput,
  ListUsersParams,
  PaginatedResponse,
  UpdateUserInput,
  User,
  UserStatus,
} from '@while-building/types';
import type { HttpClient } from '../http';

interface CallOptions {
  signal?: AbortSignal;
}

const userPath = (id: string) => `/users/${encodeURIComponent(id)}`;

/** User management. The backend excludes ROOT from every response. */
export function createUsersApi(http: HttpClient) {
  return {
    /** `GET /users` */
    list(params: ListUsersParams = {}, { signal }: CallOptions = {}) {
      return http.request<PaginatedResponse<User>>('/users', { query: { ...params }, signal });
    },

    /** `GET /users/:id` */
    async get(id: string, { signal }: CallOptions = {}): Promise<User> {
      return (await http.request<ApiResponse<User>>(userPath(id), { signal })).data;
    },

    /** `POST /users` */
    async create(input: CreateUserInput): Promise<User> {
      return (await http.request<ApiResponse<User>>('/users', { method: 'POST', body: input }))
        .data;
    },

    /** `PATCH /users/:id` — profile, role and (optionally) a new password. */
    async update(id: string, input: UpdateUserInput): Promise<User> {
      return (await http.request<ApiResponse<User>>(userPath(id), { method: 'PATCH', body: input }))
        .data;
    },

    /** `PATCH /users/:id/status` — enable or disable an account. */
    async updateStatus(id: string, status: UserStatus): Promise<User> {
      const path = `${userPath(id)}/status`;
      return (await http.request<ApiResponse<User>>(path, { method: 'PATCH', body: { status } }))
        .data;
    },

    /** `DELETE /users/:id` */
    async remove(id: string): Promise<void> {
      await http.request<void>(userPath(id), { method: 'DELETE' });
    },
  };
}

export type UsersApi = ReturnType<typeof createUsersApi>;
