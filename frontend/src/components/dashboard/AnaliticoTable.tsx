import type { AnaliticoResponse } from "../../api/types";
import { formatarNumero } from "../../utils/format";
import { formatarCentavos } from "../../utils/money";

interface AnaliticoTableProps {
  dados: AnaliticoResponse | null;
}

export function AnaliticoTable({ dados }: AnaliticoTableProps) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-grid bg-surface p-5">
      <h3 className="mb-4 text-base font-semibold text-ink-primary">Detalhamento por produto</h3>

      {!dados || dados.linhas.length === 0 ? (
        <p className="py-8 text-center text-sm text-ink-muted">Sem lançamentos no período.</p>
      ) : (
        <div className="max-h-[480px] overflow-auto">
          <table className="w-full min-w-[960px] text-left text-sm">
            <thead className="sticky top-0 z-10 bg-surface">
              <tr className="border-b border-grid text-ink-muted">
                <th className="sticky left-0 z-20 bg-surface py-2 pr-3 font-medium">Produto</th>
                <th className="py-2 pr-3 font-medium tabular-nums">Produzido</th>
                <th className="py-2 pr-3 font-medium tabular-nums">Perdido</th>
                <th className="py-2 pr-3 font-medium tabular-nums">%</th>
                {dados.motivos.map((motivo) => (
                  <th key={motivo.codigo} className="py-2 pr-3 font-medium tabular-nums">
                    {motivo.nome}
                  </th>
                ))}
                <th className="py-2 pr-3 font-medium tabular-nums">Custo</th>
              </tr>
            </thead>
            <tbody>
              {dados.linhas.map((linha) => (
                <tr key={linha.produtoId} className="border-b border-grid last:border-0">
                  <td className="sticky left-0 z-10 bg-surface py-2 pr-3 text-ink-primary">{linha.produto}</td>
                  <td className="py-2 pr-3 tabular-nums text-ink-secondary">{formatarNumero(linha.produzido)}</td>
                  <td className="py-2 pr-3 tabular-nums text-ink-secondary">{formatarNumero(linha.perdido)}</td>
                  <td className="py-2 pr-3 tabular-nums text-ink-secondary">
                    {linha.percentualPerda.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}%
                  </td>
                  {dados.motivos.map((motivo) => (
                    <td key={motivo.codigo} className="py-2 pr-3 tabular-nums text-ink-secondary">
                      {formatarNumero(linha.porMotivo[motivo.codigo] ?? 0)}
                    </td>
                  ))}
                  <td className="py-2 pr-3 tabular-nums text-ink-secondary">{formatarCentavos(linha.custoTotalCentavos)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
