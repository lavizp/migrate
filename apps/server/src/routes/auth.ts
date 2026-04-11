import { Router, type Router as RouterType } from "express";
import * as authController from "../controllers/auth-controller";

const router: RouterType = Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/me", authController.me);

export const authRouter = router;