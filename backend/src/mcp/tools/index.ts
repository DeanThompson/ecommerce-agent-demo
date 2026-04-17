/**
 * MCP Tools Registration
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { mcpToolRegistry } from "./registry.js";

export function registerTools(server: McpServer): void {
  for (const registration of mcpToolRegistry) {
    server.tool(
      registration.name,
      registration.description,
      registration.schema,
      registration.handler,
    );
  }
}
