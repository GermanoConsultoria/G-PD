import { Router } from "express";
import { asyncHandler } from "../middleware/errorHandler";
import {
  atualizarProduto,
  criarProduto,
  listarProdutos,
  obterProduto,
  removerProduto,
} from "../controllers/produtos.controller";

const router = Router();

router.get("/", asyncHandler(listarProdutos));
router.get("/:id", asyncHandler(obterProduto));
router.post("/", asyncHandler(criarProduto));
router.put("/:id", asyncHandler(atualizarProduto));
router.delete("/:id", asyncHandler(removerProduto));

export default router;
