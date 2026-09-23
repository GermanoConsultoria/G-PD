import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../db/prisma";
import { HttpError } from "../middleware/errorHandler";
import { parseDataLancamento, resolverIntervaloDatas } from "../utils/dateRange";

const producaoSchema = z.object({
  produtoId: z.number().int().positive(),
  turnoId: z.number().int().positive(),
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data deve estar no formato YYYY-MM-DD"),
  quantidade: z.number().int().positive("Quantidade deve ser maior que zero"),
});

export async function listarProducoes(req: Request, res: Response) {
  const { dataInicio, dataFim, produtoId, turnoId } = req.query as Record<string, string | undefined>;
  const { inicio, fim } = resolverIntervaloDatas(dataInicio, dataFim);

  const producoes = await prisma.producao.findMany({
    where: {
      data: { gte: inicio, lte: fim },
      produtoId: produtoId ? Number(produtoId) : undefined,
      turnoId: turnoId ? Number(turnoId) : undefined,
    },
    include: { produto: true, turno: true },
    orderBy: [{ data: "desc" }, { id: "desc" }],
  });

  res.json(producoes);
}

export async function registrarProducao(req: Request, res: Response) {
  const dados = producaoSchema.parse(req.body);

  const produto = await prisma.produto.findUnique({ where: { id: dados.produtoId } });
  if (!produto) throw new HttpError(404, "Produto não encontrado");

  const turno = await prisma.turno.findUnique({ where: { id: dados.turnoId } });
  if (!turno) throw new HttpError(404, "Turno não encontrado");

  const producao = await prisma.producao.create({
    data: {
      produtoId: dados.produtoId,
      turnoId: dados.turnoId,
      data: parseDataLancamento(dados.data),
      quantidade: dados.quantidade,
    },
    include: { produto: true, turno: true },
  });

  res.status(201).json(producao);
}

export async function removerProducao(req: Request, res: Response) {
  const id = Number(req.params.id);
  const existente = await prisma.producao.findUnique({ where: { id } });
  if (!existente) throw new HttpError(404, "Lançamento não encontrado");

  await prisma.producao.delete({ where: { id } });
  res.status(204).send();
}
