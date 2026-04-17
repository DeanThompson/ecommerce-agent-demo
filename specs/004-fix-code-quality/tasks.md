# Tasks: Repository Quality Remediation

**Input**: Design documents from `/specs/004-fix-code-quality/`
**Prerequisites**: plan.md (required), spec.md (required for user stories)

**Available design docs**: `plan.md`, `spec.md`  
**Unavailable optional docs at generation time**: `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

**Tests**: Included. The feature explicitly requires repeatable regression validation (FR-011).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `backend/src/`, `backend/tests/`
- **Frontend**: `frontend/src/`
- **Root docs/config**: repository root files and `docs/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare deterministic quality workflow and shared verification scaffolding

- [X] T001 Create feature quickstart validation baseline in specs/004-fix-code-quality/quickstart.md
- [X] T002 [P] Create regression test workspace and conventions in backend/tests/regression/README.md
- [X] T003 [P] Add deterministic CI-oriented command aliases in package.json and backend/package.json
- [X] T004 Add sql.js typing dependency and compile-time type entry points in backend/package.json and backend/tsconfig.json

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build shared primitives required by all quality-remediation stories

**⚠️ CRITICAL**: No user story work should begin until this phase is complete

- [X] T005 Create shared query helper utilities for compatibility and summary computation in backend/src/db/queryHelpers.ts
- [X] T006 Integrate query helper exports and usage boundaries in backend/src/db/index.ts
- [X] T007 Normalize cross-layer SSE/todo event contract definitions in backend/src/types/index.ts and frontend/src/types/index.ts
- [X] T008 Create reusable MCP regression assertion helpers in backend/tests/mcp/helpers.ts
- [X] T009 Ensure non-watch deterministic test execution defaults in backend/package.json and Makefile

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - 恢复可交付基线 (Priority: P1) 🎯 MVP

**Goal**: Restore executable baseline for import, lint, test, and build workflows

**Independent Test**: In a clean checkout, run documented setup and quality-gate commands once and verify they terminate successfully without manual intervention.

### Tests for User Story 1

- [X] T010 [P] [US1] Add regression test for script path consistency in backend/tests/regression/scriptsConsistency.test.ts
- [X] T011 [P] [US1] Add regression test for deterministic test-command mode in backend/tests/regression/testCommandMode.test.ts

### Implementation for User Story 1

- [X] T012 [US1] Fix import-data script path resolution in backend/package.json
- [X] T013 [US1] Align root import-data invocation chain in ./package.json and ./Makefile
- [X] T014 [US1] Add sql.js module declaration for backend compile safety in backend/src/types/sqljs.d.ts
- [X] T015 [US1] Add explicit Express type annotations for app/router exports in backend/src/index.ts, backend/src/routes/chat.ts, backend/src/routes/health.ts, and backend/src/routes/sessions.ts
- [X] T016 [US1] Adjust backend compiler output settings for application build stability in backend/tsconfig.json
- [X] T017 [US1] Remove noisy bootstrap debug prints and standardize startup logging in backend/src/env.ts and backend/src/index.ts
- [X] T018 [US1] Update runnable command docs and filename references in ./README.md and ./CLAUDE.md

**Checkpoint**: Delivery baseline is stable and independently runnable

---

## Phase 4: User Story 2 - 保证分析结果正确一致 (Priority: P2)

**Goal**: Fix analytical correctness issues so filtering, aggregation, and fallback behavior are trustworthy

**Independent Test**: Run targeted MCP regression tests and confirm summary metrics are limit-independent, declared filters are effective, and category analysis remains available under naming differences.

### Tests for User Story 2

- [X] T019 [P] [US2] Add regression tests for limit-independent summaries in backend/tests/mcp/queryOrders.test.ts, backend/tests/mcp/queryCustomers.test.ts, and backend/tests/mcp/querySellers.test.ts
- [X] T020 [P] [US2] Add regression tests for delivery status filter effectiveness in backend/tests/mcp/queryOrders.test.ts
- [X] T021 [P] [US2] Add regression tests for category-translation fallback behavior in backend/tests/mcp/queryReviews.test.ts

### Implementation for User Story 2

- [X] T022 [US2] Implement robust category-translation compatibility fallback in backend/src/mcp/tools/queryReviews.ts
- [X] T023 [US2] Refactor summary calculations to be decoupled from LIMIT in backend/src/mcp/tools/queryOrders.ts, backend/src/mcp/tools/queryCustomers.ts, and backend/src/mcp/tools/querySellers.ts
- [X] T024 [US2] Apply status filter consistently to delivery analysis variants in backend/src/mcp/tools/queryOrders.ts
- [X] T025 [US2] Fix city-distribution ambiguity by grouping on city plus state in backend/src/mcp/tools/queryCustomers.ts
- [X] T026 [US2] Normalize corrected empty-result metadata/messages in backend/src/mcp/tools/queryOrders.ts, backend/src/mcp/tools/queryCustomers.ts, backend/src/mcp/tools/queryReviews.ts, and backend/src/mcp/tools/querySellers.ts

**Checkpoint**: Analytical outputs are consistent and independently verifiable

---

## Phase 5: User Story 3 - 提升长期维护效率 (Priority: P3)

**Goal**: Reduce duplication and contract drift to improve long-term maintainability

**Independent Test**: Verify a single source of tool definitions is used, cross-layer contracts remain aligned, unused modules are removed or integrated, and session listing remains behaviorally correct after optimization.

### Tests for User Story 3

