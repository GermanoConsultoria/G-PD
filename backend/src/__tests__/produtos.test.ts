import { beforeAll, describe, expect, it } from "vitest";
import { obterTokenAdmin, req } from "./helpers";

let token: string;

beforeAll(async () => {
  token = await obterTokenAdmin();
});

describe("produtos oficiais", () => {
  it("lista exatamente os 7 produtos oficiais ativos, com os custos corretos", async () => {
    const resposta = await req("GET", "/api/produtos?ativos=true");
    expect(resposta.status).toBe(200);

    const nomes: string[] = resposta.body.map((p: { nome: string }) => p.nome).sort();
    expect(nomes).toEqual(
      [
        "Mini Pão de Queijo",
        "Palito",
        "Pão de Queijo",
        "Pão de Queijo Goiabada",
        "Pão de Queijo Parmesão",
        "Salgados",
        "Torta",
      ].sort()
    );

    const porNome = Object.fromEntries(
      resposta.body.map((p: { nome: string; custoUnitarioCentavos: number }) => [p.nome, p.custoUnitarioCentavos])
    );
    expect(porNome["Salgados"]).toBe(411);
    expect(porNome["Torta"]).toBe(581);
    expect(porNome["Palito"]).toBe(268);
    expect(porNome["Pão de Queijo"]).toBe(166);
    expect(porNome["Mini Pão de Queijo"]).toBe(39);
    expect(porNome["Pão de Queijo Parmesão"]).toBe(112);
    expect(porNome["Pão de Queijo Goiabada"]).toBe(112);
  });

  it("produtos fora da lista oficial não aparecem como ativos", async () => {
    const resposta = await req("GET", "/api/produtos?ativos=true");
    const nomes = resposta.body.map((p: { nome: string }) => p.nome);
    expect(nomes).not.toContain("Coxinha");
    expect(nomes).not.toContain("Risoles");
    expect(nomes).not.toContain("Empada");
    expect(nomes).not.toContain("Salgado");
  });

  it("admin autenticado pode alterar o custo de um produto", async () => {
    const listagem = await req("GET", "/api/produtos?ativos=true");
    const palito = listagem.body.find((p: { nome: string }) => p.nome === "Palito");

    const resposta = await req("PUT", `/api/produtos/${palito.id}`, {
      token,
      body: { custoUnitarioCentavos: 300 },
    });

    expect(resposta.status).toBe(200);
    expect(resposta.body.custoUnitarioCentavos).toBe(300);

    await req("PUT", `/api/produtos/${palito.id}`, { token, body: { custoUnitarioCentavos: 268 } });
  });

  it("admin autenticado pode desativar um produto (soft delete)", async () => {
    const criado = await req("POST", "/api/produtos", {
      token,
      body: { nome: "Produto Teste Desativação", unidade: "un", custoUnitarioCentavos: 100 },
    });
    expect(criado.status).toBe(201);

    const resposta = await req("DELETE", `/api/produtos/${criado.body.id}`, { token });
    expect(resposta.status).toBe(200);
    expect(resposta.body.ativo).toBe(false);
  });

  it("gerenciamento de produtos exige autenticação administrativa", async () => {
    const semAuth = await req("POST", "/api/produtos", {
      body: { nome: "Sem Auth", unidade: "un", custoUnitarioCentavos: 100 },
    });
    expect(semAuth.status).toBe(401);
  });
});
