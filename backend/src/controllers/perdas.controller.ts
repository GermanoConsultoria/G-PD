import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../db/prisma";
import { HttpError } from "../middleware/errorHandler";
import { parseDataLancamento, resolverIntervaloDatas } from "../utils/dateRange";

const perdaSchema = z.object({
  produtoId: z.number().int().positive(),
  turnoId: z.number().int().positive(),
  motivoId: z.number().int().positive(),
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data deve estar no formato YYYY-MM-DD"),
  quantidade: z.number().int().positive("Quantidade deve ser maior que zero"),
});

export async function listarPerdas(req: Request, res: Response) {
  const { dataInicio, dataFim, produtoId, turnoId, motivoId } = req.query as Record<
    string,
    string | undefined
  >;
  const { inicio, fim } = resolverIntervaloDatas(dataInicio, dataFim);

  const perdas = await prisma.perda.findMany({
    where: {
      data: { gte: inicio, lte: fim },
      produtoId: produtoId ? Number(produtoId) : undefined,
      turnoId: turnoId ? Number(turnoId) : undefined,
      motivoId: motivoId ? Number(motivoId) : undefined,
    },
    include: { produto: true, turno: true, motivo: true },
    orderBy: [{ data: "desc" }, { id: "desc" }],
  });

  res.json(perdas);
}

export async function registrarPerda(req: Request, res: Response) {
  const dados = perdaSchema.parse(req.body);

  const produto = await prisma.produto.findUnique({ where: { id: dados.produtoId } });
  if (!produto) throw new HttpError(404, "Produto não encontrado");

  const turno = await prisma.turno.findUnique({ where: { id: dados.turnoId } });
  if (!turno) throw new HttpError(404, "Turno não encontrado");

  const motivo = await prisma.motivoPerda.findUnique({ where: { id: dados.motivoId } });
  if (!motivo) throw new HttpError(404, "Motivo de perda não encontrado");

  // REGRA CRÍTICA: o custo unitário é capturado do cadastro de produto NO
  // MOMENTO do lançamento e gravado nesta linha. Alterações futuras no preço
  // do produto não retroagem sobre perdas já registradas.
  const custoUnitarioHistorico = produto.custoUnitario;
  const custoTotal = Number((custoUnitarioHistorico * dados.quantidade).toFixed(2));

  const perda = await prisma.perda.create({
    data: {
      produtoId: dados.produtoId,
      turnoId: dados.turnoId,
      motivoId: dados.motivoId,
      data: parseDataLancamento(dados.data),
      quantidade: dados.quantidade,
      custoUnitarioHistorico,
      custoTotal,
    },
    include: { produto: true, turno: true, motivo: true },
  });

  res.status(201).json(perda);
}

export async function removerPerda(req: Request, res: Response) {
  const id = Number(req.params.id);
  const existente = await prisma.perda.findUnique({ where: { id } });
  if (!existente) throw new HttpError(404, "Lançamento não encontrado");

  await prisma.perda.delete({ where: { id } });
  res.status(204).send();
}
