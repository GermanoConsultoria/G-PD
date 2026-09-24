import type { Context } from "hono";
import { z } from "zod";
import { HttpError } from "../middleware/errorHandler";
import { assinarTokenAdmin } from "../middleware/auth";
import type { Bindings } from "../types/env";

const loginSchema = z.object({
  senha: z.string().min(1, "Senha é obrigatória"),
});

export async function login(c: Context<Bindings>) {
  const body = await c.req.json().catch(() => ({}));
  const { senha } = loginSchema.parse(body);

  const senhaConfigurada = c.env.ADMIN_PASSWORD;
  if (!senhaConfigurada) {
    throw new HttpError(500, "ADMIN_PASSWORD não configurado no servidor");
  }

  if (senha !== senhaConfigurada) {
    throw new HttpError(401, "Senha incorreta");
  }

  const token = await assinarTokenAdmin(c.env.JWT_SECRET);
  return c.json({ token });
}
