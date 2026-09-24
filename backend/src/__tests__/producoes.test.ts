import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { obterTokenAdmin, req } from "./helpers";
import { dataAtualISO } from "../utils/turno";

let token: string;
let produtoId: number;
let turnoT1Id: number;
let turnoT2Id: number;

beforeAll(async () => {
  token = await obterTokenAdmin();
  const produtos = await req("GET", "/api/produtos?ativos=true");
  produtoId = produtos.body.find((p: { nome: string }) => p.nome === "Torta").id;
  const turnos = await req("GET", "/api/turnos");
  turnoT1Id = turnos.body.find((t: { codigo: string }) => t.codigo === "T1").id;
  turnoT2Id = turnos.body.find((t: { codigo: string }) => t.codigo === "T2").id;
});

describe("produção", () => {
  let producaoId: number;

  it("tablet consegue criar produção sem autenticação", async () => {
    const resposta = await req("POST", "/api/producoes", {
      body: { produtoId, turnoId: turnoT1Id, data: "2026-09-01", quantidade: 10 },
    });
    expect(resposta.status).toBe(201);
    producaoId = resposta.body.id;
  });

  it("listagem administrativa exige autenticação", async () => {
    const semAuth = await req("GET", "/api/producoes");
    expect(semAuth.status).toBe(401);

    const comAuth = await req("GET", "/api/producoes", { token });
    expect(comAuth.status).toBe(200);
    expect(comAuth.body.some((p: { id: number }) => p.id === producaoId)).toBe(true);
  });

  it("edição sem autenticação é bloqueada", async () => {
    const resposta = await req("PUT", `/api/producoes/${producaoId}`, { body: { quantidade: 20 } });
    expect(resposta.status).toBe(401);
  });

  it("admin edita produção e a alteração gera auditoria", async () => {
    const resposta = await req("PUT", `/api/producoes/${producaoId}`, { token, body: { quantidade: 25 } });

    expect(resposta.status).toBe(200);
    expect(resposta.body.quantidade).toBe(25);

    const auditoria = await req("GET", `/api/auditoria?entidade=Producao&entidadeId=${producaoId}`, { token });
    expect(
      auditoria.body.some((log: { acao: string; campo: string }) => log.acao === "EDICAO" && log.campo === "quantidade")
    ).toBe(true);
  });

  it("exclusão sem autenticação é bloqueada", async () => {
    const resposta = await req("DELETE", `/api/producoes/${producaoId}`);
    expect(resposta.status).toBe(401);
  });

  it("admin exclui produção e a auditoria de exclusão é preservada", async () => {
    const resposta = await req("DELETE", `/api/producoes/${producaoId}`, { token });
    expect(resposta.status).toBe(204);

    const buscaAposExclusao = await req("GET", "/api/producoes", { token });
    expect(buscaAposExclusao.body.some((p: { id: number }) => p.id === producaoId)).toBe(false);

    const auditoria = await req("GET", `/api/auditoria?entidade=Producao&entidadeId=${producaoId}`, { token });
    expect(auditoria.body.some((log: { acao: string }) => log.acao === "EXCLUSAO")).toBe(true);
  });
});

describe("bloqueio de turno já encerrado (hoje)", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("recusa lançar produção pro Turno 1 depois que ele já encerrou hoje (15h)", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 1, 15, 0, 0));
    const hoje = dataAtualISO();

    const resposta = await req("POST", "/api/producoes", {
      body: { produtoId, turnoId: turnoT1Id, data: hoje, quantidade: 5 },
    });

    expect(resposta.status).toBe(400);
    expect(resposta.body.error).toContain("Turno 1");
  });

  it("continua aceitando lançar pro Turno 2, que ainda não encerrou, no mesmo horário", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 1, 15, 0, 0));
    const hoje = dataAtualISO();

    const resposta = await req("POST", "/api/producoes", {
      body: { produtoId, turnoId: turnoT2Id, data: hoje, quantidade: 5 },
    });

    expect(resposta.status).toBe(201);
  });

  it("não bloqueia lançamento retroativo (data diferente de hoje) mesmo pro Turno 1", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 1, 15, 0, 0));

    const resposta = await req("POST", "/api/producoes", {
      body: { produtoId, turnoId: turnoT1Id, data: "2026-09-01", quantidade: 5 },
    });

    expect(resposta.status).toBe(201);
  });
});
