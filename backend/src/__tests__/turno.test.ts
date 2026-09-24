import { describe, expect, it } from "vitest";
import { dataAtualISO, detectarTurnoAtual, turnoEncerrouHoje } from "../utils/turno";

function horario(hora: number, minuto: number): Date {
  return new Date(2026, 0, 1, hora, minuto, 0, 0);
}

describe("detectarTurnoAtual", () => {
  it.each([
    [5, 59, false, null],
    [6, 0, true, "T1"],
    [13, 59, true, "T1"],
    [14, 0, true, "T2"],
    [21, 59, true, "T2"],
    [22, 0, false, null],
    [23, 0, false, null],
    [2, 0, false, null],
  ] as const)("%i:%i -> operacional=%s turno=%s", (hora, minuto, esperadoOperacional, esperadoTurno) => {
    const resultado = detectarTurnoAtual(horario(hora, minuto));
    expect(resultado.emHorarioOperacional).toBe(esperadoOperacional);
    expect(resultado.codigoTurno).toBe(esperadoTurno);
  });

  it("nunca atribui a madrugada a um turno", () => {
    for (let hora = 0; hora < 6; hora++) {
      expect(detectarTurnoAtual(horario(hora, 0)).codigoTurno).toBeNull();
    }
  });

  it("nunca atribui 22:00-23:59 a um turno", () => {
    for (let hora = 22; hora < 24; hora++) {
      expect(detectarTurnoAtual(horario(hora, 0)).codigoTurno).toBeNull();
    }
  });
});

describe("turnoEncerrouHoje", () => {
  const hoje = dataAtualISO(horario(0, 0)); // "2026-01-01"

  it("Turno 1 (encerra 14:00) fica encerrado assim que passa das 14:00, no dia de hoje", () => {
    expect(turnoEncerrouHoje("14:00", hoje, horario(13, 59))).toBe(false);
    expect(turnoEncerrouHoje("14:00", hoje, horario(14, 0))).toBe(true);
    expect(turnoEncerrouHoje("14:00", hoje, horario(15, 0))).toBe(true);
  });

  it("Turno 2 (encerra 22:00) continua liberado enquanto o Turno 1 já encerrou", () => {
    expect(turnoEncerrouHoje("22:00", hoje, horario(15, 0))).toBe(false);
    expect(turnoEncerrouHoje("22:00", hoje, horario(22, 0))).toBe(true);
  });

  it("não se aplica a datas diferentes de hoje (lançamento retroativo)", () => {
    const ontem = "2025-12-31";
    expect(turnoEncerrouHoje("14:00", ontem, horario(15, 0))).toBe(false);
    expect(turnoEncerrouHoje("22:00", ontem, horario(23, 0))).toBe(false);
  });
});
