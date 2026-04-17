/**
 * Express Server Entry Point
 */

import "./env.js";

import express from "express";
import type { Express, NextFunction, Request, Response } from "express";
import cors from "cors";
import { initDatabase } from "./db/index.js";
import healthRouter from "./routes/health.js";
import chatRouter from "./routes/chat.js";
import sessionsRouter from "./routes/sessions.js";

const app: Express = express();
const PORT = Number(process.env.PORT || 3001);

app.use(cors());
app.use(express.json());

app.use("/api", healthRouter);
app.use("/api", chatRouter);
app.use("/api", sessionsRouter);

app.use(
  (
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction,
  ) => {
    console.error("Server error:", err);
    res.status(500).json({
      code: "INTERNAL_ERROR",
      message: err.message || "Internal server error",
    });
  },
);

async function start() {
  try {
    await initDatabase();

    app.listen(PORT, () => {
      console.log(`Server started on http://localhost:${PORT}`);
      console.log(`Health endpoint: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

start();

export default app;
