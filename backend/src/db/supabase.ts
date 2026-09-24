import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { Env } from "../types/env";

/**
 * Cria o cliente Postgres/Supabase para UMA requisição. Sempre usa a
 * SERVICE_ROLE_KEY — nunca a chave pública — porque este Worker é o backend
 * de confiança (tem seu próprio login administrativo) e precisa ignorar as
 * políticas de RLS. NUNCA exponha essa chave ao frontend.
 *
 * Criado por requisição (não como singleton do módulo) porque em Cloudflare
 * Workers os bindings (env) só existem dentro do handler de cada requisição
 * — não há process.env global, e reaproveitar estado entre requisições
 * concorrentes no mesmo isolate seria uma condição de corrida.
 */
export function criarClienteSupabase(env: Env): SupabaseClient<any, string, any> {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórios (ver backend/.dev.vars.example)");
  }

  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    db: { schema: env.SUPABASE_SCHEMA ?? "public" },
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
