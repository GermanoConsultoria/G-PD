import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../db/prisma";
import { HttpError } from "../middleware/errorHandler";

const produtoSchema = z.object({
  nome: z.string().trim().min(1, "Nome é obrigatório"),
  categoria: z.string().trim().optional().nullable(),
  unidade: z.string().trim().min(1).default("un"),
  custoUnitario: z.number().positive("Custo unitário deve ser maior que zero"),
  ativo: z.boolean().optional(),
});

export async function listarProdutos(req: Request, res: Response) {
  const somenteAtivos = req.query.ativos === "true";
  const produtos = await prisma.produto.findMany({
    where: somenteAtivos ? { ativo: true } : undefined,
    orderBy: { nome: "asc" },
  });
  res.json(produtos);
}

export async function obterProduto(req: Request, res: Response) {
  const id = Number(req.params.id);
  const produto = await prisma.produto.findUnique({ where: { id } });
  if (!produto) throw new HttpError(404, "Produto não encontrado");
  res.json(produto);
}

export async function criarProduto(req: Request, res: Response) {
  const dados = produtoSchema.parse(req.body);
  const produto = await prisma.produto.create({ data: dados });
  res.status(201).json(produto);
}

export async function atualizarProduto(req: Request, res: Response) {
  const id = Number(req.params.id);
  const dados = produtoSchema.partial().parse(req.body);

  const existente = await prisma.produto.findUnique({ where: { id } });
  if (!existente) throw new HttpError(404, "Produto não encontrado");

  // Importante: alterar custoUnitario aqui NÃO afeta perdas já lançadas,
  // pois cada perda guarda seu próprio custoUnitarioHistorico.
  const produto = await prisma.produto.update({ where: { id }, data: dados });
  res.json(produto);
}

export async function removerProduto(req: Request, res: Response) {
  const id = Number(req.params.id);
  const existente = await prisma.produto.findUnique({ where: { id } });
  if (!existente) throw new HttpError(404, "Produto não encontrado");

  // Soft delete: preserva histórico de produções/perdas vinculadas ao produto.
  const produto = await prisma.produto.update({
    where: { id },
    data: { ativo: false },
  });
  res.json(produto);
}
