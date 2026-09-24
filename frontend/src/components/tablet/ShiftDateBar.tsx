import type { Turno } from "../../api/types";
import { hojeISO } from "../../utils/format";

interface ShiftDateBarProps {
  data: string;
  turnos: Turno[];
  turnoId: number | null;
  onMudarData: (data: string) => void;
  onMudarTurno: (turnoId: number) => void;
}

// Espelha backend/src/utils/turno.ts (turnoEncerrouHoje) — o backend é quem
// realmente impede o lançamento; isso aqui só evita o clique na UI.
function turnoJaEncerrouHoje(turno: Turno, data: string): boolean {
  if (data !== hojeISO()) return false;

  const agora = new Date();
  const minutosAgora = agora.getHours() * 60 + agora.getMinutes();
  const [hora, minuto] = turno.horaFim.split(":").map(Number);
  return minutosAgora >= hora * 60 + minuto;
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
          const encerrado = turnoJaEncerrouHoje(turno, data);
          return (
            <button
              key={turno.id}
              type="button"
              disabled={encerrado}
              onClick={() => onMudarTurno(turno.id)}
              title={encerrado ? `${turno.nome} já encerrou hoje às ${turno.horaFim}` : undefined}
              className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                encerrado
                  ? "cursor-not-allowed border border-grid bg-page text-ink-muted opacity-50"
                  : ativo
                    ? "bg-series-1 text-white"
                    : "border border-grid bg-page text-ink-secondary"
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
