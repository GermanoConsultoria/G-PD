import { Router } from "express";
import { asyncHandler } from "../middleware/errorHandler";
import {
  listarProducoes,
  registrarProducao,
  removerProducao,
} from "../controllers/producoes.controller";

const router = Router();

router.get("/", asyncHandler(listarProducoes));
router.post("/", asyncHandler(registrarProducao));
router.delete("/:id", asyncHandler(removerProducao));

export default router;
