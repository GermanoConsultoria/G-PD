import "dotenv/config";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globalSetup: ["./src/__tests__/globalSetup.ts"],
    fileParallelism: false,
    env: {
      // Mesmo projeto Supabase do dev/produção, mas isolado no schema
      // "test" (ver supabase/schema.sql) — precisa estar na lista de
      // "Exposed schemas" em Settings → API no dashboard do Supabase.
      SUPABASE_URL: process.env.SUPABASE_URL ?? "",
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
      SUPABASE_SCHEMA: "test",
      ADMIN_PASSWORD: "test-admin-pass",
      JWT_SECRET: "test-secret",
      CORS_ORIGIN: "*",
    },
  },
});
