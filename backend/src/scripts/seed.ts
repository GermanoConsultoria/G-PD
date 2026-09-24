import "dotenv/config";
import { criarClienteSupabase } from "../db/supabase";
import { seedDatabase } from "../db/seedData";
import type { Env } from "../types/env";

// Script administrativo — roda em Node puro (via tsx), fora do Worker. Lê as
// mesmas variáveis de backend/.dev.vars (ou .env local) por conveniência.
const env = {
  SUPABASE_URL: process.env.SUPABASE_URL ?? "",
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
} as Env;

const supabase = criarClienteSupabase(env);

seedDatabase(supabase)
  .then(() => {
    console.log("Seed concluído.");
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
