import type { ResCompat as Response } from "../lib/honoAdapter";
import { z } from "zod";
import { HttpError } from "../middleware/errorHandler";
import { RequestComAdmin } from "../middleware/auth";
import { registrarAuditoria } from "../services/audit";
import { ProdutoRow, mapProduto } from "../db/mappers";

const produtoSchema = z.object({
  nome: z.string().trim().min(1, "Nome é obrigatório"),
  categoria: z.string().trim().optional().nullable(),
  unidade: z.string().trim().min(1).default("un"),
  custoUnitarioCentavos: z.number().int().positive("Custo unitário deve ser maior que zero"),
  ativo: z.boolean().optional(),
});

function tratarErroEscrita(error: { code?: string; message: string }): never {
  if (error.code === "23505") throw new HttpError(409, "Já existe um produto com esse nome.");
  throw new HttpError(400, error.message);
}

export async function listarProdutos(req: RequestComAdmin, res: Response) {
  const somenteAtivos = req.query.ativos === "true";
  let query = req.supabase.from("produtos").select("*").order("nome", { ascending: true });
  if (somenteAtivos) query = query.eq("ativo", true);

  const { data, error } = await query;
  if (error) throw new HttpError(500, error.message);

  res.json((data as ProdutoRow[]).map(mapProduto));
}

export async function obterProduto(req: RequestComAdmin, res: Response) {
  const id = Number(req.params.id);
  const { data, error } = await req.supabase.from("produtos").select("*").eq("id", id).maybeSingle();
  if (error) throw new HttpError(500, error.message);
  if (!data) throw new HttpError(404, "Produto não encontrado");
  res.json(mapProduto(data as ProdutoRow));
}

export async function criarProduto(req: RequestComAdmin, res: Response) {
  const dados = produtoSchema.parse(req.body);

  const { data, error } = await req.supabase
    .from("produtos")
    .insert({
      nome: dados.nome,
      categoria: dados.categoria ?? null,
      unidade: dados.unidade,
      custo_unitario_centavos: dados.custoUnitarioCentavos,
      ativo: dados.ativo ?? true,
    })
    .select()
    .single();
  if (error) tratarErroEscrita(error);

  const produto = mapProduto(data as ProdutoRow);

  await registrarAuditoria(req.supabase, {
    administrador: req.adminId ?? "ADMIN",
    entidade: "Produto",
    entidadeId: produto.id,
    acao: "CRIACAO",
    snapshot: produto,
  });

  res.status(201).json(produto);
}

export async function atualizarProduto(req: RequestComAdmin, res: Response) {
  const id = Number(req.params.id);
  const dados = produtoSchema.partial().parse(req.body);

  const { data: existenteRow, error: existenteError } = await req.supabase
    .from("produtos")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (existenteError) throw new HttpError(500, existenteError.message);
  if (!existenteRow) throw new HttpError(404, "Produto não encontrado");
  const existente = mapProduto(existenteRow as ProdutoRow);

  // Importante: alterar custoUnitarioCentavos aqui NÃO afeta perdas já
  // lançadas, pois cada perda guarda seu próprio custoUnitarioHistoricoCentavos.
  const patch: Record<string, unknown> = {};
  if (dados.nome !== undefined) patch.nome = dados.nome;
  if (dados.categoria !== undefined) patch.categoria = dados.categoria;
  if (dados.unidade !== undefined) patch.unidade = dados.unidade;
  if (dados.custoUnitarioCentavos !== undefined) patch.custo_unitario_centavos = dados.custoUnitarioCentavos;
  if (dados.ativo !== undefined) patch.ativo = dados.ativo;

  const { data, error } = await req.supabase.from("produtos").update(patch).eq("id", id).select().single();
  if (error) tratarErroEscrita(error);
  const produto = mapProduto(data as ProdutoRow);

  const campos = ["nome", "categoria", "unidade", "custoUnitarioCentavos", "ativo"] as const;
  const alteracoes = campos
    .filter((campo) => produto[campo] !== existente[campo])
    .map((campo) => ({ campo, valorAnterior: existente[campo], valorNovo: produto[campo] }));

  if (alteracoes.length > 0) {
    await registrarAuditoria(req.supabase, {
      administrador: req.adminId ?? "ADMIN",
      entidade: "Produto",
      entidadeId: id,
      acao: "EDICAO",
      alteracoes,
    });
  }

  res.json(produto);
}

export async function removerProduto(req: RequestComAdmin, res: Response) {
  const id = Number(req.params.id);

  const { data: existenteRow, error: existenteError } = await req.supabase
    .from("produtos")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (existenteError) throw new HttpError(500, existenteError.message);
  if (!existenteRow) throw new HttpError(404, "Produto não encontrado");
  const existente = mapProduto(existenteRow as ProdutoRow);

  // Soft delete: preserva histórico de produções/perdas vinculadas ao produto.
  const { data, error } = await req.supabase.from("produtos").update({ ativo: false }).eq("id", id).select().single();
  if (error) throw new HttpError(400, error.message);
  const produto = mapProduto(data as ProdutoRow);

  if (existente.ativo !== produto.ativo) {
    await registrarAuditoria(req.supabase, {
      administrador: req.adminId ?? "ADMIN",
      entidade: "Produto",
      entidadeId: id,
      acao: "EDICAO",
      alteracoes: [{ campo: "ativo", valorAnterior: existente.ativo, valorNovo: produto.ativo }],
    });
  }

  res.json(produto);
}
