import { beforeAll, describe, expect, it } from "vitest";
import { obterTokenAdmin, req } from "./helpers";

let token: string;
let produtoTortaId: number;
let produtoPalitoId: number;
let turnoT1Id: number;
let motivoId: number;

beforeAll(async () => {
  token = await obterTokenAdmin();
  const produtos = await req("GET", "/api/produtos?ativos=true");
  produtoTortaId = produtos.body.find((p: { nome: string }) => p.nome === "Torta").id;
  produtoPalitoId = produtos.body.find((p: { nome: string }) => p.nome === "Palito").id;
  const turnos = await req("GET", "/api/turnos");
  turnoT1Id = turnos.body.find((t: { codigo: string }) => t.codigo === "T1").id;
  const motivos = await req("GET", "/api/motivos");
  motivoId = motivos.body[0].id;
});

describe("perdas", () => {
  it("custo histórico é gravado a partir do custo vigente do produto ao criar", async () => {
    await req("POST", "/api/producoes", { body: { produtoId: produtoTortaId, turnoId: turnoT1Id, data: "2026-09-01", quantidade: 10 } });

    const resposta = await req("POST", "/api/perdas", {
      body: { produtoId: produtoTortaId, turnoId: turnoT1Id, motivoId, data: "2026-09-01", quantidade: 10 },
    });

    expect(resposta.status).toBe(201);
    expect(resposta.body.custoUnitarioHistoricoCentavos).toBe(581);
    expect(resposta.body.custoTotalCentavos).toBe(5810);
  });

  it("alterar o custo do produto depois NÃO afeta perda já registrada (custo histórico)", async () => {
    await req("POST", "/api/producoes", { body: { produtoId: produtoTortaId, turnoId: turnoT1Id, data: "2026-09-02", quantidade: 5 } });

    const criada = await req("POST", "/api/perdas", {
      body: { produtoId: produtoTortaId, turnoId: turnoT1Id, motivoId, data: "2026-09-02", quantidade: 5 },
    });
    const perdaId = criada.body.id;
    expect(criada.body.custoUnitarioHistoricoCentavos).toBe(581);

    await req("PUT", `/api/produtos/${produtoTortaId}`, { token, body: { custoUnitarioCentavos: 700 } });

    const releitura = await req("GET", "/api/perdas", { token });
    const perdaAntiga = releitura.body.find((p: { id: number }) => p.id === perdaId);
    expect(perdaAntiga.custoUnitarioHistoricoCentavos).toBe(581);
    expect(perdaAntiga.custoTotalCentavos).toBe(2905);

    await req("PUT", `/api/produtos/${produtoTortaId}`, { token, body: { custoUnitarioCentavos: 581 } });
  });

  it("listagem sem autenticação é bloqueada", async () => {
    const resposta = await req("GET", "/api/perdas");
    expect(resposta.status).toBe(401);
  });

  it("edição administrativa que só corrige a quantidade preserva o custo unitário histórico", async () => {
    await req("POST", "/api/producoes", { body: { produtoId: produtoTortaId, turnoId: turnoT1Id, data: "2026-09-03", quantidade: 6 } });

    const criada = await req("POST", "/api/perdas", {
      body: { produtoId: produtoTortaId, turnoId: turnoT1Id, motivoId, data: "2026-09-03", quantidade: 4 },
    });
    const perdaId = criada.body.id;

    const editada = await req("PUT", `/api/perdas/${perdaId}`, { token, body: { quantidade: 6 } });

    expect(editada.status).toBe(200);
    expect(editada.body.custoUnitarioHistoricoCentavos).toBe(581);
    expect(editada.body.custoTotalCentavos).toBe(581 * 6);
  });

  it("edição administrativa que troca o produto recalcula o custo histórico e audita a mudança", async () => {
    await req("POST", "/api/producoes", { body: { produtoId: produtoTortaId, turnoId: turnoT1Id, data: "2026-09-04", quantidade: 3 } });
    await req("POST", "/api/producoes", { body: { produtoId: produtoPalitoId, turnoId: turnoT1Id, data: "2026-09-04", quantidade: 3 } });

    const criada = await req("POST", "/api/perdas", {
      body: { produtoId: produtoTortaId, turnoId: turnoT1Id, motivoId, data: "2026-09-04", quantidade: 3 },
    });
    const perdaId = criada.body.id;

    const editada = await req("PUT", `/api/perdas/${perdaId}`, { token, body: { produtoId: produtoPalitoId } });

    expect(editada.status).toBe(200);
    expect(editada.body.produtoId).toBe(produtoPalitoId);
    expect(editada.body.custoUnitarioHistoricoCentavos).toBe(268);
    expect(editada.body.custoTotalCentavos).toBe(268 * 3);

    const auditoria = await req("GET", `/api/auditoria?entidade=Perda&entidadeId=${perdaId}`, { token });
    const campos = auditoria.body.map((log: { campo: string }) => log.campo);
    expect(campos).toContain("produtoId");
    expect(campos).toContain("custoUnitarioHistoricoCentavos");
    expect(campos).toContain("custoTotalCentavos");
  });

  it("admin exclui perda e a auditoria preserva os dados do registro removido", async () => {
    await req("POST", "/api/producoes", { body: { produtoId: produtoTortaId, turnoId: turnoT1Id, data: "2026-09-05", quantidade: 2 } });

    const criada = await req("POST", "/api/perdas", {
      body: { produtoId: produtoTortaId, turnoId: turnoT1Id, motivoId, data: "2026-09-05", quantidade: 2 },
    });
    const perdaId = criada.body.id;

    const resposta = await req("DELETE", `/api/perdas/${perdaId}`, { token });
    expect(resposta.status).toBe(204);

    const auditoria = await req("GET", `/api/auditoria?entidade=Perda&entidadeId=${perdaId}`, { token });
    const exclusao = auditoria.body.find((log: { acao: string }) => log.acao === "EXCLUSAO");
    expect(exclusao).toBeTruthy();
    expect(exclusao.valorAnterior).toContain("Torta");
  });
});

