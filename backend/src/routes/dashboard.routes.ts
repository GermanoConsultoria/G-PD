import { Hono } from "hono";
import type { Bindings } from "../types/env";
import { requireAdmin } from "../middleware/auth";
import { honoHandler } from "../lib/honoAdapter";
import {
  analitico,
  evolucaoPerdas,
  perdasPorMotivo,
  perdasPorProduto,
  resumo,
} from "../controllers/dashboard.controller";

const router = new Hono<Bindings>();

router.use(requireAdmin);

router.get("/resumo", honoHandler(resumo));
router.get("/perdas-por-motivo", honoHandler(perdasPorMotivo));
router.get("/perdas-por-produto", honoHandler(perdasPorProduto));
router.get("/evolucao-perdas", honoHandler(evolucaoPerdas));
router.get("/analitico", honoHandler(analitico));

export default router;
