import type { Context, Next } from "hono";
import { sign, verify } from "hono/jwt";
import { HttpError } from "./errorHandler";
import type { Bindings } from "../types/env";
import type { ReqCompat } from "../lib/honoAdapter";

// Reexportado com o nome usado pelos controllers (mantido do backend Express).
export type RequestComAdmin = ReqCompat;

// O sistema tem uma unica conta administrativa (sem identificacao individual
// de administradores, conforme decisao de escopo). O identificador abaixo e
// usado tanto no token quanto nos registros de auditoria.
const ADMIN_ID = "ADMIN";
const DOZE_HORAS_EM_SEGUNDOS = 60 * 60 * 12;

interface AdminJwtPayload {
  admin: true;
  exp: number;
  [key: string]: unknown;
}

export async function assinarTokenAdmin(jwtSecret: string): Promise<string> {
  const payload: AdminJwtPayload = {
    admin: true,
    exp: Math.floor(Date.now() / 1000) + DOZE_HORAS_EM_SEGUNDOS,
  };
  return sign(payload, jwtSecret, "HS256");
}

/**
 * Middleware Hono: exige `Authorization: Bearer <token>` administrativo
 * válido. Usa hono/jwt (Web Crypto), compatível nativamente com o runtime
 * de Cloudflare Workers — sem precisar da flag nodejs_compat.
 */
export async function requireAdmin(c: Context<Bindings>, next: Next) {
  const header = c.req.header("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : null;

  if (!token) {
    throw new HttpError(401, "Autenticação administrativa necessária");
  }

  try {
    const payload = (await verify(token, c.env.JWT_SECRET, "HS256")) as unknown as AdminJwtPayload;
    if (!payload.admin) throw new Error("payload inválido");
  } catch {
    throw new HttpError(401, "Sessão inválida ou expirada. Faça login novamente.");
  }

  c.set("adminId", ADMIN_ID);
  await next();
}
