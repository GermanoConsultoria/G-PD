import type { ReqCompat as Request, ResCompat as Response } from "../lib/honoAdapter";
import { z } from "zod";
import { HttpError } from "../middleware/errorHandler";
import { RequestComAdmin } from "../middleware/auth";
import { resolverIntervaloDatas } from "../utils/dateRange";
import { registrarAuditoria } from "../services/audit";
import { PerdaRow, ProdutoRow, mapPerda, mapProduto } from "../db/mappers";

const PERDA_SELECT = "*, produto:produtos(*), turno:turnos(*), motivo:motivos_perda(*)";

const perdaSchema = z.object({
  produtoId: z.number().int().positive(),
  turnoId: z.number().int().positive(),
  motivoId: z.number().int().positive(),
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data deve estar no formato YYYY-MM-DD"),
  quantidade: z.number().int().positive("Quantidade deve ser maior que zero"),
});

const perdaUpdateSchema = perdaSchema.partial();

export async function listarPerdas(req: Request, res: Response) {
  const { dataInicio, dataFim, produtoId, turnoId, motivoId } = req.query as Record<string, string | undefined>;
  const { inicio, fim } = resolverIntervaloDatas(dataInicio, dataFim);

  let query = req.supabase
    .from("perdas")
    .select(PERDA_SELECT)
    .gte("data", inicio)
    .lte("data", fim)
    .order("data", { ascending: false })
    .order("id", { ascending: false });

  if (produtoId) query = query.eq("produto_id", Number(produtoId));
  if (turnoId) query = query.eq("turno_id", Number(turnoId));
  if (motivoId) query = query.eq("motivo_id", Number(motivoId));

  const { data, error } = await query;
  if (error) throw new HttpError(500, error.message);

  res.json((data as unknown as PerdaRow[]).map(mapPerda));
}

export async function registrarPerda(req: Request, res: Response) {
  const dados = perdaSchema.parse(req.body);

  const { data: produtoRow, error: produtoError } = await req.supabase
    .from("produtos")
    .select("*")
    .eq("id", dados.produtoId)
    .maybeSingle();
  if (produtoError) throw new HttpError(500, produtoError.message);
  if (!produtoRow) throw new HttpError(404, "Produto não encontrado");
  const produto = mapProduto(produtoRow as ProdutoRow);

  const { data: turno, error: turnoError } = await req.supabase
    .from("turnos")
    .select("id")
    .eq("id", dados.turnoId)
    .maybeSingle();
  if (turnoError) throw new HttpError(500, turnoError.message);
  if (!turno) throw new HttpError(404, "Turno não encontrado");

  const { data: motivo, error: motivoError } = await req.supabase
    .from("motivos_perda")
    .select("id")
    .eq("id", dados.motivoId)
    .maybeSingle();
  if (motivoError) throw new HttpError(500, motivoError.message);
  if (!motivo) throw new HttpError(404, "Motivo de perda não encontrado");

  // REGRA CRÍTICA: o custo unitário é capturado do cadastro de produto NO
  // MOMENTO do lançamento e gravado nesta linha. Alterações futuras no preço
  // do produto não retroagem sobre perdas já registradas.
  const custoUnitarioHistoricoCentavos = produto.custoUnitarioCentavos;
  const custoTotalCentavos = custoUnitarioHistoricoCentavos * dados.quantidade;

  const { data, error } = await req.supabase
    .from("perdas")
    .insert({
      produto_id: dados.produtoId,
      turno_id: dados.turnoId,
      motivo_id: dados.motivoId,
      data: dados.data,
      quantidade: dados.quantidade,
      custo_unitario_historico_centavos: custoUnitarioHistoricoCentavos,
      custo_total_centavos: custoTotalCentavos,
    })
    .select(PERDA_SELECT)
    .single();
  if (error) throw new HttpError(400, error.message);

  res.status(201).json(mapPerda(data as unknown as PerdaRow));
}

