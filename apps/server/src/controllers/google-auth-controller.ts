import type { Request, Response } from "express";
import { z } from "zod";
import { getAuthUrl, exchangeCode, saveCredentials } from "../services/google-oauth-service";
import type { AuthRequest } from "../middleware/auth-middleware";

export const getAuth = (req: AuthRequest, res: Response) => {
  const authUrl = getAuthUrl(req.user?.userId);
  res.json({ url: authUrl });
};

export const oauthCallback = async (req: Request, res: Response) => {
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
};
