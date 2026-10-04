/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the While Building API, e.g. `http://localhost:3000`. */
  readonly VITE_API_URL?: string;
  /** Public origin of this site, e.g. `https://whilebuilding.dev` (canonical URLs, og:url). */
  readonly VITE_SITE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
