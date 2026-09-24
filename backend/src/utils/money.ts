/**
 * Utilitarios monetarios. Todo valor monetario e armazenado e trafegado pela
 * API como inteiro em CENTAVOS (nunca float) para evitar erros de
 * arredondamento em calculos financeiros. A conversao para reais so deve
 * acontecer na camada de apresentacao (frontend).
 */

export function reaisParaCentavos(valorReais: number): number {
  return Math.round(valorReais * 100);
}

export function centavosParaReais(centavos: number): number {
  return centavos / 100;
}
