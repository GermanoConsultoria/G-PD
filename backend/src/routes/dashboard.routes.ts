import { Router } from "express";
import { asyncHandler } from "../middleware/errorHandler";
import {
  evolucaoPerdas,
  perdasPorMotivo,
  perdasPorProduto,
  resumo,
} from "../controllers/dashboard.controller";

const router = Router();

router.get("/resumo", asyncHandler(resumo));
router.get("/perdas-por-motivo", asyncHandler(perdasPorMotivo));
router.get("/perdas-por-produto", asyncHandler(perdasPorProduto));
router.get("/evolucao-perdas", asyncHandler(evolucaoPerdas));

export default router;
