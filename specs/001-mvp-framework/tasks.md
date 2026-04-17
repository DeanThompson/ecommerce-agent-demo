# Tasks: E-Commerce Insight Agent MVP

**Input**: Design documents from `/specs/001-mvp-framework/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/ ✓, quickstart.md ✓

**Tests**: Not explicitly requested in spec - test tasks NOT included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Web app (monorepo)**: `backend/src/`, `frontend/src/`
- **Data scripts**: `data/scripts/`
- **Root config**: `package.json`, `pnpm-workspace.yaml`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, monorepo structure, and basic configuration

- [x] T001 Create monorepo root structure with package.json and pnpm-workspace.yaml
- [x] T002 [P] Create backend/package.json with Express, Claude Agent SDK, MCP SDK, better-sqlite3 dependencies
- [x] T003 [P] Create frontend/package.json with React, Ant Design, ECharts, Zustand, fetch-event-source dependencies
- [x] T004 [P] Create backend/tsconfig.json with TypeScript configuration
- [x] T005 [P] Create frontend/tsconfig.json with TypeScript configuration
- [x] T006 [P] Create frontend/vite.config.ts with Vite configuration
- [x] T007 [P] Create .env.example with ANTHROPIC_API_KEY template
- [x] T008 [P] Create frontend/index.html entry point
- [x] T009 [P] Create frontend/src/styles/variables.css with CSS variables
- [x] T010 [P] Create frontend/src/styles/global.css with global styles

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Data Layer

- [x] T011 Create data/scripts/import.ts for CSV to SQLite import
- [x] T012 Create backend/src/db/index.ts with SQLite connection using better-sqlite3
- [x] T013 Create backend/src/db/queries.ts with predefined SQL queries and views (v_order_details, v_daily_sales)
- [x] T014 Create database indexes for performance optimization in backend/src/db/index.ts

### Backend Core

- [x] T015 Create backend/src/types/index.ts with Session, Message, ChartConfig, ToolCall interfaces
- [x] T016 Create backend/src/index.ts with Express server entry point
- [x] T017 Create backend/src/routes/health.ts with health check endpoint (GET /api/health)

### Frontend Core

- [x] T018 Create frontend/src/types/index.ts with Session, Message, ChartConfig, SSE event types
- [x] T019 Create frontend/src/main.tsx with React entry point
- [x] T020 Create frontend/src/App.tsx with basic app structure and Ant Design ConfigProvider

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - 基础销售数据查询 (Priority: P1) 🎯 MVP

**Goal**: 用户通过自然语言询问销售数据，Agent 调用工具查询数据库并返回结果

**Independent Test**: 输入 "2017年销售额是多少" 并验证返回正确的销售数据和数字卡片展示

### MCP Server & Tools

- [x] T021 [US1] Create backend/src/mcp/server.ts with MCP Server setup using @modelcontextprotocol/sdk
- [x] T022 [US1] Create backend/src/mcp/tools/index.ts with tool registration
- [x] T023 [US1] Create backend/src/mcp/tools/querySales.ts with query_sales tool implementation
- [x] T024 [US1] Create backend/src/mcp/tools/generateChart.ts with generate_chart tool implementation

### Agent Integration

- [x] T025 [US1] Create backend/src/agent/systemPrompt.ts with Agent system prompt
- [x] T026 [US1] Create backend/src/agent/index.ts with Claude Agent SDK configuration

### Chat API (SSE)

- [x] T027 [US1] Create backend/src/routes/chat.ts with POST /api/chat SSE endpoint

### Frontend Chat Components

- [x] T028 [P] [US1] Create frontend/src/stores/chatStore.ts with Zustand store for chat state
- [x] T029 [P] [US1] Create frontend/src/hooks/useSSE.ts with SSE connection hook using fetch-event-source
- [x] T030 [US1] Create frontend/src/hooks/useChat.ts with chat logic hook (depends on T028, T029)
- [x] T031 [P] [US1] Create frontend/src/components/Chat/InputArea.tsx with message input component
- [x] T032 [P] [US1] Create frontend/src/components/Chat/MessageItem.tsx with single message display
- [x] T033 [US1] Create frontend/src/components/Chat/MessageList.tsx with message list component
- [x] T034 [US1] Create frontend/src/components/Chat/ChatPanel.tsx with main chat panel

### Chart Components

- [x] T035 [P] [US1] Create frontend/src/components/Charts/MetricCard.tsx with metric display component
- [x] T036 [P] [US1] Create frontend/src/components/Charts/DataTable.tsx with table display using Ant Design Table
- [x] T037 [US1] Create frontend/src/components/Charts/ChartRenderer.tsx with chart type dispatcher

### Layout Integration

- [x] T038 [P] [US1] Create frontend/src/components/Layout/Header.tsx with app header
- [x] T039 [US1] Create frontend/src/components/Layout/MainContent.tsx with main content area
- [x] T040 [US1] Integrate ChatPanel and ChartRenderer into App.tsx

**Checkpoint**: User Story 1 complete - basic sales query with metric/table display works end-to-end

---

## Phase 4: User Story 2 - 多轮对话上下文 (Priority: P1)

**Goal**: 用户在对话中追问细节，系统能理解上下文指代

**Independent Test**: 连续提问 "2017年销售额最高的品类是什么" 然后 "这个品类的月度趋势呢"，验证系统正确理解上下文

### Session Storage

- [x] T041 [US2] Create backend/src/services/sessionStore.ts with in-memory session management (Map)

### Session API

- [x] T042 [US2] Update backend/src/routes/chat.ts to use sessionStore for context management
- [x] T043 [US2] Update backend/src/agent/index.ts to pass conversation history to Claude Agent SDK

### Frontend Context Display

- [x] T044 [US2] Update frontend/src/stores/chatStore.ts to maintain conversation history
- [x] T045 [US2] Update frontend/src/components/Chat/MessageList.tsx to display full conversation history

**Checkpoint**: User Story 2 complete - multi-turn conversation with context understanding works

---

## Phase 5: User Story 3 - 流式响应体验 (Priority: P1)

**Goal**: 用户实时看到 Agent 的思考和输出过程

**Independent Test**: 发送查询请求，观察文字逐步输出而非一次性显示

### Tool Call Status

- [x] T046 [P] [US3] Create frontend/src/components/Chat/ToolCallStatus.tsx with tool call status indicator
- [x] T047 [US3] Update frontend/src/components/Chat/MessageItem.tsx to show tool call status during streaming

### Streaming Enhancement

- [x] T048 [US3] Update frontend/src/hooks/useSSE.ts to handle partial text events (isPartial flag)
- [x] T049 [US3] Update frontend/src/stores/chatStore.ts to support streaming text accumulation
- [x] T050 [US3] Update frontend/src/components/Chat/MessageItem.tsx to render streaming text with typing effect

**Checkpoint**: User Story 3 complete - real-time streaming response with tool call status works

---

## Phase 6: User Story 4 - 会话管理 (Priority: P2)

**Goal**: 用户管理对话会话，创建新对话或查看历史会话

**Independent Test**: 创建新会话、切换会话、查看历史会话列表

### Session API Endpoints

- [x] T051 [US4] Create backend/src/routes/sessions.ts with GET /api/sessions (list), GET /api/sessions/:id (detail), DELETE /api/sessions/:id

### Frontend Session Components

- [x] T052 [P] [US4] Create frontend/src/hooks/useSession.ts with session management hook
- [x] T053 [P] [US4] Create frontend/src/components/Session/SessionItem.tsx with session list item
- [x] T054 [US4] Create frontend/src/components/Session/SessionList.tsx with session list component
- [x] T055 [US4] Create frontend/src/components/Layout/Sidebar.tsx with sidebar containing session list
- [x] T056 [US4] Update frontend/src/App.tsx to integrate Sidebar with session switching

**Checkpoint**: User Story 4 complete - session management with create/switch/history works

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Edge cases, error handling, and final integration

### Error Handling

- [x] T057 [P] Update backend/src/routes/chat.ts to handle edge cases (irrelevant questions, date range limits)
- [x] T058 [P] Update frontend/src/hooks/useSSE.ts to handle connection errors and reconnection

### Final Integration

- [x] T059 Update frontend/src/App.tsx with complete layout (Header, Sidebar, MainContent)
- [x] T060 Run quickstart.md validation - verify all steps work end-to-end

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - US1 (Phase 3): Can start after Foundational
  - US2 (Phase 4): Depends on US1 (needs chat infrastructure)
  - US3 (Phase 5): Depends on US1 (needs SSE infrastructure)
  - US4 (Phase 6): Depends on US2 (needs session storage)
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

```
Phase 1 (Setup)
    ↓
