/**
 * Health Check Route
 */

import { Router } from "express";
import type { Request, Response } from "express";
import { isDatabaseReady } from "../db/index.js";
import type { HealthResponse } from "../types/index.js";

const router: Router = Router();

router.get("/health", async (_req: Request, res: Response) => {
  let dbConnected = false;
  try {
    dbConnected = await isDatabaseReady();
  } catch {
    dbConnected = false;
  }

  const response: HealthResponse = {
    status: dbConnected ? "ok" : "degraded",
    version: "1.0.0",
    database: dbConnected ? "connected" : "disconnected",
    timestamp: new Date(),
  };

  res.json(response);
});

export default router;
