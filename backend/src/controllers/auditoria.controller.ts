import { Request, Response } from "express";
import { supabase } from "../db/supabase";
import { HttpError } from "../middleware/errorHandler";
import { AuditLogRow, mapAuditLog } from "../db/mappers";

export async function listarAuditoria(req: Request, res: Response) {
  const { entidade, entidadeId, dataInicio, dataFim } = req.query as Record<string, string | undefined>;

  let query = supabase.from("audit_logs").select("*").order("criado_em", { ascending: false }).limit(500);

  if (entidade) query = query.eq("entidade", entidade);
  if (entidadeId) query = query.eq("entidade_id", Number(entidadeId));
  if (dataInicio) query = query.gte("criado_em", `${dataInicio}T00:00:00.000Z`);
  if (dataFim) query = query.lte("criado_em", `${dataFim}T23:59:59.999Z`);

  const { data, error } = await query;
  if (error) throw new HttpError(500, error.message);

  res.json((data as AuditLogRow[]).map(mapAuditLog));
}
