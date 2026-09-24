/**
 * Deduz o turno e o estado operacional "atuais" a partir do horario do
 * servidor, para que o tablet de producao possa pre-selecionar esses valores
 * sem exigir digitacao.
 *
 * Regra oficial (sem excecoes, sem "cair" em turno por proximidade):
 *   Turno 1: 06:00 (inclusive) ate antes de 14:00
 *   Turno 2: 14:00 (inclusive) ate antes de 22:00
 *   Fora do horario operacional: 22:00 (inclusive) ate antes de 06:00
 */
export type CodigoTurno = "T1" | "T2";

export interface ResultadoTurno {
  emHorarioOperacional: boolean;
  codigoTurno: CodigoTurno | null;
}

const INICIO_T1_MIN = 6 * 60; // 06:00
const INICIO_T2_MIN = 14 * 60; // 14:00
const FIM_OPERACAO_MIN = 22 * 60; // 22:00

export function detectarTurnoAtual(agora: Date = new Date()): ResultadoTurno {
  const minutosDoDia = agora.getHours() * 60 + agora.getMinutes();

  if (minutosDoDia >= INICIO_T1_MIN && minutosDoDia < INICIO_T2_MIN) {
    return { emHorarioOperacional: true, codigoTurno: "T1" };
  }
  if (minutosDoDia >= INICIO_T2_MIN && minutosDoDia < FIM_OPERACAO_MIN) {
    return { emHorarioOperacional: true, codigoTurno: "T2" };
  }
  return { emHorarioOperacional: false, codigoTurno: null };
}

export function dataAtualISO(agora: Date = new Date()): string {
  const ano = agora.getFullYear();
  const mes = String(agora.getMonth() + 1).padStart(2, "0");
  const dia = String(agora.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

/**
 * Um turno só pode ser considerado "encerrado" em relação ao lançamento de
 * HOJE — datas passadas são correções/backfill e todo turno delas já
 * terminou há muito, então não se aplica. Evita que alguém volte para um
 * turno de hoje que já fechou (ex: selecionar Turno 1 às 15h) e lance como
 * se ainda estivesse em andamento.
 */
export function turnoEncerrouHoje(horaFim: string, dataLancamento: string, agora: Date = new Date()): boolean {
  if (dataLancamento !== dataAtualISO(agora)) return false;

  const minutosAgora = agora.getHours() * 60 + agora.getMinutes();
  const [hora, minuto] = horaFim.split(":").map(Number);
  return minutosAgora >= hora * 60 + minuto;
}
