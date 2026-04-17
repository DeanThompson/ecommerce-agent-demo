/**
 * Query Orders MCP Tool
 * Supports order status distribution, delivery analysis, and delivery by region
 */

import { queryAll, queryOne } from "../../db/index.js";
import { toExclusiveEndDate } from "../../db/dateUtils.js";
import {
  emptyQueryResult,
  normalizeLimit,
  queryTotalCount,
} from "../../db/queryHelpers.js";
import type {
  QueryResult,
  OrderStatusDistribution,
  DeliveryAnalysis,
  DeliveryByRegion,
} from "../../types/index.js";

export interface QueryOrdersInput {
  start_date: string;
  end_date: string;
  analysis_type:
    | "status_distribution"
    | "delivery_analysis"
    | "delivery_by_region";
  filters?: {
    status?: string;
    state?: string;
  };
  limit?: number;
}

export async function queryOrders(
  params: QueryOrdersInput,
): Promise<
  QueryResult<
  OrderStatusDistribution[] | DeliveryAnalysis | DeliveryByRegion[]
  >
> {
  const startTime = Date.now();
  const {
    start_date,
    end_date,
    analysis_type,
    filters = {},
    limit,
  } = params;

  const normalizedLimit = normalizeLimit(limit, 100);

  try {
    switch (analysis_type) {
      case "status_distribution":
        return await queryStatusDistribution(
          start_date,
          end_date,
          filters,
          normalizedLimit,
          startTime,
        );
      case "delivery_analysis":
        return await queryDeliveryAnalysis(
          start_date,
          end_date,
          filters,
          startTime,
        );
      case "delivery_by_region":
        return await queryDeliveryByRegion(
          start_date,
          end_date,
          filters,
          normalizedLimit,
          startTime,
        );
      default:
        return {
          success: false,
          data: [],
          metadata: { query_time_ms: Date.now() - startTime, row_count: 0 },
          error: `Unknown analysis type: ${analysis_type}`,
        };
    }
  } catch (error) {
    console.error("Query orders error:", error);
    return {
      success: false,
      data: [],
      metadata: { query_time_ms: Date.now() - startTime, row_count: 0 },
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

async function queryStatusDistribution(
  start_date: string,
  end_date: string,
  filters: { status?: string; state?: string },
  limit: number,
  startTime: number,
): Promise<QueryResult<OrderStatusDistribution[]>> {
  const endExclusive = toExclusiveEndDate(end_date);
  const conditions: string[] = [
    "o.order_purchase_timestamp >= ?",
    "o.order_purchase_timestamp < ?",
  ];
  const baseParams: unknown[] = [start_date, endExclusive];

  if (filters.status) {
    conditions.push("o.order_status = ?");
    baseParams.push(filters.status);
  }
  if (filters.state) {
    conditions.push("c.customer_state = ?");
    baseParams.push(filters.state);
  }

  const whereClause = conditions.join(" AND ");

  const dataSql = `
    WITH filtered_orders AS (
      SELECT o.order_id, o.order_status
      FROM orders o
      JOIN customers c ON o.customer_id = c.customer_id
      WHERE ${whereClause}
    ),
    total AS (
      SELECT COUNT(*) as total_count FROM filtered_orders
    )
    SELECT
      order_status,
      COUNT(*) as count,
      ROUND(COUNT(*) * 100.0 / (SELECT total_count FROM total), 2) as percentage
    FROM filtered_orders
    GROUP BY order_status
    ORDER BY count DESC
    LIMIT ?
  `;

  const data = await queryAll<OrderStatusDistribution>(dataSql, [
    ...baseParams,
    limit,
  ]);
  const totalOrders = await queryTotalCount(
    `
      SELECT o.order_id
      FROM orders o
      JOIN customers c ON o.customer_id = c.customer_id
      WHERE ${whereClause}
    `,
    baseParams,
  );

  if (data.length === 0) {
    return emptyQueryResult<OrderStatusDistribution>(
      startTime,
      "未找到符合条件的订单状态数据",
      { total_orders: 0 },
    );
  }

  return {
    success: true,
    data,
    summary: { total_orders: totalOrders },
    metadata: { query_time_ms: Date.now() - startTime, row_count: data.length },
  };
}

async function queryDeliveryAnalysis(
  start_date: string,
  end_date: string,
  filters: { status?: string; state?: string },
  startTime: number,
): Promise<QueryResult<DeliveryAnalysis>> {
  const endExclusive = toExclusiveEndDate(end_date);
  const conditions: string[] = [
    "o.order_purchase_timestamp >= ?",
    "o.order_purchase_timestamp < ?",
    "o.order_delivered_customer_date IS NOT NULL",
  ];
  const queryParams: unknown[] = [start_date, endExclusive];

  if (filters.status) {
    conditions.push("o.order_status = ?");
    queryParams.push(filters.status);
  } else {
    conditions.push("o.order_status = 'delivered'");
  }

  if (filters.state) {
    conditions.push("c.customer_state = ?");
    queryParams.push(filters.state);
  }

  const sql = `
    SELECT
      ROUND(AVG(date_diff('day', CAST(o.order_purchase_timestamp AS TIMESTAMP), CAST(o.order_delivered_customer_date AS TIMESTAMP))), 2) as avg_delivery_days,
      ROUND(MIN(date_diff('day', CAST(o.order_purchase_timestamp AS TIMESTAMP), CAST(o.order_delivered_customer_date AS TIMESTAMP))), 2) as min_delivery_days,
      ROUND(MAX(date_diff('day', CAST(o.order_purchase_timestamp AS TIMESTAMP), CAST(o.order_delivered_customer_date AS TIMESTAMP))), 2) as max_delivery_days,
      SUM(CASE WHEN o.order_delivered_customer_date <= o.order_estimated_delivery_date THEN 1 ELSE 0 END) as on_time_count,
      SUM(CASE WHEN o.order_delivered_customer_date > o.order_estimated_delivery_date THEN 1 ELSE 0 END) as overdue_count,
      ROUND(
        SUM(CASE WHEN o.order_delivered_customer_date <= o.order_estimated_delivery_date THEN 1 ELSE 0 END) * 100.0 / COUNT(*),
        2
      ) as on_time_rate
    FROM orders o
    JOIN customers c ON o.customer_id = c.customer_id
    WHERE ${conditions.join(" AND ")}
  `;

  const result = await queryOne<{
    avg_delivery_days: number | null;
    min_delivery_days: number | null;
    max_delivery_days: number | null;
    on_time_count: number | null;
    overdue_count: number | null;
    on_time_rate: number | null;
  }>(sql, queryParams);

  const totalOrders =
    Number(result?.on_time_count ?? 0) + Number(result?.overdue_count ?? 0);

  if (!result || totalOrders === 0) {
    return {
      success: true,
      data: {
        avg_delivery_days: 0,
        min_delivery_days: 0,
        max_delivery_days: 0,
        on_time_count: 0,
        overdue_count: 0,
        on_time_rate: 0,
      },
      summary: {
        total_orders: 0,
        delivered_orders: 0,
        on_time_rate: 0,
      },
      metadata: { query_time_ms: Date.now() - startTime, row_count: 0 },
      message: "未找到符合条件的配送时效数据",
    };
  }

  const data: DeliveryAnalysis = {
    avg_delivery_days: Number(result.avg_delivery_days ?? 0),
    min_delivery_days: Number(result.min_delivery_days ?? 0),
    max_delivery_days: Number(result.max_delivery_days ?? 0),
    on_time_count: Number(result.on_time_count ?? 0),
    overdue_count: Number(result.overdue_count ?? 0),
    on_time_rate: Number(result.on_time_rate ?? 0),
  };

  return {
    success: true,
    data,
    summary: {
      total_orders: totalOrders,
      delivered_orders: totalOrders,
      on_time_rate: data.on_time_rate,
    },
    metadata: { query_time_ms: Date.now() - startTime, row_count: 1 },
  };
}

async function queryDeliveryByRegion(
  start_date: string,
  end_date: string,
  filters: { status?: string; state?: string },
  limit: number,
  startTime: number,
): Promise<QueryResult<DeliveryByRegion[]>> {
  const endExclusive = toExclusiveEndDate(end_date);
  const conditions: string[] = [
    "o.order_purchase_timestamp >= ?",
    "o.order_purchase_timestamp < ?",
    "o.order_delivered_customer_date IS NOT NULL",
  ];
  const baseParams: unknown[] = [start_date, endExclusive];

  if (filters.status) {
    conditions.push("o.order_status = ?");
    baseParams.push(filters.status);
  } else {
    conditions.push("o.order_status = 'delivered'");
  }

  if (filters.state) {
    conditions.push("c.customer_state = ?");
    baseParams.push(filters.state);
  }

  const whereClause = conditions.join(" AND ");

  const sql = `
    SELECT
      c.customer_state as state,
      ROUND(AVG(date_diff('day', CAST(o.order_purchase_timestamp AS TIMESTAMP), CAST(o.order_delivered_customer_date AS TIMESTAMP))), 2) as avg_delivery_days,
      COUNT(*) as order_count
    FROM orders o
    JOIN customers c ON o.customer_id = c.customer_id
    WHERE ${whereClause}
    GROUP BY c.customer_state
    ORDER BY avg_delivery_days DESC
    LIMIT ?
  `;

  const data = await queryAll<DeliveryByRegion>(sql, [...baseParams, limit]);
  const totalOrders = await queryTotalCount(
    `
      SELECT o.order_id
      FROM orders o
      JOIN customers c ON o.customer_id = c.customer_id
      WHERE ${whereClause}
    `,
    baseParams,
  );

  if (data.length === 0) {
    return emptyQueryResult<DeliveryByRegion>(
      startTime,
      "未找到符合条件的配送地区数据",
      { total_orders: 0 },
    );
  }

  return {
    success: true,
    data,
    summary: { total_orders: totalOrders },
    metadata: { query_time_ms: Date.now() - startTime, row_count: data.length },
  };
}
