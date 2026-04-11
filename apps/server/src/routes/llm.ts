import { Router, type Router as RouterType } from "express";
import { authMiddleware } from "../middleware/auth-middleware";
import * as llmController from "../controllers/llm-controller";

const router: RouterType = Router();

router.post("/chat", authMiddleware, llmController.sendChat);

export const llmRouter = router;