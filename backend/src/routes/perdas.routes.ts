import { Router } from "express";
import { asyncHandler } from "../middleware/errorHandler";
import { requireAdmin } from "../middleware/auth";
import {
  atualizarPerda,
  listarPerdas,
  registrarPerda,
  removerPerda,
} from "../controllers/perdas.controller";

const router = Router();

router.get("/", requireAdmin, asyncHandler(listarPerdas));
router.post("/", asyncHandler(registrarPerda));
router.put("/:id", requireAdmin, asyncHandler(atualizarPerda));
router.delete("/:id", requireAdmin, asyncHandler(removerPerda));

export default router;
