import { z } from "zod";
import {
  querySales,
  getDataDateRange,
  getCategories,
  getStates,
} from "../../db/queries.js";
import { queryOrders } from "./queryOrders.js";
import { analyzeTrend } from "./analyzeTrend.js";
import { queryCustomers } from "./queryCustomers.js";
import { queryReviews } from "./queryReviews.js";
import { querySellers } from "./querySellers.js";
import type { ChartConfig, TodoItem } from "../../types/index.js";

export interface ToolRegistration {
  name: string;
  description: string;
  schema: Record<string, z.ZodTypeAny>;
  handler: (
    args: Record<string, unknown>,
  ) => Promise<{ content: Array<{ type: "text"; text: string }> }>;
}

function asTextResponse(payload: unknown) {
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(payload, null, 2),
      },
    ],
  };
}

const chartConfigSchema = z
  .object({
    value: z.number().optional().describe("主数值（metric类型）"),
    unit: z.string().optional().describe("单位"),
    compareValue: z.number().optional().describe("对比值"),
    compareLabel: z.string().optional().describe("对比标签"),
    trend: z.enum(["up", "down"]).optional().describe("趋势方向"),
    columns: z
      .array(
        z.object({
          key: z.string().describe("字段名"),
          title: z.string().describe("显示名"),
          format: z.string().optional().describe("格式化类型"),
        }),
      )
      .optional()
      .describe("列定义（table类型）"),
    xField: z.string().optional().describe("X轴数据字段"),
    yField: z.string().optional().describe("Y轴数据字段"),
    seriesField: z.string().optional().describe("多系列分组字段"),
    smooth: z.boolean().optional().describe("是否平滑曲线"),
    showArea: z.boolean().optional().describe("是否显示面积"),
    horizontal: z.boolean().optional().describe("是否横向"),
    showLabel: z.boolean().optional().describe("是否显示数值标签"),
    yAxisLabel: z.string().optional().describe("Y轴标签"),
    xAxisLabel: z.string().optional().describe("X轴标签"),
    barWidth: z.number().optional().describe("柱宽"),
    nameField: z.string().optional().describe("名称字段"),
    valueField: z.string().optional().describe("数值字段"),
    showPercent: z.boolean().optional().describe("是否显示百分比"),
    innerRadius: z.number().optional().describe("内半径比例"),
    legendPosition: z
      .enum(["left", "right", "top", "bottom"])
      .optional()
      .describe("图例位置"),
  })
  .optional()
  .describe("图表配置");

