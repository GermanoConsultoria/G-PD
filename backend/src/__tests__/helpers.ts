import { createApp } from "../app";
import type { Env } from "../types/env";

const app = createApp();

function testEnv(): Env {
  return {
    SUPABASE_URL: process.env.SUPABASE_URL ?? "",
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
    SUPABASE_SCHEMA: process.env.SUPABASE_SCHEMA ?? "test",
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD ?? "test-admin-pass",
    JWT_SECRET: process.env.JWT_SECRET ?? "test-secret",
    CORS_ORIGIN: process.env.CORS_ORIGIN ?? "*",
    // Sem frontend publicado durante os testes: qualquer rota não-API cai em 404.
    ASSETS: { fetch: async () => new Response("not found", { status: 404 }) } as unknown as Fetcher,
  };
}

interface ReqOptions {
  token?: string;
  body?: unknown;
}

export interface TestResponse {
  status: number;
  body: any;
}

/** Faz uma requisição direto contra o Hono app (sem subir servidor HTTP real). */
export async function req(method: string, path: string, options: ReqOptions = {}): Promise<TestResponse> {
  const headers: Record<string, string> = {};
  if (options.token) headers["Authorization"] = `Bearer ${options.token}`;

  let bodyInit: string | undefined;
  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
    bodyInit = JSON.stringify(options.body);
  }

  const res = await app.request(path, { method, headers, body: bodyInit }, testEnv());

  let body: any = null;
  const texto = await res.text();
  if (texto) {
    try {
      body = JSON.parse(texto);
    } catch {
      body = texto;
    }
  }

  return { status: res.status, body };
}

export async function obterTokenAdmin(): Promise<string> {
  const resposta = await req("POST", "/api/auth/login", { body: { senha: process.env.ADMIN_PASSWORD ?? "test-admin-pass" } });
  return resposta.body.token as string;
}
