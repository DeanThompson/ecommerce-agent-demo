/**
 * Frontend Type Definitions
 */

export interface Session {
  id: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  charts?: ChartConfig[];
  toolCalls?: ToolCall[];
  timestamp: Date;
  isStreaming?: boolean;
}

export interface ToolCall {
  id?: string;
  tool: string;
  args: Record<string, unknown>;
  result?: unknown;
  duration?: number;
  status?: "pending" | "running" | "completed" | "error";
  isCollapsed?: boolean;
}

export type ChartType = "metric" | "table" | "line" | "bar" | "pie";

export interface ChartConfig {
  type: ChartType;
  title: string;
  data: unknown[];
  config?: MetricConfig | TableConfig | LineConfig | BarConfig | PieConfig;
}

export type CanvasContentType = "chart" | "table" | "report";

export interface TableData {
  columns: TableColumn[];
  rows: Record<string, unknown>[];
}

export interface ReportData {
  summary: string;
  sections?: { title: string; content: string }[];
}

export interface CanvasContent {
  type: CanvasContentType;
  title: string;
  data: ChartConfig | TableData | ReportData;
}

export interface MetricConfig {
  value?: number;
  unit?: string;
  compareValue?: number;
  compareLabel?: string;
  trend?: "up" | "down";
}

export interface TableConfig {
  columns?: TableColumn[];
}

export interface TableColumn {
  key: string;
  title: string;
  dataType?: "string" | "number" | "date";
  format?: string;
}

export interface LineConfig {
  xField: string;
  yField: string;
  seriesField?: string;
  smooth?: boolean;
  showArea?: boolean;
  yAxisLabel?: string;
  xAxisLabel?: string;
}

export interface BarConfig {
  xField: string;
  yField: string;
  seriesField?: string;
  horizontal?: boolean;
  showLabel?: boolean;
  yAxisLabel?: string;
  xAxisLabel?: string;
  barWidth?: number;
}

export interface PieConfig {
  nameField: string;
  valueField: string;
  showPercent?: boolean;
  showLabel?: boolean;
  innerRadius?: number;
  legendPosition?: "left" | "right" | "top" | "bottom";
}

export const SSE_EVENT_TYPES = [
  "turn_start",
  "thinking",
  "text_delta",
  "tool_start",
  "tool_input",
  "tool_result",
  "chart",
  "todos",
  "turn_end",
  "done",
  "error",
] as const;

export type SSEEventType = (typeof SSE_EVENT_TYPES)[number];

export interface SSETurnStartEvent {
  turnId: number;
  sessionId?: string;
}

export interface SSEThinkingEvent {
  content: string;
}

export interface SSETextDeltaEvent {
  content: string;
}

export interface SSEToolStartEvent {
  id: string;
  tool: string;
  args?: Record<string, unknown>;
}

export interface SSEToolInputEvent {
  id: string;
  partialInput: string;
}

export interface SSEToolResultEvent {
  id: string;
  tool: string;
  args: Record<string, unknown>;
  result: unknown;
  duration?: number;
}

export interface SSETurnEndEvent {
  turnId: number;
}

export interface TodoItem {
  content: string;
  status: "pending" | "in_progress" | "completed";
  activeForm: string;
}

export type SSETodosEvent = TodoItem[];

export interface SSEDoneEvent {
  sessionId: string;
  totalDuration?: number;
}

export interface SSEErrorEvent {
  code: string;
  message: string;
}

export interface ChatRequest {
  message: string;
  sessionId?: string;
}

export interface SessionSummary {
  id: string;
  title: string;
  messageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SessionListResponse {
  sessions: SessionSummary[];
}

export interface SessionResponse {
  id: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export type ChatItem = ChatUserMessageItem | ChatAssistantMessageItem;

export interface ChatUserMessageItem {
  id: string;
  type: "user_message";
  content: string;
}

export interface ChatAssistantMessageItem {
  id: string;
  type: "assistant_message";
  thinking?: string;
  toolCalls: ToolCallBlock[];
  content: string;
  charts: ChartConfig[];
  isStreaming: boolean;
}

export interface ToolCallBlock {
  id: string;
  tool: string;
  args: Record<string, unknown>;
  result?: unknown;
  duration?: number;
  status: "pending" | "running" | "completed" | "error";
  isCollapsed: boolean;
}

export const LOG_LEVELS = ["DEBUG", "INFO", "WARN", "ERROR"] as const;
export type LogLevel = (typeof LOG_LEVELS)[number];

export const LOG_CATEGORIES = [
  "AGENT:REQUEST",
  "AGENT:API_CALL",
  "AGENT:API_RESPONSE",
  "AGENT:TOOL_CALL",
  "AGENT:TOOL_RESULT",
  "AGENT:MESSAGE",
  "AGENT:COMPLETE",
  "AGENT:ERROR",
  "AGENT:RESUME",
  "AGENT:SESSION_INIT",
  "CHAT:SESSION_INIT",
  "HTTP:REQUEST",
  "HTTP:RESPONSE",
] as const;

export type LogCategory = (typeof LOG_CATEGORIES)[number];

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  category: LogCategory;
  message: string;
  meta?: Record<string, unknown>;
}

export interface ChatState {
  sessionId: string | null;
  items: ChatItem[];
  isLoading: boolean;
  error: string | null;
}
