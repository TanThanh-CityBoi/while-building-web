# While Building

> "Things I build, things I learn, things I break."

A personal technical platform: articles, projects, experiments, engineering notes, learning logs —
and the things that broke along the way. This repository is the **frontend monorepo**; the backend
lives in its own repository.

## Architecture

```text
while-building-web                  ← this repository (pnpm workspaces + Turborepo)
├── apps/
│   ├── client                      public website             (React + Vite, port 5173)
│   └── cms                         internal CMS               (React + Vite, port 5174)
└── packages/
    ├── ui                          React UI primitives + design tokens
    ├── types                       frontend ↔ API contract types
    ├── utils                       small framework-agnostic helpers
    ├── api-client                  HTTP client, session handling, endpoints
    └── config                      shared TypeScript + ESLint configuration

while-building-api                  ← separate repository
└── NestJS API
```

Dependency rules (enforced by each `package.json`; there are no cycles):

```text
apps/client ─┐
             ├──> @while-building/ui ──────────> @while-building/utils
apps/cms ────┤    @while-building/api-client ──> @while-building/types, @while-building/utils
             └──> @while-building/types, @while-building/utils
```

- Apps depend on packages; **packages never depend on apps**.
- Each app owns its routing, pages, layout and app-specific components.
- Shared packages hold only code that is genuinely shared and application-agnostic.
- Internal packages are consumed as TypeScript source ("just-in-time" packages): the apps' Vite
  builds compile them, so there is no separate package build step and no stale `dist/` to manage.

## Applications

### Client (`apps/client`)

The public website. No authentication.

| Route             | Page                                                  |
| ----------------- | ----------------------------------------------------- |
| `/`               | Hero, recent articles, featured projects, experiments |
| `/articles`       | Article listing                                       |
| `/articles/:slug` | Article detail                                        |
| `/projects`       | Project listing                                       |
| `/projects/:slug` | Project detail                                        |
| `/about`          | About                                                 |

- Articles come from the API (`GET /articles`, `GET /articles/:slug`), which only returns published
  ones: a draft's URL is a 404 there and here. Projects still come from mock data in
  `src/content/mock/`. Both are read only through `src/content/source.ts` and the React Query hooks
  in `src/content/queries.ts`.
- An article's body is rendered read-only by BlockNote (`RichTextViewer` from `@while-building/ui`).
  It is loaded on demand, so only article pages download the editor engine.
- Per-page titles, meta descriptions, canonical URL (with `VITE_SITE_URL`) and Open Graph tags
  (`usePageMeta`; article pages add `og:image` from the cover). The site is a static SPA, so
  crawlers that don't run JavaScript see the defaults in `index.html`. Semantic HTML, favicon.
- The footer shows API health (`GET /health`); the site renders fully when the API is down.

### CMS (`apps/cms`)

**While Building CMS** — the internal content management system: articles, projects, drafts and
publishing, plus users, roles and permissions (media, revisions and workflow later). It is its own
app, so its routes have no `/cms` prefix.

| Route                        | Page                                                | Permission       |
| ---------------------------- | --------------------------------------------------- | ---------------- |
| `/login`                     | Sign in                                             | —                |
| `/dashboard`                 | Metrics, recent content, status                     | —                |
| `/content`                   | Content overview                                    | `CONTENT_READ`   |
| `/content/articles`          | Articles: search, status, sort                      | `CONTENT_READ`   |
| `/content/articles/new`      | Write a new draft                                   | `CONTENT_CREATE` |
| `/content/articles/:id/edit` | Article editor (read-only without `CONTENT_UPDATE`) | `CONTENT_READ`   |
| `/content/projects`          | Projects table (sample data)                        | `CONTENT_READ`   |
| `/assistant`                 | Ask While Building (AI chat)                        | `CONTENT_READ`   |
| `/users`                     | User management                                     | `USERS_READ`     |
| `/settings`                  | Profile, session, permissions                       | —                |

- Every route except `/login` requires a session; the session is restored on startup before any
  protected UI renders.
- `/assistant` chats with the While Building assistant (`apps/ai` in while-building-api): answers
  about published articles and projects stream in, with the lookups it runs and the sources it used.
  The user picks the LLM provider and one of its models from what the server offers (`GET /models`);
  the server validates the choice. The conversation stays in memory (gone on reload or sign-out);
  Stop cancels the answer on the server.
