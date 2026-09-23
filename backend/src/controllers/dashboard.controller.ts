import { Request, Response } from "express";
import { prisma } from "../db/prisma";
import { resolverIntervaloDatas } from "../utils/dateRange";

function query(req: Request) {
  const { dataInicio, dataFim } = req.query as Record<string, string | undefined>;
  return resolverIntervaloDatas(dataInicio, dataFim);
}

export async function resumo(req: Request, res: Response) {
  const { inicio, fim } = query(req);

  const [producaoAgg, perdaAgg] = await Promise.all([
    prisma.producao.aggregate({
      where: { data: { gte: inicio, lte: fim } },
      _sum: { quantidade: true },
    }),
    prisma.perda.aggregate({
      where: { data: { gte: inicio, lte: fim } },
      _sum: { quantidade: true, custoTotal: true },
    }),
  ]);

  const totalProduzido = producaoAgg._sum.quantidade ?? 0;
  const totalDescartado = perdaAgg._sum.quantidade ?? 0;
  const custoTotalPerdas = Number((perdaAgg._sum.custoTotal ?? 0).toFixed(2));
  const taxaPerda = totalProduzido > 0 ? Number(((totalDescartado / totalProduzido) * 100).toFixed(2)) : 0;

  res.json({ totalProduzido, totalDescartado, taxaPerda, custoTotalPerdas });
}

export async function perdasPorMotivo(req: Request, res: Response) {
  const { inicio, fim } = query(req);

  const grupos = await prisma.perda.groupBy({
    by: ["motivoId"],
    where: { data: { gte: inicio, lte: fim } },
    _sum: { quantidade: true, custoTotal: true },
  });

  const motivos = await prisma.motivoPerda.findMany();
  const motivoPorId = new Map(motivos.map((m) => [m.id, m.nome]));

  const resultado = grupos
    .map((g) => ({
      motivoId: g.motivoId,
      motivo: motivoPorId.get(g.motivoId) ?? "Desconhecido",
      quantidade: g._sum.quantidade ?? 0,
      custoTotal: Number((g._sum.custoTotal ?? 0).toFixed(2)),
    }))
    .sort((a, b) => b.quantidade - a.quantidade);

  res.json(resultado);
}

export async function perdasPorProduto(req: Request, res: Response) {
  const { inicio, fim } = query(req);

  const grupos = await prisma.perda.groupBy({
    by: ["produtoId"],
    where: { data: { gte: inicio, lte: fim } },
    _sum: { quantidade: true, custoTotal: true },
  });

  const produtos = await prisma.produto.findMany();
  const produtoPorId = new Map(produtos.map((p) => [p.id, p.nome]));

  const resultado = grupos
    .map((g) => ({
      produtoId: g.produtoId,
      produto: produtoPorId.get(g.produtoId) ?? "Desconhecido",
      quantidade: g._sum.quantidade ?? 0,
      custoTotal: Number((g._sum.custoTotal ?? 0).toFixed(2)),
    }))
    .sort((a, b) => b.quantidade - a.quantidade);

  res.json(resultado);
}

export async function evolucaoPerdas(req: Request, res: Response) {
  const { inicio, fim } = query(req);

  const grupos = await prisma.perda.groupBy({
    by: ["data"],
    where: { data: { gte: inicio, lte: fim } },
    _sum: { quantidade: true, custoTotal: true },
  });

  const resultado = grupos
    .map((g) => ({
      data: g.data.toISOString().slice(0, 10),
      quantidade: g._sum.quantidade ?? 0,
      custoTotal: Number((g._sum.custoTotal ?? 0).toFixed(2)),
    }))
    .sort((a, b) => (a.data < b.data ? -1 : 1));

  res.json(resultado);
}
