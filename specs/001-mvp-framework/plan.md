# Implementation Plan: E-Commerce Insight Agent MVP

**Branch**: `001-mvp-framework` | **Date**: 2026-02-05 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-mvp-framework/spec.md`

## Summary

构建电商数据分析智能助手 MVP，实现端到端的对话式数据查询功能。用户通过自然语言提问，Agent 调用 MCP 工具查询 SQLite 数据库，返回数据和图表。

**核心技术方案**:
- Claude Agent SDK (streaming mode) + MCP Server 实现 Agent 能力
- Express + SSE 实现流式响应
- React + Ant Design + ECharts 实现前端
- SQLite + better-sqlite3 实现数据层

## Technical Context

**Language/Version**: TypeScript 5.x, Node.js 18+
**Primary Dependencies**:
- Backend: Express 4.x, @anthropic-ai/claude-agent-sdk, @modelcontextprotocol/sdk, better-sqlite3
- Frontend: React 18.x, Ant Design 5.x, ECharts 5.x, Zustand 4.x, @microsoft/fetch-event-source
**Storage**: SQLite 3.x (嵌入式)
**Testing**: Vitest (单元测试), Playwright (E2E)
**Target Platform**: 桌面端浏览器 (Chrome, Firefox, Safari)
**Project Type**: Web application (monorepo: frontend + backend)
**Performance Goals**: 流式响应首字节 < 10s
**Constraints**: 仅桌面端，无响应式；会话内存存储，重启丢失
**Scale/Scope**: Demo 项目，单用户，~100k 订单数据

## Constitution Check

*GATE: 项目无 constitution.md 定义，跳过检查*

✅ 无违规项

## Project Structure

### Documentation (this feature)

```text
specs/001-mvp-framework/
├── plan.md              # 本文件
├── spec.md              # 功能规格
├── research.md          # 技术研究
├── data-model.md        # 数据模型
├── frontend-design.md   # 前端设计
├── quickstart.md        # 快速启动指南
├── contracts/
│   ├── api.yaml         # OpenAPI 规范
│   └── sse-events.md    # SSE 事件契约
├── checklists/
│   └── requirements.md  # 需求检查清单
└── tasks.md             # 任务列表 (由 /speckit.tasks 生成)
```

### Source Code (repository root)

```text
ecommerce-agent/
├── backend/                           # 后端项目
│   ├── src/
│   │   ├── agent/
│   │   │   ├── index.ts               # Agent 配置
│   │   │   └── systemPrompt.ts        # 系统提示词
│   │   ├── mcp/
│   │   │   ├── server.ts              # MCP 服务器
│   │   │   └── tools/
│   │   │       ├── index.ts           # 工具注册
│   │   │       ├── querySales.ts      # 销售查询工具
│   │   │       └── generateChart.ts   # 图表生成工具
│   │   ├── db/
│   │   │   ├── index.ts               # 数据库连接
│   │   │   └── queries.ts             # 预定义查询
│   │   ├── routes/
│   │   │   ├── chat.ts                # 对话路由 (SSE)
│   │   │   ├── sessions.ts            # 会话路由
│   │   │   └── health.ts              # 健康检查
│   │   ├── services/
│   │   │   └── sessionStore.ts        # 会话存储
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── index.ts                   # 入口文件
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                          # 前端项目
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout/
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   └── MainContent.tsx
│   │   │   ├── Chat/
│   │   │   │   ├── ChatPanel.tsx
│   │   │   │   ├── MessageList.tsx
│   │   │   │   ├── MessageItem.tsx
│   │   │   │   ├── InputArea.tsx
│   │   │   │   └── ToolCallStatus.tsx
│   │   │   ├── Charts/
│   │   │   │   ├── MetricCard.tsx
│   │   │   │   ├── DataTable.tsx
│   │   │   │   └── ChartRenderer.tsx
│   │   │   └── Session/
│   │   │       ├── SessionList.tsx
│   │   │       └── SessionItem.tsx
│   │   ├── hooks/
│   │   │   ├── useChat.ts
│   │   │   ├── useSSE.ts
│   │   │   └── useSession.ts
│   │   ├── stores/
│   │   │   └── chatStore.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── styles/
│   │   │   ├── variables.css
│   │   │   └── global.css
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── data/
│   ├── raw/                           # 原始 CSV 文件
│   ├── ecommerce.db                   # SQLite 数据库
│   └── scripts/
│       └── import.ts                  # 数据导入脚本
│
├── package.json                       # 根目录 package.json
├── pnpm-workspace.yaml                # pnpm workspace 配置
└── .env.example                       # 环境变量模板
```

**Structure Decision**: 采用 Web application 结构 (Option 2)，使用 pnpm workspace 管理 monorepo，frontend 和 backend 作为独立包。

## Complexity Tracking

无违规项，无需记录。

## Related Documents

| 文档 | 说明 |
|------|------|
| [spec.md](./spec.md) | 功能规格 - 用户故事、需求、验收标准 |
| [research.md](./research.md) | 技术研究 - Claude Agent SDK, MCP, SSE 最佳实践 |
| [data-model.md](./data-model.md) | 数据模型 - 实体定义、表结构、验证规则 |
| [frontend-design.md](./frontend-design.md) | 前端设计 - 布局、组件、配色、交互 |
| [quickstart.md](./quickstart.md) | 快速启动 - 环境配置、启动步骤 |
| [contracts/api.yaml](./contracts/api.yaml) | API 契约 - OpenAPI 规范 |
| [contracts/sse-events.md](./contracts/sse-events.md) | SSE 事件契约 - 事件类型和格式 |

## Next Steps

运行 `/speckit.tasks` 生成详细任务列表。
