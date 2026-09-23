import { useState } from "react";

interface NumericKeypadProps {
  titulo: string;
  subtitulo?: string;
  corDestaque?: string;
  onConfirmar: (quantidade: number) => void;
  onCancelar: () => void;
}

const teclas = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "limpar", "0", "apagar"];

export function NumericKeypad({ titulo, subtitulo, corDestaque = "bg-series-1", onConfirmar, onCancelar }: NumericKeypadProps) {
  const [valor, setValor] = useState("");

  function pressionar(tecla: string) {
    if (tecla === "limpar") return setValor("");
    if (tecla === "apagar") return setValor((v) => v.slice(0, -1));
    if (valor.length >= 5) return;
    if (tecla === "0" && valor === "0") return;
    setValor((v) => (v === "0" ? tecla : v + tecla));
  }

  const quantidade = Number(valor || "0");
  const valido = quantidade > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-surface p-6 shadow-xl">
        <p className="text-center text-lg font-semibold text-ink-primary">{titulo}</p>
        {subtitulo && <p className="mb-2 text-center text-sm text-ink-secondary">{subtitulo}</p>}

        <div className="my-4 rounded-xl border border-grid bg-page py-4 text-center text-5xl font-bold text-ink-primary">
          {valor || "0"}
        </div>

        <div className="grid grid-cols-3 gap-3">
          {teclas.map((tecla) => (
            <button
              key={tecla}
              type="button"
              onClick={() => pressionar(tecla)}
              className="h-16 rounded-xl bg-page text-2xl font-semibold text-ink-primary active:scale-95 active:bg-black/10"
            >
              {tecla === "limpar" ? "C" : tecla === "apagar" ? "⌫" : tecla}
            </button>
          ))}
        </div>

        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={onCancelar}
            className="flex-1 rounded-xl border border-grid py-4 text-lg font-medium text-ink-secondary active:scale-95"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={!valido}
            onClick={() => onConfirmar(quantidade)}
            className={`flex-1 rounded-xl py-4 text-lg font-semibold text-white active:scale-95 disabled:opacity-40 ${corDestaque}`}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}
