/**
 * Bindings do Worker Cloudflare (Settings → Variables and secrets em modo
 * Runtime, ou backend/.dev.vars em desenvolvimento local via `wrangler dev`).
 * Nunca vêm de process.env — Workers não tem esse global.
 */
export interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  JWT_SECRET: string;
  ADMIN_PASSWORD: string;
  CORS_ORIGIN?: string;
  /** Schema do Postgres a usar (testes apontam para "test"). Opcional: default "public". */
  SUPABASE_SCHEMA?: string;
  /** Binding de assets estáticos do frontend (frontend/dist), injetado pelo wrangler.jsonc. */
  ASSETS: Fetcher;
}

export interface Bindings {
  Bindings: Env;
  Variables: {
    adminId?: string;
  };
}
