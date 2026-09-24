import { FormEvent, useState } from "react";
import type { MotivoPerda, Perda, Producao, Produto, Turno } from "../../api/types";

type Lancamento = (Producao & { tipo: "producao" }) | (Perda & { tipo: "perda" });

export interface EditLancamentoPayload {
  data: string;
  turnoId: number;
  produtoId: number;
  quantidade: number;
  motivoId?: number;
}

interface EditLancamentoModalProps {
  lancamento: Lancamento;
  produtos: Produto[];
  turnos: Turno[];
  motivos: MotivoPerda[];
  onSalvar: (payload: EditLancamentoPayload) => Promise<void>;
  onFechar: () => void;
}

export function EditLancamentoModal({ lancamento, produtos, turnos, motivos, onSalvar, onFechar }: EditLancamentoModalProps) {
  const [data, setData] = useState(lancamento.data.slice(0, 10));
  const [turnoId, setTurnoId] = useState(lancamento.turnoId);
  const [produtoId, setProdutoId] = useState(lancamento.produtoId);
  const [quantidade, setQuantidade] = useState(String(lancamento.quantidade));
  const [motivoId, setMotivoId] = useState(lancamento.tipo === "perda" ? lancamento.motivoId : motivos[0]?.id ?? 0);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSalvando(true);
    setErro(null);
    try {
      await onSalvar({
        data,
        turnoId,
        produtoId,
        quantidade: Number(quantidade),
        motivoId: lancamento.tipo === "perda" ? motivoId : undefined,
      });
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Não foi possível salvar a alteração.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-2xl bg-surface p-6 shadow-xl">
        <h2 className="mb-4 text-lg font-semibold text-ink-primary">
          Editar {lancamento.tipo === "producao" ? "produção" : "perda"} #{lancamento.id}
        </h2>

        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="mb-1 block text-xs font-medium text-ink-secondary">Data</label>
            <input
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              className="w-full rounded-lg border border-grid px-3 py-2 text-sm"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-ink-secondary">Turno</label>
            <select
              value={turnoId}
              onChange={(e) => setTurnoId(Number(e.target.value))}
              className="w-full rounded-lg border border-grid px-3 py-2 text-sm"
            >
              {turnos.map((turno) => (
                <option key={turno.id} value={turno.id}>
                  {turno.nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-ink-secondary">Quantidade</label>
            <input
              type="number"
              min={1}
              value={quantidade}
              onChange={(e) => setQuantidade(e.target.value)}
              className="w-full rounded-lg border border-grid px-3 py-2 text-sm"
              required
            />
          </div>

          <div className="col-span-2">
            <label className="mb-1 block text-xs font-medium text-ink-secondary">Produto</label>
            <select
              value={produtoId}
              onChange={(e) => setProdutoId(Number(e.target.value))}
              className="w-full rounded-lg border border-grid px-3 py-2 text-sm"
            >
              {produtos.map((produto) => (
                <option key={produto.id} value={produto.id}>
                  {produto.nome}
                  {!produto.ativo ? " (inativo)" : ""}
                </option>
              ))}
            </select>
          </div>

          {lancamento.tipo === "perda" && (
            <div className="col-span-2">
              <label className="mb-1 block text-xs font-medium text-ink-secondary">Motivo</label>
              <select
                value={motivoId}
                onChange={(e) => setMotivoId(Number(e.target.value))}
                className="w-full rounded-lg border border-grid px-3 py-2 text-sm"
              >
                {motivos.map((motivo) => (
                  <option key={motivo.id} value={motivo.id}>
                    {motivo.nome}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-xs text-ink-muted">
                Alterar o produto recalcula o custo histórico desta perda para o custo atual do novo produto
                (registrado na auditoria). Alterar só a quantidade preserva o custo unitário já registrado.
              </p>
            </div>
          )}
        </div>

        {erro && <p className="mt-3 text-sm text-status-critical">{erro}</p>}

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onFechar}
            className="rounded-lg border border-grid px-4 py-2 text-sm font-medium text-ink-secondary"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={salvando}
            className="rounded-lg bg-series-1 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {salvando ? "Salvando..." : "Salvar alterações"}
          </button>
        </div>
      </form>
    </div>
  );
}
