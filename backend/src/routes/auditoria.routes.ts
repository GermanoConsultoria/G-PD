import { Hono } from "hono";
import type { Bindings } from "../types/env";
import { requireAdmin } from "../middleware/auth";
import { honoHandler } from "../lib/honoAdapter";
import { listarAuditoria } from "../controllers/auditoria.controller";

const router = new Hono<Bindings>();

router.get("/", requireAdmin, honoHandler(listarAuditoria));

export default router;
