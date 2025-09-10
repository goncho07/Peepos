/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_APP_NAME: string
  readonly VITE_APP_ENV: string
  readonly VITE_DEBUG: string
  readonly VITE_SANCTUM_STATEFUL_DOMAINS: string
  readonly VITE_SESSION_DOMAIN: string
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}