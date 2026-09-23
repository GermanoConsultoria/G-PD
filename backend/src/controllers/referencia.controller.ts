import { Request, Response } from "express";
import { prisma } from "../db/prisma";
import { dataAtualISO, detectarTurnoAtual } from "../utils/turno";

export async function listarTurnos(_req: Request, res: Response) {
  const turnos = await prisma.turno.findMany({ orderBy: { codigo: "asc" } });
  res.json(turnos);
}

export async function listarMotivos(_req: Request, res: Response) {
  const motivos = await prisma.motivoPerda.findMany({
    where: { ativo: true },
    orderBy: { id: "asc" },
  });
  res.json(motivos);
}

export async function obterContextoAtual(_req: Request, res: Response) {
  const codigoTurno = detectarTurnoAtual();
  const turno = await prisma.turno.findUnique({ where: { codigo: codigoTurno } });
  res.json({ data: dataAtualISO(), turno });
}
