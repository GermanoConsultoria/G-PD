import { beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../app";
import { obterTokenAdmin } from "./helpers";

const app = createApp();
let token: string;
let produtoId: number;
let turnoT1Id: number;
let motivoId: number;

beforeAll(async () => {
  token = await obterTokenAdmin(app);
  const produtos = await request(app).get("/api/produtos?ativos=true");
  produtoId = produtos.body.find((p: { nome: string }) => p.nome === "Mini Pão de Queijo").id;
  const turnos = await request(app).get("/api/turnos");
  turnoT1Id = turnos.body.find((t: { codigo: string }) => t.codigo === "T1").id;
  const motivos = await request(app).get("/api/motivos");
  motivoId = motivos.body[0].id;
});

describe("dashboard analítico", () => {
  it("exige autenticação", async () => {
    const resposta = await request(app).get("/api/dashboard/analitico?dataInicio=2026-09-01&dataFim=2026-09-30");
    expect(resposta.status).toBe(401);
  });

  it("agrega produção e perda por produto dentro do período informado", async () => {
    await request(app)
      .post("/api/producoes")
      .send({ produtoId, turnoId: turnoT1Id, data: "2026-09-10", quantidade: 100 });
    await request(app)
      .post("/api/perdas")
      .send({ produtoId, turnoId: turnoT1Id, motivoId, data: "2026-09-10", quantidade: 15 });

    const resposta = await request(app)
      .get("/api/dashboard/analitico?dataInicio=2026-09-10&dataFim=2026-09-10")
      .set("Authorization", `Bearer ${token}`);

    expect(resposta.status).toBe(200);
    expect(Array.isArray(resposta.body.motivos)).toBe(true);

    const linha = resposta.body.linhas.find((l: { produtoId: number }) => l.produtoId === produtoId);
    expect(linha).toBeTruthy();
    expect(linha.produzido).toBe(100);
    expect(linha.perdido).toBe(15);
    expect(linha.percentualPerda).toBeCloseTo(15);
    expect(linha.custoTotalCentavos).toBe(39 * 15);
  });
});
