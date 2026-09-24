import { Router } from "express";
import { asyncHandler } from "../middleware/errorHandler";
import { requireAdmin } from "../middleware/auth";
import {
  atualizarProduto,
  criarProduto,
  listarProdutos,
  obterProduto,
  removerProduto,
} from "../controllers/produtos.controller";

const router = Router();

// Listagem publica: o tablet le os produtos ativos para montar a grade de
// lançamento e não deve exigir autenticação administrativa.
router.get("/", asyncHandler(listarProdutos));

router.get("/:id", requireAdmin, asyncHandler(obterProduto));
router.post("/", requireAdmin, asyncHandler(criarProduto));
router.put("/:id", requireAdmin, asyncHandler(atualizarProduto));
router.delete("/:id", requireAdmin, asyncHandler(removerProduto));

export default router;
