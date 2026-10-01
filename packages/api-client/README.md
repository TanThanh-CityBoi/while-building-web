# @while-building/api-client

The only HTTP layer used by `apps/client` and `apps/cms`. It is framework-agnostic (no React);
the apps wrap its functions in React Query hooks.

```ts
// Public site: no cookies, no session.
const api = createApiClient({ baseUrl: import.meta.env.VITE_API_URL });

// CMS: send the refresh cookie and refresh the session once on a 401.
const api = createApiClient({
  baseUrl: import.meta.env.VITE_API_URL,
  credentials: 'include',
  refreshOnUnauthorized: true,
});

await api.health.check();
await api.auth.login({ email, password }); // → AuthUser
await api.users.list({ search: 'ada', page: 1 });

// The assistant (CMS): a separate app with its own base URL, same access token.
const api = createApiClient({ baseUrl, aiBaseUrl: import.meta.env.VITE_AI_URL /* … */ });
for await (const event of api.ai.chat({ messages }, { signal })) {
  // { type: 'status' | 'text' | 'sources' | 'error' | 'done', … }
}
```

**If `while-building-api` differs from the contract below, change this package** (usually a single
endpoint file) rather than the apps.

## Behaviour

- **Errors** are `ApiError` with `kind` (`http` | `network` | `timeout` | `config`), `status`,
  `messages` (all validation messages) and `body`. `getErrorMessage(error)` returns a user-safe
  message (5xx details are never shown). Caller aborts stay `AbortError`s.
- **Access token** — kept in memory, sent as `Authorization: Bearer …`. Never persisted.
- **Refresh token** — an httpOnly cookie handled by the browser; JavaScript never sees it.
- **401 handling** (`refreshOnUnauthorized`) — one `POST /auth/refresh` shared by all concurrent
  requests (safe with refresh-token rotation), then a single retry. If the refresh is rejected
  (401/403), `api.session.onExpired` listeners fire. Network failures are not treated as an
  expired session.
- **Timeouts** — 10 s by default (`timeoutMs`).

## Contract

Conventions: JSON bodies; single resources are wrapped as `{ "data": T }`, lists as
`{ "data": T[], "meta": { page, pageSize, total, totalPages } }` (1-based pages). Errors use the
NestJS shape `{ "statusCode": 400, "message": "…" | ["…"], "error": "Bad Request" }`.
Types live in `@while-building/types`.

### Health

| Endpoint      | Response                                                                                     |
| ------------- | -------------------------------------------------------------------------------------------- |
| `GET /health` | `200 { "status": "ok", "database": "up" }` · `503 { "status": "error", "database": "down" }` |

### Auth

| Endpoint             | Request                   | Response                                                                                                                                   |
| -------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `POST /auth/login`   | `{ "email", "password" }` | `200 { "accessToken"? }` + sets the refresh cookie · `401` wrong credentials · `403` disabled account (message shown) · `429` rate limited |
| `POST /auth/refresh` | refresh cookie            | `200 { "accessToken"? }` + rotated cookie · `401` no/invalid session                                                                       |
| `POST /auth/logout`  | refresh cookie            | `204`, clears the cookie. Should succeed even without a valid access token.                                                                |
| `GET /auth/me`       | `Authorization: Bearer`   | `200 { "data": { "id", "email", "name", "role", "permissions": Permission[] } }` · `401`                                                   |

`accessToken` is optional: a backend using cookie-only sessions can omit it and everything still
works, because every request is sent with `credentials: 'include'`.

Roles: `ROOT`, `ADMIN`, `EDITOR`, `AUTHOR`. Permissions: `USERS_READ`, `USERS_CREATE`,
`USERS_UPDATE`, `USERS_DELETE`, `CONTENT_READ`, `CONTENT_CREATE`, `CONTENT_UPDATE`,
`CONTENT_DELETE`, `CONTENT_PUBLISH`. The backend maps roles to permissions and enforces them; the
frontend only reads `permissions`.

### Users

The backend never returns the `ROOT` user from any of these endpoints.

| Endpoint                  | Request                                                 | Response                                   |
| ------------------------- | ------------------------------------------------------- | ------------------------------------------ |
| `GET /users`              | `?search=&role=&status=&page=&pageSize=`                | `200 { "data": User[], "meta" }`           |
| `GET /users/:id`          | —                                                       | `200 { "data": User }`                     |
| `POST /users`             | `{ "name", "email", "role", "password" }` (role ≠ ROOT) | `201 { "data": User }` · `409` email taken |
| `PATCH /users/:id`        | any of `{ "name", "email", "role", "password" }`        | `200 { "data": User }`                     |
| `PATCH /users/:id/status` | `{ "status": "ACTIVE" \| "DISABLED" }`                  | `200 { "data": User }`                     |
| `DELETE /users/:id`       | —                                                       | `204`                                      |

`User = { id, email, name, role, status, createdAt, updatedAt }` — never a password, hash or token.

### Assistant (`apps/ai`, at `aiBaseUrl`)

| Endpoint     | Request                                                    | Response                                     |
| ------------ | ---------------------------------------------------------- | -------------------------------------------- |
| `POST /chat` | `{ messages: [{ role: 'user' \| 'assistant', content }] }` | `200 text/event-stream` of `ChatStreamEvent` |

- Sends the in-memory access token as `Authorization: Bearer …` with `credentials: 'omit'`; a `401`
  refreshes the session once (shared with the API calls) and retries.
- The request timeout only covers the wait for response headers; the answer then streams for as long
  as it takes. Aborting the `signal` cancels it on the server.
- Errors before the stream (`400`, `401`, `403`, `429`, `503`, network) reject with `ApiError`; errors
  during the stream arrive as an `{ type: 'error', code, message }` event (`message` is safe to show).
- Every stream ends with `done` or `error`. Unknown event types are skipped. Limits: `CHAT_LIMITS`
  (20 messages, 8 000 characters each, 32 000 in total), from `@while-building/types`.
- `parseSse(stream)` is the generic `text/event-stream` parser behind it.

### CORS and cookies

- The CMS origin must be listed in the API's `CORS_ORIGIN`, and CORS must allow credentials.
- Refresh cookie: `HttpOnly`, `Secure` (production), `SameSite=Lax` when the CMS and API share a
  site (`cms.example.com` / `api.example.com`), otherwise `SameSite=None; Secure`. Scoping it to
  `Path=/auth` keeps it off every other request.
