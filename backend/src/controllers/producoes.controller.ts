import type { ReqCompat as Request, ResCompat as Response } from "../lib/honoAdapter";
import { z } from "zod";
import { HttpError } from "../middleware/errorHandler";
import { RequestComAdmin } from "../middleware/auth";
import { resolverIntervaloDatas } from "../utils/dateRange";
import { registrarAuditoria } from "../services/audit";
import { ProducaoRow, mapProducao } from "../db/mappers";

const PRODUCAO_SELECT = "*, produto:produtos(*), turno:turnos(*)";

const producaoSchema = z.object({
  produtoId: z.number().int().positive(),
  turnoId: z.number().int().positive(),
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data deve estar no formato YYYY-MM-DD"),
  quantidade: z.number().int().positive("Quantidade deve ser maior que zero"),
});

const producaoUpdateSchema = producaoSchema.partial();

export async function listarProducoes(req: Request, res: Response) {
  const { dataInicio, dataFim, produtoId, turnoId } = req.query as Record<string, string | undefined>;
  const { inicio, fim } = resolverIntervaloDatas(dataInicio, dataFim);

  let query = req.supabase
    .from("producoes")
    .select(PRODUCAO_SELECT)
    .gte("data", inicio)
    .lte("data", fim)
    .order("data", { ascending: false })
    .order("id", { ascending: false });

  if (produtoId) query = query.eq("produto_id", Number(produtoId));
  if (turnoId) query = query.eq("turno_id", Number(turnoId));

  const { data, error } = await query;
  if (error) throw new HttpError(500, error.message);

  res.json((data as unknown as ProducaoRow[]).map(mapProducao));
}

export async function registrarProducao(req: Request, res: Response) {
  const dados = producaoSchema.parse(req.body);

  const { data: produto, error: produtoError } = await req.supabase
    .from("produtos")
    .select("id")
    .eq("id", dados.produtoId)
    .maybeSingle();
  if (produtoError) throw new HttpError(500, produtoError.message);
  if (!produto) throw new HttpError(404, "Produto não encontrado");

  const { data: turno, error: turnoError } = await req.supabase
    .from("turnos")
    .select("id")
    .eq("id", dados.turnoId)
    .maybeSingle();
  if (turnoError) throw new HttpError(500, turnoError.message);
  if (!turno) throw new HttpError(404, "Turno não encontrado");

  const { data, error } = await req.supabase
    .from("producoes")
    .insert({ produto_id: dados.produtoId, turno_id: dados.turnoId, data: dados.data, quantidade: dados.quantidade })
    .select(PRODUCAO_SELECT)
    .single();
  if (error) throw new HttpError(400, error.message);

  res.status(201).json(mapProducao(data as unknown as ProducaoRow));
}

export async function atualizarProducao(req: RequestComAdmin, res: Response) {
  const id = Number(req.params.id);
  const dados = producaoUpdateSchema.parse(req.body);

  const { data: existenteRow, error: existenteError } = await req.supabase
    .from("producoes")
    .select(PRODUCAO_SELECT)
    .eq("id", id)
    .maybeSingle();
  if (existenteError) throw new HttpError(500, existenteError.message);
  if (!existenteRow) throw new HttpError(404, "Lançamento não encontrado");
  const existente = mapProducao(existenteRow as unknown as ProducaoRow);

  if (dados.produtoId !== undefined) {
    const { data: produto, error } = await req.supabase.from("produtos").select("id").eq("id", dados.produtoId).maybeSingle();
    if (error) throw new HttpError(500, error.message);
    if (!produto) throw new HttpError(404, "Produto não encontrado");
  }
  if (dados.turnoId !== undefined) {
    const { data: turno, error } = await req.supabase.from("turnos").select("id").eq("id", dados.turnoId).maybeSingle();
    if (error) throw new HttpError(500, error.message);
    if (!turno) throw new HttpError(404, "Turno não encontrado");
  }

  const patch: Record<string, unknown> = {};
  if (dados.produtoId !== undefined) patch.produto_id = dados.produtoId;
  if (dados.turnoId !== undefined) patch.turno_id = dados.turnoId;
  if (dados.data !== undefined) patch.data = dados.data;
  if (dados.quantidade !== undefined) patch.quantidade = dados.quantidade;

  const { data, error } = await req.supabase.from("producoes").update(patch).eq("id", id).select(PRODUCAO_SELECT).single();
  if (error) throw new HttpError(400, error.message);
  const producao = mapProducao(data as unknown as ProducaoRow);

  const alteracoes: { campo: string; valorAnterior: unknown; valorNovo: unknown }[] = [];
  if (producao.produtoId !== existente.produtoId) {
    alteracoes.push({ campo: "produtoId", valorAnterior: existente.produtoId, valorNovo: producao.produtoId });
  }
  if (producao.turnoId !== existente.turnoId) {
    alteracoes.push({ campo: "turnoId", valorAnterior: existente.turnoId, valorNovo: producao.turnoId });
  }
  if (producao.data !== existente.data) {
    alteracoes.push({ campo: "data", valorAnterior: existente.data, valorNovo: producao.data });
  }
  if (producao.quantidade !== existente.quantidade) {
    alteracoes.push({ campo: "quantidade", valorAnterior: existente.quantidade, valorNovo: producao.quantidade });
  }

  if (alteracoes.length > 0) {
    await registrarAuditoria(req.supabase, {
      administrador: req.adminId ?? "ADMIN",
      entidade: "Producao",
      entidadeId: id,
      acao: "EDICAO",
      alteracoes,
    });
  }

  res.json(producao);
}

export async function removerProducao(req: RequestComAdmin, res: Response) {
  const id = Number(req.params.id);

  const { data: existenteRow, error: existenteError } = await req.supabase
    .from("producoes")
    .select(PRODUCAO_SELECT)
    .eq("id", id)
    .maybeSingle();
  if (existenteError) throw new HttpError(500, existenteError.message);
  if (!existenteRow) throw new HttpError(404, "Lançamento não encontrado");
  const existente = mapProducao(existenteRow as unknown as ProducaoRow);

  const { error } = await req.supabase.from("producoes").delete().eq("id", id);
  if (error) throw new HttpError(400, error.message);

  await registrarAuditoria(req.supabase, {
    administrador: req.adminId ?? "ADMIN",
    entidade: "Producao",
    entidadeId: id,
    acao: "EXCLUSAO",
    snapshot: {
      produto: existente.produto.nome,
      turno: existente.turno.nome,
      data: existente.data,
      quantidade: existente.quantidade,
    },
  });

  res.status(204).send();
}
