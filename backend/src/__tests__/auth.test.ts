import { describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../app";

const app = createApp();

describe("autenticação administrativa", () => {
  it("login com senha correta retorna token", async () => {
    const resposta = await request(app).post("/api/auth/login").send({ senha: "test-admin-pass" });
    expect(resposta.status).toBe(200);
    expect(typeof resposta.body.token).toBe("string");
  });

  it("login com senha incorreta falha", async () => {
    const resposta = await request(app).post("/api/auth/login").send({ senha: "senha-errada" });
    expect(resposta.status).toBe(401);
  });

  it("rota administrativa sem token retorna não autorizado", async () => {
    const resposta = await request(app).get("/api/dashboard/resumo");
    expect(resposta.status).toBe(401);
  });

  it("rota administrativa com token válido funciona", async () => {
    const login = await request(app).post("/api/auth/login").send({ senha: "test-admin-pass" });
    const resposta = await request(app)
      .get("/api/dashboard/resumo")
      .set("Authorization", `Bearer ${login.body.token}`);
    expect(resposta.status).toBe(200);
  });

  it("token inválido é rejeitado", async () => {
    const resposta = await request(app).get("/api/dashboard/resumo").set("Authorization", "Bearer token-invalido");
    expect(resposta.status).toBe(401);
  });
});
