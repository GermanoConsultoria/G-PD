/**
 * A API trafega todo valor monetário como inteiro em CENTAVOS (nunca float),
 * para evitar erros de arredondamento. Estas funções isolam a conversão
 * para reais, usada apenas na apresentação e na leitura de formulários.
 */

export function formatarCentavos(centavos: number): string {
  return (centavos / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function parseReaisParaCentavos(valor: string): number {
  const normalizado = valor.trim().replace(/\./g, "").replace(",", ".");
  const numero = Number(normalizado);
  return Math.round(numero * 100);
}
