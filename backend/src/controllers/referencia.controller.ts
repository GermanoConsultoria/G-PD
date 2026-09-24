import type { ReqCompat as Request, ResCompat as Response } from "../lib/honoAdapter";
import { HttpError } from "../middleware/errorHandler";
import { MotivoRow, TurnoRow, mapMotivo, mapTurno } from "../db/mappers";
import { dataAtualISO, detectarTurnoAtual } from "../utils/turno";

export async function listarTurnos(req: Request, res: Response) {
  const { data, error } = await req.supabase.from("turnos").select("*").order("codigo", { ascending: true });
  if (error) throw new HttpError(500, error.message);
  res.json((data as TurnoRow[]).map(mapTurno));
}

export async function listarMotivos(req: Request, res: Response) {
  const { data, error } = await req.supabase
    .from("motivos_perda")
    .select("*")
    .eq("ativo", true)
    .order("id", { ascending: true });
  if (error) throw new HttpError(500, error.message);
  res.json((data as MotivoRow[]).map(mapMotivo));
}

export async function obterContextoAtual(req: Request, res: Response) {
  const { emHorarioOperacional, codigoTurno } = detectarTurnoAtual();

  if (!emHorarioOperacional || !codigoTurno) {
    return res.json({ data: dataAtualISO(), emHorarioOperacional: false, turno: null });
  }

  const { data, error } = await req.supabase.from("turnos").select("*").eq("codigo", codigoTurno).maybeSingle();
  if (error) throw new HttpError(500, error.message);

  res.json({ data: dataAtualISO(), emHorarioOperacional: true, turno: data ? mapTurno(data as TurnoRow) : null });
}
