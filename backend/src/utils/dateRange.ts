/**
 * Resolve o intervalo de datas usado pelos filtros do dashboard.
 * Aceita "YYYY-MM-DD" via querystring; sem parametros, assume o mes corrente
 * (substitui o antigo modelo de "abas por mes" da planilha).
 */
export function resolverIntervaloDatas(dataInicioStr?: string, dataFimStr?: string) {
  const agora = new Date();

  const inicio = dataInicioStr
    ? new Date(`${dataInicioStr}T00:00:00.000Z`)
    : new Date(Date.UTC(agora.getFullYear(), agora.getMonth(), 1));

  const fim = dataFimStr
    ? new Date(`${dataFimStr}T23:59:59.999Z`)
    : new Date(Date.UTC(agora.getFullYear(), agora.getMonth() + 1, 0, 23, 59, 59, 999));

  return { inicio, fim };
}

export function parseDataLancamento(dataStr: string): Date {
  return new Date(`${dataStr}T00:00:00.000Z`);
}
