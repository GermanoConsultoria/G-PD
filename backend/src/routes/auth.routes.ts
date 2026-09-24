import { Hono } from "hono";
import type { Bindings } from "../types/env";
import { login } from "../controllers/auth.controller";

const router = new Hono<Bindings>();

router.post("/login", login);

export default router;
