import { Request, Response } from "express";
import { z } from "zod";
import { listEmails, getEmail, sendEmail } from "../services/gmail-service";
import type { AuthRequest } from "../middleware/auth-middleware";

export const listMessages = async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      query: z.string().optional(),
      maxResults: z.coerce.number().min(1).max(100).default(20),
    });

    const { query, maxResults } = schema.parse(req.query);

    const messages = await listEmails(req.user!.userId, query, maxResults);
    res.json({ messages });
  } catch (error) {
    console.error("List emails error:", error);
    res.status(500).json({ error: "Failed to list emails" });
  }
};

export const getMessage = async (req: AuthRequest, res: Response) => {
  try {
    const message = await getEmail(req.user!.userId, req.params.id as string);
    res.json({ message });
  } catch (error) {
    console.error("Get email error:", error);
    res.status(500).json({ error: "Failed to get email" });
  }
};

export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      to: z.string().email(),
      subject: z.string().min(1),
      body: z.string(),
      cc: z.string().email().optional(),
      bcc: z.string().email().optional(),
    });

    const params = schema.parse(req.body);

    const messageId = await sendEmail(req.user!.userId, params);
    res.json({ messageId });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues });
    }
    console.error("Send email error:", error);
    res.status(500).json({ error: "Failed to send email" });
  }
};