import { Hono } from "hono";
import type { Bindings } from "../types/env";
import produtosRouter from "./produtos.routes";
import producoesRouter from "./producoes.routes";
import perdasRouter from "./perdas.routes";
import dashboardRouter from "./dashboard.routes";
import referenciaRouter from "./referencia.routes";
import authRouter from "./auth.routes";
import auditoriaRouter from "./auditoria.routes";

const router = new Hono<Bindings>();

router.route("/auth", authRouter);
router.route("/produtos", produtosRouter);
router.route("/producoes", producoesRouter);
router.route("/perdas", perdasRouter);
router.route("/dashboard", dashboardRouter);
router.route("/auditoria", auditoriaRouter);
router.route("/", referenciaRouter);

export default router;
