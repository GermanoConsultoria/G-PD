import { Hono } from "hono";
import type { Bindings } from "../types/env";
import { requireAdmin } from "../middleware/auth";
import { honoHandler } from "../lib/honoAdapter";
import {
  atualizarPerda,
  listarPerdas,
  registrarPerda,
  removerPerda,
} from "../controllers/perdas.controller";

const router = new Hono<Bindings>();

router.get("/", requireAdmin, honoHandler(listarPerdas));
router.post("/", honoHandler(registrarPerda));
router.put("/:id", requireAdmin, honoHandler(atualizarPerda));
router.delete("/:id", requireAdmin, honoHandler(removerPerda));

export default router;
