import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente Postgres/Supabase do backend. Usa sempre a SERVICE_ROLE_KEY — nunca
 * a chave pública — porque este processo é o backend de confiança (tem seu
 * próprio login administrativo) e precisa ignorar as políticas de RLS.
 * NUNCA exponha essa chave ao frontend.
 *
 * O schema padrão é "public" (dev/produção). Em testes, criamos um segundo
 * cliente apontando para o schema "test" (ver src/__tests__/setup).
 */
function criarClienteSupabase(schema: string): SupabaseClient<any, string, any> {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórios (ver backend/.env.example)");
  }

  return createClient(url, serviceRoleKey, {
    db: { schema },
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export const supabase = criarClienteSupabase(process.env.SUPABASE_SCHEMA ?? "public");

export { criarClienteSupabase };
