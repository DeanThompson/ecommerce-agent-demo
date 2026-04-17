# Frontend Design: E-Commerce Insight Agent MVP

**Feature**: 001-mvp-framework
**Date**: 2026-02-05

## 1. 整体布局

### 布局结构

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│ HEADER (56px)                                                                     │
│ ┌──────────────────────────────────────────────────────────────────────────────┐ │
│ │ [Logo] E-Commerce Insight Agent                                              │ │
│ └──────────────────────────────────────────────────────────────────────────────┘ │
├────────────────────┬─────────────────────────────────────────────────────────────┤
│ SIDEBAR (280px)    │ MAIN CONTENT AREA (flex: 1)                                 │
│ ┌────────────────┐ │ ┌─────────────────────────────────────────────────────────┐ │
│ │ [+ 新建对话]   │ │ │ MESSAGE LIST (flex: 1, overflow-y: auto)               │ │
│ ├────────────────┤ │ │                                                        │ │
│ │ 今天           │ │ │   ┌─────────────────────────────────┐                  │ │
│ │ ┌────────────┐ │ │ │   │ USER MESSAGE (右对齐)           │                  │ │
│ │ │ 会话标题    │ │ │ │   │ "2017年销售额是多少？"          │                  │ │
│ │ │ 摘要文字... │ │ │ │   └─────────────────────────────────┘                  │ │
│ │ └────────────┘ │ │ │                                                        │ │
│ │                │ │ │ ┌───────────────────────────────────────────┐          │ │
│ │ 昨天           │ │ │ │ AGENT MESSAGE (左对齐)                    │          │ │
│ │ ┌────────────┐ │ │ │ │ 2017年总销售额为：                        │          │ │
│ │ │ 会话标题    │ │ │ │ │ ┌─────────────────────────────────────┐  │          │ │
│ │ │ 摘要文字... │ │ │ │ │ │ METRIC CARD                         │  │          │ │
│ │ └────────────┘ │ │ │ │ │ R$ 8,234,567.89        ↑ 23.5%       │  │          │ │
│ │                │ │ │ │ └─────────────────────────────────────┘  │          │ │
│ │                │ │ │ └───────────────────────────────────────────┘          │ │
│ │                │ │ ├─────────────────────────────────────────────────────────┤ │
│ │                │ │ │ INPUT AREA (固定底部)                                   │ │
│ │                │ │ │ ┌─────────────────────────────────────────────────────┐ │ │
│ │                │ │ │ │ [TextArea] 输入您的问题...              [发送按钮] │ │ │
│ │                │ │ │ └─────────────────────────────────────────────────────┘ │ │
│ └────────────────┘ │ └─────────────────────────────────────────────────────────┘ │
└────────────────────┴─────────────────────────────────────────────────────────────┘
```

### 尺寸规范

| 区域 | 尺寸 | 说明 |
|------|------|------|
| Header | 56px 高 | 固定顶部 |
| Sidebar | 280px 宽 | 固定左侧 |
| Main Content | flex: 1 | 自适应剩余空间 |
| Input Area | 120px 高 | 固定底部 |
| 最小宽度 | 1200px | 桌面端最小支持 |

---

## 2. 配色方案

### 主色调

```css
:root {
  /* 主色 - 蓝色系 */
  --primary-color: #1677ff;
  --primary-hover: #4096ff;
  --primary-active: #0958d9;

  /* 背景色 */
  --bg-base: #ffffff;
  --bg-layout: #f5f5f5;
  --bg-container: #ffffff;

  /* 文字色 */
  --text-primary: rgba(0, 0, 0, 0.88);
  --text-secondary: rgba(0, 0, 0, 0.65);
  --text-tertiary: rgba(0, 0, 0, 0.45);

  /* 边框色 */
  --border-color: #d9d9d9;
  --border-color-split: #f0f0f0;

  /* 消息气泡 */
  --user-bubble-bg: #1677ff;
  --user-bubble-text: #ffffff;
  --agent-bubble-bg: #f5f5f5;
  --agent-bubble-text: rgba(0, 0, 0, 0.88);

  /* 状态色 */
  --success-color: #52c41a;
  --error-color: #ff4d4f;
  --warning-color: #faad14;
}
```

### 深色模式（可选，MVP 不实现）

```css
[data-theme='dark'] {
  --bg-base: #141414;
  --bg-layout: #1f1f1f;
  --text-primary: rgba(255, 255, 255, 0.85);
}
```

---

## 3. 核心组件设计

### 3.1 SessionList（会话列表）

```tsx
interface SessionListProps {
  sessions: SessionSummary[];
  activeSessionId?: string;
  onSelect: (sessionId: string) => void;
  onNew: () => void;
  onDelete: (sessionId: string) => void;
}
```

**样式规范**:
- 新建按钮：主色填充，圆角 6px
- 会话项：hover 时背景 #f5f5f5
- 选中项：背景 #e6f4ff，左边框 2px 主色
- 分组标题：12px，#999

### 3.2 MessageList（消息列表）

```tsx
interface MessageListProps {
  messages: Message[];
  isLoading?: boolean;
}
```

**样式规范**:
- 消息间距：16px
- 自动滚动到底部
- 加载中显示骨架屏或打字动画

### 3.3 MessageItem（消息项）

```tsx
interface MessageItemProps {
  message: Message;
  isStreaming?: boolean;
}
```

**用户消息样式**:
```css
.user-message {
  display: flex;
  justify-content: flex-end;
}

