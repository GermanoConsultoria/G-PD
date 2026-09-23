import type { Turno } from "../../api/types";

interface ShiftDateBarProps {
  data: string;
  turnos: Turno[];
  turnoId: number | null;
  onMudarData: (data: string) => void;
  onMudarTurno: (turnoId: number) => void;
}

export function ShiftDateBar({ data, turnos, turnoId, onMudarData, onMudarTurno }: ShiftDateBarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-grid bg-surface p-3">
      <label className="flex items-center gap-2 text-sm text-ink-secondary">
        Data
        <input
          type="date"
          value={data}
          onChange={(e) => onMudarData(e.target.value)}
          className="rounded-lg border border-grid bg-page px-3 py-2 text-base text-ink-primary"
        />
      </label>

      <div className="flex gap-2">
        {turnos.map((turno) => {
          const ativo = turno.id === turnoId;
          return (
            <button
              key={turno.id}
              type="button"
              onClick={() => onMudarTurno(turno.id)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                ativo ? "bg-series-1 text-white" : "border border-grid bg-page text-ink-secondary"
              }`}
            >
              {turno.nome} · {turno.horaInicio}-{turno.horaFim}
            </button>
          );
        })}
      </div>
    </div>
  );
}
