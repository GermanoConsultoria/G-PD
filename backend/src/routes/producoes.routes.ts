import { Router } from "express";
import { asyncHandler } from "../middleware/errorHandler";
import { requireAdmin } from "../middleware/auth";
import {
  atualizarProducao,
  listarProducoes,
  registrarProducao,
  removerProducao,
} from "../controllers/producoes.controller";

const router = Router();

// Listagem e correções são uso administrativo (tela de Lançamentos).
router.get("/", requireAdmin, asyncHandler(listarProducoes));
// Criação é o fluxo do tablet e continua sem login.
router.post("/", asyncHandler(registrarProducao));
router.put("/:id", requireAdmin, asyncHandler(atualizarProducao));
router.delete("/:id", requireAdmin, asyncHandler(removerProducao));

export default router;
