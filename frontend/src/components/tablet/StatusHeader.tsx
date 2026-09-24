import type { Turno } from "../../api/types";
import { formatarDataExtensa } from "../../utils/format";

interface StatusHeaderProps {
  data: string;
  emHorarioOperacional: boolean;
  turnoAtual: Turno | null;
  turnos: Turno[];
  agora?: Date;
}

/**
 * "Amanhã" só quando o horário atual (22h-23h59) ainda vai virar o dia até o
 * próximo Turno 1 às 06:00; entre 00h-05h59 o T1 já é hoje. Não é escrito
 * fixo: recalculado a cada render a partir da hora real do dispositivo.
 */
function calcularProximoTurno(agora: Date, turnos: Turno[]): { quando: "hoje" | "amanhã"; turno: Turno | undefined } {
  const turno1 = turnos.find((t) => t.codigo === "T1");
  const quando = agora.getHours() >= 22 ? "amanhã" : "hoje";
  return { quando, turno: turno1 };
}

export function StatusHeader({ data, emHorarioOperacional, turnoAtual, turnos, agora = new Date() }: StatusHeaderProps) {
  return (
    <div className="rounded-2xl border border-grid bg-surface p-5">
      <div className="flex items-baseline gap-2">
        <span className="text-lg font-extrabold tracking-tight text-series-1">G-PD</span>
        <span className="text-sm font-medium text-ink-muted">Controle de Produção</span>
      </div>

      <p className="mt-4 text-xs font-semibold tracking-wide text-ink-muted">{formatarDataExtensa(data)}</p>

      {emHorarioOperacional && turnoAtual ? (
        <div className="mt-1">
          <p className="text-2xl font-extrabold text-ink-primary">{turnoAtual.nome.toUpperCase()}</p>
          <p className="text-base font-medium text-ink-secondary">
            {turnoAtual.horaInicio} — {turnoAtual.horaFim}
          </p>
        </div>
      ) : (
        <div className="mt-1">
          <p className="text-2xl font-extrabold text-status-critical">FORA DO HORÁRIO DE PRODUÇÃO</p>
          {(() => {
            const { quando, turno } = calcularProximoTurno(agora, turnos);
            if (!turno) return null;
            return (
              <div className="mt-2">
                <p className="text-sm text-ink-secondary">
                  O próximo turno começa {quando} às {turno.horaInicio}.
                </p>
                <p className="mt-1 text-base font-semibold text-ink-primary">
                  {turno.nome} · {turno.horaInicio} — {turno.horaFim}
                </p>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
