import { env } from "@migrate/env/server";
import cors from "cors";
import express from "express";

import { authRouter } from "./routes/auth";
import { googleAuthRouter } from "./routes/google-auth";
import { gmailRouter } from "./routes/gmail";
import { driveRouter } from "./routes/drive";
import { llmRouter } from "./routes/llm";

const app = express();

app.use(
  cors({
    origin: env.CORS_ORIGIN,
    methods: ["GET", "POST", "OPTIONS"],
  })
);

app.use(express.json());

app.use("/auth", authRouter);
app.use("/auth/google", googleAuthRouter);
app.use("/gmail", gmailRouter);
app.use("/drive", driveRouter);
app.use("/llm", llmRouter);

app.get("/", (_req, res) => {
  res.status(200).send("OK");
});

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
