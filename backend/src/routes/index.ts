import { Router } from "express";
import produtosRouter from "./produtos.routes";
import producoesRouter from "./producoes.routes";
import perdasRouter from "./perdas.routes";
import dashboardRouter from "./dashboard.routes";
import referenciaRouter from "./referencia.routes";

const router = Router();

router.use("/produtos", produtosRouter);
router.use("/producoes", producoesRouter);
router.use("/perdas", perdasRouter);
router.use("/dashboard", dashboardRouter);
router.use("/", referenciaRouter);

export default router;
