import { beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../app";
import { obterTokenAdmin } from "./helpers";

const app = createApp();
let token: string;
let produtoId: number;
let turnoT1Id: number;

beforeAll(async () => {
  token = await obterTokenAdmin(app);
  const produtos = await request(app).get("/api/produtos?ativos=true");
  produtoId = produtos.body.find((p: { nome: string }) => p.nome === "Torta").id;
  const turnos = await request(app).get("/api/turnos");
  turnoT1Id = turnos.body.find((t: { codigo: string }) => t.codigo === "T1").id;
});

describe("produção", () => {
  let producaoId: number;

  it("tablet consegue criar produção sem autenticação", async () => {
    const resposta = await request(app)
      .post("/api/producoes")
      .send({ produtoId, turnoId: turnoT1Id, data: "2026-09-01", quantidade: 10 });
    expect(resposta.status).toBe(201);
    producaoId = resposta.body.id;
  });

  it("listagem administrativa exige autenticação", async () => {
    const semAuth = await request(app).get("/api/producoes");
    expect(semAuth.status).toBe(401);

    const comAuth = await request(app).get("/api/producoes").set("Authorization", `Bearer ${token}`);
    expect(comAuth.status).toBe(200);
    expect(comAuth.body.some((p: { id: number }) => p.id === producaoId)).toBe(true);
  });

  it("edição sem autenticação é bloqueada", async () => {
    const resposta = await request(app).put(`/api/producoes/${producaoId}`).send({ quantidade: 20 });
    expect(resposta.status).toBe(401);
  });

  it("admin edita produção e a alteração gera auditoria", async () => {
    const resposta = await request(app)
      .put(`/api/producoes/${producaoId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ quantidade: 25 });

    expect(resposta.status).toBe(200);
    expect(resposta.body.quantidade).toBe(25);

    const auditoria = await request(app)
      .get(`/api/auditoria?entidade=Producao&entidadeId=${producaoId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(
      auditoria.body.some((log: { acao: string; campo: string }) => log.acao === "EDICAO" && log.campo === "quantidade")
    ).toBe(true);
  });

  it("exclusão sem autenticação é bloqueada", async () => {
    const resposta = await request(app).delete(`/api/producoes/${producaoId}`);
    expect(resposta.status).toBe(401);
  });

  it("admin exclui produção e a auditoria de exclusão é preservada", async () => {
    const resposta = await request(app)
      .delete(`/api/producoes/${producaoId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(resposta.status).toBe(204);

    const buscaAposExclusao = await request(app).get("/api/producoes").set("Authorization", `Bearer ${token}`);
    expect(buscaAposExclusao.body.some((p: { id: number }) => p.id === producaoId)).toBe(false);

    const auditoria = await request(app)
      .get(`/api/auditoria?entidade=Producao&entidadeId=${producaoId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(auditoria.body.some((log: { acao: string }) => log.acao === "EXCLUSAO")).toBe(true);
  });
});
