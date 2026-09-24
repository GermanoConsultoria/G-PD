import { Router } from "express";
import { asyncHandler } from "../middleware/errorHandler";
import { login } from "../controllers/auth.controller";

const router = Router();

router.post("/login", asyncHandler(login));

export default router;
