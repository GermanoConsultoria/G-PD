import { useEffect, useState } from "react";
import {
  getEvolucaoPerdas,
  getPerdasPorMotivo,
  getPerdasPorProduto,
  getResumoDashboard,
} from "../api/endpoints";
import type { EvolucaoPerdaDia, PerdaPorMotivo, PerdaPorProduto, ResumoDashboard } from "../api/types";
import { DateRangeFilter } from "../components/dashboard/DateRangeFilter";
import { KpiCard } from "../components/dashboard/KpiCard";
import { RankingChart } from "../components/dashboard/RankingChart";
import { TrendChart } from "../components/dashboard/TrendChart";
import { formatarMoeda, formatarNumero, hojeISO, primeiroDiaDoMesISO } from "../utils/format";

export function Dashboard() {
  const [dataInicio, setDataInicio] = useState(primeiroDiaDoMesISO());
  const [dataFim, setDataFim] = useState(hojeISO());

  const [resumo, setResumo] = useState<ResumoDashboard | null>(null);
  const [porMotivo, setPorMotivo] = useState<PerdaPorMotivo[]>([]);
  const [porProduto, setPorProduto] = useState<PerdaPorProduto[]>([]);
  const [evolucao, setEvolucao] = useState<EvolucaoPerdaDia[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const filtro = { dataInicio, dataFim };
    setCarregando(true);
    Promise.all([
      getResumoDashboard(filtro),
      getPerdasPorMotivo(filtro),
      getPerdasPorProduto(filtro),
      getEvolucaoPerdas(filtro),
    ])
      .then(([resumoResp, motivoResp, produtoResp, evolucaoResp]) => {
        setResumo(resumoResp);
        setPorMotivo(motivoResp);
        setPorProduto(produtoResp);
        setEvolucao(evolucaoResp);
      })
      .finally(() => setCarregando(false));
  }, [dataInicio, dataFim]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <h1 className="mb-4 text-2xl font-bold text-ink-primary">Painel do Gestor</h1>

      <DateRangeFilter
        dataInicio={dataInicio}
        dataFim={dataFim}
        onMudar={(inicio, fim) => {
          setDataInicio(inicio);
          setDataFim(fim);
        }}
      />

      <div className={`mt-4 transition-opacity ${carregando ? "opacity-60" : "opacity-100"}`}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard titulo="Total Produzido" valor={formatarNumero(resumo?.totalProduzido ?? 0) + " un"} />
          <KpiCard titulo="Total Descartado" valor={formatarNumero(resumo?.totalDescartado ?? 0) + " un"} />
          <KpiCard
            titulo="Taxa de Perda"
            valor={`${(resumo?.taxaPerda ?? 0).toLocaleString("pt-BR", { maximumFractionDigits: 2 })}%`}
            destaque={(resumo?.taxaPerda ?? 0) >= 10 ? "critico" : "neutro"}
          />
          <KpiCard titulo="Custo Total das Perdas" valor={formatarMoeda(resumo?.custoTotalPerdas ?? 0)} destaque="critico" />
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <RankingChart
            titulo="Perdas por Motivo"
            vazio="Sem perdas registradas no período."
            itens={porMotivo.map((m) => ({ chave: m.motivoId, nome: m.motivo, quantidade: m.quantidade, custoTotal: m.custoTotal }))}
          />
          <RankingChart
            titulo="Perdas por Produto (ranking de desperdício)"
            vazio="Sem perdas registradas no período."
            itens={porProduto.map((p) => ({ chave: p.produtoId, nome: p.produto, quantidade: p.quantidade, custoTotal: p.custoTotal }))}
          />
        </div>

        <div className="mt-4">
          <TrendChart dados={evolucao} />
        </div>
      </div>
    </div>
  );
}
