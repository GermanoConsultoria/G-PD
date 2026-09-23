import { useEffect, useState } from "react";
import { atualizarProduto, criarProduto, getProdutos, removerProduto } from "../api/endpoints";
import type { Produto } from "../api/types";
import { ProdutoForm } from "../components/produtos/ProdutoForm";
import { ProdutoTable } from "../components/produtos/ProdutoTable";

export function Produtos() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [produtoEmEdicao, setProdutoEmEdicao] = useState<Produto | null>(null);

  async function carregar() {
    setProdutos(await getProdutos());
  }

  useEffect(() => {
    carregar();
  }, []);

  async function handleSalvar(dados: { nome: string; categoria: string | null; unidade: string; custoUnitario: number }) {
    if (produtoEmEdicao) {
      await atualizarProduto(produtoEmEdicao.id, dados);
      setProdutoEmEdicao(null);
    } else {
      await criarProduto(dados);
    }
    await carregar();
  }

  async function handleRemover(produto: Produto) {
    if (!confirm(`Desativar "${produto.nome}"? Ele deixará de aparecer no tablet, mas o histórico é mantido.`)) return;
    await removerProduto(produto.id);
    await carregar();
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <h1 className="mb-4 text-2xl font-bold text-ink-primary">Cadastro de Produtos</h1>

      <div className="mb-6">
        <ProdutoForm
          produtoEmEdicao={produtoEmEdicao}
          onSalvar={handleSalvar}
          onCancelarEdicao={() => setProdutoEmEdicao(null)}
        />
      </div>

      <ProdutoTable produtos={produtos} onEditar={setProdutoEmEdicao} onRemover={handleRemover} />
    </div>
  );
}
