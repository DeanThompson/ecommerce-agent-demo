/**
 * Sessions Route
 * Session management endpoints
 */

import { Router } from "express";
import type { Request, Response } from "express";
import {
  getSession,
  listSessions,
  deleteSession,
} from "../services/sessionStore.js";

const router: Router = Router();

router.get("/sessions", (_req: Request, res: Response) => {
  const sessions = listSessions();
  res.json({ sessions });
});

router.get("/sessions/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const session = getSession(id);

  if (!session) {
    res.status(404).json({
      code: "SESSION_NOT_FOUND",
      message: "会话不存在",
    });
    return;
  }

  res.json({
    id: session.id,
    messages: session.messages,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
  });
});

router.delete("/sessions/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const deleted = deleteSession(id);

  if (!deleted) {
    res.status(404).json({
      code: "SESSION_NOT_FOUND",
      message: "会话不存在",
    });
    return;
  }

  res.status(204).send();
});

export default router;
