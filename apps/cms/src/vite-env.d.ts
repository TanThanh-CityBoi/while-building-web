/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the While Building API, e.g. `http://localhost:3000`. */
  readonly VITE_API_URL?: string;
  /** Base URL of the While Building assistant (`apps/ai`), e.g. `http://localhost:3004`. */
  readonly VITE_AI_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
