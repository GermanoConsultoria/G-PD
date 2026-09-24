import { afterEach, describe, expect, it, vi } from "vitest";
import { req } from "./helpers";

describe("GET /api/contexto-atual", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("fora do horário operacional não inventa turno", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 1, 2, 0, 0));

    const resposta = await req("GET", "/api/contexto-atual");
    expect(resposta.status).toBe(200);
    expect(resposta.body.emHorarioOperacional).toBe(false);
    expect(resposta.body.turno).toBeNull();
  });

  it("dentro do turno 1 retorna o turno corretamente", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 1, 8, 0, 0));

    const resposta = await req("GET", "/api/contexto-atual");
    expect(resposta.status).toBe(200);
    expect(resposta.body.emHorarioOperacional).toBe(true);
    expect(resposta.body.turno.codigo).toBe("T1");
  });

  it("dentro do turno 2 retorna o turno corretamente", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 1, 15, 0, 0));

    const resposta = await req("GET", "/api/contexto-atual");
    expect(resposta.status).toBe(200);
    expect(resposta.body.emHorarioOperacional).toBe(true);
    expect(resposta.body.turno.codigo).toBe("T2");
  });
});
