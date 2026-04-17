# Data Model: UI Redesign & Backend Logging

**Feature**: 003-ui-logging-improvements
**Date**: 2026-02-05

## Overview

本功能主要涉及 UI 重构和日志增强，不引入新的数据库实体。以下是需要扩展的前端状态模型和后端日志模型。

## Frontend State Models

### 1. Canvas State (新增)

Canvas 面板的状态管理，集成到现有的 chatStore。

```typescript
interface CanvasState {
  // Canvas 面板状态
  isCanvasOpen: boolean;
  canvasContent: CanvasContent | null;

  // Actions
  openCanvas: (content: CanvasContent) => void;
  closeCanvas: () => void;
  toggleCanvas: () => void;
}

interface CanvasContent {
  type: 'chart' | 'table' | 'report';
  title: string;
  data: ChartConfig | TableData | ReportData;
}
```

### 2. Sidebar State (新增)

侧边栏折叠状态，独立管理或集成到 UI store。

```typescript
interface SidebarState {
  isCollapsed: boolean;

  // Actions
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
}
```

### 3. Extended Chat Store

扩展现有的 chatStore 以支持 Canvas 功能。

```typescript
// 现有 Message 类型扩展
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  toolCalls?: ToolCall[];
  charts?: ChartConfig[];  // 关联的图表配置
}

// 现有 ChartConfig 保持不变
interface ChartConfig {
  type: 'metric' | 'table' | 'line' | 'bar' | 'pie';
  title: string;
  data: unknown[];
  config?: Record<string, unknown>;
}
```

## Backend Log Models

### 1. LogEntry (新增)

结构化日志条目模型。

```typescript
interface LogEntry {
  timestamp: string;      // ISO 8601 格式
  level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
  category: LogCategory;
  message: string;
  meta?: Record<string, unknown>;
}

type LogCategory =
  | 'AGENT:REQUEST'      // 用户请求接收
  | 'AGENT:API_CALL'     // Claude API 调用
  | 'AGENT:API_RESPONSE' // Claude API 响应
  | 'AGENT:TOOL_CALL'    // 工具调用开始
  | 'AGENT:TOOL_RESULT'  // 工具执行结果
  | 'AGENT:ERROR'        // 错误日志
  | 'HTTP:REQUEST'       // HTTP 请求
  | 'HTTP:RESPONSE';     // HTTP 响应
```

### 2. Log Meta Types

不同日志类别的元数据结构。

```typescript
// AGENT:REQUEST 元数据
interface RequestLogMeta {
  sessionId: string;
  messageLength: number;
  messagePreview: string;  // 前 100 字符
}

// AGENT:API_CALL 元数据
interface ApiCallLogMeta {
  model: string;
  messageCount: number;
  toolCount: number;
  tools: string[];
}

// AGENT:API_RESPONSE 元数据
interface ApiResponseLogMeta {
  stopReason: string;
  contentBlocks: number;
  hasToolUse: boolean;
  duration: number;  // ms
}

// AGENT:TOOL_CALL 元数据
interface ToolCallLogMeta {
  toolName: string;
  inputPreview: string;  // JSON 前 200 字符
}

// AGENT:TOOL_RESULT 元数据
interface ToolResultLogMeta {
  toolName: string;
  success: boolean;
  duration: number;  // ms
  resultPreview: string;  // JSON 前 200 字符
}
```

## State Transitions

### Canvas Panel States

```
[Closed] --openCanvas(content)--> [Open]
[Open] --closeCanvas()--> [Closed]
[Open] --openCanvas(newContent)--> [Open] (内容更新)
```

### Sidebar States

```
[Expanded] --toggleSidebar()--> [Collapsed]
[Collapsed] --toggleSidebar()--> [Expanded]
```

## Validation Rules

### Canvas Content
- `type` 必须是 'chart' | 'table' | 'report' 之一
- `title` 不能为空
- `data` 必须符合对应类型的数据结构

### Log Entry
- `timestamp` 必须是有效的 ISO 8601 格式
- `level` 必须是预定义的级别之一
- `category` 必须是预定义的类别之一
- `message` 不能为空

## Relationships

```
Message 1 ----* ChartConfig (一条消息可以包含多个图表)
CanvasContent 1 ---- 1 ChartConfig (Canvas 一次展示一个内容)
```

## Notes

- 本功能不涉及数据库 schema 变更
- 所有新增模型都是内存状态或日志输出
- 日志不持久化到数据库，仅输出到 stdout
