import { Router, type Router as RouterType } from "express";
import { z } from "zod";
import { getAuthUrl, exchangeCode, saveCredentials } from "../services/google-oauth-service";
import { authMiddleware, type AuthRequest } from "../middleware/auth-middleware";

const router: RouterType = Router();

router.get("/", authMiddleware, (req: AuthRequest, res) => {
  const authUrl = getAuthUrl(req.user?.userId);
  res.json({ url: authUrl });
});

router.get("/callback", async (req, res) => {
  try {
    const schema = z.object({
      code: z.string(),
      state: z.string().optional(),
    });

    const { code, state } = schema.parse(req.query);

    const tokens = await exchangeCode(code);

    if (state) {
      await saveCredentials(state, tokens);
      return res.redirect(`${process.env.CORS_ORIGIN}/settings?connected=true`);
    }

    res.json({ tokens: { accessToken: tokens.accessToken, expiresAt: tokens.expiresAt } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues });
    }
    console.error("OAuth callback error:", error);
    res.status(500).json({ error: "OAuth callback failed" });
  }
});

export const googleAuthRouter = router;