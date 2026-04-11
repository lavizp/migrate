import { Router, type Router as RouterType } from "express";
import { authMiddleware } from "../middleware/auth-middleware";
import * as googleAuthController from "../controllers/google-auth-controller";

const router: RouterType = Router();

router.get("/", authMiddleware, googleAuthController.getAuth);
router.get("/callback", googleAuthController.oauthCallback);

export const googleAuthRouter = router;