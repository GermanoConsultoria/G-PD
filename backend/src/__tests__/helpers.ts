import request from "supertest";
import type { Express } from "express";

export async function obterTokenAdmin(app: Express): Promise<string> {
  const resposta = await request(app).post("/api/auth/login").send({ senha: process.env.ADMIN_PASSWORD });
  return resposta.body.token as string;
}
