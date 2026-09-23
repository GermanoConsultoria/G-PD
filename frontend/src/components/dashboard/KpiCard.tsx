interface KpiCardProps {
  titulo: string;
  valor: string;
  destaque?: "neutro" | "critico";
}

export function KpiCard({ titulo, valor, destaque = "neutro" }: KpiCardProps) {
  return (
    <div className="rounded-2xl border border-grid bg-surface p-5">
      <p className="text-sm font-medium text-ink-secondary">{titulo}</p>
      <p
        className={`mt-2 text-3xl font-bold ${
          destaque === "critico" ? "text-status-critical" : "text-ink-primary"
        }`}
      >
        {valor}
      </p>
    </div>
  );
}