- Users: list (search, role/status filters, pagination), create, edit (name, email, role, password
  reset), enable/disable, delete — all against the users API.
- Articles are written and published here, against the content API (`/content/articles`):
  - The list has search, a status filter, sorting and pagination. Its actions follow the user's
    permissions (edit, publish/unpublish, delete), and each asks for confirmation.
  - The editor is [BlockNote](https://www.blocknotejs.org/) (`@blocknote/shadcn`), loaded on demand.
    Type `/` for blocks: headings, lists, checklists, quotes, code, dividers, images by URL.
  - The body is saved as BlockNote's JSON block document. Title, slug (derived from the title until
    edited), excerpt, category and cover image sit beside it.
  - Saving is explicit: Save draft, or ⌘S / Ctrl+S. Unsaved changes are tracked, and leaving the page
    with some asks first. Publishing an article with unsaved changes saves them first.
- Projects are still on **sample data** (no project API yet).
- UI: [shadcn/ui](https://ui.shadcn.com/) components (Base UI, Tailwind CSS v4) from
  `@while-building/ui/components/*`, with lucide icons. Dark mode follows the OS.

## Shared packages

| Package                      | Contents                                                                                                                                                                                                                                                                                                               |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@while-building/ui`         | The CMS's shadcn/ui components and Tailwind theme (`components/*`, `globals.css`). The public site's CSS Modules kit (root export, `styles.css`). The shared BlockNote schema and read-only `RichTextViewer` (`rich-text`). No routing, auth or business logic. See [packages/ui](packages/ui/README.md).              |
| `@while-building/types`      | API contract types: `User`, `Role`, `Permission`, `UserStatus`, `AuthUser`, `Article`/`ArticleSummary` (public), `ManagedArticle` (CMS), `ArticleContent`, `Project`, `ApiResponse`, `Pagination`… No passwords or tokens.                                                                                             |
| `@while-building/utils`      | Date formatting, initials/pluralization, `slugify`/`isValidSlug`, URL/query helpers, email/password checks, brand constants, `cx`.                                                                                                                                                                                     |
| `@while-building/api-client` | The single HTTP layer for both apps: base URL, errors, in-memory access token, refresh-on-401, auth/users/health endpoints, published articles (`api.articles`), article management (`api.content.articles`), and the assistant's streaming chat (`api.ai`). See [packages/api-client](packages/api-client/README.md). |
| `@while-building/config`     | Shared `tsconfig` bases and ESLint flat-config presets. Prettier is configured once at the root.                                                                                                                                                                                                                       |

## Technology

React 19 · Vite 8 · TypeScript 6 (strict) · pnpm 12 workspaces · Turborepo 2 · React Router 8 ·
TanStack React Query 5 · CMS: shadcn/ui (Base UI) + Tailwind CSS 4 · public site: CSS Modules + CSS custom
properties · BlockNote · ESLint 10 · Prettier · Vitest + Testing Library.

## Requirements

- Node.js **>= 22.22** (Node 24 LTS recommended)
- pnpm **12** — pinned in `package.json` (`packageManager`); `corepack enable` picks it up.
- For the CMS: a running `while-building-api` with the auth endpoints (see [Backend integration](#backend-integration)).

## Development

```bash
pnpm install
cp apps/client/.env.example apps/client/.env
cp apps/cms/.env.example apps/cms/.env

pnpm dev          # both apps
pnpm dev:client   # public site → http://localhost:5173
pnpm dev:cms      # CMS         → http://localhost:5174
```

## Build

```bash
pnpm build          # both apps → apps/*/dist (static files)
pnpm build:client
pnpm build:cms
pnpm preview:client # serve the client build → http://localhost:4173
pnpm preview:cms    # serve the CMS build    → http://localhost:4174
```

## Lint

```bash
pnpm lint           # ESLint in every workspace + root config files
pnpm format         # Prettier (write);  pnpm format:check to verify
```

## Typecheck

```bash
pnpm typecheck
```

## Test

```bash
pnpm test           # Vitest: utils, api-client, CMS auth/permissions, articles and assistant
pnpm check          # typecheck + lint + test + build in one Turborepo run (CI)
```

## Environment variables

Each app has its own `.env` (git-ignored) created from its `.env.example`.

| App           | Variable        | Example                     | Notes                                                                         |
| ------------- | --------------- | --------------------------- | ----------------------------------------------------------------------------- |
| `apps/client` | `VITE_API_URL`  | `http://localhost:3000`     | Articles come from the API; without it the footer shows "API not configured". |
| `apps/client` | `VITE_SITE_URL` | `https://whilebuilding.dev` | Optional: the public origin, for canonical URLs and `og:url`.                 |
| `apps/cms`    | `VITE_API_URL`  | `http://localhost:3000`     | Required for sign-in. The API must allow the CMS origin with credentials.     |
| `apps/cms`    | `VITE_AI_URL`   | `http://localhost:3004`     | Optional: the assistant (`/assistant`). The AI app must allow the CMS origin. |

`VITE_*` variables are embedded in the bundle at build time — never put secrets in them. Set
production values in the hosting provider's build settings.

## Turborepo

| Task        | Runs in                | Depends on                       | Cached                                                |
| ----------- | ---------------------- | -------------------------------- | ----------------------------------------------------- |
| `build`     | apps                   | `^build` (all internal packages) | yes — `dist/**`; inputs include `.env*`, env `VITE_*` |
| `typecheck` | apps + packages        | `transit` (dependency sources)   | yes                                                   |
| `lint`      | every workspace + root | `transit`                        | yes                                                   |
| `test`      | utils, api-client, cms | `transit`                        | yes                                                   |
| `dev`       | apps                   | —                                | **no** (persistent)                                   |
| `preview`   | apps                   | `build`                          | **no** (persistent)                                   |

- Changing any file in a package invalidates the build/typecheck/test caches of everything that
  depends on it. The packages have no build script, so their `build` nodes carry only their source hash.
- `.env` files are git-ignored, so they're declared as build inputs explicitly; `VITE_*` shell
  variables are part of the hash too (and are passed through in strict env mode).
- Remote caching is not configured.

## Authentication (CMS)

- `POST /auth/login` returns a short-lived **access token**, kept **in memory only**; the API also
  sets an **httpOnly refresh cookie**. Nothing auth-related is written to `localStorage`/`sessionStorage`.
- On startup the CMS restores the session with `POST /auth/refresh` (cookie) → `GET /auth/me`,
  showing a loading screen until it knows the answer (no flash of protected content).
- A `401` on any request triggers one refresh (single-flight, safe with token rotation) and a retry.
  If the refresh fails, the session has expired: state and cached data are cleared and the user is
  sent to `/login` with a notice, returning to the same page after signing in.
- Logout calls `POST /auth/logout`, then clears local state and the React Query cache — even if the
  request fails (the user is told the server couldn't be reached).
- Permissions from `GET /auth/me` hide navigation, disable actions and guard pages. **This is UX
  only — the API must authorize every request.**

## Backend integration

The complete contract (endpoints, payloads, cookies, CORS, error format) is documented in
[packages/api-client/README.md](packages/api-client/README.md). If `while-building-api` ends up
different, adapt `packages/api-client` — the apps don't talk HTTP directly.

What the API needs for the CMS to work:

1. `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, `GET /auth/me` and the `/users`
   endpoints as described in the contract.
2. CORS: add the CMS origin to `CORS_ORIGIN` (e.g. `http://localhost:5174`) and enable
   `credentials: true` (`Access-Control-Allow-Credentials`). The public client never sends cookies,
   so it works with the current CORS setup.
3. The refresh cookie: `HttpOnly`, `Secure` in production, `SameSite=Lax` (API and CMS on the same
   site, e.g. `cms.example.com` + `api.example.com`) or `SameSite=None; Secure` if they're on
   different sites.
4. For the assistant: the AI app (`apps/ai`) running at `VITE_AI_URL`, with the CMS origin in its
   own `CORS_ORIGIN` (no credentials: it receives the access token as a bearer header). The LLM key
   lives only in that app's environment.

## Deployment

Both apps build to static files (`apps/client/dist`, `apps/cms/dist`) and can be deployed
separately to Firebase Hosting, Cloudflare Pages or any static host. Each needs an SPA fallback
(serve `index.html` for unknown paths). The CMS ships `noindex` and should live on its own
(sub)domain.

## Future roadmap

Not implemented yet:

- Project management in the CMS
- Autosave, revisions, scheduled publishing
- Media management (uploads; images are embedded by URL today)
- Tags and categories
- Revisions
- Comments
- Analytics
- Search, RSS and sitemap for the public site
