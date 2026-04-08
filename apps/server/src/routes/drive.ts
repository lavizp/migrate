import { Router, type Router as RouterType } from "express";
import { z } from "zod";
import {
  listFiles,
  getFile,
  uploadFile,
  downloadFile,
  deleteFile,
} from "../services/drive-service";
import { authMiddleware, type AuthRequest } from "../middleware/auth-middleware";

const router: RouterType = Router();

router.get("/files", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const schema = z.object({
      query: z.string().optional(),
      pageSize: z.coerce.number().min(1).max(100).default(20),
      pageToken: z.string().optional(),
    });

    const { query, pageSize, pageToken } = schema.parse(req.query);

    const result = await listFiles(req.user!.userId, query, pageSize, pageToken);
    res.json(result);
  } catch (error) {
    console.error("List files error:", error);
    res.status(500).json({ error: "Failed to list files" });
  }
});

router.get("/files/:id", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const file = await getFile(req.user!.userId, req.params.id as string);
    res.json({ file });
  } catch (error) {
    console.error("Get file error:", error);
    res.status(500).json({ error: "Failed to get file" });
  }
});

router.post("/files", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const schema = z.object({
      name: z.string().min(1),
      content: z.string(),
      mimeType: z.string().default("application/octet-stream"),
      parentId: z.string().optional(),
    });

    const { name, content, mimeType, parentId } = schema.parse(req.body);

    const file = await uploadFile(req.user!.userId, name, content, mimeType, parentId);
    res.json({ file });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues });
    }
    console.error("Upload file error:", error);
    res.status(500).json({ error: "Failed to upload file" });
  }
});

router.get("/files/:id/download", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const buffer = await downloadFile(req.user!.userId, req.params.id as string);
    
    res.set({
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment`,
    });
    res.send(buffer);
  } catch (error) {
    console.error("Download file error:", error);
    res.status(500).json({ error: "Failed to download file" });
  }
});

router.delete("/files/:id", authMiddleware, async (req: AuthRequest, res) => {
  try {
    await deleteFile(req.user!.userId, req.params.id as string);
    res.json({ success: true });
  } catch (error) {
    console.error("Delete file error:", error);
    res.status(500).json({ error: "Failed to delete file" });
  }
});

export const driveRouter = router;