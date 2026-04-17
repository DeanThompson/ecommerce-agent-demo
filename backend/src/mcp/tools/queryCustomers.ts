/**
 * Query Customers MCP Tool
 * Supports customer distribution, repurchase analysis, and value segment analysis
 */

import { queryAll, queryOne } from "../../db/index.js";
import {
  emptyQueryResult,
  normalizeLimit,
  queryTotalCount,
} from "../../db/queryHelpers.js";
import type {
  QueryResult,
  CustomerDistribution,
  RepurchaseAnalysis,
  OrderValueDistribution,
} from "../../types/index.js";

export interface QueryCustomersInput {
  analysis_type: "distribution" | "repurchase" | "value_segment";
  group_by?: "state" | "city";
  filters?: {
    state?: string;
    min_orders?: number;
  };
  limit?: number;
}

export async function queryCustomers(
  params: QueryCustomersInput,
): Promise<
  QueryResult<
  CustomerDistribution[] | RepurchaseAnalysis | OrderValueDistribution[]
  >
> {
  const startTime = Date.now();
  const {
    analysis_type,
    group_by = "state",
    filters = {},
    limit,
  } = params;

  const normalizedLimit = normalizeLimit(limit, 100);

  try {
    switch (analysis_type) {
      case "distribution":
        return await queryDistribution(
          group_by,
          filters,
          normalizedLimit,
          startTime,
        );
      case "repurchase":
        return await queryRepurchase(filters, startTime);
      case "value_segment":
        return await queryValueSegment(filters, normalizedLimit, startTime);
      default:
        return {
          success: false,
          data: [],
          metadata: { query_time_ms: Date.now() - startTime, row_count: 0 },
          error: `Unknown analysis type: ${analysis_type}`,
        };
    }
  } catch (error) {
    console.error("Query customers error:", error);
    return {
      success: false,
      data: [],
      metadata: { query_time_ms: Date.now() - startTime, row_count: 0 },
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

function buildCustomerFilter(
  filters: { state?: string; min_orders?: number },
): { whereClause: string; havingClause: string; params: unknown[] } {
  const conditions: string[] = [];
  const params: unknown[] = [];
  const havingConditions: string[] = [];

  if (filters.state) {
    conditions.push("c.customer_state = ?");
    params.push(filters.state);
  }

  if (typeof filters.min_orders === "number") {
    havingConditions.push("COUNT(DISTINCT o.order_id) >= ?");
    params.push(filters.min_orders);
  }

  return {
    whereClause:
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "",
    havingClause:
      havingConditions.length > 0
        ? `HAVING ${havingConditions.join(" AND ")}`
        : "",
    params,
  };
}

async function queryDistribution(
  groupBy: "state" | "city",
  filters: { state?: string; min_orders?: number },
  limit: number,
  startTime: number,
): Promise<QueryResult<CustomerDistribution[]>> {
  const { whereClause, havingClause, params } = buildCustomerFilter(filters);

  const selectColumns =
    groupBy === "city"
      ? "customer_city as city, customer_state as state"
      : "customer_state as state";
  const groupByColumns = groupBy === "city" ? "city, state" : "state";

  const qualifiedCustomersCte = `
    WITH qualified_customers AS (
      SELECT
        c.customer_unique_id,
        c.customer_city,
        c.customer_state
      FROM customers c
      JOIN orders o ON c.customer_id = o.customer_id
      ${whereClause}
      GROUP BY c.customer_unique_id, c.customer_city, c.customer_state
      ${havingClause}
    )
  `;

  const dataSql = `
    ${qualifiedCustomersCte}
    , total AS (
      SELECT COUNT(DISTINCT customer_unique_id) as total_count
      FROM qualified_customers
    )
    SELECT
      ${selectColumns},
      COUNT(DISTINCT customer_unique_id) as customer_count,
      ROUND(COUNT(DISTINCT customer_unique_id) * 100.0 / (SELECT total_count FROM total), 2) as percentage
    FROM qualified_customers
    GROUP BY ${groupByColumns}
    ORDER BY customer_count DESC
    LIMIT ?
  `;

  const data = await queryAll<CustomerDistribution>(dataSql, [...params, limit]);

  const totalCustomers = await queryTotalCount(
    `
      ${qualifiedCustomersCte}
      SELECT customer_unique_id FROM qualified_customers
    `,
    params,
  );

  if (data.length === 0) {
    return emptyQueryResult<CustomerDistribution>(
      startTime,
      "未找到符合条件的客户分布数据",
      { total_customers: 0 },
    );
  }

  return {
    success: true,
    data,
    summary: { total_customers: totalCustomers },
    metadata: { query_time_ms: Date.now() - startTime, row_count: data.length },
  };
}

async function queryRepurchase(
  filters: { state?: string; min_orders?: number },
  startTime: number,
): Promise<QueryResult<RepurchaseAnalysis>> {
  const { whereClause, havingClause, params } = buildCustomerFilter(filters);

  const sql = `
    WITH customer_orders AS (
      SELECT
        c.customer_unique_id,
        COUNT(DISTINCT o.order_id) as order_count
      FROM customers c
      JOIN orders o ON c.customer_id = o.customer_id
      ${whereClause}
      GROUP BY c.customer_unique_id
      ${havingClause}
    )
    SELECT
      COUNT(*) as total_customers,
      SUM(CASE WHEN order_count > 1 THEN 1 ELSE 0 END) as repurchase_customers,
      ROUND(SUM(CASE WHEN order_count > 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as repurchase_rate,
      ROUND(AVG(order_count), 2) as avg_orders_per_customer
    FROM customer_orders
  `;

  const result = await queryOne<{
    total_customers: number | null;
    repurchase_customers: number | null;
    repurchase_rate: number | null;
    avg_orders_per_customer: number | null;
  }>(sql, params);

  const data: RepurchaseAnalysis = {
    total_customers: Number(result?.total_customers ?? 0),
    repurchase_customers: Number(result?.repurchase_customers ?? 0),
    repurchase_rate: Number(result?.repurchase_rate ?? 0),
    avg_orders_per_customer: Number(result?.avg_orders_per_customer ?? 0),
  };

  if (data.total_customers === 0) {
    return {
      success: true,
      data,
      summary: {
        total_customers: 0,
        repurchase_rate: 0,
      },
      metadata: { query_time_ms: Date.now() - startTime, row_count: 0 },
      message: "未找到符合条件的复购数据",
    };
  }

  return {
    success: true,
    data,
    summary: {
      total_customers: data.total_customers,
      repurchase_rate: data.repurchase_rate,
    },
    metadata: { query_time_ms: Date.now() - startTime, row_count: 1 },
  };
}

async function queryValueSegment(
  filters: { state?: string; min_orders?: number },
  limit: number,
  startTime: number,
): Promise<QueryResult<OrderValueDistribution[]>> {
  const { whereClause, havingClause, params } = buildCustomerFilter(filters);

  const customerValueCte = `
    WITH customer_value AS (
      SELECT
        c.customer_unique_id,
        SUM(oi.price) as total_value
      FROM customers c
      JOIN orders o ON c.customer_id = o.customer_id
      JOIN order_items oi ON o.order_id = oi.order_id
      ${whereClause}
      GROUP BY c.customer_unique_id
      ${havingClause}
    )
  `;

  const sql = `
    ${customerValueCte}
    , total AS (
      SELECT COUNT(*) as total_count FROM customer_value
    )
    SELECT
      CASE
        WHEN total_value < 50 THEN '0-50'
        WHEN total_value < 100 THEN '50-100'
        WHEN total_value < 200 THEN '100-200'
        WHEN total_value < 500 THEN '200-500'
        WHEN total_value < 1000 THEN '500-1000'
        ELSE '1000+'
      END as price_range,
      COUNT(*) as order_count,
      ROUND(COUNT(*) * 100.0 / (SELECT total_count FROM total), 2) as percentage
    FROM customer_value
    GROUP BY price_range
    ORDER BY
      CASE price_range
        WHEN '0-50' THEN 1
        WHEN '50-100' THEN 2
        WHEN '100-200' THEN 3
        WHEN '200-500' THEN 4
        WHEN '500-1000' THEN 5
        ELSE 6
      END
    LIMIT ?
  `;

  const data = await queryAll<OrderValueDistribution>(sql, [...params, limit]);

  const totalCustomers = await queryTotalCount(
    `
      ${customerValueCte}
      SELECT customer_unique_id FROM customer_value
    `,
    params,
  );

  if (data.length === 0) {
    return emptyQueryResult<OrderValueDistribution>(
      startTime,
      "未找到符合条件的客户消费分段数据",
      { total_customers: 0, avg_order_value: 0 },
    );
  }

  const avgResult = await queryOne<{ avg_value: number }>(
    `
      ${customerValueCte}
      SELECT ROUND(AVG(total_value), 2) as avg_value
      FROM customer_value
    `,
    params,
  );

  return {
    success: true,
    data,
    summary: {
      total_customers: totalCustomers,
      avg_order_value: Number(avgResult?.avg_value ?? 0),
    },
    metadata: { query_time_ms: Date.now() - startTime, row_count: data.length },
  };
}
