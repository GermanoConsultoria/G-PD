import { Hono } from "hono";
import type { Bindings } from "../types/env";
import { honoHandler } from "../lib/honoAdapter";
import {
  listarMotivos,
  listarTurnos,
  obterContextoAtual,
} from "../controllers/referencia.controller";

const router = new Hono<Bindings>();

router.get("/turnos", honoHandler(listarTurnos));
router.get("/motivos", honoHandler(listarMotivos));
router.get("/contexto-atual", honoHandler(obterContextoAtual));

export default router;
