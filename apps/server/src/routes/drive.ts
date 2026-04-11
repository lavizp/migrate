import { Router, type Router as RouterType } from "express";
import { authMiddleware } from "../middleware/auth-middleware";
import * as driveController from "../controllers/drive-controller";

const router: RouterType = Router();

router.get("/files", authMiddleware, driveController.listDriveFiles);
router.get("/files/:id", authMiddleware, driveController.getDriveFile);
router.post("/files", authMiddleware, driveController.createDriveFile);
router.get("/files/:id/download", authMiddleware, driveController.downloadDriveFile);
router.delete("/files/:id", authMiddleware, driveController.deleteDriveFile);

export const driveRouter = router;