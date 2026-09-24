import { describe, expect, it } from "vitest";
import { centavosParaReais, reaisParaCentavos } from "../utils/money";

describe("utilitários monetários", () => {
  it("converte reais para centavos (lista oficial de produtos)", () => {
    expect(reaisParaCentavos(4.11)).toBe(411);
    expect(reaisParaCentavos(5.81)).toBe(581);
    expect(reaisParaCentavos(2.68)).toBe(268);
    expect(reaisParaCentavos(1.66)).toBe(166);
    expect(reaisParaCentavos(0.39)).toBe(39);
    expect(reaisParaCentavos(1.12)).toBe(112);
  });

  it("converte centavos para reais", () => {
    expect(centavosParaReais(411)).toBeCloseTo(4.11);
    expect(centavosParaReais(39)).toBeCloseTo(0.39);
  });
});
