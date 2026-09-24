import { Hono } from "hono";
import { cors } from "hono/cors";
import { ZodError } from "zod";
import router from "./routes";
import { HttpError } from "./middleware/errorHandler";
import type { Bindings, Env } from "./types/env";

export function createApp() {
  const app = new Hono<Bindings>();

  app.use(
    "*",
    cors({
      origin: (_origin, c) => (c.env as Env).CORS_ORIGIN ?? "*",
    })
  );

  app.get("/health", (c) => c.json({ status: "ok" }));
  app.route("/api", router);

  app.onError((err, c) => {
    if (err instanceof ZodError) {
      return c.json(
        {
          error: "Dados inválidos",
          detalhes: err.issues.map((issue) => ({
            campo: issue.path.join("."),
            mensagem: issue.message,
          })),
        },
        400
      );
    }

    if (err instanceof HttpError) {
      return c.json({ error: err.message }, err.status as any);
    }

    console.error(err);
    return c.json({ error: "Erro interno do servidor" }, 500);
  });

  return app;
}
