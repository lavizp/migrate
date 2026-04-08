import { Router, type Router as RouterType } from "express";
import { z } from "zod";
import {
  createUser,
  verifyCredentials,
  generateToken,
  verifyToken,
} from "../services/auth-service";

const router: RouterType = Router();

router.post("/register", async (req, res) => {
  try {
    const schema = z.object({
      email: z.string().email(),
      password: z.string().min(6),
    });

    const { email, password } = schema.parse(req.body);

    const existingUser = await createUser(email, password).catch(() => null);
    if (!existingUser) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const token = generateToken(existingUser);
    res.json({ token, user: { id: existingUser.id, email: existingUser.email } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const schema = z.object({
      email: z.string().email(),
      password: z.string(),
    });

    const { email, password } = schema.parse(req.body);

    const user = await verifyCredentials(email, password);
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = generateToken(user);
    res.json({ token, user: { id: user.id, email: user.email } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/me", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.slice(7);
  try {
    const payload = verifyToken(token);
    res.json({ userId: payload.userId, email: payload.email });
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
});

export const authRouter = router;