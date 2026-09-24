import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { HttpError } from "./errorHandler";

const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret-troque-em-producao";

// O sistema tem uma unica conta administrativa (sem identificacao individual
// de administradores, conforme decisao de escopo). O identificador abaixo e
// usado tanto no token quanto nos registros de auditoria.
const ADMIN_ID = "ADMIN";

interface AdminJwtPayload {
  admin: true;
}

export function assinarTokenAdmin(): string {
  return jwt.sign({ admin: true } satisfies AdminJwtPayload, JWT_SECRET, { expiresIn: "12h" });
}

export interface RequestComAdmin extends Request {
  adminId?: string;
}

export function requireAdmin(req: RequestComAdmin, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : null;

  if (!token) {
    throw new HttpError(401, "Autenticação administrativa necessária");
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as AdminJwtPayload;
    if (!payload.admin) throw new Error("payload inválido");
  } catch {
    throw new HttpError(401, "Sessão inválida ou expirada. Faça login novamente.");
  }

  req.adminId = ADMIN_ID;
  next();
}
