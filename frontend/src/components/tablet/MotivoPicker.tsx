import type { MotivoPerda } from "../../api/types";

interface MotivoPickerProps {
  produtoNome: string;
  quantidade: number;
  motivos: MotivoPerda[];
  erro?: string | null;
  enviando?: boolean;
  onSelecionar: (motivo: MotivoPerda) => void;
  onCancelar: () => void;
}

export function MotivoPicker({ produtoNome, quantidade, motivos, erro, enviando = false, onSelecionar, onCancelar }: MotivoPickerProps) {
  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-page p-4 animate-[slideUp_0.15s_ease-out]">
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-1 text-center">
        <p className="text-2xl font-extrabold text-ink-primary">
          {produtoNome} · {quantidade}
        </p>
        <p className="mb-4 text-base font-medium text-ink-secondary">Qual foi o motivo?</p>

        {erro && (
          <div className="mb-4 rounded-xl border border-status-critical bg-status-critical/10 px-4 py-3 text-left text-sm text-status-critical">
            {erro}
          </div>
        )}

        <div className="grid grid-cols-1 gap-3">
          {motivos.map((motivo) => (
            <button
              key={motivo.id}
              type="button"
              disabled={enviando}
              onClick={() => onSelecionar(motivo)}
              className="rounded-xl border border-grid bg-surface py-4 text-lg font-medium text-ink-primary shadow-sm active:scale-95 active:bg-black/10 disabled:opacity-50"
            >
              {motivo.nome}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onCancelar}
          className="mt-5 w-full rounded-xl border border-grid py-4 text-lg font-medium text-ink-secondary active:scale-95"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
