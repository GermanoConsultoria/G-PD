import type { MotivoPerda } from "../../api/types";

interface MotivoPickerProps {
  motivos: MotivoPerda[];
  onSelecionar: (motivo: MotivoPerda) => void;
  onCancelar: () => void;
}

export function MotivoPicker({ motivos, onSelecionar, onCancelar }: MotivoPickerProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-surface p-6 shadow-xl">
        <p className="mb-4 text-center text-lg font-semibold text-ink-primary">Qual foi o motivo?</p>

        <div className="grid grid-cols-1 gap-3">
          {motivos.map((motivo) => (
            <button
              key={motivo.id}
              type="button"
              onClick={() => onSelecionar(motivo)}
              className="rounded-xl border border-grid bg-page py-4 text-lg font-medium text-ink-primary active:scale-95 active:bg-black/10"
            >
              {motivo.nome}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onCancelar}
          className="mt-4 w-full rounded-xl border border-grid py-4 text-lg font-medium text-ink-secondary active:scale-95"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
