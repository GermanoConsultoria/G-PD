import type { ReqCompat as Request, ResCompat as Response } from "../lib/honoAdapter";
import type { SupabaseClient } from "@supabase/supabase-js";
import { HttpError } from "../middleware/errorHandler";
import { resolverIntervaloDatas } from "../utils/dateRange";
import { ProdutoRow, mapProduto } from "../db/mappers";

function query(req: Request) {
  const { dataInicio, dataFim } = req.query as Record<string, string | undefined>;
  return resolverIntervaloDatas(dataInicio, dataFim);
}

interface ProducaoAgregavel {
  produto_id: number;
  quantidade: number;
}

interface PerdaAgregavel {
  produto_id: number;
  turno_id: number;
  motivo_id: number;
  data: string;
  quantidade: number;
  custo_total_centavos: number;
  produto: { nome: string } | null;
  motivo: { codigo: string; nome: string } | null;
}

// A tabela analítica agrega no backend a partir das linhas cruas do período
// (sem GROUP BY em SQL — o client PostgREST/supabase-js não expõe agregação
// nativa), o que é perfeitamente aceitável no volume de dados de uma
// padaria/produção artesanal.
async function buscarProducoesNoPeriodo(
  supabase: SupabaseClient<any, string, any>,
  inicio: string,
  fim: string
): Promise<ProducaoAgregavel[]> {
  const { data, error } = await supabase
    .from("producoes")
    .select("produto_id, quantidade")
    .gte("data", inicio)
    .lte("data", fim);
  if (error) throw new HttpError(500, error.message);
  return data as ProducaoAgregavel[];
}

async function buscarPerdasNoPeriodo(
  supabase: SupabaseClient<any, string, any>,
  inicio: string,
  fim: string
): Promise<PerdaAgregavel[]> {
  const { data, error } = await supabase
    .from("perdas")
    .select("produto_id, turno_id, motivo_id, data, quantidade, custo_total_centavos, produto:produtos(nome), motivo:motivos_perda(codigo, nome)")
    .gte("data", inicio)
    .lte("data", fim);
  if (error) throw new HttpError(500, error.message);
  return data as unknown as PerdaAgregavel[];
}

export async function resumo(req: Request, res: Response) {
  const { inicio, fim } = query(req);
  const [producoes, perdas] = await Promise.all([buscarProducoesNoPeriodo(req.supabase, inicio, fim), buscarPerdasNoPeriodo(req.supabase, inicio, fim)]);

  const totalProduzido = producoes.reduce((soma, p) => soma + p.quantidade, 0);
  const totalDescartado = perdas.reduce((soma, p) => soma + p.quantidade, 0);
  const custoTotalPerdasCentavos = perdas.reduce((soma, p) => soma + p.custo_total_centavos, 0);
  const taxaPerda = totalProduzido > 0 ? Number(((totalDescartado / totalProduzido) * 100).toFixed(2)) : 0;

  res.json({ totalProduzido, totalDescartado, taxaPerda, custoTotalPerdasCentavos });
}

export async function perdasPorMotivo(req: Request, res: Response) {
  const { inicio, fim } = query(req);
  const perdas = await buscarPerdasNoPeriodo(req.supabase, inicio, fim);

  const porMotivo = new Map<number, { motivoId: number; motivo: string; quantidade: number; custoTotalCentavos: number }>();
  for (const perda of perdas) {
    const atual = porMotivo.get(perda.motivo_id) ?? {
      motivoId: perda.motivo_id,
      motivo: perda.motivo?.nome ?? "Desconhecido",
      quantidade: 0,
      custoTotalCentavos: 0,
    };
    atual.quantidade += perda.quantidade;
    atual.custoTotalCentavos += perda.custo_total_centavos;
    porMotivo.set(perda.motivo_id, atual);
  }

  res.json(Array.from(porMotivo.values()).sort((a, b) => b.quantidade - a.quantidade));
}

