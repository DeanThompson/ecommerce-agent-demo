# Tasks: UI Redesign & Backend Logging

**Input**: Design documents from `/specs/003-ui-logging-improvements/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md

**Tests**: Not explicitly requested - test tasks omitted.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Frontend**: `frontend/src/`
- **Backend**: `backend/src/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create foundational theme and utility files

- [X] T001 [P] Create theme CSS variables file in frontend/src/styles/theme.css
- [X] T002 [P] Create logger utility module in backend/src/utils/logger.ts
- [X] T003 Update Ant Design ConfigProvider theme tokens in frontend/src/App.tsx

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Extend state management to support Canvas and Sidebar

**⚠️ CRITICAL**: User story implementation depends on these state extensions

- [X] T004 Extend chatStore with Canvas state (isCanvasOpen, canvasContent, openCanvas, closeCanvas) in frontend/src/stores/chatStore.ts
- [X] T005 Add Sidebar collapse state with localStorage persistence in frontend/src/stores/chatStore.ts
- [X] T006 Define CanvasContent and LogEntry types in frontend/src/types/index.ts

**Checkpoint**: State management ready - UI components can now be implemented

---

## Phase 3: User Story 1 - Modern Chat Interface (Priority: P1) 🎯 MVP

**Goal**: 实现现代化三栏布局，深色侧边栏 + 浅色聊天区域，参考 Claude 风格

**Independent Test**: 启动前端应用，验证三栏布局正确渲染，视觉风格现代化

### Implementation for User Story 1

- [X] T007 [P] [US1] Refactor Sidebar component with dark theme and collapse support in frontend/src/components/Layout/Sidebar.tsx
- [X] T008 [P] [US1] Refactor Header component with simplified modern design in frontend/src/components/Layout/Header.tsx
- [X] T009 [P] [US1] Refactor MainContent component with proper flex layout in frontend/src/components/Layout/MainContent.tsx
- [X] T010 [US1] Refactor App.tsx with three-column layout structure in frontend/src/App.tsx
- [X] T011 [P] [US1] Refactor MessageItem with modern bubble style (user: accent color, assistant: white) in frontend/src/components/Chat/MessageItem.tsx
- [X] T012 [P] [US1] Refactor InputArea with rounded input box and accent send button in frontend/src/components/Chat/InputArea.tsx
- [X] T013 [US1] Refactor ChatPanel with updated message list styling in frontend/src/components/Chat/ChatPanel.tsx
- [X] T014 [P] [US1] Update ToolCallStatus with modern compact design in frontend/src/components/Chat/ToolCallStatus.tsx
- [X] T015 [US1] Import theme.css in main.tsx and verify styles apply in frontend/src/main.tsx

**Checkpoint**: 三栏布局完成，界面呈现现代化设计风格

---

## Phase 4: User Story 2 - Canvas Panel (Priority: P2)

**Goal**: 实现右侧 Canvas 面板，支持展示图表和数据表格

**Independent Test**: 发送生成图表的查询，点击图表卡片，验证 Canvas 面板正确打开并展示内容

### Implementation for User Story 2

- [X] T016 [US2] Create CanvasPanel component with slide animation in frontend/src/components/Layout/CanvasPanel.tsx
- [X] T017 [US2] Create ChartCard component for clickable chart preview in frontend/src/components/Charts/ChartCard.tsx
- [X] T018 [US2] Integrate CanvasPanel into App.tsx layout in frontend/src/App.tsx
- [X] T019 [US2] Update MessageItem to render ChartCard for chart messages in frontend/src/components/Chat/MessageItem.tsx
- [X] T020 [US2] Connect ChartCard click to openCanvas action in frontend/src/components/Charts/ChartCard.tsx
- [X] T021 [US2] Integrate existing chart components (LineChart, BarChart, PieChart, DataTable) into CanvasPanel in frontend/src/components/Layout/CanvasPanel.tsx

