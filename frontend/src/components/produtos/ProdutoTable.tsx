import type { Produto } from "../../api/types";
import { formatarCentavos } from "../../utils/money";

interface ProdutoTableProps {
  produtos: Produto[];
  onEditar: (produto: Produto) => void;
  onRemover: (produto: Produto) => void;
  onReativar: (produto: Produto) => void;
}

export function ProdutoTable({ produtos, onEditar, onRemover, onReativar }: ProdutoTableProps) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-grid bg-surface">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-grid text-ink-muted">
            <th className="px-4 py-3 font-medium">Nome</th>
            <th className="px-4 py-3 font-medium">Categoria</th>
            <th className="px-4 py-3 font-medium">Unidade</th>
            <th className="px-4 py-3 font-medium tabular-nums">Custo unitário</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium text-right">Ações</th>
          </tr>
        </thead>
        <tbody>
          {produtos.map((produto) => (
            <tr key={produto.id} className="border-b border-grid last:border-0">
              <td className="px-4 py-3 text-ink-primary">{produto.nome}</td>
              <td className="px-4 py-3 text-ink-secondary">{produto.categoria ?? "—"}</td>
              <td className="px-4 py-3 text-ink-secondary">{produto.unidade}</td>
              <td className="px-4 py-3 tabular-nums text-ink-secondary">{formatarCentavos(produto.custoUnitarioCentavos)}</td>
              <td className="px-4 py-3">
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${
                    produto.ativo ? "bg-status-good/10 text-status-good" : "bg-black/5 text-ink-muted"
                  }`}
                >
                  {produto.ativo ? "Ativo" : "Inativo"}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                <button
                  type="button"
                  onClick={() => onEditar(produto)}
                  className="mr-2 rounded-lg border border-grid px-3 py-1.5 text-xs font-medium text-ink-secondary hover:bg-black/5"
                >
                  Editar
                </button>
                {produto.ativo ? (
                  <button
                    type="button"
                    onClick={() => onRemover(produto)}
                    className="rounded-lg border border-grid px-3 py-1.5 text-xs font-medium text-status-critical hover:bg-status-critical/10"
                  >
                    Desativar
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => onReativar(produto)}
                    className="rounded-lg border border-grid px-3 py-1.5 text-xs font-medium text-status-good hover:bg-status-good/10"
                  >
                    Reativar
                  </button>
                )}
              </td>
            </tr>
          ))}
          {produtos.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-ink-muted">
                Nenhum produto cadastrado.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
