import { Router } from "express";
import { asyncHandler } from "../middleware/errorHandler";
import {
  listarMotivos,
  listarTurnos,
  obterContextoAtual,
} from "../controllers/referencia.controller";

const router = Router();

router.get("/turnos", asyncHandler(listarTurnos));
router.get("/motivos", asyncHandler(listarMotivos));
router.get("/contexto-atual", asyncHandler(obterContextoAtual));

export default router;
