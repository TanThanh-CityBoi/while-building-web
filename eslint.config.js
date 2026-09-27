// Root-level files only (this file, prettier.config.js…). Every app and package has its
// own eslint.config.js built from @while-building/config and is linted by `turbo run lint`.
import { baseConfig } from '@while-building/config/eslint';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([globalIgnores(['apps/**', 'packages/**']), ...baseConfig]);
