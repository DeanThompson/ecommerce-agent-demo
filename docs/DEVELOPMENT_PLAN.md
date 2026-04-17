# E-Commerce Insight Agent 开发规划

> 基于 PRD.md 的简化开发方案，采用 SDD (Spec-Driven Development) 模式

## 设计原则

**框架完整，功能最小可用**

- 框架层面：项目结构、数据层、SSE、会话管理等基础设施一次性搭建完整
- 功能层面：MCP 工具、图表类型等可分期迭代添加

## Spec 拆分方案

### Spec 1: 框架搭建 (MVP)

**目标：** 端到端跑通，能对话、能查询、能出图

**范围：**

| 模块 | 内容 |
|------|------|
| 项目结构 | monorepo (pnpm workspace)，frontend + backend |
| 数据层 | SQLite + 全部 9 张表 + 2 个视图，数据导入脚本 |
| 后端框架 | Express + SSE 流式响应 + 会话管理 |
| Agent 集成 | Claude Agent SDK + MCP Server 基础框架 |
| 前端框架 | React + Vite + 对话组件 + SSE 处理 |
| MCP 工具 | `query_sales` + `generate_chart` (2个核心工具) |
| 图表类型 | `metric` (数字卡片) + `table` (数据表格) |

**验收标准：**

- 用户输入 "2017年销售额是多少"
- Agent 调用 query_sales 查询数据
- 返回文字回答 + metric 卡片展示
- 支持多轮对话上下文
- 会话列表可查看

---

### Spec 2: 功能扩展

**目标：** 补齐核心功能，提升分析能力

**范围：**

| 模块 | 内容 |
|------|------|
| MCP 工具 | 添加 `query_orders`, `query_customers`, `query_reviews`, `query_sellers` |
| 图表类型 | 添加 `line` (折线图), `bar` (柱状图), `pie` (饼图) |
| 分析能力 | 添加 `analyze_trend` 趋势分析工具 |

**验收标准：**

- 支持订单、客户、评价、卖家等多维度查询
- 支持时间趋势图表展示
- 支持分类对比图表展示

---

### Spec 3: 体验优化 (可选)

**目标：** 优化用户体验，完善细节

**范围：**

- 会话持久化存储
- 对话历史导出
- 加载状态优化
- 错误处理优化
- 主题/样式美化

---

## 技术决策记录

| 决策 | 选择 | 原因 |
|------|------|------|
| 多轮对话管理 | Claude Agent SDK | SDK 内置管理，应用端只需记录用于展示 |
| 会话存储 | SQLite 持久化 | 支持恢复历史对话并便于回归测试 |
| MCP 工具定义 | 统一 registry | 避免 SDK MCP 与 stdio MCP 工具定义漂移 |
| 响应式布局 | 不做 | Demo 项目，仅支持桌面端 |
| SSE | 需要 | 流式响应是核心体验 |

---

## 维护性补充

- 所有 MCP 工具在 `backend/src/mcp/tools/registry.ts` 定义一次，并由两个 MCP 入口复用。
- 前后端 SSE 事件名与日志分类通过类型常量保持一致，并由回归测试校验。
- 回归测试集中于 `backend/tests/regression/`，用于覆盖跨模块质量问题。

---

## 分支策略

每个 Spec 对应一个 feature 分支：

- `spec-1-mvp-framework`
- `spec-2-feature-expansion`
- `spec-3-ux-optimization`

完成后合并到 `main` 分支。

---

## 参考文档

- [PRD.md](./PRD.md) - 完整产品需求文档
