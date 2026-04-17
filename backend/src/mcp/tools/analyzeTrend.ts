/**
 * Analyze Trend MCP Tool
 * Supports time series analysis with YoY and MoM comparison
 */

import { queryAll } from "../../db/index.js";
import { toExclusiveEndDate } from "../../db/dateUtils.js";
import type { QueryResult, TrendDataPoint } from "../../types/index.js";

export interface AnalyzeTrendInput {
  metric: "sales" | "orders" | "customers" | "avg_score";
  period: "daily" | "weekly" | "monthly" | "quarterly";
  start_date: string;
  end_date: string;
  compare_with?: "previous_period" | "same_period_last_year";
  filters?: {
    category?: string;
    state?: string;
  };
}

interface TrendResult {
  data: TrendDataPoint[];
  summary: {
    total: number;
    avg: number;
    max: number;
    min: number;
    overall_change_rate?: number;
  };
}

export async function analyzeTrend(
  params: AnalyzeTrendInput,
): Promise<QueryResult<TrendResult>> {
  const startTime = Date.now();
  const { metric, period, start_date, end_date, compare_with, filters = {} } =
    params;

  try {
    const periodFormat = getPeriodFormat(period);
    const metricExpression = getMetricExpression(metric);
    const tableName = getTableName(metric);
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

    const sql = `
      SELECT
        ${periodFormat} as period,
        ${metricExpression} as value
      FROM ${tableName}
      WHERE ${conditions.join(" AND ")}
      GROUP BY period
      ORDER BY period
    `;

    const currentData = await queryAll<{ period: string; value: number }>(
      sql,
      queryParams,
    );

    if (currentData.length === 0) {
      return {
        success: true,
        data: { data: [], summary: { total: 0, avg: 0, max: 0, min: 0 } },
        metadata: { query_time_ms: Date.now() - startTime, row_count: 0 },
        message: "指定时间范围内没有趋势数据",
      };
    }

    let trendData: TrendDataPoint[] = currentData.map((d) => ({
      period: d.period,
      value: d.value,
    }));

    if (compare_with && currentData.length > 0) {
      trendData = await calculateComparison(
        currentData,
        compare_with,
        period,
        start_date,
        end_date,
        metricExpression,
        tableName,
        conditions.slice(2),
        queryParams.slice(2),
      );
    }

    const values = trendData.map((d) => d.value);
    const total = values.reduce((sum, v) => sum + v, 0);
    const avg = values.length > 0 ? total / values.length : 0;
    const max = values.length > 0 ? Math.max(...values) : 0;
    const min = values.length > 0 ? Math.min(...values) : 0;

    let overall_change_rate: number | undefined;
    if (trendData.length >= 2) {
      const firstValue = trendData[0].value;
      const lastValue = trendData[trendData.length - 1].value;
      if (firstValue > 0) {
        overall_change_rate =
          Math.round(((lastValue - firstValue) / firstValue) * 100 * 100) / 100;
      }
    }

    return {
      success: true,
      data: {
        data: trendData,
        summary: {
          total: Math.round(total * 100) / 100,
          avg: Math.round(avg * 100) / 100,
          max: Math.round(max * 100) / 100,
          min: Math.round(min * 100) / 100,
          overall_change_rate,
        },
      },
      metadata: {
        query_time_ms: Date.now() - startTime,
        row_count: trendData.length,
      },
    };
  } catch (error) {
    console.error("Analyze trend error:", error);
    return {
      success: false,
      data: { data: [], summary: { total: 0, avg: 0, max: 0, min: 0 } },
      metadata: { query_time_ms: Date.now() - startTime, row_count: 0 },
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

function getPeriodFormat(period: string): string {
  const dateExpr = "CAST(order_purchase_timestamp AS DATE)";
  switch (period) {
    case "daily":
      return `strftime(${dateExpr}, '%Y-%m-%d')`;
    case "weekly":
      return `strftime(${dateExpr}, '%Y-W%V')`;
    case "monthly":
      return `strftime(${dateExpr}, '%Y-%m')`;
    case "quarterly":
      return `strftime(${dateExpr}, '%Y') || '-Q' || CAST(date_part('quarter', ${dateExpr}) AS INTEGER)`;
    default:
      return `strftime(${dateExpr}, '%Y-%m')`;
  }
}

function getMetricExpression(metric: string): string {
  switch (metric) {
    case "sales":
      return "ROUND(SUM(price), 2)";
    case "orders":
      return "COUNT(DISTINCT order_id)";
    case "customers":
      return "COUNT(DISTINCT customer_unique_id)";
    case "avg_score":
      return "ROUND(AVG(review_score), 2)";
    default:
      return "ROUND(SUM(price), 2)";
  }
}

function getTableName(metric: string): string {
  return metric === "avg_score" ? "v_order_details" : "v_order_sales";
}

async function calculateComparison(
  currentData: { period: string; value: number }[],
  compareWith: "previous_period" | "same_period_last_year",
  period: string,
  startDate: string,
  endDate: string,
  metricExpression: string,
  tableName: string,
  extraConditions: string[],
  extraParams: unknown[],
): Promise<TrendDataPoint[]> {
  const periodFormat = getPeriodFormat(period);

  const startDateObj = new Date(startDate);
  const endDateObj = new Date(endDate);
  const daysDiff = Math.ceil(
    (endDateObj.getTime() - startDateObj.getTime()) / (1000 * 60 * 60 * 24),
  );

  let compareStartDate: string;
  let compareEndDate: string;

  if (compareWith === "same_period_last_year") {
    const compareStart = new Date(startDateObj);
    compareStart.setFullYear(compareStart.getFullYear() - 1);
    const compareEnd = new Date(endDateObj);
    compareEnd.setFullYear(compareEnd.getFullYear() - 1);
    compareStartDate = compareStart.toISOString().split("T")[0];
    compareEndDate = compareEnd.toISOString().split("T")[0];
  } else {
    const compareEnd = new Date(startDateObj);
    compareEnd.setDate(compareEnd.getDate() - 1);
    const compareStart = new Date(compareEnd);
    compareStart.setDate(compareStart.getDate() - daysDiff);
    compareStartDate = compareStart.toISOString().split("T")[0];
    compareEndDate = compareEnd.toISOString().split("T")[0];
  }

  const compareEndExclusive = toExclusiveEndDate(compareEndDate);
  const conditions: string[] = [
    "order_purchase_timestamp >= ?",
    "order_purchase_timestamp < ?",
    ...extraConditions,
  ];
  const queryParams: unknown[] = [
    compareStartDate,
    compareEndExclusive,
    ...extraParams,
  ];

  const sql = `
    SELECT
      ${periodFormat} as period,
      ${metricExpression} as value
    FROM ${tableName}
    WHERE ${conditions.join(" AND ")}
    GROUP BY period
    ORDER BY period
  `;

  const compareData = await queryAll<{ period: string; value: number }>(
    sql,
    queryParams,
  );

  const compareMap = new Map<string, number>();
  compareData.forEach((d) => {
    if (compareWith === "same_period_last_year") {
      const adjustedPeriod = adjustPeriodYear(d.period, 1);
      compareMap.set(adjustedPeriod, d.value);
    } else {
      compareMap.set(d.period, d.value);
    }
  });

  return currentData.map((d, index) => {
    let compareValue: number | undefined;
    let changeRate: number | undefined;

    if (compareWith === "same_period_last_year") {
      compareValue = compareMap.get(d.period);
    } else if (index < compareData.length) {
      compareValue = compareData[index].value;
    }

    if (compareValue !== undefined && compareValue > 0) {
      changeRate =
        Math.round(((d.value - compareValue) / compareValue) * 100 * 100) / 100;
    }

    return {
      period: d.period,
      value: d.value,
      compare_value: compareValue,
      change_rate: changeRate,
    };
  });
}

function adjustPeriodYear(period: string, yearsToAdd: number): string {
  if (period.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const date = new Date(period);
    date.setFullYear(date.getFullYear() + yearsToAdd);
    return date.toISOString().split("T")[0];
  }
  if (period.match(/^\d{4}-W\d{2}$/)) {
    const year = parseInt(period.substring(0, 4), 10) + yearsToAdd;
    return `${year}${period.substring(4)}`;
  }
  if (period.match(/^\d{4}-\d{2}$/)) {
    const year = parseInt(period.substring(0, 4), 10) + yearsToAdd;
    return `${year}${period.substring(4)}`;
  }
  if (period.match(/^\d{4}-Q\d$/)) {
    const year = parseInt(period.substring(0, 4), 10) + yearsToAdd;
    return `${year}${period.substring(4)}`;
  }
  return period;
}