export async function atualizarPerda(req: RequestComAdmin, res: Response) {
  const id = Number(req.params.id);
  const dados = perdaUpdateSchema.parse(req.body);

  const { data: existenteRow, error: existenteError } = await req.supabase
    .from("perdas")
    .select(PERDA_SELECT)
    .eq("id", id)
    .maybeSingle();
  if (existenteError) throw new HttpError(500, existenteError.message);
  if (!existenteRow) throw new HttpError(404, "Lançamento não encontrado");
  const existente = mapPerda(existenteRow as unknown as PerdaRow);

  const produtoMudou = dados.produtoId !== undefined && dados.produtoId !== existente.produtoId;

  let novoProduto: ReturnType<typeof mapProduto> | null = null;
  if (produtoMudou) {
    const { data: produtoRow, error } = await req.supabase
      .from("produtos")
      .select("*")
      .eq("id", dados.produtoId)
      .maybeSingle();
    if (error) throw new HttpError(500, error.message);
    if (!produtoRow) throw new HttpError(404, "Produto não encontrado");
    novoProduto = mapProduto(produtoRow as ProdutoRow);
  }
  if (dados.turnoId !== undefined) {
    const { data: turno, error } = await req.supabase.from("turnos").select("id").eq("id", dados.turnoId).maybeSingle();
    if (error) throw new HttpError(500, error.message);
    if (!turno) throw new HttpError(404, "Turno não encontrado");
  }
  if (dados.motivoId !== undefined) {
    const { data: motivo, error } = await req.supabase
      .from("motivos_perda")
      .select("id")
      .eq("id", dados.motivoId)
      .maybeSingle();
    if (error) throw new HttpError(500, error.message);
    if (!motivo) throw new HttpError(404, "Motivo de perda não encontrado");
  }

  const quantidadeFinal = dados.quantidade ?? existente.quantidade;

  // REGRA: o custo histórico só é recalculado quando o PRODUTO do
  // lançamento é alterado. Uma correção de quantidade, data ou turno,
  // sozinha, preserva o custo unitário histórico já registrado.
  const custoUnitarioHistoricoCentavos = novoProduto
    ? novoProduto.custoUnitarioCentavos
    : existente.custoUnitarioHistoricoCentavos;
  const custoTotalCentavos = custoUnitarioHistoricoCentavos * quantidadeFinal;

  const patch: Record<string, unknown> = {
    quantidade: quantidadeFinal,
    custo_unitario_historico_centavos: custoUnitarioHistoricoCentavos,
    custo_total_centavos: custoTotalCentavos,
  };
  if (dados.produtoId !== undefined) patch.produto_id = dados.produtoId;
  if (dados.turnoId !== undefined) patch.turno_id = dados.turnoId;
  if (dados.motivoId !== undefined) patch.motivo_id = dados.motivoId;
  if (dados.data !== undefined) patch.data = dados.data;

  const { data, error } = await req.supabase.from("perdas").update(patch).eq("id", id).select(PERDA_SELECT).single();
  if (error) throw new HttpError(400, error.message);
  const perda = mapPerda(data as unknown as PerdaRow);

  const alteracoes: { campo: string; valorAnterior: unknown; valorNovo: unknown }[] = [];
  if (perda.produtoId !== existente.produtoId) {
    alteracoes.push({ campo: "produtoId", valorAnterior: existente.produtoId, valorNovo: perda.produtoId });
  }
  if (perda.turnoId !== existente.turnoId) {
    alteracoes.push({ campo: "turnoId", valorAnterior: existente.turnoId, valorNovo: perda.turnoId });
  }
  if (perda.motivoId !== existente.motivoId) {
    alteracoes.push({ campo: "motivoId", valorAnterior: existente.motivoId, valorNovo: perda.motivoId });
  }
  if (perda.data !== existente.data) {
    alteracoes.push({ campo: "data", valorAnterior: existente.data, valorNovo: perda.data });
  }
  if (perda.quantidade !== existente.quantidade) {
    alteracoes.push({ campo: "quantidade", valorAnterior: existente.quantidade, valorNovo: perda.quantidade });
  }
  if (perda.custoUnitarioHistoricoCentavos !== existente.custoUnitarioHistoricoCentavos) {
    alteracoes.push({
      campo: "custoUnitarioHistoricoCentavos",
      valorAnterior: existente.custoUnitarioHistoricoCentavos,
      valorNovo: perda.custoUnitarioHistoricoCentavos,
    });
  }
  if (perda.custoTotalCentavos !== existente.custoTotalCentavos) {
    alteracoes.push({
      campo: "custoTotalCentavos",
      valorAnterior: existente.custoTotalCentavos,
      valorNovo: perda.custoTotalCentavos,
    });
  }

  if (alteracoes.length > 0) {
    await registrarAuditoria(req.supabase, {
      administrador: req.adminId ?? "ADMIN",
      entidade: "Perda",
      entidadeId: id,
      acao: "EDICAO",
      alteracoes,
    });
  }

  res.json(perda);
}

export async function removerPerda(req: RequestComAdmin, res: Response) {
  const id = Number(req.params.id);

  const { data: existenteRow, error: existenteError } = await req.supabase
    .from("perdas")
    .select(PERDA_SELECT)
    .eq("id", id)
    .maybeSingle();
  if (existenteError) throw new HttpError(500, existenteError.message);
  if (!existenteRow) throw new HttpError(404, "Lançamento não encontrado");
  const existente = mapPerda(existenteRow as unknown as PerdaRow);

  const { error } = await req.supabase.from("perdas").delete().eq("id", id);
  if (error) throw new HttpError(400, error.message);

  await registrarAuditoria(req.supabase, {
    administrador: req.adminId ?? "ADMIN",
    entidade: "Perda",
    entidadeId: id,
    acao: "EXCLUSAO",
    snapshot: {
      produto: existente.produto.nome,
      turno: existente.turno.nome,
      motivo: existente.motivo.nome,
      data: existente.data,
      quantidade: existente.quantidade,
      custoUnitarioHistoricoCentavos: existente.custoUnitarioHistoricoCentavos,
      custoTotalCentavos: existente.custoTotalCentavos,
    },
  });

  res.status(204).send();
}
