# Feature Specification: E-Commerce Insight Agent MVP 框架搭建

**Feature Branch**: `001-mvp-framework`
**Created**: 2026-02-05
**Status**: Draft
**Input**: User description: "E-Commerce Insight Agent MVP - 框架搭建，端到端跑通，能对话、能查询、能出图"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 基础销售数据查询 (Priority: P1)

作为一名运营人员，我想通过自然语言询问销售数据，以便快速了解业务情况而无需编写 SQL。

**Why this priority**: 这是 Agent 能力演示的核心场景，展示自然语言 → 工具调用 → 数据返回的完整链路。

**Independent Test**: 可以通过输入 "2017年销售额是多少" 并验证返回正确的销售数据和数字卡片展示来独立测试。

**Acceptance Scenarios**:

1. **Given** 系统已启动且数据已导入, **When** 用户输入 "2017年销售额是多少", **Then** 系统返回 2017 年的总销售额数字，并以数字卡片形式展示
2. **Given** 系统已启动且数据已导入, **When** 用户输入 "去年各月销售额", **Then** 系统返回按月汇总的销售数据，并以表格形式展示
3. **Given** 系统已启动且数据已导入, **When** 用户输入 "销售额最高的5个品类", **Then** 系统返回 TOP 5 品类及其销售额，并以表格形式展示

---

### User Story 2 - 多轮对话上下文 (Priority: P1)

作为一名分析师，我想在对话中追问细节，系统能理解上下文，以便深入分析问题。

**Why this priority**: 多轮对话是 Agent 的核心能力之一，展示 Claude Agent SDK 的上下文管理能力。

**Independent Test**: 可以通过连续提问并验证系统正确理解上下文指代来独立测试。

**Acceptance Scenarios**:

1. **Given** 用户已询问 "2017年销售额最高的品类是什么", **When** 用户追问 "这个品类的月度趋势呢", **Then** 系统理解 "这个品类" 指代上一轮提到的品类，并返回该品类的月度数据
2. **Given** 用户已进行多轮对话, **When** 用户查看对话历史, **Then** 系统展示完整的对话记录，包括用户问题和 Agent 回答

---

### User Story 3 - 流式响应体验 (Priority: P1)

作为用户，我想实时看到 Agent 的思考和输出过程，以便了解系统正在处理我的请求。

**Why this priority**: SSE 流式响应是核心体验要求，让用户感知系统活跃状态。

**Independent Test**: 可以通过观察响应过程中的实时文字输出来独立测试。

**Acceptance Scenarios**:

1. **Given** 用户发送查询请求, **When** Agent 开始处理, **Then** 用户实时看到文字逐步输出，而非等待全部完成后一次性显示
2. **Given** Agent 正在调用工具, **When** 工具执行中, **Then** 用户看到工具调用状态提示
3. **Given** Agent 返回图表数据, **When** 图表数据就绪, **Then** 图表在对话中正确渲染展示

---

### User Story 4 - 会话管理 (Priority: P2)

作为用户，我想管理我的对话会话，以便开始新对话或查看历史会话。

**Why this priority**: 会话管理是完整框架的一部分，但不是核心演示功能。

**Independent Test**: 可以通过创建新会话、切换会话来独立测试。

**Acceptance Scenarios**:

1. **Given** 用户在对话界面, **When** 用户点击 "新对话", **Then** 系统创建新会话并清空对话区域
2. **Given** 用户有多个历史会话, **When** 用户查看会话列表, **Then** 系统展示会话列表，显示会话创建时间或首条消息摘要
3. **Given** 用户在会话列表中, **When** 用户选择某个历史会话, **Then** 系统加载该会话的完整对话历史

---

### Edge Cases

- 用户输入与数据无关的问题时，Agent 应友好回复无法处理并引导用户提问数据相关问题
- 用户输入的时间范围超出数据集范围（2016-2018）时，系统应提示数据范围限制
- 网络中断导致 SSE 连接断开时，前端应提示用户并支持重新发送
- 用户快速连续发送多条消息时，系统应按顺序处理或提示等待当前请求完成

