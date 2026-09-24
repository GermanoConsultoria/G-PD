import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CHART_COLORS } from "../../utils/chartColors";
import { formatarNumero } from "../../utils/format";
import { formatarCentavos } from "../../utils/money";

interface RankingItem {
  chave: number;
  nome: string;
  quantidade: number;
  custoTotalCentavos: number;
}

interface RankingChartProps {
  titulo: string;
  itens: RankingItem[];
  vazio: string;
}

function TooltipRanking({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const item: RankingItem = payload[0].payload;
  return (
    <div className="rounded-lg border border-grid bg-surface px-3 py-2 text-sm shadow-md">
      <p className="font-semibold text-ink-primary">{item.nome}</p>
      <p className="text-ink-secondary">{formatarNumero(item.quantidade)} un perdidas</p>
      <p className="text-ink-secondary">{formatarCentavos(item.custoTotalCentavos)}</p>
    </div>
  );
}

export function RankingChart({ titulo, itens, vazio }: RankingChartProps) {
  const altura = Math.max(itens.length * 40, 120);

  return (
    <div className="rounded-2xl border border-grid bg-surface p-5">
      <h3 className="mb-4 text-base font-semibold text-ink-primary">{titulo}</h3>

      {itens.length === 0 ? (
        <p className="py-8 text-center text-sm text-ink-muted">{vazio}</p>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={altura}>
            <BarChart data={itens} layout="vertical" margin={{ left: 8, right: 24 }}>
              <CartesianGrid horizontal={false} stroke={CHART_COLORS.grid} />
              <XAxis type="number" tick={{ fill: CHART_COLORS.textMuted, fontSize: 12 }} axisLine={{ stroke: CHART_COLORS.axis }} tickLine={false} allowDecimals={false} />
              <YAxis
                type="category"
                dataKey="nome"
                width={110}
                tick={{ fill: CHART_COLORS.textSecondary, fontSize: 12 }}
                axisLine={{ stroke: CHART_COLORS.axis }}
                tickLine={false}
              />
              <Tooltip content={<TooltipRanking />} cursor={{ fill: "rgba(0,0,0,0.04)" }} />
              <Bar dataKey="quantidade" radius={[0, 4, 4, 0]} maxBarSize={22}>
                {itens.map((item) => (
                  <Cell key={item.chave} fill={CHART_COLORS.series1} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-grid text-ink-muted">
                  <th className="py-2 font-medium">Item</th>
                  <th className="py-2 font-medium tabular-nums">Qtd. perdida</th>
                  <th className="py-2 font-medium tabular-nums">Custo</th>
                </tr>
              </thead>
              <tbody>
                {itens.map((item) => (
                  <tr key={item.chave} className="border-b border-grid last:border-0">
                    <td className="py-2 text-ink-primary">{item.nome}</td>
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
