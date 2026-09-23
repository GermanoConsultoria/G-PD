import type { Produto } from "../../api/types";

interface ProductGridProps {
  produtos: Produto[];
  classeAtiva: string;
  onSelecionar: (produto: Produto) => void;
}

export function ProductGrid({ produtos, classeAtiva, onSelecionar }: ProductGridProps) {
  if (produtos.length === 0) {
    return (
      <p className="mt-10 text-center text-ink-secondary">
        Nenhum produto cadastrado. Cadastre produtos no Painel do Gestor.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
      {produtos.map((produto) => (
        <button
          key={produto.id}
          type="button"
          onClick={() => onSelecionar(produto)}
          className={`flex h-28 flex-col items-center justify-center rounded-2xl border border-grid bg-surface px-2 text-center shadow-sm active:scale-95 ${classeAtiva}`}
        >
          <span className="text-base font-semibold text-ink-primary">{produto.nome}</span>
          <span className="mt-1 text-xs text-ink-muted">{produto.categoria}</span>
        </button>
      ))}
    </div>
  );
}
