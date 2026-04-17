# Research: E-Commerce Insight Agent MVP

**Feature**: 001-mvp-framework
**Date**: 2026-02-05

## 1. Claude Agent SDK

### Decision
使用 Claude Agent SDK 的 streaming input mode 配合 MCP Server 实现 Agent 功能。

### Rationale
- SDK 内置对话上下文管理，无需手动维护
- 支持 MCP 协议，可灵活扩展工具
- 提供流式响应，满足 SSE 需求
- TypeScript 原生支持

### Key Implementation Patterns

```typescript
import { query } from "@anthropic-ai/claude-agent-sdk";

// 配置 MCP Server
const response = query({
  prompt: generateMessages(),
  options: {
    model: "claude-sonnet-4-5",
    mcpServers: {
      "ecommerce": {
        type: "stdio",
        command: "node",
        args: ["./mcp-server/index.js"]
      }
    },
    allowedTools: [
      "mcp__ecommerce__query_sales",
      "mcp__ecommerce__generate_chart"
    ]
  }
});

// 处理流式响应
for await (const message of response) {
  if (message.type === "assistant") {
    // 发送到 SSE
  }
}
```

### Alternatives Considered
- 直接使用 Anthropic API：需要手动实现工具调用循环，复杂度高
- LangChain：过于重量级，不适合 Demo 项目

---

## 2. MCP Server Implementation

### Decision
使用 `@modelcontextprotocol/sdk` 创建 stdio 类型的 MCP Server。

### Rationale
- 官方 SDK，稳定可靠
- stdio 传输简单，适合本地开发
- Zod schema 验证，类型安全

### Key Implementation Patterns

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({
  name: "ecommerce-tools",
  version: "1.0.0"
});

// 定义工具
server.tool(
  "query_sales",
  "查询销售数据，支持按时间、品类、地区筛选",
  {
    start_date: z.string().describe("开始日期 YYYY-MM-DD"),
    end_date: z.string().describe("结束日期 YYYY-MM-DD"),
    group_by: z.enum(["day", "month", "year", "category", "state"]).optional(),
    filters: z.object({
      category: z.string().optional(),
      state: z.string().optional()
    }).optional()
  },
  async ({ start_date, end_date, group_by, filters }) => {
    // 执行 SQL 查询
    const result = await db.querySales({ start_date, end_date, group_by, filters });
    return { content: [{ type: "text", text: JSON.stringify(result) }] };
  }
);

// 启动服务器
const transport = new StdioServerTransport();
await server.connect(transport);
```

### Alternatives Considered
- HTTP 传输：需要额外的服务器进程，增加复杂度
- 内嵌工具：不符合 MCP 架构，不利于扩展

---

## 3. SSE Implementation

### Decision
使用 Express 原生 SSE + `@microsoft/fetch-event-source` 客户端。

### Rationale
- Express 原生支持，无需额外依赖
- fetch-event-source 支持 POST 请求和自定义 headers
- 更好的错误处理和重连控制

### Backend Pattern

```typescript
app.post('/api/chat', async (req, res) => {
  // SSE headers
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const { message, sessionId } = req.body;

  try {
    // 调用 Agent SDK
    for await (const event of agentResponse) {
      // 发送事件
      res.write(`event: ${event.type}\n`);
      res.write(`data: ${JSON.stringify(event.data)}\n\n`);
    }

    // 完成
    res.write(`event: done\ndata: {"sessionId": "${sessionId}"}\n\n`);
    res.end();
  } catch (error) {
    res.write(`event: error\ndata: ${JSON.stringify({ message: error.message })}\n\n`);
    res.end();
  }
});
```

### Frontend Pattern

```typescript
import { fetchEventSource } from '@microsoft/fetch-event-source';

const sendMessage = async (message: string, sessionId: string) => {
  await fetchEventSource('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, sessionId }),

    onmessage(event) {
      switch (event.event) {
        case 'text':
          appendText(JSON.parse(event.data).content);
          break;
        case 'chart':
          renderChart(JSON.parse(event.data));
          break;
        case 'done':
          setLoading(false);
          break;
      }
    },

    onerror(err) {
      setError('连接中断，请重试');
      throw err;
    }
  });
};
```

### SSE Event Types

| Event | Purpose | Data |
|-------|---------|------|
| `text` | 文本输出 | `{ content: string, isPartial?: boolean }` |
| `tool_call` | 工具调用 | `{ tool: string, args: object }` |
| `tool_result` | 工具结果 | `{ tool: string, result: any }` |
| `chart` | 图表数据 | `ChartConfig` |
| `done` | 完成 | `{ sessionId: string }` |
| `error` | 错误 | `{ message: string }` |

### Alternatives Considered
- WebSocket：双向通信过于复杂，SSE 足够
- 原生 EventSource：不支持 POST 请求

---

## 4. Frontend Tech Stack

### Decision
React 18 + Vite + Ant Design + ECharts

### Rationale
- PRD 已指定技术栈
- Ant Design 提供完整的企业级组件
- ECharts 图表类型丰富，支持 metric 和 table

### Key Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "antd": "^5.x",
    "echarts": "^5.x",
    "echarts-for-react": "^3.x",
    "zustand": "^4.x",
    "@microsoft/fetch-event-source": "^2.x"
  }
}
```

---

## 5. Data Layer

### Decision
SQLite + better-sqlite3 (同步驱动)

### Rationale
- PRD 已指定
- 嵌入式数据库，无需额外服务
- 同步 API 简化 MCP 工具实现

### Key Patterns

```typescript
import Database from 'better-sqlite3';

const db = new Database('./data/ecommerce.db');

// 预编译查询
const querySalesStmt = db.prepare(`
  SELECT
    strftime('%Y-%m', order_purchase_timestamp) as month,
    SUM(price) as total_sales,
    COUNT(DISTINCT order_id) as order_count
  FROM v_order_details
  WHERE order_purchase_timestamp BETWEEN ? AND ?
  GROUP BY month
  ORDER BY month
`);

export function querySales(startDate: string, endDate: string) {
  return querySalesStmt.all(startDate, endDate);
}
```

---

## 6. Session Management

### Decision
内存存储 + Map 数据结构

### Rationale
- MVP 阶段简化实现
- 无需持久化，服务重启清空
- 后续可升级为 Redis

### Key Patterns

```typescript
interface Session {
  id: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

const sessions = new Map<string, Session>();

export function getOrCreateSession(sessionId?: string): Session {
  if (sessionId && sessions.has(sessionId)) {
    return sessions.get(sessionId)!;
  }

  const newSession: Session = {
    id: crypto.randomUUID(),
    messages: [],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  sessions.set(newSession.id, newSession);
  return newSession;
}
```

---

## Summary

| Component | Technology | Notes |
|-----------|------------|-------|
| Agent | Claude Agent SDK | streaming mode + MCP |
| MCP Server | @modelcontextprotocol/sdk | stdio transport |
| Backend | Express 4.x | SSE streaming |
| Frontend | React 18 + Ant Design 5 + ECharts 5 | Vite build |
| State | Zustand | 轻量级 |
| Database | SQLite + better-sqlite3 | 同步 API |
| Session | In-memory Map | MVP 简化 |