- [X] T027 [P] [US3] Add regression test for backend/frontend event contract parity in backend/tests/regression/sseContractParity.test.ts
- [X] T028 [P] [US3] Add regression test for session list consistency after query optimization in backend/tests/regression/sessionListConsistency.test.ts

### Implementation for User Story 3

- [X] T029 [US3] Create shared MCP tool registry abstraction in backend/src/mcp/tools/registry.ts
- [X] T030 [US3] Refactor SDK MCP and stdio MCP registration to consume shared registry in backend/src/agent/mcpServer.ts, backend/src/mcp/tools/index.ts, and backend/src/mcp/server.ts
- [X] T031 [US3] Align and deduplicate event/log-related contract types in backend/src/types/index.ts and frontend/src/types/index.ts
- [X] T032 [US3] Optimize session listing to remove N+1 query pattern in backend/src/services/sessionStore.ts
- [X] T033 [US3] Remove or integrate currently unused UI modules in frontend/src/components/Charts/ChartRenderer.tsx, frontend/src/components/Chat/ToolCallItem.tsx, and frontend/src/components/Chat/ToolCallStatus.tsx
- [X] T034 [US3] Update architecture and maintenance notes for unified definitions in docs/DEVELOPMENT_PLAN.md and CLAUDE.md

**Checkpoint**: Maintainability improvements are complete and independently testable

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: End-to-end validation and final quality cleanup across all stories

- [X] T035 [P] Run and document targeted backend regression suites in specs/004-fix-code-quality/quickstart.md
- [X] T036 [P] Run and document repository quality gates (`pnpm lint`, `pnpm build`, `pnpm test`) in specs/004-fix-code-quality/quickstart.md
- [X] T037 Perform final consistency/format cleanup for all modified files in backend/, frontend/, docs/, and specs/004-fix-code-quality/
- [X] T038 [P] Validate full quickstart journey from setup to first successful analysis in specs/004-fix-code-quality/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - blocks user stories
- **User Story phases (Phase 3-5)**: Depend on Foundational completion
- **Polish (Phase 6)**: Depends on all user story phases being complete

### User Story Dependencies

- **US1 (P1)**: Can start after Phase 2; recommended MVP scope
- **US2 (P2)**: Can start after Phase 2; independent from US1 in business intent, but benefits from US1 quality-gate fixes
- **US3 (P3)**: Can start after Phase 2; independent from US1/US2 outcomes, but may touch overlapping files so sequencing should avoid conflicts

### Dependency Graph

- **Core graph**: `Phase1 → Phase2 → {US1, US2, US3} → Phase6`
- **Recommended completion order**: `US1 → US2 → US3`
- **Parallel-capable story execution**: `US2 || US3` after US1 stabilizes shared touched files

### Within Each User Story

- Regression tests first (add/adjust and confirm fail before fix)
- Core implementation second
- Story-level validation third
- Mark story complete only when independent test criteria pass

### Parallel Opportunities

- Phase 1 tasks marked `[P]` can run concurrently
- Phase 2 tasks `T007` and `T008` can run concurrently after `T005`
- US1 tests `T010` and `T011` can run in parallel
- US2 tests `T019`, `T020`, `T021` can run in parallel
- US3 tests `T027` and `T028` can run in parallel
- Phase 6 documentation tasks `T035`, `T036`, and `T038` can run in parallel

---

## Parallel Example: User Story 1

```bash
# Parallel regression tests for US1
Task: "Add regression test for script path consistency in backend/tests/regression/scriptsConsistency.test.ts"
Task: "Add regression test for deterministic test-command mode in backend/tests/regression/testCommandMode.test.ts"

# Then implement independent file changes in parallel
Task: "Add sql.js module declaration in backend/src/types/sqljs.d.ts"
Task: "Update docs in README.md and CLAUDE.md"
```

## Parallel Example: User Story 2

```bash
# Parallel regression tests for analytical correctness
Task: "Add limit-independence tests in backend/tests/mcp/queryOrders.test.ts, queryCustomers.test.ts, querySellers.test.ts"
Task: "Add status-filter tests in backend/tests/mcp/queryOrders.test.ts"
Task: "Add category-fallback tests in backend/tests/mcp/queryReviews.test.ts"
```

## Parallel Example: User Story 3

```bash
# Parallel regression tests for maintainability guarantees
Task: "Add event contract parity test in backend/tests/regression/sseContractParity.test.ts"
Task: "Add session list consistency test in backend/tests/regression/sessionListConsistency.test.ts"

# Parallelizable implementation on distinct areas
Task: "Optimize session listing in backend/src/services/sessionStore.ts"
Task: "Update architecture notes in docs/DEVELOPMENT_PLAN.md and CLAUDE.md"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 and Phase 2
2. Complete Phase 3 (US1)
3. Validate US1 independent test criteria
4. Freeze a stable baseline before broader correctness/maintainability changes

### Incremental Delivery

1. Deliver US1 baseline stability
2. Deliver US2 analytical correctness fixes
3. Deliver US3 maintainability refactors
4. Run Phase 6 cross-cutting validation

### Parallel Team Strategy

With multiple contributors:

1. Team completes Setup + Foundational together
2. Contributor A executes US1
3. Contributors B/C split US2 and US3 after US1 baseline merge
4. Team jointly executes Phase 6 validation

---

## Notes

- Every task follows the required checklist format with explicit file paths
- `[P]` marker is used only for tasks with no direct unfinished dependency conflicts
- Story labels are only applied in user story phases (US1/US2/US3)
- Suggested MVP scope: **User Story 1 only**
