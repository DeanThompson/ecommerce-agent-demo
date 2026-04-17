# Research: UI Redesign & Backend Logging

**Feature**: 003-ui-logging-improvements
**Date**: 2026-02-05

## Research Tasks

### 1. UI Design Pattern Research

**Task**: 研究 Claude 风格聊天界面的设计模式和最佳实践

**Findings**:

#### Decision: 采用 Claude 官方界面风格的三栏布局

**Rationale**:
- Claude 官方界面已被广泛认可为现代化 AI 聊天界面的标杆
- 三栏布局（侧边栏 | 聊天 | Canvas）是复杂内容展示的最佳实践
- 深色侧边栏 + 浅色主内容区的对比设计提升视觉层次

**Alternatives Considered**:
1. **两栏布局（侧边栏 | 聊天）**: 简单但无法展示复杂内容
2. **全屏聊天 + 弹窗**: 打断用户流程，体验不佳
3. **标签页切换**: 增加认知负担，不如并排展示直观

#### Design Tokens (from mockup)

```css
:root {
  /* Colors */
  --bg-primary: #f9fafb;
  --bg-secondary: #ffffff;
  --bg-sidebar: #1a1a1a;
  --text-primary: #1f2937;
  --text-secondary: #6b7280;
  --accent-color: #d97757;
  --border-color: #e5e7eb;

  /* Spacing */
  --sidebar-width: 260px;
  --canvas-width: 480px;
  --border-radius: 8px;
  --border-radius-lg: 16px;
}
```

---

### 2. CSS Architecture Research

**Task**: 确定 CSS 架构方案，平衡 Ant Design 集成和自定义样式

**Decision**: CSS Variables + Ant Design ConfigProvider 混合方案

**Rationale**:
- CSS Variables 提供全局主题控制，易于维护
- Ant Design ConfigProvider 可以覆盖组件默认样式
- 避免完全抛弃 Ant Design，保留其表单、表格等复杂组件

**Implementation Approach**:
1. 创建 `theme.css` 定义全局 CSS 变量
2. 使用 Ant Design ConfigProvider 设置 token
3. 对需要深度定制的组件使用自定义 CSS

**Alternatives Considered**:
1. **完全自定义 CSS**: 工作量大，需要重写所有组件
2. **CSS-in-JS (styled-components)**: 增加依赖，与 Ant Design 集成复杂
3. **Tailwind CSS**: 需要大量配置，与现有 Ant Design 冲突

---

### 3. Canvas Panel Implementation Research

**Task**: 研究 Canvas 面板的实现方式和动画效果

**Decision**: 使用 CSS transition + Zustand 状态管理

**Rationale**:
- CSS transition 性能好，满足 < 300ms 响应要求
- Zustand 已在项目中使用，无需引入新依赖
- 简单的 width 动画即可实现滑入/滑出效果

**Implementation Details**:
```tsx
// Canvas 状态
interface CanvasState {
  isOpen: boolean;
  content: ChartConfig | null;
  openCanvas: (content: ChartConfig) => void;
  closeCanvas: () => void;
}

// CSS 动画
.canvas-panel {
  width: 0;
  transition: width 0.3s ease;
}
.canvas-panel.open {
  width: 480px;
}
```

**Alternatives Considered**:
1. **Framer Motion**: 功能强大但增加依赖
2. **React Spring**: 同上
3. **Ant Design Drawer**: 样式不符合设计要求

---

### 4. Backend Logging Research

**Task**: 研究 Node.js 日志最佳实践

**Decision**: 使用简单的 console 封装 + 结构化格式

**Rationale**:
- Demo 项目不需要复杂的日志框架
- console 输出足够满足开发调试需求
- 结构化格式便于阅读和后续扩展

**Implementation Approach**:
```typescript
// logger.ts
const logger = {
  info: (category: string, message: string, meta?: object) => {
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'INFO',
      category,
      message,
      ...meta
    }));
  },
  // ... error, debug, etc.
};
```

**Log Categories**:
- `AGENT:REQUEST` - 用户消息接收
- `AGENT:API_CALL` - Claude API 调用
- `AGENT:API_RESPONSE` - Claude API 响应
- `AGENT:TOOL_CALL` - 工具调用
- `AGENT:TOOL_RESULT` - 工具执行结果

**Alternatives Considered**:
1. **Winston**: 功能全面但对 Demo 项目过重
2. **Pino**: 高性能但配置复杂
3. **Debug**: 太简单，不支持结构化输出

---

### 5. Sidebar Collapse Research

**Task**: 研究侧边栏折叠的实现方式

**Decision**: CSS transition + localStorage 持久化

**Rationale**:
- 用户偏好应该被记住
- 简单的 CSS 动画即可实现
- 不需要复杂的状态管理

**Implementation**:
```tsx
// 状态持久化
const [collapsed, setCollapsed] = useState(() => {
  return localStorage.getItem('sidebar-collapsed') === 'true';
});

// CSS
.sidebar {
  width: 260px;
  transition: width 0.2s ease;
}
.sidebar.collapsed {
  width: 60px;
}
```

---

## Summary

所有研究任务已完成，无需进一步澄清。主要技术决策：

| 领域 | 决策 | 依赖 |
|------|------|------|
| UI 设计 | Claude 风格三栏布局 | CSS Variables |
| CSS 架构 | CSS Variables + Ant Design ConfigProvider | 无新依赖 |
| Canvas 面板 | CSS transition + Zustand | 无新依赖 |
| 后端日志 | 简单 console 封装 | 无新依赖 |
| 侧边栏折叠 | CSS transition + localStorage | 无新依赖 |

**关键原则**: 最小化新依赖，充分利用现有技术栈。