Phase 2 (Foundational)
    ↓
Phase 3 (US1: 基础销售数据查询) ← MVP 核心
    ↓
Phase 4 (US2: 多轮对话上下文) ← 依赖 US1 的 chat 基础设施
    ↓
Phase 5 (US3: 流式响应体验) ← 依赖 US1 的 SSE 基础设施
    ↓
Phase 6 (US4: 会话管理) ← 依赖 US2 的 session 存储
    ↓
Phase 7 (Polish)
```

### Within Each User Story

- Backend before frontend (API must exist before UI can call it)
- MCP tools before Agent (tools must be registered before Agent can use them)
- Stores/hooks before components (state management before UI)
- Core components before integration

### Parallel Opportunities

**Phase 1 (Setup)**:
```bash
# All config files can be created in parallel:
T002, T003, T004, T005, T006, T007, T008, T009, T010
```

**Phase 3 (US1)**:
```bash
# Frontend stores and hooks can be created in parallel:
T028, T029

# Chart components can be created in parallel:
T035, T036

# Input and message item can be created in parallel:
T031, T032
```

**Phase 6 (US4)**:
```bash
# Session hooks and components can be created in parallel:
T052, T053
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test "2017年销售额是多少" query end-to-end
5. Deploy/demo if ready - this is the core MVP!

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → **MVP Demo** (基础查询 + 图表)
3. Add User Story 2 → Test independently → Demo (多轮对话)
4. Add User Story 3 → Test independently → Demo (流式体验)
5. Add User Story 4 → Test independently → Demo (会话管理)
6. Polish → Final validation

### Suggested MVP Scope

**Minimum Viable Demo**: Phase 1 + Phase 2 + Phase 3 (User Story 1)
- 用户可以输入自然语言问题
- Agent 调用 MCP 工具查询数据库
- 返回数据以 metric 或 table 形式展示
- 这已经展示了完整的 Agent → MCP → 数据库 → 图表 链路

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- All user stories are P1 except US4 (P2), but US2/US3 depend on US1 infrastructure
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Data import (T011) requires Olist CSV files in data/raw/ - see quickstart.md
