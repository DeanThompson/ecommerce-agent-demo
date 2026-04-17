# Implementation Plan: UI Redesign & Backend Logging

**Branch**: `003-ui-logging-improvements` | **Date**: 2026-02-05 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-ui-logging-improvements/spec.md`

## Summary

重新设计前端 UI 为现代化三栏布局（对话列表 | 聊天区域 | Canvas 面板），参考 Claude 官方界面风格。同时增强后端日志功能，在 Claude Agent SDK 交互过程中打印详细的输入输出日志，便于开发调试。

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)
**Primary Dependencies**:
- Frontend: React 18.x, Ant Design 5.x, ECharts 5.x, Zustand 4.x
- Backend: Express 4.x, @anthropic-ai/sdk
**Storage**: SQLite 3.x (sql.js)
**Testing**: Vitest (backend)
**Target Platform**: Web (Desktop-first, 1280px+)
**Project Type**: Web application (frontend + backend monorepo)
**Performance Goals**: Canvas 面板打开/关闭 < 300ms
**Constraints**: 界面在 1280px+ 屏幕上完整显示
**Scale/Scope**: Demo 应用，单用户使用

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Modern Tech Stack | ✅ PASS | 使用 TypeScript 5.x, React 18.x, 符合要求 |
| II. Code Quality Standards | ✅ PASS | 项目已配置 ESLint + Prettier |
| III. Modular Architecture | ✅ PASS | 前后端分离，组件化设计 |
| IV. Testing Discipline | ⚠️ PARTIAL | 后端有 Vitest，前端暂无测试要求 |
| V. API-First Design | ✅ PASS | 现有 API 结构清晰，本次主要是 UI 重构 |

**Gate Result**: PASS - 可以继续 Phase 0

## Project Structure

### Documentation (this feature)

```text
specs/003-ui-logging-improvements/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (N/A - no new APIs)
├── mockup.html          # UI mockup (已创建)
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── agent/
│   │   └── index.ts         # 添加日志功能
│   ├── routes/
│   │   └── chat.ts          # 添加请求日志
│   └── utils/
│       └── logger.ts        # 新增：日志工具模块
└── tests/

frontend/
├── src/
│   ├── components/
│   │   ├── Layout/
│   │   │   ├── Sidebar.tsx      # 重构：深色主题对话列表
│   │   │   ├── MainContent.tsx  # 重构：聊天区域
│   │   │   ├── Header.tsx       # 重构：简化头部
│   │   │   └── CanvasPanel.tsx  # 新增：右侧 Canvas 面板
│   │   ├── Chat/
│   │   │   ├── ChatPanel.tsx    # 重构：现代化消息样式
│   │   │   ├── MessageItem.tsx  # 重构：消息气泡样式
│   │   │   └── InputArea.tsx    # 重构：输入框样式
│   │   └── Charts/              # 保持现有，集成到 Canvas
│   ├── styles/
│   │   └── theme.css            # 新增：全局主题变量
│   ├── stores/
│   │   └── chatStore.ts         # 扩展：Canvas 状态管理
│   └── App.tsx                  # 重构：三栏布局
└── tests/
```

**Structure Decision**: 使用现有的 Web 应用结构（frontend/ + backend/），在现有组件基础上进行重构和扩展。

## Complexity Tracking

> 无违规项，不需要记录
