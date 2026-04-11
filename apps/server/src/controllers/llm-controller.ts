import type { Response } from "express";
import { z } from "zod";
import { chat, streamChat } from "../services/llm-service";
import type { AuthRequest } from "../middleware/auth-middleware";

export const sendChat = async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      messages: z.array(
        z.object({
          role: z.enum(["user", "assistant", "system"]),
          content: z.string(),
        })
      ),
      model: z.string().optional(),
      temperature: z.number().min(0).max(2).optional(),
      maxTokens: z.number().min(1).optional(),
      stream: z.boolean().default(false),
    });

    const { messages, model, temperature, maxTokens, stream } = schema.parse(req.body);

    if (stream) {
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      for await (const chunk of streamChat(messages, { model, temperature, maxTokens })) {
        res.write(chunk);
      }
      res.end();
      return;
    }

    const response = await chat(messages, { model, temperature, maxTokens });
    res.json({ response });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues });
    }
    console.error("Chat error:", error);
    res.status(500).json({ error: "Chat failed" });
  }
};
