import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { EvolucaoPerdaDia } from "../../api/types";
import { CHART_COLORS } from "../../utils/chartColors";
import { formatarDataCompleta, formatarDataCurta, formatarNumero } from "../../utils/format";
import { formatarCentavos } from "../../utils/money";

interface TrendChartProps {
  dados: EvolucaoPerdaDia[];
}

function TooltipEvolucao({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const item: EvolucaoPerdaDia = payload[0].payload;
  return (
    <div className="rounded-lg border border-grid bg-surface px-3 py-2 text-sm shadow-md">
      <p className="font-semibold text-ink-primary">{formatarDataCompleta(item.data)}</p>
      <p className="text-ink-secondary">{formatarNumero(item.quantidade)} un perdidas</p>
      <p className="text-ink-secondary">{formatarCentavos(item.custoTotalCentavos)}</p>
    </div>
  );
}

export function TrendChart({ dados }: TrendChartProps) {
  return (
    <div className="rounded-2xl border border-grid bg-surface p-5">
      <h3 className="mb-4 text-base font-semibold text-ink-primary">Evolução das perdas ao longo dos dias</h3>

      {dados.length === 0 ? (
        <p className="py-8 text-center text-sm text-ink-muted">Sem perdas registradas no período.</p>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={dados} margin={{ left: 0, right: 16, top: 8 }}>
              <defs>
                <linearGradient id="corEvolucao" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={CHART_COLORS.series1} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={CHART_COLORS.series1} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke={CHART_COLORS.grid} />
              <XAxis
                dataKey="data"
                tickFormatter={formatarDataCurta}
                tick={{ fill: CHART_COLORS.textMuted, fontSize: 12 }}
                axisLine={{ stroke: CHART_COLORS.axis }}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: CHART_COLORS.textMuted, fontSize: 12 }}
                axisLine={{ stroke: CHART_COLORS.axis }}
                tickLine={false}
                width={36}
              />
              <Tooltip content={<TooltipEvolucao />} />
              <Area
                type="monotone"
                dataKey="quantidade"
                stroke={CHART_COLORS.series1}
                strokeWidth={2}
                fill="url(#corEvolucao)"
                dot={{ r: 3, fill: CHART_COLORS.series1, strokeWidth: 0 }}
                activeDot={{ r: 5 }}
              />
            </AreaChart>
          </ResponsiveContainer>

          <div className="mt-4 max-h-48 overflow-y-auto">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-surface">
                <tr className="border-b border-grid text-ink-muted">
                  <th className="py-2 font-medium">Data</th>
                  <th className="py-2 font-medium tabular-nums">Qtd. perdida</th>
                  <th className="py-2 font-medium tabular-nums">Custo</th>
                </tr>
              </thead>
              <tbody>
                {[...dados].reverse().map((item) => (
                  <tr key={item.data} className="border-b border-grid last:border-0">
                    <td className="py-2 text-ink-primary">{formatarDataCompleta(item.data)}</td>
                    <td className="py-2 tabular-nums text-ink-secondary">{formatarNumero(item.quantidade)}</td>
                    <td className="py-2 tabular-nums text-ink-secondary">{formatarCentavos(item.custoTotalCentavos)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
