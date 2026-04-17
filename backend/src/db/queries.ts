/**
 * Predefined SQL Queries
 * Query functions for sales data analysis
 */

import { queryAll, queryOne } from "./index.js";
import { toExclusiveEndDate } from "./dateUtils.js";

export interface QuerySalesParams {
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

export interface SalesResult {
  success: boolean;
  data: Record<string, unknown>[];
  summary?: {
    total_sales?: number;
    total_orders?: number;
    avg_order_value?: number;
  };
  metadata?: {
    query_time_ms: number;
    row_count: number;
  };
}

export async function querySales(params: QuerySalesParams): Promise<SalesResult> {
  const startTime = Date.now();

  const {
    start_date,
    end_date,
    group_by,
    filters = {},
    metrics = ["total_sales", "order_count"],
    limit = 100,
  } = params;

  // Build SELECT clause based on group_by
  let groupColumn: string;
  let groupExpression: string;

  switch (group_by) {
    case "day":
      groupColumn = "period";
      groupExpression =
        "strftime(CAST(order_purchase_timestamp AS DATE), '%Y-%m-%d') as period";
      break;
    case "week":
      groupColumn = "period";
      groupExpression =
        "strftime(CAST(order_purchase_timestamp AS DATE), '%Y-W%V') as period";
      break;
    case "month":
      groupColumn = "period";
      groupExpression =
        "strftime(CAST(order_purchase_timestamp AS DATE), '%Y-%m') as period";
      break;
    case "year":
      groupColumn = "period";
      groupExpression =
        "strftime(CAST(order_purchase_timestamp AS DATE), '%Y') as period";
      break;
    case "category":
      groupColumn = "category";
      groupExpression =
        "COALESCE(category_english, product_category_name, 'Unknown') as category";
      break;
    case "state":
      groupColumn = "state";
      groupExpression = "customer_state as state";
      break;
    case "city":
      groupColumn = "city";
      groupExpression = "customer_city as city";
      break;
    default:
      groupColumn = "";
      groupExpression = "";
  }

  // Build metrics
  const metricExpressions: string[] = [];
  if (metrics.includes("total_sales")) {
    metricExpressions.push("ROUND(SUM(price), 2) as total_sales");
  }
  if (metrics.includes("order_count")) {
    metricExpressions.push("COUNT(DISTINCT order_id) as order_count");
  }
  if (metrics.includes("avg_order_value")) {
    metricExpressions.push("ROUND(AVG(price), 2) as avg_order_value");
  }
  if (metrics.includes("total_freight")) {
    metricExpressions.push("ROUND(SUM(freight_value), 2) as total_freight");
  }

  // Build WHERE clause
  const endExclusive = toExclusiveEndDate(end_date);
  const conditions: string[] = [
    "order_purchase_timestamp >= ?",
    "order_purchase_timestamp < ?",
  ];
  const queryParams: unknown[] = [start_date, endExclusive];

  if (filters.category) {
    conditions.push("(category_english = ? OR product_category_name = ?)");
    queryParams.push(filters.category, filters.category);
  }
  if (filters.state) {
    conditions.push("customer_state = ?");
    queryParams.push(filters.state);
  }
  if (filters.city) {
    conditions.push("customer_city = ?");
    queryParams.push(filters.city);
  }

  // Build query
  let sql: string;
  if (groupExpression) {
    sql = `
      SELECT
        ${groupExpression},
        ${metricExpressions.join(", ")}
      FROM v_order_sales
      WHERE ${conditions.join(" AND ")}
      GROUP BY ${groupColumn}
      ORDER BY ${metrics.includes("total_sales") ? "total_sales DESC" : groupColumn}
      LIMIT ?
    `;
    queryParams.push(limit);
  } else {
    sql = `
      SELECT
        ${metricExpressions.join(", ")}
      FROM v_order_sales
      WHERE ${conditions.join(" AND ")}
    `;
  }

  try {
    const data = await queryAll(sql, queryParams);

    // Calculate summary
    const summarySQL = `
      SELECT
        ROUND(SUM(price), 2) as total_sales,
        COUNT(DISTINCT order_id) as total_orders,
        ROUND(AVG(price), 2) as avg_order_value
      FROM v_order_sales
      WHERE ${conditions.join(" AND ")}
    `;
    const summaryParams = queryParams.slice(
      0,
      groupExpression ? -1 : undefined,
    );
    const summary = await queryOne<{
      total_sales: number;
      total_orders: number;
      avg_order_value: number;
    }>(summarySQL, summaryParams);

    return {
      success: true,
      data,
      summary: summary
        ? {
            total_sales: summary.total_sales,
            total_orders: summary.total_orders,
            avg_order_value: summary.avg_order_value,
          }
        : undefined,
      metadata: {
        query_time_ms: Date.now() - startTime,
        row_count: data.length,
      },
    };
  } catch (error) {
    console.error("Query error:", error);
    return {
      success: false,
      data: [],
      metadata: {
        query_time_ms: Date.now() - startTime,
        row_count: 0,
      },
    };
  }
}

export async function getDataDateRange(): Promise<{
  min_date: string;
  max_date: string;
} | null> {
  try {
    const result = await queryOne<{ min_date: string; max_date: string }>(`
      SELECT
        MIN(DATE(order_purchase_timestamp)) as min_date,
        MAX(DATE(order_purchase_timestamp)) as max_date
      FROM orders
      WHERE order_status = 'delivered'
    `);
    return result;
  } catch {
    return null;
  }
}

export async function getCategories(): Promise<string[]> {
  try {
    const results = await queryAll<{ category: string }>(`
      SELECT DISTINCT
        COALESCE(product_category_name_english, product_category_name) as category
      FROM product_category_name_translation
      WHERE product_category_name_english IS NOT NULL
         OR product_category_name IS NOT NULL
      ORDER BY category
    `);
    return results.map((r) => r.category);
  } catch {
    return [];
  }
}

export async function getStates(): Promise<string[]> {
  try {
    const results = await queryAll<{ state: string }>(`
      SELECT DISTINCT customer_state as state
      FROM customers
      WHERE customer_state IS NOT NULL
      ORDER BY customer_state
    `);
    return results.map((r) => r.state);
  } catch {
    return [];
  }
}
