/**
 * MCP Server Setup
 * Model Context Protocol server for e-commerce tools
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerTools } from "./tools/index.js";

export function createMcpServer(): McpServer {
  const server = new McpServer({
    name: "ecommerce-tools",
    version: "1.0.0",
  });

  // Register all tools
  registerTools(server);

  return server;
}

export async function startMcpServer(): Promise<void> {
  const server = createMcpServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.log("MCP Server started");
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  startMcpServer().catch(console.error);
}
