import { Router } from "express";
import { asyncHandler } from "../middleware/errorHandler";
import { listarPerdas, registrarPerda, removerPerda } from "../controllers/perdas.controller";

const router = Router();

router.get("/", asyncHandler(listarPerdas));
router.post("/", asyncHandler(registrarPerda));
router.delete("/:id", asyncHandler(removerPerda));

export default router;
