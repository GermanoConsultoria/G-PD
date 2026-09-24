import { Hono } from "hono";
import type { Bindings } from "../types/env";
import { requireAdmin } from "../middleware/auth";
import { honoHandler } from "../lib/honoAdapter";
import {
  atualizarProduto,
  criarProduto,
  listarProdutos,
  obterProduto,
  removerProduto,
} from "../controllers/produtos.controller";

const router = new Hono<Bindings>();

// Listagem publica: o tablet le os produtos ativos para montar a grade de
// lançamento e não deve exigir autenticação administrativa.
router.get("/", honoHandler(listarProdutos));

router.get("/:id", requireAdmin, honoHandler(obterProduto));
router.post("/", requireAdmin, honoHandler(criarProduto));
router.put("/:id", requireAdmin, honoHandler(atualizarProduto));
router.delete("/:id", requireAdmin, honoHandler(removerProduto));

export default router;
