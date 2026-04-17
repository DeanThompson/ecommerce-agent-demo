# Implementation Plan: 功能扩展 - 多维度查询与可视化

**Branch**: `002-feature-expansion` | **Date**: 2026-02-05 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-feature-expansion/spec.md`

## Summary

本功能扩展在 Spec 1 MVP 框架基础上，添加 4 个新的 MCP 查询工具（query_orders、query_customers、query_reviews、query_sellers）和 1 个趋势分析工具（analyze_trend），同时扩展前端图表组件支持折线图、柱状图和饼图，实现多维度数据分析和可视化能力。

## Technical Context

**Language/Version**: TypeScript 5.3.x (strict mode)
**Primary Dependencies**:
- Backend: Express 4.x, @anthropic-ai/sdk, @modelcontextprotocol/sdk, sql.js, zod
- Frontend: React 18.x, Ant Design 5.x, ECharts 5.x, Zustand 4.x
**Storage**: SQLite (sql.js) - 已有 Olist 数据集 9 张表 + 2 个视图
**Testing**: Vitest (backend), ESLint (both)
**Target Platform**: Web (桌面端浏览器)
**Project Type**: Web application (monorepo: frontend + backend)
**Performance Goals**: 查询响应 < 3 秒，图表交互响应 < 100ms
**Constraints**: 数据量约 10 万订单，无需分布式处理
**Scale/Scope**: 单用户 Demo 项目，5 个 MCP 工具，3 种新图表类型

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Modern Tech Stack | ✅ PASS | TypeScript 5.x, React 18.x, ECharts 5.x 均为当前稳定版本 |
| II. Code Quality Standards | ✅ PASS | 项目已配置 ESLint，将遵循单一职责原则 |
| III. Modular Architecture | ✅ PASS | 前后端分离，MCP 工具独立模块，图表组件独立 |
| IV. Testing Discipline | ✅ PASS | 将为新 MCP 工具添加集成测试 |
| V. API-First Design | ✅ PASS | MCP 工具将先定义 schema，图表配置先定义接口 |

**Gate Result**: PASS - 可进入 Phase 0

## Project Structure

### Documentation (this feature)

```text
specs/002-feature-expansion/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   ├── mcp-tools.md     # MCP 工具 schema 定义
│   └── chart-types.md   # 图表配置接口定义
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── agent/           # Agent 配置
│   ├── db/              # 数据库连接和查询
│   ├── mcp/
│   │   ├── server.ts    # MCP 服务器
│   │   └── tools/
│   │       ├── index.ts         # 工具注册 (已有)
│   │       ├── querySales.ts    # 销售查询 (已有)
│   │       ├── generateChart.ts # 图表生成 (已有)
│   │       ├── queryOrders.ts   # [NEW] 订单查询
│   │       ├── queryCustomers.ts # [NEW] 客户查询
│   │       ├── queryReviews.ts  # [NEW] 评价查询
│   │       ├── querySellers.ts  # [NEW] 卖家查询
│   │       └── analyzeTrend.ts  # [NEW] 趋势分析
│   ├── routes/          # API 路由
│   ├── services/        # 业务服务
│   └── types/           # 类型定义
└── tests/
    └── mcp/             # [NEW] MCP 工具测试

frontend/
├── src/
│   ├── components/
│   │   ├── Charts/
│   │   │   ├── ChartRenderer.tsx  # 图表渲染器 (已有)
│   │   │   ├── MetricCard.tsx     # 数字卡片 (已有)
│   │   │   ├── DataTable.tsx      # 数据表格 (已有)
│   │   │   ├── LineChart.tsx      # [NEW] 折线图
│   │   │   ├── BarChart.tsx       # [NEW] 柱状图
│   │   │   └── PieChart.tsx       # [NEW] 饼图
│   │   ├── Chat/        # 对话组件 (已有)
│   │   ├── Layout/      # 布局组件 (已有)
│   │   └── Session/     # 会话组件 (已有)
│   ├── hooks/           # 自定义 Hooks
│   ├── stores/          # Zustand 状态
│   ├── styles/          # 样式文件
│   └── types/           # 类型定义 (扩展图表类型)
└── tests/               # [NEW] 组件测试
```

**Structure Decision**: 采用现有 Web application 结构，在 backend/src/mcp/tools/ 添加新工具，在 frontend/src/components/Charts/ 添加新图表组件。

## Constitution Check (Post-Design)

*Re-check after Phase 1 design completion.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Modern Tech Stack | ✅ PASS | 使用现有依赖，无新增过时技术 |
| II. Code Quality Standards | ✅ PASS | 合约定义了完整的 TypeScript 类型，无 `any` 类型 |
| III. Modular Architecture | ✅ PASS | 每个 MCP 工具独立文件，图表组件独立，无循环依赖 |
| IV. Testing Discipline | ✅ PASS | 计划为 MCP 工具添加集成测试 |
| V. API-First Design | ✅ PASS | contracts/ 目录定义了完整的 MCP 工具和图表类型合约 |

**Post-Design Gate Result**: PASS - 可进入 Phase 2 (tasks generation)

## Complexity Tracking

> 无 Constitution 违规，无需记录。
