import { Router } from "express";
import { asyncHandler } from "../middleware/errorHandler";
import { requireAdmin } from "../middleware/auth";
import { listarAuditoria } from "../controllers/auditoria.controller";

const router = Router();

router.get("/", requireAdmin, asyncHandler(listarAuditoria));

export default router;