export async function perdasPorProduto(req: Request, res: Response) {
  const { inicio, fim } = query(req);
  const perdas = await buscarPerdasNoPeriodo(req.supabase, inicio, fim);

  const porProduto = new Map<number, { produtoId: number; produto: string; quantidade: number; custoTotalCentavos: number }>();
  for (const perda of perdas) {
    const atual = porProduto.get(perda.produto_id) ?? {
      produtoId: perda.produto_id,
      produto: perda.produto?.nome ?? "Desconhecido",
      quantidade: 0,
      custoTotalCentavos: 0,
    };
    atual.quantidade += perda.quantidade;
    atual.custoTotalCentavos += perda.custo_total_centavos;
    porProduto.set(perda.produto_id, atual);
  }

  res.json(Array.from(porProduto.values()).sort((a, b) => b.quantidade - a.quantidade));
}

export async function evolucaoPerdas(req: Request, res: Response) {
  const { inicio, fim } = query(req);
  const perdas = await buscarPerdasNoPeriodo(req.supabase, inicio, fim);

  const porData = new Map<string, { data: string; quantidade: number; custoTotalCentavos: number }>();
  for (const perda of perdas) {
    const atual = porData.get(perda.data) ?? { data: perda.data, quantidade: 0, custoTotalCentavos: 0 };
    atual.quantidade += perda.quantidade;
    atual.custoTotalCentavos += perda.custo_total_centavos;
    porData.set(perda.data, atual);
  }

  res.json(Array.from(porData.values()).sort((a, b) => (a.data < b.data ? -1 : 1)));
}

/**
 * Tabela analítica do dashboard: por produto, produzido x perdido x
 * percentual x quebra por motivo x custo total das perdas, tudo agregado no
 * backend a partir do intervalo de datas informado.
 */
export async function analitico(req: Request, res: Response) {
  const { inicio, fim } = query(req);

  const [producoes, perdas, produtosResp, motivosResp] = await Promise.all([
    buscarProducoesNoPeriodo(req.supabase, inicio, fim),
    buscarPerdasNoPeriodo(req.supabase, inicio, fim),
    req.supabase.from("produtos").select("*"),
    req.supabase.from("motivos_perda").select("*").order("id", { ascending: true }),
  ]);

  if (produtosResp.error) throw new HttpError(500, produtosResp.error.message);
  if (motivosResp.error) throw new HttpError(500, motivosResp.error.message);

  const produtos = (produtosResp.data as ProdutoRow[]).map(mapProduto);
  const motivos = motivosResp.data as { id: number; codigo: string; nome: string; ativo: boolean }[];
  const produtoPorId = new Map(produtos.map((p) => [p.id, p]));

  interface LinhaAnalitica {
    produtoId: number;
    produto: string;
    produzido: number;
    perdido: number;
    percentualPerda: number;
    porMotivo: Record<string, number>;
    custoTotalCentavos: number;
  }

  const linhas = new Map<number, LinhaAnalitica>();

  function obterLinha(produtoId: number): LinhaAnalitica {
    let linha = linhas.get(produtoId);
    if (!linha) {
      const produto = produtoPorId.get(produtoId);
      linha = {
        produtoId,
        produto: produto?.nome ?? `Produto #${produtoId}`,
        produzido: 0,
        perdido: 0,
        percentualPerda: 0,
        porMotivo: Object.fromEntries(motivos.map((m) => [m.codigo, 0])),
        custoTotalCentavos: 0,
      };
      linhas.set(produtoId, linha);
    }
    return linha;
  }

  for (const producao of producoes) {
    obterLinha(producao.produto_id).produzido += producao.quantidade;
  }

  for (const perda of perdas) {
    const linha = obterLinha(perda.produto_id);
    linha.perdido += perda.quantidade;
    linha.custoTotalCentavos += perda.custo_total_centavos;
    const codigoMotivo = perda.motivo?.codigo;
    if (codigoMotivo && linha.porMotivo[codigoMotivo] !== undefined) {
      linha.porMotivo[codigoMotivo] += perda.quantidade;
    }
  }

  const resultado = Array.from(linhas.values())
    .map((linha) => ({
      ...linha,
      percentualPerda:
        linha.produzido > 0
          ? Number(((linha.perdido / linha.produzido) * 100).toFixed(2))
          : linha.perdido > 0
            ? 100
            : 0,
    }))
    .sort((a, b) => b.custoTotalCentavos - a.custoTotalCentavos);

  res.json({
    motivos: motivos.map((m) => ({ codigo: m.codigo, nome: m.nome })),
    linhas: resultado,
  });
}