export const mcpToolRegistry: ToolRegistration[] = [
  {
    name: "query_sales",
    description:
      "查询销售数据，支持按时间、品类、地区筛选和聚合。数据范围：2016-09 到 2018-08。",
    schema: {
      start_date: z.string().describe("开始日期，格式 YYYY-MM-DD"),
      end_date: z.string().describe("结束日期，格式 YYYY-MM-DD"),
      group_by: z
        .enum(["day", "week", "month", "year", "category", "state", "city"])
        .optional()
        .describe("分组方式"),
      filters: z
        .object({
          category: z.string().optional().describe("品类筛选"),
          state: z.string().optional().describe("州筛选"),
          city: z.string().optional().describe("城市筛选"),
        })
        .optional()
        .describe("筛选条件"),
      metrics: z
        .array(
          z.enum([
            "total_sales",
            "order_count",
            "avg_order_value",
            "total_freight",
          ]),
        )
        .optional()
        .describe("指标列表"),
      limit: z.number().optional().describe("返回记录数限制"),
    },
    handler: async (args) => {
      const result = await querySales({
        start_date: args.start_date as string,
        end_date: args.end_date as string,
        group_by: args.group_by as
          | "day"
          | "week"
          | "month"
          | "year"
          | "category"
          | "state"
          | "city"
          | undefined,
        filters: args.filters as
          | { category?: string; state?: string; city?: string }
          | undefined,
        metrics: args.metrics as
          | (
              | "total_sales"
              | "order_count"
              | "avg_order_value"
              | "total_freight"
            )[]
          | undefined,
        limit: args.limit as number | undefined,
      });
      return asTextResponse(result);
    },
  },
  {
    name: "query_orders",
    description:
      "查询订单数据，支持订单状态分布、配送时效分析、按地区配送分析。数据范围：2016-09 到 2018-08。",
    schema: {
      start_date: z.string().describe("开始日期，格式 YYYY-MM-DD"),
      end_date: z.string().describe("结束日期，格式 YYYY-MM-DD"),
      analysis_type: z
        .enum(["status_distribution", "delivery_analysis", "delivery_by_region"])
        .describe("分析类型"),
      filters: z
        .object({
          status: z.string().optional().describe("订单状态筛选"),
          state: z.string().optional().describe("州筛选"),
        })
        .optional()
        .describe("筛选条件"),
      limit: z.number().optional().describe("返回记录数限制"),
    },
    handler: async (args) => {
      const result = await queryOrders({
        start_date: args.start_date as string,
        end_date: args.end_date as string,
        analysis_type: args.analysis_type as
          | "status_distribution"
          | "delivery_analysis"
          | "delivery_by_region",
        filters: args.filters as { status?: string; state?: string } | undefined,
        limit: args.limit as number | undefined,
      });
      return asTextResponse(result);
    },
  },
  {
    name: "analyze_trend",
    description:
      "分析时间序列趋势，支持按日/周/月/季度聚合，支持同比、环比计算。数据范围：2016-09 到 2018-08。",
    schema: {
      metric: z
        .enum(["sales", "orders", "customers", "avg_score"])
        .describe("指标"),
      period: z
        .enum(["daily", "weekly", "monthly", "quarterly"])
        .describe("时间粒度"),
      start_date: z.string().describe("开始日期，格式 YYYY-MM-DD"),
      end_date: z.string().describe("结束日期，格式 YYYY-MM-DD"),
      compare_with: z
        .enum(["previous_period", "same_period_last_year"])
        .optional()
        .describe("对比方式"),
      filters: z
        .object({
          category: z.string().optional().describe("品类筛选"),
          state: z.string().optional().describe("州筛选"),
        })
        .optional()
        .describe("筛选条件"),
    },
    handler: async (args) => {
      const result = await analyzeTrend({
        metric: args.metric as "sales" | "orders" | "customers" | "avg_score",
        period: args.period as "daily" | "weekly" | "monthly" | "quarterly",
        start_date: args.start_date as string,
        end_date: args.end_date as string,
        compare_with: args.compare_with as
          | "previous_period"
          | "same_period_last_year"
          | undefined,
        filters: args.filters as { category?: string; state?: string } | undefined,
      });
      return asTextResponse(result);
    },
  },
  {
    name: "query_customers",
    description: "查询客户数据，支持地域分布、复购分析、客单价分析。",
    schema: {
      analysis_type: z
        .enum(["distribution", "repurchase", "value_segment"])
        .describe("分析类型"),
      group_by: z
        .enum(["state", "city"])
        .optional()
        .describe("分组方式（distribution类型时使用）"),
      filters: z
        .object({
          state: z.string().optional().describe("州筛选"),
          min_orders: z.number().optional().describe("最小订单数筛选"),
        })
        .optional()
        .describe("筛选条件"),
      limit: z.number().optional().describe("返回记录数限制"),
    },
    handler: async (args) => {
      const result = await queryCustomers({
        analysis_type: args.analysis_type as
          | "distribution"
          | "repurchase"
          | "value_segment",
        group_by: args.group_by as "state" | "city" | undefined,
        filters: args.filters as { state?: string; min_orders?: number } | undefined,
        limit: args.limit as number | undefined,
      });
      return asTextResponse(result);
    },
  },
  {
    name: "query_reviews",
    description: "查询评价数据，支持评分分布、按品类分析、按月分析。",
    schema: {
      score_filter: z
        .object({
          min: z.number().min(1).max(5).optional().describe("最低评分 1-5"),
          max: z.number().min(1).max(5).optional().describe("最高评分 1-5"),
        })
        .optional()
        .describe("评分筛选"),
      group_by: z
        .enum(["score", "category", "month"])
        .optional()
        .describe("分组方式"),
      include_comments: z.boolean().optional().describe("是否包含评论内容"),
      limit: z.number().optional().describe("返回记录数限制"),
    },
    handler: async (args) => {
      const result = await queryReviews({
        score_filter: args.score_filter as { min?: number; max?: number } | undefined,
        group_by: args.group_by as "score" | "category" | "month" | undefined,
        include_comments: args.include_comments as boolean | undefined,
        limit: args.limit as number | undefined,
      });
      return asTextResponse(result);
    },
  },
  {
    name: "query_sellers",
    description: "查询卖家数据，支持卖家排名、地域分布、绩效分析。",
    schema: {
      analysis_type: z
        .enum(["ranking", "distribution", "performance"])
        .describe("分析类型"),
      sort_by: z
        .enum(["sales", "orders", "score"])
        .optional()
        .describe("排序方式（ranking类型时使用）"),
      filters: z
        .object({
          state: z.string().optional().describe("州筛选"),
          min_orders: z.number().optional().describe("最小订单数筛选"),
        })
        .optional()
        .describe("筛选条件"),
      limit: z.number().optional().describe("返回记录数限制"),
    },
    handler: async (args) => {
      const result = await querySellers({
        analysis_type: args.analysis_type as "ranking" | "distribution" | "performance",
        sort_by: args.sort_by as "sales" | "orders" | "score" | undefined,
        filters: args.filters as { state?: string; min_orders?: number } | undefined,
        limit: args.limit as number | undefined,
      });
      return asTextResponse(result);
    },
  },
  {
    name: "generate_chart",
    description:
      "生成图表配置，支持 metric(数字卡片)、table(数据表格)、line(折线图)、bar(柱状图)、pie(饼图) 五种类型。",
    schema: {
      chart_type: z
        .enum(["metric", "table", "line", "bar", "pie"])
        .describe("图表类型"),
      title: z.string().describe("图表标题"),
      data: z.array(z.any()).describe("图表数据"),
      config: chartConfigSchema,
    },
    handler: async (args) => {
      const chart: ChartConfig = {
        type: args.chart_type as ChartConfig["type"],
        title: args.title as string,
        data: args.data as unknown[],
        config: args.config as ChartConfig["config"],
      };

      return asTextResponse({ success: true, chart });
    },
  },
  {
    name: "get_data_info",
    description: "获取数据集信息，包括日期范围、可用品类和州列表。",
    schema: {},
    handler: async () => {
      const dateRange = await getDataDateRange();
      const categories = await getCategories();
      const states = await getStates();
      return asTextResponse({
        date_range: dateRange,
        categories: categories.slice(0, 20),
        states,
        note: "数据来源：Olist Brazilian E-Commerce Dataset",
      });
    },
  },
  {
    name: "todo_write",
    description:
      "管理任务列表，用于规划和跟踪分析任务的进度。当需要执行多步骤分析时，先创建任务列表，然后逐步完成。",
    schema: {
      todos: z
        .array(
          z.object({
            content: z.string().describe("任务内容"),
            status: z
              .enum(["pending", "in_progress", "completed"])
              .describe("任务状态"),
            activeForm: z.string().describe("任务进行时的描述"),
          }),
        )
        .describe("任务列表"),
    },
    handler: async (args) => {
      const todos = args.todos as TodoItem[];
      return asTextResponse({
        success: true,
        todos,
        message: `已更新 ${todos.length} 个任务`,
      });
    },
  },
];
