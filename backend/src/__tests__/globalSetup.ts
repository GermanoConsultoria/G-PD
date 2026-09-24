import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { seedDatabase } from "../db/seedData";

// Prepara o schema "test" do mesmo projeto Supabase usado em dev/produção:
// limpa todas as tabelas (respeitando as foreign keys) e semeia de novo os
// dados oficiais (turnos, motivos, os 7 produtos), para que cada execução
// da suíte comece de um estado conhecido. Não toca no schema "public".
//
// Pré-requisitos (ver backend/supabase/schema.sql e o README):
//  1. Ter rodado supabase/schema.sql no SQL Editor do Supabase (cria o
//     schema "test" com as mesmas tabelas do "public").
//  2. Ter adicionado "test" em Settings → API → Data API → Exposed schemas.
export default async function globalSetup() {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórios para rodar os testes (configure backend/.env)."
    );
  }

  const testClient = createClient(url, serviceRoleKey, {
    db: { schema: "test" },
    auth: { autoRefreshToken: false, persistSession: false },
  });

  for (const tabela of ["audit_logs", "perdas", "producoes", "produtos", "motivos_perda", "turnos"]) {
    const { error } = await testClient.from(tabela).delete().gte("id", 0);
    if (error) {
      throw new Error(
        `Falha ao limpar test.${tabela} antes dos testes: ${error.message}. ` +
          `Verifique se rodou supabase/schema.sql e se "test" está em Exposed schemas.`
      );
    }
  }

  await seedDatabase(testClient);
}
