import { describe, expect, it } from "vitest";
import { detectarTurnoAtual } from "../utils/turno";

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
