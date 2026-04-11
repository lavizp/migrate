import { Router, type Router as RouterType } from "express";
import { authMiddleware } from "../middleware/auth-middleware";
import * as gmailController from "../controllers/gmail-controller";

const router: RouterType = Router();

router.get("/messages", authMiddleware, gmailController.listMessages);
router.get("/messages/:id", authMiddleware, gmailController.getMessage);
router.post("/messages/send", authMiddleware, gmailController.sendMessage);

export const gmailRouter = router;