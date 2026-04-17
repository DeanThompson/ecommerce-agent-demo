/**
 * Agent Configuration
 * Claude Agent SDK integration with MCP tools
 */

import { query } from "@anthropic-ai/claude-agent-sdk";
import { ecommerceServer } from "./mcpServer.js";
import { getSystemPrompt } from "./systemPrompt.js";
import type { ChartConfig } from "../types/index.js";
import { logger } from "../utils/logger.js";
import { mcpToolRegistry } from "../mcp/tools/registry.js";
import {
  getUniqueTextChunk,
  normalizeTextChunkBoundary,
} from "./textDedup.js";

export interface AgentResponse {
  type:
    | "text"
    | "tool_call"
    | "tool_result"
    | "chart"
    | "todos"
    | "done"
    | "error"
    | "session_init";
  data: unknown;
}

export async function* runAgent(
  userMessage: string,
  agentSessionId?: string,
): AsyncGenerator<AgentResponse> {
  logger.info("AGENT:REQUEST", "Received user message", {
    messageLength: userMessage.length,
    messagePreview: userMessage.slice(0, 100),
    agentSessionId: agentSessionId || "new session",
  });

  // Track chart index for [[CHART:N]] markers
  let chartIndex = 0;

  // Track tool_use_id to tool name mapping for matching results
  const toolIdToName = new Map<string, string>();
  let emittedText = "";

  try {
    const allowedMcpTools = mcpToolRegistry.map(
      (tool) => `mcp__ecommerce-tools__${tool.name}`,
    );

    // Build query options
    const queryOptions: {
      systemPrompt: string;
      mcpServers: { "ecommerce-tools": typeof ecommerceServer };
      allowedTools: string[];
      maxTurns: number;
      resume?: string;
    } = {
      systemPrompt: getSystemPrompt(),
      mcpServers: {
        "ecommerce-tools": ecommerceServer,
      },
      allowedTools: allowedMcpTools,
      maxTurns: 10,
    };

    // Add resume option if we have an existing agent session
    if (agentSessionId) {
      queryOptions.resume = agentSessionId;
      logger.info("AGENT:RESUME", "Resuming existing session", {
        agentSessionId,
      });
    }

    // Use Claude Agent SDK query with MCP server
    for await (const message of query({
      prompt: userMessage,
      options: queryOptions,
    })) {
      // Handle system init message to capture session ID
      if (
        message.type === "system" &&
        "subtype" in message &&
        message.subtype === "init"
      ) {
        const sessionId = (message as { session_id?: string }).session_id;
        if (sessionId) {
          logger.info("AGENT:SESSION_INIT", "Session initialized", {
            sessionId,
          });
          yield {
            type: "session_init",
            data: { sessionId },
          };
        }
      }

      // Handle different message types
      if (message.type === "assistant") {
        // Process assistant message content blocks
        for (const block of message.message.content) {
          if (block.type === "tool_use") {
            // Extract tool name - handle different formats from Claude Agent SDK
            let toolName: string;
            const blockName = (block as { name?: string }).name || "";

            if (blockName.startsWith("mcp__ecommerce-tools__")) {
              // Standard MCP format: mcp__ecommerce-tools__tool_name
              toolName = blockName.replace("mcp__ecommerce-tools__", "");
            } else if (blockName.startsWith("mcp__")) {
              // Other MCP format: mcp__server__tool_name
              const parts = blockName.split("__");
              toolName = parts[parts.length - 1] || blockName;
            } else if (
              blockName.startsWith("call ") ||
              blockName.startsWith("toolu_")
            ) {
              // This looks like an ID, not a tool name - try to get from other properties
              const blockAny = block as unknown as Record<string, unknown>;
              toolName =
                (blockAny.tool as string) ||
                (blockAny.tool_name as string) ||
                blockName;
            } else {
              // Use as-is
              toolName = blockName;
            }

            // Store mapping for later result matching
            toolIdToName.set(block.id, toolName);

            logger.info("AGENT:TOOL_CALL", "Tool called", {
              toolId: block.id,
              toolName,
              blockName,
              inputPreview: JSON.stringify(block.input).slice(0, 200),
            });

            yield {
              type: "tool_call",
              data: {
                id: block.id,
                tool: toolName,
                args: block.input,
              },
            };
          } else if (block.type === "text") {
            const uniqueText = getUniqueTextChunk(emittedText, block.text);
            const normalizedText = normalizeTextChunkBoundary(
              emittedText,
              uniqueText,
            );
            if (normalizedText) {
              emittedText += normalizedText;
              yield {
                type: "text",
                data: {
                  content: normalizedText,
                  isPartial: false,
                },
              };
            }
          }
        }
      } else if (message.type === "user" && "content" in message.message) {
        // Tool results come back as user messages
        const content = message.message.content;
        if (Array.isArray(content)) {
          for (const block of content) {
            if (
              typeof block === "object" &&
              block !== null &&
              "type" in block &&
              block.type === "tool_result"
            ) {
              const toolResult = block as {
                type: "tool_result";
                tool_use_id: string;
                content: string | Array<{ type: string; text?: string }>;
              };

              // Get tool name from mapping
              const toolName =
                toolIdToName.get(toolResult.tool_use_id) || "unknown";

              // Handle content as array of content blocks or string
              let contentText: string;
              if (Array.isArray(toolResult.content)) {
                // Extract text from content blocks
                contentText = toolResult.content
                  .filter((c) => c.type === "text" && c.text)
                  .map((c) => c.text)
                  .join("");
              } else {
                contentText = toolResult.content;
              }

              try {
                const result = JSON.parse(contentText);

                logger.info("AGENT:TOOL_RESULT", "Tool result received", {
                  toolId: toolResult.tool_use_id,
                  toolName,
                  resultPreview: JSON.stringify(result).slice(0, 200),
                });

                // Check if this is a chart generation result
                if (
                  result.success &&
                  result.chart &&
                  typeof result.chart === "object"
                ) {
                  const currentChartIndex = chartIndex++;
                  result.chartIndex = currentChartIndex;

                  yield {
                    type: "chart",
                    data: result.chart as ChartConfig,
                  };
                }

                // Check if this is a todo_write result
                if (
                  result.success &&
                  result.todos &&
                  Array.isArray(result.todos)
                ) {
                  yield {
                    type: "todos",
                    data: result.todos,
                  };
                }

                yield {
                  type: "tool_result",
                  data: {
                    id: toolResult.tool_use_id,
                    tool: toolName,
                    result,
                  },
                };
              } catch {
                // If parsing fails, yield raw content text
                yield {
                  type: "tool_result",
                  data: {
                    id: toolResult.tool_use_id,
                    tool: toolName,
                    result: contentText,
                  },
                };
              }
            }
          }
        }
      } else if (message.type === "result") {
        if (message.subtype === "success") {
          logger.info("AGENT:COMPLETE", "Agent completed successfully", {
            resultPreview: String(message.result).slice(0, 200),
          });

          // Yield only incremental text to avoid duplicated final answer
          if (message.result && typeof message.result === "string") {
            const uniqueText = getUniqueTextChunk(emittedText, message.result);
            const normalizedText = normalizeTextChunkBoundary(
              emittedText,
              uniqueText,
            );
            if (normalizedText) {
              emittedText += normalizedText;
              yield {
                type: "text",
                data: {
                  content: normalizedText,
                  isPartial: false,
                },
              };
            }
          }
        } else {
          // Handle error subtypes
          logger.error("AGENT:ERROR", "Agent returned error", {
            subtype: message.subtype,
          });

          yield {
            type: "error",
            data: {
              code: "AGENT_ERROR",
              message: `Agent error: ${message.subtype}`,
            },
          };
        }
      }
    }

    yield {
      type: "done",
      data: {},
    };
  } catch (error) {
    logger.error("AGENT:ERROR", "Agent execution failed", { error });
    yield {
      type: "error",
      data: {
        code: "AGENT_ERROR",
        message: error instanceof Error ? error.message : "Unknown error",
      },
    };
  }
}