**Checkpoint**: Canvas 面板功能完成，图表可以在右侧面板中展示

---

## Phase 5: User Story 3 - Backend Logging (Priority: P1)

**Goal**: 在 Claude Agent SDK 交互过程中打印详细的结构化日志

**Independent Test**: 发送聊天消息，验证后端控制台输出完整的交互日志

### Implementation for User Story 3

- [X] T022 [US3] Implement logger.info, logger.error, logger.debug methods in backend/src/utils/logger.ts
- [X] T023 [US3] Add AGENT:REQUEST log when receiving user message in backend/src/agent/index.ts
- [X] T024 [US3] Add AGENT:API_CALL log before calling Claude API in backend/src/agent/index.ts
- [X] T025 [US3] Add AGENT:API_RESPONSE log after receiving Claude response in backend/src/agent/index.ts
- [X] T026 [US3] Add AGENT:TOOL_CALL log when executing tool in backend/src/agent/index.ts
- [X] T027 [US3] Add AGENT:TOOL_RESULT log after tool execution completes in backend/src/agent/index.ts
- [X] T028 [US3] Add HTTP:REQUEST log in chat route handler in backend/src/routes/chat.ts

**Checkpoint**: 后端日志功能完成，所有 Agent 交互都有详细日志输出

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: 最终优化和验证

- [ ] T029 [P] Verify responsive layout at 1280px+ screen width
- [ ] T030 [P] Verify Canvas panel open/close animation < 300ms
- [ ] T031 [P] Verify all log categories output correctly
- [ ] T032 Run ESLint and fix any linting errors
- [ ] T033 Run Prettier and format all modified files
- [ ] T034 Manual testing: complete user journey from chat to Canvas display

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - US1 and US3 are both P1, can proceed in parallel
  - US2 depends on US1 layout being complete
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational - No dependencies on other stories
- **User Story 2 (P2)**: Depends on US1 layout structure being complete
- **User Story 3 (P1)**: Can start after Foundational - Independent of frontend stories

### Within Each User Story

- Layout components before content components
- State management before UI components
- Core implementation before integration

### Parallel Opportunities

- T001, T002 can run in parallel (different directories)
- T007, T008, T009 can run in parallel (different files)
- T011, T012, T014 can run in parallel (different files)
- T022-T028 are sequential (same file modifications)
- US1 and US3 can be worked on in parallel (frontend vs backend)

---

## Parallel Example: User Story 1

```bash
# Launch layout components together:
Task: "Refactor Sidebar component in frontend/src/components/Layout/Sidebar.tsx"
Task: "Refactor Header component in frontend/src/components/Layout/Header.tsx"
Task: "Refactor MainContent component in frontend/src/components/Layout/MainContent.tsx"

# Launch chat components together:
Task: "Refactor MessageItem in frontend/src/components/Chat/MessageItem.tsx"
Task: "Refactor InputArea in frontend/src/components/Chat/InputArea.tsx"
Task: "Update ToolCallStatus in frontend/src/components/Chat/ToolCallStatus.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 + 3)

1. Complete Phase 1: Setup (theme.css, logger.ts)
2. Complete Phase 2: Foundational (state extensions)
3. Complete Phase 3: User Story 1 (Modern UI) - **Frontend MVP**
4. Complete Phase 5: User Story 3 (Logging) - **Backend MVP**
5. **STOP and VALIDATE**: Test basic chat with new UI and logging
6. Deploy/demo if ready

### Full Feature Delivery

1. Complete MVP (US1 + US3)
2. Add User Story 2 (Canvas Panel)
3. Complete Phase 6: Polish
4. Final validation and deployment

### Parallel Team Strategy

With two developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Frontend UI)
   - Developer B: User Story 3 (Backend Logging)
3. Developer A continues with User Story 2 (Canvas)
4. Both complete Polish phase

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story
- Each user story is independently testable
- Commit after each task or logical group
- Reference mockup.html for visual design guidance
- Reference research.md for technical decisions
