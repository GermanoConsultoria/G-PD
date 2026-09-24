import { Hono } from "hono";
import type { Bindings } from "../types/env";
import { requireAdmin } from "../middleware/auth";
import { honoHandler } from "../lib/honoAdapter";
import {
  atualizarProducao,
  listarProducoes,
  registrarProducao,
  removerProducao,
} from "../controllers/producoes.controller";

const router = new Hono<Bindings>();

// Listagem e correções são uso administrativo (tela de Lançamentos).
router.get("/", requireAdmin, honoHandler(listarProducoes));
// Criação é o fluxo do tablet e continua sem login.
router.post("/", honoHandler(registrarProducao));
router.put("/:id", requireAdmin, honoHandler(atualizarProducao));
router.delete("/:id", requireAdmin, honoHandler(removerProducao));

export default router;
