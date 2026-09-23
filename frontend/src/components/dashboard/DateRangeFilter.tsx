import { hojeISO } from "../../utils/format";

interface DateRangeFilterProps {
  dataInicio: string;
  dataFim: string;
  onMudar: (dataInicio: string, dataFim: string) => void;
}

function isoOffset(dias: number): string {
  const d = new Date();
  d.setDate(d.getDate() - dias);
  return d.toISOString().slice(0, 10);
}

function primeiroDiaMes(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}

export function DateRangeFilter({ dataInicio, dataFim, onMudar }: DateRangeFilterProps) {
  const hoje = hojeISO();

  const presets = [
    { rotulo: "Hoje", inicio: hoje, fim: hoje },
    { rotulo: "Últimos 7 dias", inicio: isoOffset(6), fim: hoje },
    { rotulo: "Últimos 30 dias", inicio: isoOffset(29), fim: hoje },
    { rotulo: "Mês atual", inicio: primeiroDiaMes(), fim: hoje },
  ];

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-grid bg-surface p-3">
      <div className="flex flex-wrap gap-2">
        {presets.map((preset) => {
          const ativo = preset.inicio === dataInicio && preset.fim === dataFim;
          return (
            <button
              key={preset.rotulo}
              type="button"
              onClick={() => onMudar(preset.inicio, preset.fim)}
              className={`rounded-lg px-3 py-2 text-sm font-medium ${
                ativo ? "bg-series-1 text-white" : "border border-grid text-ink-secondary hover:bg-black/5"
              }`}
            >
              {preset.rotulo}
            </button>
          );
        })}
      </div>

      <div className="ml-auto flex items-center gap-2 border-l border-grid pl-3 text-sm text-ink-secondary">
        <input
          type="date"
          value={dataInicio}
          max={dataFim}
          onChange={(e) => onMudar(e.target.value, dataFim)}
          className="rounded-lg border border-grid px-2 py-1.5"
        />
        <span>até</span>
        <input
          type="date"
          value={dataFim}
          min={dataInicio}
          onChange={(e) => onMudar(dataInicio, e.target.value)}
          className="rounded-lg border border-grid px-2 py-1.5"
        />
      </div>
    </div>
  );
}
