import { Request, Response } from "express";
import { z } from "zod";
import { HttpError } from "../middleware/errorHandler";
import { assinarTokenAdmin } from "../middleware/auth";

const loginSchema = z.object({
  senha: z.string().min(1, "Senha é obrigatória"),
});

export async function login(req: Request, res: Response) {
  const { senha } = loginSchema.parse(req.body);

  const senhaConfigurada = process.env.ADMIN_PASSWORD;
  if (!senhaConfigurada) {
    throw new HttpError(500, "ADMIN_PASSWORD não configurado no servidor");
  }

  if (senha !== senhaConfigurada) {
    throw new HttpError(401, "Senha incorreta");
  }

  const token = assinarTokenAdmin();
  res.json({ token });
}
