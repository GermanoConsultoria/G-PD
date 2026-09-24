import { useEffect, useState } from "react";
import {
  getAnalitico,
  getEvolucaoPerdas,
  getPerdasPorMotivo,
  getPerdasPorProduto,
  getResumoDashboard,
} from "../api/endpoints";
import type { AnaliticoResponse, EvolucaoPerdaDia, PerdaPorMotivo, PerdaPorProduto, ResumoDashboard } from "../api/types";
import { AnaliticoTable } from "../components/dashboard/AnaliticoTable";
import { DateRangeFilter } from "../components/dashboard/DateRangeFilter";
import { KpiCard } from "../components/dashboard/KpiCard";
import { RankingChart } from "../components/dashboard/RankingChart";
import { TrendChart } from "../components/dashboard/TrendChart";
import { hojeISO, primeiroDiaDoMesISO, formatarNumero } from "../utils/format";
import { formatarCentavos } from "../utils/money";

export function Dashboard() {
  const [dataInicio, setDataInicio] = useState(primeiroDiaDoMesISO());
  const [dataFim, setDataFim] = useState(hojeISO());

  const [resumo, setResumo] = useState<ResumoDashboard | null>(null);
  const [porMotivo, setPorMotivo] = useState<PerdaPorMotivo[]>([]);
  const [porProduto, setPorProduto] = useState<PerdaPorProduto[]>([]);
  const [evolucao, setEvolucao] = useState<EvolucaoPerdaDia[]>([]);
  const [analitico, setAnalitico] = useState<AnaliticoResponse | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const filtro = { dataInicio, dataFim };
    setCarregando(true);
    Promise.all([
      getResumoDashboard(filtro),
      getPerdasPorMotivo(filtro),
      getPerdasPorProduto(filtro),
      getEvolucaoPerdas(filtro),
      getAnalitico(filtro),
    ])
      .then(([resumoResp, motivoResp, produtoResp, evolucaoResp, analiticoResp]) => {
        setResumo(resumoResp);
        setPorMotivo(motivoResp);
        setPorProduto(produtoResp);
        setEvolucao(evolucaoResp);
        setAnalitico(analiticoResp);
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
          <KpiCard
            titulo="Custo Total das Perdas"
            valor={formatarCentavos(resumo?.custoTotalPerdasCentavos ?? 0)}
            destaque="critico"
          />
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <RankingChart
            titulo="Perdas por Motivo"
            vazio="Sem perdas registradas no período."
            itens={porMotivo.map((m) => ({
              chave: m.motivoId,
              nome: m.motivo,
              quantidade: m.quantidade,
              custoTotalCentavos: m.custoTotalCentavos,
            }))}
          />
          <RankingChart
            titulo="Perdas por Produto (ranking de desperdício)"
            vazio="Sem perdas registradas no período."
            itens={porProduto.map((p) => ({
              chave: p.produtoId,
              nome: p.produto,
              quantidade: p.quantidade,
              custoTotalCentavos: p.custoTotalCentavos,
            }))}
          />
        </div>

        <div className="mt-4">
          <TrendChart dados={evolucao} />
        </div>

        <div className="mt-4">
          <AnaliticoTable dados={analitico} />
        </div>
      </div>
    </div>
  );
}
