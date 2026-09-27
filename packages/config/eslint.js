// Shared ESLint flat-config building blocks. Each workspace has a tiny eslint.config.js
// that picks the preset it needs, so lint runs (and is cached) per package by Turborepo.
import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import reactHooks from 'eslint-plugin-react-hooks';
import { reactRefresh } from 'eslint-plugin-react-refresh';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const typescript = {
  files: ['**/*.{ts,tsx}'],
  extends: [js.configs.recommended, tseslint.configs.recommended],
  languageOptions: {
    ecmaVersion: 2022,
    globals: globals.browser,
  },
  rules: {
    '@typescript-eslint/consistent-type-imports': 'error',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  },
};

const tooling = {
  files: ['*.config.{js,ts}', '*.js'],
  extends: [js.configs.recommended],
  languageOptions: { globals: globals.node },
};

/** Plain TypeScript packages (no React). */
export const baseConfig = defineConfig([
  globalIgnores(['dist', 'coverage']),
  typescript,
  tooling,
  // Keep last: disables stylistic rules that would fight with Prettier.
  prettier,
]);

/** React component libraries. */
export const reactConfig = defineConfig([
  globalIgnores(['dist', 'coverage']),
  typescript,
  { files: ['**/*.{ts,tsx}'], extends: [reactHooks.configs.flat.recommended] },
  tooling,
  prettier,
]);

/** Vite React applications (adds Fast Refresh boundary checks). */
export const reactAppConfig = defineConfig([
  globalIgnores(['dist', 'coverage']),
  typescript,
  {
    files: ['**/*.{ts,tsx}'],
    extends: [reactHooks.configs.flat.recommended, reactRefresh.configs.vite()],
  },
  tooling,
  prettier,
]);
