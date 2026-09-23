import { FormEvent, useEffect, useState } from "react";
import type { Produto } from "../../api/types";

interface ProdutoFormProps {
  produtoEmEdicao: Produto | null;
  onSalvar: (dados: { nome: string; categoria: string | null; unidade: string; custoUnitario: number }) => Promise<void>;
  onCancelarEdicao: () => void;
}

const vazio = { nome: "", categoria: "", unidade: "un", custoUnitario: "" };

export function ProdutoForm({ produtoEmEdicao, onSalvar, onCancelarEdicao }: ProdutoFormProps) {
  const [form, setForm] = useState(vazio);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (produtoEmEdicao) {
      setForm({
        nome: produtoEmEdicao.nome,
        categoria: produtoEmEdicao.categoria ?? "",
        unidade: produtoEmEdicao.unidade,
        custoUnitario: String(produtoEmEdicao.custoUnitario),
      });
    } else {
      setForm(vazio);
    }
  }, [produtoEmEdicao]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSalvando(true);
    try {
      await onSalvar({
        nome: form.nome.trim(),
        categoria: form.categoria.trim() || null,
        unidade: form.unidade.trim() || "un",
        custoUnitario: Number(form.custoUnitario.replace(",", ".")),
      });
      setForm(vazio);
    } finally {
      setSalvando(false);
    }
  }

  const valido = form.nome.trim().length > 0 && Number(form.custoUnitario.replace(",", ".")) > 0;

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 rounded-2xl border border-grid bg-surface p-5 sm:grid-cols-4">
      <div className="sm:col-span-2">
        <label className="mb-1 block text-xs font-medium text-ink-secondary">Nome do produto</label>
        <input
          value={form.nome}
          onChange={(e) => setForm({ ...form, nome: e.target.value })}
          placeholder="Ex: Coxinha"
          className="w-full rounded-lg border border-grid px-3 py-2 text-sm"
          required
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-ink-secondary">Categoria</label>
        <input
          value={form.categoria}
          onChange={(e) => setForm({ ...form, categoria: e.target.value })}
          placeholder="Ex: Salgado"
          className="w-full rounded-lg border border-grid px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-ink-secondary">Unidade</label>
        <input
          value={form.unidade}
          onChange={(e) => setForm({ ...form, unidade: e.target.value })}
          className="w-full rounded-lg border border-grid px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-ink-secondary">Custo unitário (R$)</label>
        <input
          value={form.custoUnitario}
          onChange={(e) => setForm({ ...form, custoUnitario: e.target.value })}
          placeholder="Ex: 4.11"
          inputMode="decimal"
          className="w-full rounded-lg border border-grid px-3 py-2 text-sm"
          required
        />
      </div>

      <div className="flex items-end gap-2 sm:col-span-4">
        <button
          type="submit"
          disabled={!valido || salvando}
          className="rounded-lg bg-series-1 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
        >
          {produtoEmEdicao ? "Salvar alterações" : "Adicionar produto"}
        </button>
        {produtoEmEdicao && (
          <button
            type="button"
            onClick={onCancelarEdicao}
            className="rounded-lg border border-grid px-4 py-2 text-sm font-medium text-ink-secondary"
          >
            Cancelar
          </button>
        )}
      </div>

      {produtoEmEdicao && (
        <p className="text-xs text-ink-muted sm:col-span-4">
          Atenção: alterar o custo aqui vale apenas para novos lançamentos de perda. Perdas já registradas
          mantêm o custo histórico da época em que ocorreram.
        </p>
      )}
    </form>
  );
}
