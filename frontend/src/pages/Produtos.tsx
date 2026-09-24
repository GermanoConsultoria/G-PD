import { useEffect, useState } from "react";
import { atualizarProduto, criarProduto, getProdutos, removerProduto } from "../api/endpoints";
import { extrairMensagemErro } from "../api/client";
import type { Produto } from "../api/types";
import { ProdutoForm } from "../components/produtos/ProdutoForm";
import { ProdutoTable } from "../components/produtos/ProdutoTable";

export function Produtos() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [produtoEmEdicao, setProdutoEmEdicao] = useState<Produto | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  async function carregar() {
    setProdutos(await getProdutos());
  }

  useEffect(() => {
    carregar();
  }, []);

  async function handleSalvar(dados: { nome: string; categoria: string | null; unidade: string; custoUnitarioCentavos: number }) {
    setErro(null);
    try {
      if (produtoEmEdicao) {
        await atualizarProduto(produtoEmEdicao.id, dados);
        setProdutoEmEdicao(null);
      } else {
        await criarProduto(dados);
      }
      await carregar();
    } catch (error) {
      setErro(extrairMensagemErro(error, "Não foi possível salvar o produto."));
    }
  }

  async function handleRemover(produto: Produto) {
    if (!confirm(`Desativar "${produto.nome}"? Ele deixará de aparecer no tablet, mas o histórico é mantido.`)) return;
    setErro(null);
    try {
      await removerProduto(produto.id);
      await carregar();
    } catch (error) {
      setErro(extrairMensagemErro(error, "Não foi possível desativar o produto."));
    }
  }

  async function handleReativar(produto: Produto) {
    setErro(null);
    try {
      await atualizarProduto(produto.id, { ativo: true });
      await carregar();
    } catch (error) {
      setErro(extrairMensagemErro(error, "Não foi possível reativar o produto."));
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <h1 className="mb-4 text-2xl font-bold text-ink-primary">Cadastro de Produtos</h1>

      {erro && (
        <div className="mb-4 rounded-xl border border-status-critical bg-status-critical/10 px-4 py-2 text-sm text-status-critical">
          {erro}
        </div>
      )}

      <div className="mb-6">
        <ProdutoForm
          produtoEmEdicao={produtoEmEdicao}
          onSalvar={handleSalvar}
          onCancelarEdicao={() => setProdutoEmEdicao(null)}
        />
      </div>

      <ProdutoTable
        produtos={produtos}
        onEditar={setProdutoEmEdicao}
        onRemover={handleRemover}
        onReativar={handleReativar}
      />
    </div>
  );
}
