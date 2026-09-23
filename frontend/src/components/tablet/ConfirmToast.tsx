interface ConfirmToastProps {
  mensagem: string;
  tipo: "sucesso" | "erro";
}

export function ConfirmToast({ mensagem, tipo }: ConfirmToastProps) {
  const cor = tipo === "sucesso" ? "bg-status-good" : "bg-status-critical";
  return (
    <div className={`fixed left-1/2 top-6 z-[60] -translate-x-1/2 rounded-xl px-5 py-3 text-base font-semibold text-white shadow-lg ${cor}`}>
      {mensagem}
    </div>
  );
}
