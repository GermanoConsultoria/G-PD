/**
 * Deduz o turno e a data "atuais" a partir do horario do servidor, para que o
 * tablet de producao possa pre-selecionar esses valores sem exigir digitacao.
 * Turno 1: 06:00-14:00 | Turno 2: 14:00-22:00 | Fora da janela: cai no turno
 * mais proximo (madrugada -> T1, noite -> T2).
 */
export function detectarTurnoAtual(agora: Date = new Date()): "T1" | "T2" {
  const hora = agora.getHours();
  if (hora >= 6 && hora < 14) return "T1";
  if (hora >= 14 && hora < 22) return "T2";
  return hora < 6 ? "T1" : "T2";
}

export function dataAtualISO(agora: Date = new Date()): string {
  const ano = agora.getFullYear();
  const mes = String(agora.getMonth() + 1).padStart(2, "0");
  const dia = String(agora.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}
