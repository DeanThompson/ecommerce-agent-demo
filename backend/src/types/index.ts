/**
 * Backend Type Definitions
 */

export interface Session {
  id: string;
  agentSessionId?: string;
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

export interface HealthResponse {
  status: "ok" | "degraded" | "error";
  version: string;
  database: "connected" | "disconnected";
  timestamp: Date;
}

export interface QuerySalesInput {
  start_date: string;
  end_date: string;
  group_by?: "day" | "week" | "month" | "year" | "category" | "state" | "city";
  filters?: {
    category?: string;
    state?: string;
    city?: string;
  };
  metrics?: (
    | "total_sales"
    | "order_count"
    | "avg_order_value"
    | "total_freight"
  )[];
  limit?: number;
}

export interface GenerateChartInput {
  chart_type: "metric" | "table" | "line" | "bar" | "pie";
  title: string;
  data: unknown[];
  config?: {
    value?: number;
    unit?: string;
    compareValue?: number;
    compareLabel?: string;
    trend?: "up" | "down";
    columns?: { key: string; title: string; format?: string }[];
    xField?: string;
    yField?: string;
    seriesField?: string;
    smooth?: boolean;
    showArea?: boolean;
    yAxisLabel?: string;
    xAxisLabel?: string;
    horizontal?: boolean;
    showLabel?: boolean;
    barWidth?: number;
    nameField?: string;
    valueField?: string;
    showPercent?: boolean;
    innerRadius?: number;
    legendPosition?: "left" | "right" | "top" | "bottom";
  };
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

export interface OrderStatusDistribution {
  order_status: string;
  count: number;
  percentage: number;
}

export interface DeliveryAnalysis {
  avg_delivery_days: number;
  min_delivery_days: number;
  max_delivery_days: number;
  on_time_count: number;
  overdue_count: number;
  on_time_rate: number;
}

export interface DeliveryByRegion {
  state: string;
  avg_delivery_days: number;
  order_count: number;
}

export interface CustomerDistribution {
  state: string;
  city?: string;
  customer_count: number;
  percentage: number;
}

export interface RepurchaseAnalysis {
  total_customers: number;
  repurchase_customers: number;
  repurchase_rate: number;
  avg_orders_per_customer: number;
}

export interface OrderValueDistribution {
  price_range: string;
  order_count: number;
  percentage: number;
}

export interface ScoreDistribution {
  review_score: number;
  count: number;
  percentage: number;
}

export interface CategoryReviewAnalysis {
  category: string;
  avg_score: number;
  review_count: number;
  bad_review_count: number;
  bad_review_rate: number;
}

export interface MonthlyReviewAnalysis {
  month: string;
  avg_score: number;
  review_count: number;
}

export interface SellerRanking {
  seller_id: string;
  seller_city: string;
  seller_state: string;
  order_count: number;
  total_sales: number;
  avg_score?: number;
}

export interface SellerDistribution {
  state: string;
  seller_count: number;
  percentage: number;
}

export interface TrendDataPoint {
  period: string;
  value: number;
  compare_value?: number;
  change_rate?: number;
}

export interface TrendAnalysisResult {
  metric: string;
  period_type: "daily" | "weekly" | "monthly" | "quarterly";
  data: TrendDataPoint[];
  summary: {
    total: number;
    avg: number;
    max: number;
    min: number;
    overall_change_rate?: number;
  };
}

export interface QueryResult<T> {
  success: boolean;
  data: T[] | T;
  summary?: Record<string, number>;
  metadata: {
    query_time_ms: number;
    row_count: number;
  };
  error?: string;
  message?: string;
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
