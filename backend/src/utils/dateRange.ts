/**
 * Resolve o intervalo de datas usado pelos filtros do dashboard/listagens.
 * Aceita "YYYY-MM-DD" via querystring; sem parametros, assume o mes corrente.
 * Retorna strings "YYYY-MM-DD" prontas para comparar com colunas Postgres do
 * tipo `date` (produtos/perdas.data), sem qualquer conversao de fuso horario.
 */
export function resolverIntervaloDatas(
  dataInicioStr?: string,
  dataFimStr?: string
): { inicio: string; fim: string } {
  const agora = new Date();

  const inicio = dataInicioStr ?? isoDate(new Date(Date.UTC(agora.getFullYear(), agora.getMonth(), 1)));
  const fim = dataFimStr ?? isoDate(new Date(Date.UTC(agora.getFullYear(), agora.getMonth() + 1, 0)));

  return { inicio, fim };
}

function isoDate(data: Date): string {
  return data.toISOString().slice(0, 10);
}
