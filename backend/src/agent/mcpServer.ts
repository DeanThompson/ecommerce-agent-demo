/**
 * SDK MCP Server
 * Claude Agent SDK integration with custom tools
 */

import { createSdkMcpServer, tool } from "@anthropic-ai/claude-agent-sdk";
import { mcpToolRegistry } from "../mcp/tools/registry.js";

export const ecommerceServer = createSdkMcpServer({
  name: "ecommerce-tools",
  version: "1.0.0",
  tools: mcpToolRegistry.map((registration) =>
    tool(
      registration.name,
      registration.description,
      registration.schema,
      registration.handler,
    ),
  ),
});
