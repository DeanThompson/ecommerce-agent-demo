/**
 * Chat Route
 * POST /api/chat - SSE streaming endpoint
 */

import { Router } from "express";
import type { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { runAgent } from "../agent/index.js";
import {
  getOrCreateSession,
  addMessageToSession,
  updateSession,
} from "../services/sessionStore.js";
import type { ChatRequest, Message, ChartConfig, TodoItem } from "../types/index.js";
import { logger } from "../utils/logger.js";

const router: Router = Router();

router.post("/chat", async (req: Request, res: Response) => {
  const { message, sessionId: requestSessionId } = req.body as ChatRequest;

  if (!message || typeof message !== "string") {
    res.status(400).json({
      code: "INVALID_REQUEST",
      message: "Message is required",
    });
    return;
  }

  logger.info("HTTP:REQUEST", "Incoming chat request", {
    sessionId: requestSessionId || null,
    messageLength: message.length,
    ip: req.ip,
    userAgent: req.get("user-agent"),
  });

  res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  if (typeof res.flushHeaders === "function") {
    res.flushHeaders();
  }

  const session = getOrCreateSession(requestSessionId || undefined);
  const sessionId = session.id;
  const turnId = Date.now();

  res.write(
    `event: turn_start\ndata: ${JSON.stringify({ turnId, sessionId })}\n\n`,
  );

  const userMessage: Message = {
    id: uuidv4(),
    role: "user",
    content: message,
    timestamp: new Date(),
  };
  addMessageToSession(sessionId, userMessage);

  const assistantMessage: Message = {
    id: uuidv4(),
    role: "assistant",
    content: "",
    charts: [],
    toolCalls: [],
    timestamp: new Date(),
  };

  const startTime = Date.now();

  try {
    const agentSessionId = session.agentSessionId;

    for await (const event of runAgent(message, agentSessionId)) {
      switch (event.type) {
        case "session_init": {
          const initData = event.data as { sessionId: string };
          if (initData.sessionId) {
            updateSession(sessionId, { agentSessionId: initData.sessionId });
            logger.info("CHAT:SESSION_INIT", "Agent session ID saved", {
              sessionId,
              agentSessionId: initData.sessionId,
            });
          }
          break;
        }

        case "text": {
          const textData = event.data as {
            content: string;
            isPartial?: boolean;
          };
          assistantMessage.content += textData.content;
          res.write(
            `event: text_delta\ndata: ${JSON.stringify({ content: textData.content })}\n\n`,
          );
          break;
        }

        case "tool_call": {
          const toolCallData = event.data as {
            id: string;
            tool: string;
            args: Record<string, unknown>;
          };
          res.write(
            `event: tool_start\ndata: ${JSON.stringify({
              id: toolCallData.id,
              tool: toolCallData.tool,
              args: toolCallData.args,
            })}\n\n`,
          );
          break;
        }

        case "tool_result": {
          const toolResultData = event.data as {
            id: string;
            tool: string;
            result: unknown;
            duration?: number;
          };

          assistantMessage.toolCalls?.push({
            id: toolResultData.id,
            tool: toolResultData.tool,
            args: {},
            result: toolResultData.result,
            duration: toolResultData.duration,
            status: "completed",
            isCollapsed: true,
          });

          res.write(
            `event: tool_result\ndata: ${JSON.stringify({
              id: toolResultData.id,
              tool: toolResultData.tool,
              args: {},
              result: toolResultData.result,
              duration: toolResultData.duration,
            })}\n\n`,
          );
          break;
        }

        case "chart": {
          const chartData = event.data as ChartConfig;
          assistantMessage.charts?.push(chartData);
          res.write(`event: chart\ndata: ${JSON.stringify(chartData)}\n\n`);
          break;
        }

        case "todos": {
          const todosData = event.data as TodoItem[];
          res.write(`event: todos\ndata: ${JSON.stringify(todosData)}\n\n`);
          break;
        }

        case "error": {
          const errorData = event.data as { code: string; message: string };
          res.write(`event: error\ndata: ${JSON.stringify(errorData)}\n\n`);
          break;
        }

        case "done": {
          addMessageToSession(sessionId, assistantMessage);

          const totalDuration = Date.now() - startTime;
          res.write(
            `event: done\ndata: ${JSON.stringify({ sessionId, totalDuration })}\n\n`,
          );
          break;
        }
      }
    }
  } catch (error) {
    console.error("Chat error:", error);
    res.write(
      `event: error\ndata: ${JSON.stringify({
        code: "INTERNAL_ERROR",
        message: error instanceof Error ? error.message : "Unknown error",
      })}\n\n`,
    );
  }

  res.end();
});

export default router;
