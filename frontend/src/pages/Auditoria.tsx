import { useEffect, useState } from "react";
import { getAuditoria } from "../api/endpoints";
import { extrairMensagemErro } from "../api/client";
import type { AuditLog } from "../api/types";
import { hojeISO, primeiroDiaDoMesISO } from "../utils/format";

const ENTIDADES = ["Produto", "Producao", "Perda"] as const;

const ROTULO_ACAO: Record<AuditLog["acao"], string> = {
  CRIACAO: "Criação",
  EDICAO: "Edição",
  EXCLUSAO: "Exclusão",
};

function formatarDataHora(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR");
}

export function Auditoria() {
  const [dataInicio, setDataInicio] = useState(primeiroDiaDoMesISO());
  const [dataFim, setDataFim] = useState(hojeISO());
  const [entidade, setEntidade] = useState<string>("");
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    setCarregando(true);
    setErro(null);
    getAuditoria({ dataInicio, dataFim, entidade: entidade || undefined })
      .then(setLogs)
      .catch((error) => setErro(extrairMensagemErro(error, "Não foi possível carregar a auditoria.")))
      .finally(() => setCarregando(false));
  }, [dataInicio, dataFim, entidade]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <h1 className="mb-4 text-2xl font-bold text-ink-primary">Auditoria</h1>

      <div className="mb-4 flex flex-wrap items-end gap-3 rounded-2xl border border-grid bg-surface p-3">
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
          Entidade
          <select
            value={entidade}
            onChange={(e) => setEntidade(e.target.value)}
            className="rounded-lg border border-grid px-2 py-1.5 text-sm"
          >
            <option value="">Todas</option>
            {ENTIDADES.map((e) => (
              <option key={e} value={e}>
                {e}
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
              <th className="px-4 py-3 font-medium">Data/hora</th>
              <th className="px-4 py-3 font-medium">Administrador</th>
              <th className="px-4 py-3 font-medium">Ação</th>
              <th className="px-4 py-3 font-medium">Entidade</th>
              <th className="px-4 py-3 font-medium">Registro</th>
              <th className="px-4 py-3 font-medium">Campo</th>
              <th className="px-4 py-3 font-medium">Valor anterior</th>
              <th className="px-4 py-3 font-medium">Valor novo</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-b border-grid last:border-0 align-top">
                <td className="whitespace-nowrap px-4 py-3 text-ink-primary">{formatarDataHora(log.criadoEm)}</td>
                <td className="px-4 py-3 text-ink-secondary">{log.administrador}</td>
                <td className="px-4 py-3 text-ink-secondary">{ROTULO_ACAO[log.acao]}</td>
                <td className="px-4 py-3 text-ink-secondary">{log.entidade}</td>
                <td className="px-4 py-3 text-ink-secondary">#{log.entidadeId}</td>
                <td className="px-4 py-3 text-ink-secondary">{log.campo ?? "—"}</td>
                <td className="max-w-[220px] whitespace-pre-wrap break-words px-4 py-3 text-ink-secondary">
                  {log.valorAnterior ?? "—"}
                </td>
                <td className="max-w-[220px] whitespace-pre-wrap break-words px-4 py-3 text-ink-secondary">
                  {log.valorNovo ?? "—"}
                </td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-ink-muted">
                  Nenhum registro de auditoria encontrado para os filtros selecionados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
