import { describe, expect, it } from "vitest";
import { req } from "./helpers";

describe("autenticação administrativa", () => {
  it("login com senha correta retorna token", async () => {
    const resposta = await req("POST", "/api/auth/login", { body: { senha: "test-admin-pass" } });
    expect(resposta.status).toBe(200);
    expect(typeof resposta.body.token).toBe("string");
  });

  it("login com senha incorreta falha", async () => {
    const resposta = await req("POST", "/api/auth/login", { body: { senha: "senha-errada" } });
    expect(resposta.status).toBe(401);
  });

  it("rota administrativa sem token retorna não autorizado", async () => {
    const resposta = await req("GET", "/api/dashboard/resumo");
    expect(resposta.status).toBe(401);
  });

  it("rota administrativa com token válido funciona", async () => {
    const login = await req("POST", "/api/auth/login", { body: { senha: "test-admin-pass" } });
    const resposta = await req("GET", "/api/dashboard/resumo", { token: login.body.token });
    expect(resposta.status).toBe(200);
  });

  it("token inválido é rejeitado", async () => {
    const resposta = await req("GET", "/api/dashboard/resumo", { token: "token-invalido" });
    expect(resposta.status).toBe(401);
  });
});
