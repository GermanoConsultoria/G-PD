import type { Context } from "hono";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Bindings } from "../types/env";
import { criarClienteSupabase } from "../db/supabase";

/**
 * Tipos e adaptador para reaproveitar os controllers escritos no estilo
 * Express (req, res) como rotas Hono, sem reescrevê-los — necessário ao
 * migrar o backend para rodar dentro de um Cloudflare Worker.
 */
export interface ReqCompat {
  query: Record<string, string | undefined>;
  params: Record<string, string | undefined>;
  body: any;
  headers: { authorization?: string };
  supabase: SupabaseClient<any, string, any>;
  adminId?: string;
}

export interface ResCompat {
  status(code: number): ResCompat;
  json(data: unknown): void;
  send(data?: unknown): void;
}

type ExpressStyleHandler = (req: ReqCompat, res: ResCompat) => Promise<unknown> | unknown;

export function honoHandler(fn: ExpressStyleHandler) {
  return async (c: Context<Bindings>) => {
    let statusCode = 200;
    let respondido = false;
    let corpo: unknown;
    let semCorpo = false;

    const query: Record<string, string | undefined> = {};
    for (const [chave, valor] of Object.entries(c.req.query())) {
      query[chave] = valor;
    }

    const params: Record<string, string | undefined> = { ...c.req.param() };

    let body: unknown;
    if (c.req.method !== "GET" && c.req.method !== "DELETE") {
      try {
        body = await c.req.json();
      } catch {
        body = {};
      }
    }

    const req: ReqCompat = {
      query,
      params,
      body,
      headers: { authorization: c.req.header("authorization") },
      supabase: criarClienteSupabase(c.env),
      adminId: c.get("adminId"),
    };

    const res: ResCompat = {
      status(code: number) {
        statusCode = code;
        return res;
      },
      json(data: unknown) {
        corpo = data;
        respondido = true;
      },
      send(data?: unknown) {
        corpo = data;
        respondido = true;
        semCorpo = data === undefined;
      },
    };

    // Erros lançados aqui propagam para o app.onError central (worker.ts).
    await fn(req, res);

    if (!respondido || semCorpo) {
      return c.body(null, statusCode as any);
    }
    return c.json(corpo as any, statusCode as any);
  };
}