## Requirements *(mandatory)*

### Functional Requirements

**项目结构**
- **FR-001**: 系统 MUST 采用 monorepo 结构，包含独立的前端和后端项目
- **FR-002**: 系统 MUST 支持前后端独立启动和开发

**数据层**
- **FR-003**: 系统 MUST 使用 SQLite 作为数据存储
- **FR-004**: 系统 MUST 导入 Olist 数据集的全部 9 张表（orders, order_items, products, customers, sellers, order_payments, order_reviews, geolocation, product_category_name_translation）
- **FR-005**: 系统 MUST 创建 v_order_details 和 v_daily_sales 两个预定义视图

**后端框架**
- **FR-006**: 系统 MUST 提供 HTTP API 接口接收用户消息
- **FR-007**: 系统 MUST 使用 SSE (Server-Sent Events) 实现流式响应
- **FR-008**: 系统 MUST 在内存中管理会话状态
- **FR-009**: 系统 MUST 提供健康检查接口

**Agent 集成**
- **FR-010**: 系统 MUST 集成 Claude Agent SDK 处理用户对话
- **FR-011**: 系统 MUST 实现 MCP Server 提供工具能力
- **FR-012**: 系统 MUST 实现 query_sales 工具，支持按时间、品类、地区筛选和聚合销售数据
- **FR-013**: 系统 MUST 实现 generate_chart 工具，支持生成 metric 和 table 两种图表配置

**前端框架**
- **FR-014**: 系统 MUST 提供对话输入界面，支持用户输入自然语言问题
- **FR-015**: 系统 MUST 展示对话消息列表，区分用户消息和 Agent 回复
- **FR-016**: 系统 MUST 处理 SSE 流式响应，实时展示 Agent 输出
- **FR-017**: 系统 MUST 渲染 metric（数字卡片）图表组件
- **FR-018**: 系统 MUST 渲染 table（数据表格）图表组件
- **FR-019**: 系统 MUST 提供会话列表界面，展示历史会话
- **FR-020**: 系统 MUST 支持创建新会话和切换会话

**多轮对话**
- **FR-021**: Claude Agent SDK MUST 管理对话上下文
- **FR-022**: 系统 MUST 记录对话历史用于前端展示

### Key Entities

- **Session（会话）**: 代表一次完整的对话上下文，包含会话 ID、创建时间、更新时间、消息列表
- **Message（消息）**: 代表对话中的单条消息，包含角色（用户/助手）、内容、图表配置、时间戳
- **ChartConfig（图表配置）**: 代表图表渲染所需的配置，包含图表类型、标题、数据、字段映射

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 用户输入销售相关问题后，在 10 秒内开始看到流式响应输出
- **SC-002**: 系统正确返回销售数据查询结果，数据准确率 100%
- **SC-003**: 多轮对话中，Agent 正确理解上下文指代（如 "这个品类"、"上个月"）
- **SC-004**: 图表在对话中正确渲染，数字卡片显示正确的数值和单位
- **SC-005**: 会话切换后，历史对话内容完整加载
- **SC-006**: 系统支持至少 5 个并发会话

## Assumptions

- 数据集使用 Kaggle 公开的 Olist Brazilian E-Commerce 数据集
- 货币单位为巴西雷亚尔 (R$)
- 数据时间范围为 2016年9月 - 2018年8月
- MVP 阶段会话存储在内存中，服务重启后会话丢失
- 仅支持桌面端浏览器，不做响应式布局
- 用户无需登录认证即可使用

## Out of Scope

- 用户认证和权限管理
- 数据写入和修改
- 响应式布局和移动端适配
- 会话持久化存储
- 除 query_sales 外的其他查询工具（query_orders, query_customers 等）
- 除 metric 和 table 外的其他图表类型（line, bar, pie 等）
- 趋势分析、对比分析等高级分析功能

## Dependencies

- Claude Agent SDK
- Olist 数据集（需从 Kaggle 下载）
- Anthropic API Key（用于调用 Claude）