.user-bubble {
  max-width: 70%;
  padding: 12px 16px;
  background: var(--user-bubble-bg);
  color: var(--user-bubble-text);
  border-radius: 12px 12px 4px 12px;
}
```

**Agent 消息样式**:
```css
.agent-message {
  display: flex;
  justify-content: flex-start;
}

.agent-bubble {
  max-width: 85%;
  padding: 12px 16px;
  background: var(--agent-bubble-bg);
  color: var(--agent-bubble-text);
  border-radius: 12px 12px 12px 4px;
}
```

### 3.4 MetricCard（数字卡片）

```tsx
interface MetricCardProps {
  title: string;
  value: number;
  unit?: string;
  compareValue?: number;
  compareLabel?: string;
  trend?: 'up' | 'down';
}
```

**布局**:
```
┌─────────────────────────────────────┐
│  2017年销售额                        │  <- 标题 (14px, #666)
│                                      │
│  R$ 8,234,567.89                     │  <- 主数值 (32px, 加粗)
│                                      │
│  ↑ 23.5% vs 2016                     │  <- 对比 (14px, 绿色/红色)
└─────────────────────────────────────┘
```

**样式规范**:
```css
.metric-card {
  padding: 16px 20px;
  background: #fafafa;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
  margin: 12px 0;
}

.metric-title {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.metric-value {
  font-size: 32px;
  font-weight: 600;
  color: var(--text-primary);
}

.metric-unit {
  font-size: 16px;
  margin-right: 4px;
}

.metric-compare {
  font-size: 14px;
  margin-top: 8px;
}

.metric-compare.up {
  color: var(--success-color);
}

.metric-compare.down {
  color: var(--error-color);
}
```

### 3.5 DataTable（数据表格）

```tsx
interface DataTableProps {
  title: string;
  columns: TableColumn[];
  data: Record<string, any>[];
}
```

**样式规范**:
- 使用 Ant Design Table 组件
- 紧凑模式 (size="small")
- 斑马纹 (striped)
- 最大高度 400px，超出滚动
- 数字右对齐，货币格式化

```css
.data-table {
  margin: 12px 0;
  border-radius: 8px;
  overflow: hidden;
}

.data-table .ant-table {
  font-size: 13px;
}

.data-table .ant-table-thead > tr > th {
  background: #fafafa;
  font-weight: 500;
}
```

### 3.6 InputArea（输入区域）

```tsx
interface InputAreaProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}
```

**交互规范**:
- Enter 发送消息
- Shift+Enter 换行
- 发送后清空输入框
- 发送中禁用输入和按钮
- 空内容时发送按钮禁用

**样式规范**:
```css
.input-area {
  padding: 16px 24px;
  border-top: 1px solid var(--border-color-split);
  background: var(--bg-base);
}

.input-wrapper {
  display: flex;
  gap: 12px;
  align-items: flex-end;
}

.input-textarea {
  flex: 1;
  min-height: 44px;
  max-height: 120px;
  resize: none;
}

.send-button {
  height: 44px;
  width: 80px;
}
```

---

## 4. 交互细节

### 4.1 流式响应

**打字机效果**:
- 文字逐字显示，间隔 30ms
- 光标闪烁动画

**工具调用状态**:
```
┌─────────────────────────────────────┐
│ 🔧 正在查询销售数据...               │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │  <- 进度条动画
└─────────────────────────────────────┘
```

### 4.2 加载状态

**消息加载中**:
- 显示三个跳动的点 `...`
- 或骨架屏占位

**会话切换**:
- 消息列表显示 Spin 组件
- 输入框禁用

### 4.3 错误处理

**网络错误**:
```
┌─────────────────────────────────────┐
│ ⚠️ 连接中断，请重试                  │
│                        [重新发送]   │
└─────────────────────────────────────┘
```

**Agent 错误**:
- 在消息中显示错误提示
- 红色边框标识

### 4.4 空状态

**无会话**:
```
┌─────────────────────────────────────┐
│                                      │
│         📊 E-Commerce Insight        │
│                                      │
│    开始一个新对话，探索销售数据       │
│                                      │
│         [开始新对话]                 │
│                                      │
└─────────────────────────────────────┘
```

---

## 5. 组件目录结构

```
frontend/src/
├── components/
│   ├── Layout/
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── MainContent.tsx
│   ├── Chat/
│   │   ├── ChatPanel.tsx
│   │   ├── MessageList.tsx
│   │   ├── MessageItem.tsx
│   │   ├── InputArea.tsx
│   │   └── ToolCallStatus.tsx
│   ├── Charts/
│   │   ├── MetricCard.tsx
│   │   ├── DataTable.tsx
│   │   └── ChartRenderer.tsx
│   └── Session/
│       ├── SessionList.tsx
│       └── SessionItem.tsx
├── hooks/
│   ├── useChat.ts
│   ├── useSSE.ts
│   └── useSession.ts
├── stores/
│   └── chatStore.ts
├── types/
│   └── index.ts
├── styles/
│   ├── variables.css
│   └── global.css
├── App.tsx
└── main.tsx
```

---

## 6. Ant Design 组件使用

| 场景 | 组件 |
|------|------|
| 布局 | Layout, Sider, Content |
| 按钮 | Button |
| 输入 | Input.TextArea |
| 表格 | Table |
| 列表 | List |
| 加载 | Spin, Skeleton |
| 消息 | message (toast) |
| 空状态 | Empty |
| 图标 | @ant-design/icons |
