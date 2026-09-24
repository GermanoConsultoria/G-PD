import { formatarDataCompleta } from "../../utils/format";
import { formatarCentavos } from "../../utils/money";

interface SuccessScreenProps {
  tipo: "producao" | "perda";
  produtoNome: string;
  quantidade: number;
  turnoNome: string;
  data: string;
  motivoNome?: string;
  custoTotalCentavos?: number;
  onNovoLancamento: () => void;
}

export function SuccessScreen({
  tipo,
  produtoNome,
  quantidade,
  turnoNome,
  data,
  motivoNome,
  custoTotalCentavos,
  onNovoLancamento,
}: SuccessScreenProps) {
  const cor = tipo === "producao" ? "bg-status-good" : "bg-series-2";

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-page p-6 animate-[fadeIn_0.2s_ease-out]">
      <div className={`flex h-20 w-20 items-center justify-center rounded-full text-white ${cor}`}>
        <svg viewBox="0 0 24 24" fill="none" className="h-10 w-10" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <p className="mt-5 text-xl font-bold text-ink-primary">
        {tipo === "producao" ? "Produção registrada" : "Perda registrada"}
      </p>

      <div className="mt-6 w-full max-w-sm rounded-2xl border border-grid bg-surface p-6 text-center">
        <p className="text-2xl font-extrabold text-ink-primary">{produtoNome}</p>
        <p className="mt-1 text-lg font-semibold text-ink-secondary">{quantidade} unidades</p>

        {motivoNome && (
          <div className="mt-4 border-t border-grid pt-4">
            <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">Motivo</p>
            <p className="text-base font-semibold text-ink-primary">{motivoNome}</p>
          </div>
        )}

        <div className="mt-4 border-t border-grid pt-4 text-sm text-ink-secondary">
          <p>{turnoNome}</p>
          <p>{formatarDataCompleta(data)}</p>
        </div>

        {custoTotalCentavos !== undefined && (
          <p className="mt-4 text-xs text-ink-muted">Custo da perda: {formatarCentavos(custoTotalCentavos)}</p>
        )}
      </div>

      <button
        type="button"
        onClick={onNovoLancamento}
        className="mt-8 w-full max-w-sm rounded-2xl bg-series-1 py-5 text-lg font-bold text-white active:scale-95"
      >
        NOVO LANÇAMENTO
      </button>
    </div>
  );
}
