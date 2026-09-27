# @while-building/config

Shared tooling configuration. Only things that are genuinely identical across workspaces live here;
app-specific settings (Vite config, path aliases, env) stay in each app.

| Export                                             | Use                                                               |
| -------------------------------------------------- | ----------------------------------------------------------------- |
| `@while-building/config/tsconfig/base.json`        | Strict TypeScript defaults (bundler resolution, type-check only). |
| `@while-building/config/tsconfig/react.json`       | `base` + DOM libs + JSX, for React packages and apps.             |
| `@while-building/config/tsconfig/node.json`        | `base` + Node types, for `vite.config.ts` / `vitest.config.ts`.   |
| `@while-building/config/eslint` → `baseConfig`     | Plain TypeScript packages.                                        |
| `@while-building/config/eslint` → `reactConfig`    | React libraries (`packages/ui`).                                  |
| `@while-building/config/eslint` → `reactAppConfig` | Vite React apps (adds React Fast Refresh checks).                 |

Prettier is configured once at the repository root (`prettier.config.js`) because it only runs from there.
