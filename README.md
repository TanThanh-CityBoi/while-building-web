# While Building

> Things I build, things I learn, things I break.

## Project Overview

**While Building** is a personal technical website — part engineering journal, part digital garden. It's where I:

- write technical articles and share engineering knowledge and experiences,
- showcase side projects, experiments and prototypes,
- document things I build — and things that break — and what I learn from both.

This repository is the **frontend only**. The backend lives in a separate repository, `while-building-api`, and the two communicate over HTTP.

The first version is intentionally simple: static pages, local mock data for articles and projects, and a single API integration (`GET /health`) to prove the frontend ↔ backend wiring.

## Tech Stack

- [React 19](https://react.dev) + [TypeScript](https://www.typescriptlang.org) (strict mode)
- [Vite](https://vite.dev) — dev server and static production build
- [React Router](https://reactrouter.com) (data mode, `createBrowserRouter`)
- [TanStack Query](https://tanstack.com/query) — server state, used only for API calls
- CSS Modules + a small global stylesheet with design tokens (no UI library)
- [ESLint](https://eslint.org) (flat config, `typescript-eslint`, React Hooks rules) and [Prettier](https://prettier.io)
- [pnpm](https://pnpm.io)

## Requirements

- Node.js **>= 22.22** (required by React Router 8; Node 24 LTS recommended)
- pnpm **12** (the exact version is pinned in `package.json` → `packageManager`; `corepack enable` will pick it up)

## Installation

```bash
pnpm install
cp .env.example .env
```

## Development

```bash
pnpm dev
```

Opens the site at <http://localhost:5173>. To see the API status as “online”, run `while-building-api` on the URL in `VITE_API_URL` (default `http://localhost:3000`). The site renders normally without it.

Other useful scripts:

| Command             | What it does                              |
| ------------------- | ----------------------------------------- |
| `pnpm typecheck`    | Type-check the project (`tsc -b`)         |
| `pnpm lint`         | Run ESLint                                |
| `pnpm format`       | Format all files with Prettier            |
| `pnpm format:check` | Check formatting without writing (for CI) |

## Build

```bash
pnpm build
```

Type-checks, then writes a fully static site to `dist/`. There is no server-side rendering — `dist/` can be served by any static host.

## Preview

```bash
pnpm preview
```

Serves the production build from `dist/` locally at <http://localhost:4173>.

## Environment Variables

| Variable       | Required | Example                 | Description                                                                                                                            |
| -------------- | -------- | ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `VITE_API_URL` | No       | `http://localhost:3000` | Base URL of `while-building-api`. A trailing slash is fine. If unset, API calls are skipped and the footer shows “API not configured”. |

Notes:

- Vite inlines `VITE_*` variables into the JavaScript bundle **at build time**. Set the production value in your host's build settings, and rebuild to change it.
- Everything in `VITE_*` is public. Never put secrets in these variables.
- `.env` is git-ignored; only `.env.example` is committed.
- The API must allow the site's origin via CORS (e.g. `http://localhost:5173` in development).

## Project Structure

```text
src/
├── api/          HTTP layer: fetch client (base URL, timeout, errors) and endpoint functions
├── components/   Reusable UI: Navbar, Footer, Container, PageHeader, ButtonLink, Tag,
│                 ArticleCard, ProjectCard, Section, StatusIndicator, ApiStatus, ExternalLink
├── data/         Local mock content (articles, projects, experiments, about, site config & links)
├── hooks/        usePageMeta (title/description), useApiHealth (React Query)
├── layouts/      RootLayout: navbar + page outlet + footer
├── lib/          Small utilities: date formatting, class names, the QueryClient
├── pages/        One component per route (+ 404 and error pages)
├── router/       Route table
├── styles/       Global CSS: design tokens (light/dark), reset, base typography
├── types/        Shared content types
├── App.tsx       Providers (React Query, router)
└── main.tsx      Entry point
public/           Static files copied as-is (favicon)
```

Components are styled with a co-located `*.module.css` file. Colors, spacing and type sizes come from CSS custom properties in `src/styles/global.css`, so light/dark theming happens in one place.

To edit content, change the files in `src/data/`. Social links in `src/data/site.ts` show as “(soon)” placeholders until they're given an `href`.

## Deployment

`pnpm build` produces a static SPA in `dist/`. Any static host works; the only requirement is an **SPA fallback** so deep links like `/articles` serve `index.html`:

- **Cloudflare Pages** — build command `pnpm build`, output directory `dist`. SPA fallback is automatic when no `404.html` exists.
- **Firebase Hosting** — set `"public": "dist"` and add a rewrite of `**` → `/index.html` in `firebase.json`.
- **Others** (Netlify, nginx, S3 + CDN, …) — configure the equivalent “rewrite all routes to `/index.html`” rule.

Remember to set `VITE_API_URL` in the host's build environment.

## Future Roadmap

Not implemented yet — possible next steps:

- Markdown/MDX articles
- Article detail pages
- CMS
- Project detail pages
- Search
- RSS
- Sitemap
- Analytics
- Authentication
- Admin
- Comments