describe("saldo disponível para perda (produção - perdas já lançadas)", () => {
  it("recusa lançar perda de um produto que não teve produção lançada no turno/data", async () => {
    const resposta = await req("POST", "/api/perdas", {
      body: { produtoId: produtoTortaId, turnoId: turnoT1Id, motivoId, data: "2026-09-06", quantidade: 1 },
    });

    expect(resposta.status).toBe(400);
    expect(resposta.body.error).toContain("Saldo insuficiente");
  });

  it("recusa lançar perda maior que o saldo produzido no turno/data", async () => {
    await req("POST", "/api/producoes", { body: { produtoId: produtoTortaId, turnoId: turnoT1Id, data: "2026-09-07", quantidade: 5 } });

    const resposta = await req("POST", "/api/perdas", {
      body: { produtoId: produtoTortaId, turnoId: turnoT1Id, motivoId, data: "2026-09-07", quantidade: 6 },
    });

    expect(resposta.status).toBe(400);
    expect(resposta.body.error).toContain("Saldo insuficiente");
  });

  it("aceita lançar perda até o saldo exato, considerando perdas já lançadas na mesma combinação", async () => {
    await req("POST", "/api/producoes", { body: { produtoId: produtoTortaId, turnoId: turnoT1Id, data: "2026-09-08", quantidade: 10 } });

    const primeira = await req("POST", "/api/perdas", {
      body: { produtoId: produtoTortaId, turnoId: turnoT1Id, motivoId, data: "2026-09-08", quantidade: 7 },
    });
    expect(primeira.status).toBe(201);

    const segunda = await req("POST", "/api/perdas", {
      body: { produtoId: produtoTortaId, turnoId: turnoT1Id, motivoId, data: "2026-09-08", quantidade: 3 },
    });
    expect(segunda.status).toBe(201);

    const terceira = await req("POST", "/api/perdas", {
      body: { produtoId: produtoTortaId, turnoId: turnoT1Id, motivoId, data: "2026-09-08", quantidade: 1 },
    });
    expect(terceira.status).toBe(400);
    expect(terceira.body.error).toContain("Saldo insuficiente");
  });

  it("edição que aumentaria a perda além do saldo disponível é recusada", async () => {
    await req("POST", "/api/producoes", { body: { produtoId: produtoTortaId, turnoId: turnoT1Id, data: "2026-09-09", quantidade: 5 } });

    const criada = await req("POST", "/api/perdas", {
      body: { produtoId: produtoTortaId, turnoId: turnoT1Id, motivoId, data: "2026-09-09", quantidade: 5 },
    });
    expect(criada.status).toBe(201);

    const editada = await req("PUT", `/api/perdas/${criada.body.id}`, { token, body: { quantidade: 6 } });
    expect(editada.status).toBe(400);
    expect(editada.body.error).toContain("Saldo insuficiente");
  });
});
