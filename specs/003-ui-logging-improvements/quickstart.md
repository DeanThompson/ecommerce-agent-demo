# Quickstart: UI Redesign & Backend Logging

**Feature**: 003-ui-logging-improvements
**Date**: 2026-02-05

## Prerequisites

- Node.js 18+
- pnpm 8+
- ANTHROPIC_API_KEY 环境变量

## Quick Setup

```bash
# 1. 切换到功能分支
git checkout 003-ui-logging-improvements

# 2. 安装依赖
pnpm install

# 3. 启动开发服务器
make dev
```

## Development Workflow

### Frontend Development

```bash
# 仅启动前端
cd frontend && pnpm dev

# 前端运行在 http://localhost:5173
```

**关键文件**:
- `frontend/src/App.tsx` - 三栏布局入口
- `frontend/src/components/Layout/` - 布局组件
- `frontend/src/styles/theme.css` - 主题变量
- `frontend/src/stores/chatStore.ts` - Canvas 状态

### Backend Development

```bash
# 仅启动后端
cd backend && pnpm dev

# 后端运行在 http://localhost:3001
# 日志输出到控制台
```

**关键文件**:
- `backend/src/agent/index.ts` - Agent 日志
- `backend/src/utils/logger.ts` - 日志工具
- `backend/src/routes/chat.ts` - 请求日志

## Testing Changes

### UI Changes

1. 打开浏览器访问 `http://localhost:5173`
2. 验证三栏布局正确显示
3. 测试侧边栏折叠/展开
4. 发送消息生成图表，测试 Canvas 面板

### Logging Changes

1. 在终端观察后端日志输出
2. 发送聊天消息，验证以下日志：
   - `AGENT:REQUEST` - 用户消息
   - `AGENT:API_CALL` - API 调用
   - `AGENT:API_RESPONSE` - API 响应
   - `AGENT:TOOL_CALL` - 工具调用
   - `AGENT:TOOL_RESULT` - 工具结果

### Example Log Output

```json
{"timestamp":"2026-02-05T10:30:00.000Z","level":"INFO","category":"AGENT:REQUEST","message":"Received user message","sessionId":"abc123","messagePreview":"帮我分析2017年的销售..."}
{"timestamp":"2026-02-05T10:30:00.100Z","level":"INFO","category":"AGENT:API_CALL","message":"Calling Claude API","model":"claude-sonnet-4","messageCount":2,"toolCount":3}
{"timestamp":"2026-02-05T10:30:01.500Z","level":"INFO","category":"AGENT:API_RESPONSE","message":"Received API response","stopReason":"tool_use","duration":1400}
{"timestamp":"2026-02-05T10:30:01.510Z","level":"INFO","category":"AGENT:TOOL_CALL","message":"Executing tool","toolName":"query_sales"}
{"timestamp":"2026-02-05T10:30:01.600Z","level":"INFO","category":"AGENT:TOOL_RESULT","message":"Tool completed","toolName":"query_sales","success":true,"duration":90}
```

## Code Style

### CSS Variables

```css
/* 使用主题变量 */
.my-component {
  background: var(--bg-primary);
  color: var(--text-primary);
  border-radius: var(--border-radius);
}
```

### Logging

```typescript
import { logger } from '../utils/logger';

// 使用结构化日志
logger.info('AGENT:REQUEST', 'Received user message', {
  sessionId,
  messagePreview: message.slice(0, 100)
});
```

## Common Issues

### Canvas 不显示

1. 检查 `chatStore` 中 `isCanvasOpen` 状态
2. 确认 `canvasContent` 不为 null
3. 检查 CSS transition 是否正确应用

### 日志不输出

1. 确认 `logger.ts` 已正确导入
2. 检查日志级别设置
3. 确认控制台没有被过滤

## Linting & Formatting

```bash
# 运行 lint
make lint

# 运行格式化
pnpm format
```

## Build

```bash
# 构建生产版本
make build

# 输出目录
# - frontend/dist/
# - backend/dist/
```
