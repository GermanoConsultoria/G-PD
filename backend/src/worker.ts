import { createApp } from "./app";
import type { Env } from "./types/env";

/**
 * Entry point do Cloudflare Worker (ver wrangler.jsonc na raiz do repo).
 * Um único Worker serve tanto a API (Hono, abaixo) quanto os arquivos
 * estáticos do frontend (frontend/dist, via o binding ASSETS) — não existem
 * dois serviços separados.
 *
 * /health e /api/* vão para o backend; qualquer outra rota tenta os assets
 * do frontend, caindo no index.html quando não bate com nenhum arquivo
 * (necessário para as rotas client-side do react-router, tipo /dashboard).
 */
const app = createApp();

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/health" || url.pathname.startsWith("/api/")) {
      return app.fetch(request, env, ctx);
    }

    const assetResponse = await env.ASSETS.fetch(request);
    if (assetResponse.status !== 404) {
      return assetResponse;
    }

    const indexRequest = new Request(new URL("/index.html", request.url), request);
    return env.ASSETS.fetch(indexRequest);
  },
};
