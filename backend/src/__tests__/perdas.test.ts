import { beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../app";
import { obterTokenAdmin } from "./helpers";

const app = createApp();
let token: string;
let produtoTortaId: number;
let produtoPalitoId: number;
let turnoT1Id: number;
let motivoId: number;

beforeAll(async () => {
  token = await obterTokenAdmin(app);
  const produtos = await request(app).get("/api/produtos?ativos=true");
  produtoTortaId = produtos.body.find((p: { nome: string }) => p.nome === "Torta").id;
  produtoPalitoId = produtos.body.find((p: { nome: string }) => p.nome === "Palito").id;
  const turnos = await request(app).get("/api/turnos");
  turnoT1Id = turnos.body.find((t: { codigo: string }) => t.codigo === "T1").id;
  const motivos = await request(app).get("/api/motivos");
  motivoId = motivos.body[0].id;
});

describe("perdas", () => {
  it("custo histórico é gravado a partir do custo vigente do produto ao criar", async () => {
    const resposta = await request(app)
      .post("/api/perdas")
      .send({ produtoId: produtoTortaId, turnoId: turnoT1Id, motivoId, data: "2026-09-01", quantidade: 10 });

    expect(resposta.status).toBe(201);
    expect(resposta.body.custoUnitarioHistoricoCentavos).toBe(581);
    expect(resposta.body.custoTotalCentavos).toBe(5810);
  });

  it("alterar o custo do produto depois NÃO afeta perda já registrada (custo histórico)", async () => {
    const criada = await request(app)
      .post("/api/perdas")
      .send({ produtoId: produtoTortaId, turnoId: turnoT1Id, motivoId, data: "2026-09-02", quantidade: 5 });
    const perdaId = criada.body.id;
    expect(criada.body.custoUnitarioHistoricoCentavos).toBe(581);

    await request(app)
      .put(`/api/produtos/${produtoTortaId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ custoUnitarioCentavos: 700 });

    const releitura = await request(app).get("/api/perdas").set("Authorization", `Bearer ${token}`);
    const perdaAntiga = releitura.body.find((p: { id: number }) => p.id === perdaId);
    expect(perdaAntiga.custoUnitarioHistoricoCentavos).toBe(581);
    expect(perdaAntiga.custoTotalCentavos).toBe(2905);

    await request(app)
      .put(`/api/produtos/${produtoTortaId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ custoUnitarioCentavos: 581 });
  });

  it("listagem sem autenticação é bloqueada", async () => {
    const resposta = await request(app).get("/api/perdas");
    expect(resposta.status).toBe(401);
  });

  it("edição administrativa que só corrige a quantidade preserva o custo unitário histórico", async () => {
    const criada = await request(app)
      .post("/api/perdas")
      .send({ produtoId: produtoTortaId, turnoId: turnoT1Id, motivoId, data: "2026-09-03", quantidade: 4 });
    const perdaId = criada.body.id;

    const editada = await request(app)
      .put(`/api/perdas/${perdaId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ quantidade: 6 });

    expect(editada.status).toBe(200);
    expect(editada.body.custoUnitarioHistoricoCentavos).toBe(581);
    expect(editada.body.custoTotalCentavos).toBe(581 * 6);
  });

  it("edição administrativa que troca o produto recalcula o custo histórico e audita a mudança", async () => {
    const criada = await request(app)
      .post("/api/perdas")
      .send({ produtoId: produtoTortaId, turnoId: turnoT1Id, motivoId, data: "2026-09-04", quantidade: 3 });
    const perdaId = criada.body.id;

    const editada = await request(app)
      .put(`/api/perdas/${perdaId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ produtoId: produtoPalitoId });

    expect(editada.status).toBe(200);
    expect(editada.body.produtoId).toBe(produtoPalitoId);
    expect(editada.body.custoUnitarioHistoricoCentavos).toBe(268);
    expect(editada.body.custoTotalCentavos).toBe(268 * 3);

    const auditoria = await request(app)
      .get(`/api/auditoria?entidade=Perda&entidadeId=${perdaId}`)
      .set("Authorization", `Bearer ${token}`);
    const campos = auditoria.body.map((log: { campo: string }) => log.campo);
    expect(campos).toContain("produtoId");
    expect(campos).toContain("custoUnitarioHistoricoCentavos");
    expect(campos).toContain("custoTotalCentavos");
  });

  it("admin exclui perda e a auditoria preserva os dados do registro removido", async () => {
    const criada = await request(app)
      .post("/api/perdas")
      .send({ produtoId: produtoTortaId, turnoId: turnoT1Id, motivoId, data: "2026-09-05", quantidade: 2 });
    const perdaId = criada.body.id;

    const resposta = await request(app).delete(`/api/perdas/${perdaId}`).set("Authorization", `Bearer ${token}`);
    expect(resposta.status).toBe(204);

    const auditoria = await request(app)
      .get(`/api/auditoria?entidade=Perda&entidadeId=${perdaId}`)
      .set("Authorization", `Bearer ${token}`);
    const exclusao = auditoria.body.find((log: { acao: string }) => log.acao === "EXCLUSAO");
    expect(exclusao).toBeTruthy();
    expect(exclusao.valorAnterior).toContain("Torta");
  });
});
