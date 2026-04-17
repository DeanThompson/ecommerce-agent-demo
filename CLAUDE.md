# E-Commerce Insight Agent

AI-powered data analysis assistant using Claude Agent SDK for natural language querying of Brazilian e-commerce data.

## Tech Stack

- **Backend**: TypeScript 5.3.x (strict), Express 4.x, Claude Agent SDK, MCP, sql.js
- **Frontend**: React 18, Vite 5, Ant Design 5, ECharts 5, Zustand
- **Database**: SQLite (~100k orders, 2016-09 to 2018-08)
- **Package Manager**: pnpm workspace (monorepo)

## Project Structure

```text
backend/src/
  agent/          # Claude Agent SDK integration
  mcp/tools/      # MCP tools for data analysis (registry-driven)
  db/             # SQLite queries (sql.js)
  routes/         # Express API endpoints
frontend/src/
  components/     # Chat, Charts, Layout
  hooks/          # useChat, useSSE, useSession
  stores/         # Zustand state management
data/
  ecommerce.db    # SQLite database
```

## Commands

```bash
make dev          # Start frontend + backend
make test         # Run all tests (deterministic)
make lint         # Lint all code
make import-data  # Import CSV to SQLite
make setup        # Initialize project
```

## Environment

```bash
ANTHROPIC_API_KEY=your-key  # Required
PORT=3001                   # Backend port
```

## Key Patterns

- **MCP Tool Registry**: Single source of truth in `backend/src/mcp/tools/registry.ts`
- **SSE Streaming**: Real-time responses via Server-Sent Events
- **sql.js**: Pure JS SQLite (no native dependencies)
- **Shared Contracts**: Backend/frontend event and logging contracts kept in sync

## Testing

Tests in `backend/tests/` using Vitest.

```bash
pnpm --filter backend test:ci
pnpm --filter backend test:watch
```

## Documentation

- `docs/PRD.md` - Product requirements
- `docs/DEVELOPMENT_PLAN.md` - Development plan
- `specs/` - Feature specifications

## Active Technologies

- TypeScript 5.x (strict mode) (003-ui-logging-improvements)
- SQLite 3.x (sql.js) (003-ui-logging-improvements)

## Recent Changes

- 004-fix-code-quality: Unified MCP tool registry and deterministic test defaults
