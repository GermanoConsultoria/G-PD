import { useEffect, useState } from "react";
import {
  atualizarPerda,
  atualizarProducao,
  getMotivos,
  getPerdas,
  getProducoes,
  getProdutos,
  getTurnos,
  removerPerda,
  removerProducao,
} from "../api/endpoints";
import { extrairMensagemErro } from "../api/client";
import type { MotivoPerda, Perda, Producao, Produto, Turno } from "../api/types";
import { EditLancamentoModal, type EditLancamentoPayload } from "../components/lancamentos/EditLancamentoModal";
import { formatarDataCompleta, hojeISO, primeiroDiaDoMesISO } from "../utils/format";
import { formatarCentavos } from "../utils/money";

type Tipo = "producao" | "perda";
type LinhaTabela =
  | (Producao & { tipo: "producao" })
  | (Perda & { tipo: "perda" });

export function Lancamentos() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [motivos, setMotivos] = useState<MotivoPerda[]>([]);

  const [tipo, setTipo] = useState<Tipo>("producao");
  const [dataInicio, setDataInicio] = useState(primeiroDiaDoMesISO());
  const [dataFim, setDataFim] = useState(hojeISO());
  const [produtoId, setProdutoId] = useState<number | "">("");
  const [turnoId, setTurnoId] = useState<number | "">("");

  const [linhas, setLinhas] = useState<LinhaTabela[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [emEdicao, setEmEdicao] = useState<LinhaTabela | null>(null);

  useEffect(() => {
    Promise.all([getProdutos(), getTurnos(), getMotivos()]).then(([p, t, m]) => {
      setProdutos(p);
      setTurnos(t);
      setMotivos(m);
    });
  }, []);

  async function carregar() {
    setCarregando(true);
    setErro(null);
    const filtro = {
      dataInicio,
      dataFim,
      produtoId: produtoId === "" ? undefined : produtoId,
      turnoId: turnoId === "" ? undefined : turnoId,
    };
    try {
      if (tipo === "producao") {
        const dados = await getProducoes(filtro);
        setLinhas(dados.map((d) => ({ ...d, tipo: "producao" as const })));
      } else {
        const dados = await getPerdas(filtro);
        setLinhas(dados.map((d) => ({ ...d, tipo: "perda" as const })));
      }
    } catch (error) {
      setErro(extrairMensagemErro(error, "Não foi possível carregar os lançamentos."));
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipo, dataInicio, dataFim, produtoId, turnoId]);

  async function handleSalvarEdicao(payload: EditLancamentoPayload) {
    if (!emEdicao) return;
    try {
      if (emEdicao.tipo === "producao") {
        await atualizarProducao(emEdicao.id, payload);
      } else {
        await atualizarPerda(emEdicao.id, payload);
      }
      setEmEdicao(null);
      await carregar();
    } catch (error) {
      throw new Error(extrairMensagemErro(error, "Não foi possível salvar a alteração."));
    }
  }

  async function handleExcluir(linha: LinhaTabela) {
    const descricao = linha.tipo === "producao" ? "produção" : "perda";
    if (!confirm(`Excluir este lançamento de ${descricao}? Esta ação não pode ser desfeita.`)) return;
    setErro(null);
    try {
      if (linha.tipo === "producao") {
        await removerProducao(linha.id);
      } else {
        await removerPerda(linha.id);
      }
      await carregar();
    } catch (error) {
      setErro(extrairMensagemErro(error, "Não foi possível excluir o lançamento."));
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <h1 className="mb-4 text-2xl font-bold text-ink-primary">Lançamentos</h1>

      <div className="mb-4 flex flex-wrap items-end gap-3 rounded-2xl border border-grid bg-surface p-3">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setTipo("producao")}
            className={`rounded-lg px-3 py-2 text-sm font-semibold ${
              tipo === "producao" ? "bg-series-1 text-white" : "border border-grid text-ink-secondary"
            }`}
          >
            Produção
          </button>
          <button
            type="button"
            onClick={() => setTipo("perda")}
            className={`rounded-lg px-3 py-2 text-sm font-semibold ${
              tipo === "perda" ? "bg-status-critical text-white" : "border border-grid text-ink-secondary"
            }`}
          >
            Perda
          </button>
        </div>

        <label className="flex flex-col text-xs text-ink-secondary">
          Data inicial
          <input
            type="date"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
            className="rounded-lg border border-grid px-2 py-1.5 text-sm"
          />
        </label>
        <label className="flex flex-col text-xs text-ink-secondary">
          Data final
          <input
            type="date"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
            className="rounded-lg border border-grid px-2 py-1.5 text-sm"
          />
        </label>
        <label className="flex flex-col text-xs text-ink-secondary">
          Produto
          <select
            value={produtoId}
            onChange={(e) => setProdutoId(e.target.value === "" ? "" : Number(e.target.value))}
            className="rounded-lg border border-grid px-2 py-1.5 text-sm"
          >
            <option value="">Todos</option>
            {produtos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col text-xs text-ink-secondary">
          Turno
          <select
            value={turnoId}
            onChange={(e) => setTurnoId(e.target.value === "" ? "" : Number(e.target.value))}
            className="rounded-lg border border-grid px-2 py-1.5 text-sm"
          >
            <option value="">Todos</option>
            {turnos.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nome}
              </option>
            ))}
          </select>
        </label>
      </div>

      {erro && (
        <div className="mb-4 rounded-xl border border-status-critical bg-status-critical/10 px-4 py-2 text-sm text-status-critical">
          {erro}
        </div>
      )}

      <div className={`overflow-x-auto rounded-2xl border border-grid bg-surface transition-opacity ${carregando ? "opacity-60" : "opacity-100"}`}>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-grid text-ink-muted">
              <th className="px-4 py-3 font-medium">Data</th>
              <th className="px-4 py-3 font-medium">Turno</th>
              <th className="px-4 py-3 font-medium">Produto</th>
              <th className="px-4 py-3 font-medium tabular-nums">Quantidade</th>
              {tipo === "perda" && <th className="px-4 py-3 font-medium">Motivo</th>}
              {tipo === "perda" && <th className="px-4 py-3 font-medium tabular-nums">Custo</th>}
              <th className="px-4 py-3 font-medium text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {linhas.map((linha) => (
              <tr key={linha.id} className="border-b border-grid last:border-0">
                <td className="px-4 py-3 text-ink-primary">{formatarDataCompleta(linha.data.slice(0, 10))}</td>
                <td className="px-4 py-3 text-ink-secondary">{linha.turno.nome}</td>
                <td className="px-4 py-3 text-ink-secondary">{linha.produto.nome}</td>
                <td className="px-4 py-3 tabular-nums text-ink-secondary">{linha.quantidade}</td>
                {linha.tipo === "perda" && <td className="px-4 py-3 text-ink-secondary">{linha.motivo.nome}</td>}
                {linha.tipo === "perda" && (
                  <td className="px-4 py-3 tabular-nums text-ink-secondary">{formatarCentavos(linha.custoTotalCentavos)}</td>
                )}
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => setEmEdicao(linha)}
                    className="mr-2 rounded-lg border border-grid px-3 py-1.5 text-xs font-medium text-ink-secondary hover:bg-black/5"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExcluir(linha)}
                    className="rounded-lg border border-grid px-3 py-1.5 text-xs font-medium text-status-critical hover:bg-status-critical/10"
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
            {linhas.length === 0 && (
              <tr>
                <td colSpan={tipo === "perda" ? 7 : 5} className="px-4 py-8 text-center text-ink-muted">
                  Nenhum lançamento encontrado para os filtros selecionados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {emEdicao && (
        <EditLancamentoModal
          lancamento={emEdicao}
          produtos={produtos}
          turnos={turnos}
          motivos={motivos}
          onSalvar={handleSalvarEdicao}
          onFechar={() => setEmEdicao(null)}
        />
      )}
    </div>
  );
}
