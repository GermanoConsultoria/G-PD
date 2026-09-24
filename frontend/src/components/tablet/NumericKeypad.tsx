import { useState } from "react";

interface NumericKeypadProps {
  titulo: string;
  subtitulo?: string;
  corDestaque?: string;
  erro?: string | null;
  enviando?: boolean;
  onConfirmar: (quantidade: number) => void;
  onCancelar: () => void;
}

const teclas = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "limpar", "0", "apagar"];

export function NumericKeypad({
  titulo,
  subtitulo,
  corDestaque = "bg-series-1",
  erro,
  enviando = false,
  onConfirmar,
  onCancelar,
}: NumericKeypadProps) {
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
    <div className="fixed inset-0 z-40 flex flex-col bg-page p-4 animate-[slideUp_0.15s_ease-out]">
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-1 text-center">
        {subtitulo && <p className="text-2xl font-extrabold text-ink-primary">{subtitulo}</p>}
        <p className="mb-4 text-base font-medium text-ink-secondary">{titulo}</p>

        <div className="rounded-2xl border border-grid bg-surface py-6 text-center text-6xl font-extrabold tabular-nums text-ink-primary">
          {valor || "0"}
        </div>

        {erro && (
          <div className="mt-4 rounded-xl border border-status-critical bg-status-critical/10 px-4 py-3 text-left text-sm text-status-critical">
            {erro}
          </div>
        )}

        <div className="mt-4 grid grid-cols-3 gap-3">
          {teclas.map((tecla) => (
            <button
              key={tecla}
              type="button"
              onClick={() => pressionar(tecla)}
              className="h-16 rounded-xl bg-surface text-2xl font-semibold text-ink-primary shadow-sm active:scale-95 active:bg-black/10"
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
            disabled={!valido || enviando}
            onClick={() => onConfirmar(quantidade)}
            className={`flex-1 rounded-xl py-4 text-lg font-semibold text-white active:scale-95 disabled:opacity-40 ${corDestaque}`}
          >
            {enviando ? "Enviando..." : "Confirmar"}
          </button>
        </div>
      </div>
    </div>
  );
}
