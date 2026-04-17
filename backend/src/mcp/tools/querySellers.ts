/**
 * Query Sellers MCP Tool
 * Supports seller ranking, distribution, and performance analysis
 */

import { queryAll } from "../../db/index.js";
import {
  emptyQueryResult,
  normalizeLimit,
  queryTotalCount,
} from "../../db/queryHelpers.js";
import type {
  QueryResult,
  SellerRanking,
  SellerDistribution,
} from "../../types/index.js";

export interface QuerySellersInput {
  analysis_type: "ranking" | "distribution" | "performance";
  sort_by?: "sales" | "orders" | "score";
  filters?: {
    state?: string;
    min_orders?: number;
  };
  limit?: number;
}

export async function querySellers(
  params: QuerySellersInput,
): Promise<QueryResult<SellerRanking[] | SellerDistribution[]>> {
  const startTime = Date.now();
  const {
    analysis_type,
    sort_by = "sales",
    filters = {},
    limit,
  } = params;

  const normalizedLimit = normalizeLimit(limit, 100);

  try {
    switch (analysis_type) {
      case "ranking":
        return await queryRanking(sort_by, filters, normalizedLimit, startTime);
      case "distribution":
        return await queryDistribution(filters, normalizedLimit, startTime);
      case "performance":
        return await queryPerformance(filters, normalizedLimit, startTime);
      default:
        return {
          success: false,
          data: [],
          metadata: { query_time_ms: Date.now() - startTime, row_count: 0 },
          error: `Unknown analysis type: ${analysis_type}`,
        };
    }
  } catch (error) {
    console.error("Query sellers error:", error);
    return {
      success: false,
      data: [],
      metadata: { query_time_ms: Date.now() - startTime, row_count: 0 },
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

function buildSellerFilter(
  filters: { state?: string; min_orders?: number },
): { whereClause: string; havingClause: string; params: unknown[] } {
  const conditions: string[] = [];
  const params: unknown[] = [];
  const havingConditions: string[] = [];

  if (filters.state) {
    conditions.push("s.seller_state = ?");
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

async function queryRanking(
  sortBy: "sales" | "orders" | "score",
  filters: { state?: string; min_orders?: number },
  limit: number,
  startTime: number,
): Promise<QueryResult<SellerRanking[]>> {
  const { whereClause, havingClause, params } = buildSellerFilter(filters);

  const orderByClause =
    sortBy === "orders"
      ? "order_count DESC"
      : sortBy === "score"
        ? "avg_score DESC NULLS LAST"
        : "total_sales DESC";

  const baseSql = `
    SELECT
      s.seller_id,
      s.seller_city,
      s.seller_state,
      COUNT(DISTINCT o.order_id) as order_count,
      ROUND(SUM(oi.price), 2) as total_sales,
      ROUND(AVG(r.review_score), 2) as avg_score
    FROM sellers s
    JOIN order_items oi ON s.seller_id = oi.seller_id
    JOIN orders o ON oi.order_id = o.order_id
    LEFT JOIN order_reviews r ON o.order_id = r.order_id
    ${whereClause}
    GROUP BY s.seller_id, s.seller_city, s.seller_state
    ${havingClause}
  `;

  const data = await queryAll<SellerRanking>(
    `${baseSql} ORDER BY ${orderByClause} LIMIT ?`,
    [...params, limit],
  );

  const totalSellers = await queryTotalCount(
    `SELECT seller_id FROM (${baseSql}) ranking_rows`,
    params,
  );

  if (data.length === 0) {
    return emptyQueryResult<SellerRanking>(
      startTime,
      "未找到符合条件的卖家排名数据",
      { total_sellers: 0 },
    );
  }

  return {
    success: true,
    data,
    summary: {
      total_sellers: totalSellers,
    },
    metadata: { query_time_ms: Date.now() - startTime, row_count: data.length },
  };
}

async function queryDistribution(
  filters: { state?: string; min_orders?: number },
  limit: number,
  startTime: number,
): Promise<QueryResult<SellerDistribution[]>> {
  const { whereClause, havingClause, params } = buildSellerFilter(filters);

  const qualifiedSellersCte = `
    WITH qualified_sellers AS (
      SELECT s.seller_id, s.seller_state
      FROM sellers s
      JOIN order_items oi ON s.seller_id = oi.seller_id
      JOIN orders o ON oi.order_id = o.order_id
      ${whereClause}
      GROUP BY s.seller_id, s.seller_state
      ${havingClause}
    )
  `;

  const sql = `
    ${qualifiedSellersCte}
    , total AS (
      SELECT COUNT(DISTINCT seller_id) as total_count
      FROM qualified_sellers
    )
    SELECT
      seller_state as state,
      COUNT(DISTINCT seller_id) as seller_count,
      ROUND(COUNT(DISTINCT seller_id) * 100.0 / (SELECT total_count FROM total), 2) as percentage
    FROM qualified_sellers
    GROUP BY seller_state
    ORDER BY seller_count DESC
    LIMIT ?
  `;

  const data = await queryAll<SellerDistribution>(sql, [...params, limit]);

  const totalSellers = await queryTotalCount(
    `
      ${qualifiedSellersCte}
      SELECT seller_id FROM qualified_sellers
    `,
    params,
  );

  if (data.length === 0) {
    return emptyQueryResult<SellerDistribution>(
      startTime,
      "未找到符合条件的卖家分布数据",
      { total_sellers: 0 },
    );
  }

  return {
    success: true,
    data,
    summary: {
      total_sellers: totalSellers,
    },
    metadata: { query_time_ms: Date.now() - startTime, row_count: data.length },
  };
}

async function queryPerformance(
  filters: { state?: string; min_orders?: number },
  limit: number,
  startTime: number,
): Promise<QueryResult<SellerRanking[]>> {
  const { whereClause, havingClause, params } = buildSellerFilter(filters);

  const baseSql = `
    SELECT
      s.seller_id,
      s.seller_city,
      s.seller_state,
      COUNT(DISTINCT o.order_id) as order_count,
      ROUND(SUM(oi.price), 2) as total_sales,
      ROUND(AVG(r.review_score), 2) as avg_score
    FROM sellers s
    JOIN order_items oi ON s.seller_id = oi.seller_id
    JOIN orders o ON oi.order_id = o.order_id
    LEFT JOIN order_reviews r ON o.order_id = r.order_id
    ${whereClause}
    GROUP BY s.seller_id, s.seller_city, s.seller_state
    ${havingClause}
  `;

  const data = await queryAll<SellerRanking>(
    `${baseSql} ORDER BY avg_score ASC NULLS LAST LIMIT ?`,
    [...params, limit],
  );

  const totalSellers = await queryTotalCount(
    `SELECT seller_id FROM (${baseSql}) performance_rows`,
    params,
  );

  if (data.length === 0) {
    return emptyQueryResult<SellerRanking>(
      startTime,
      "未找到符合条件的卖家绩效数据",
      { total_sellers: 0 },
    );
  }

  return {
    success: true,
    data,
    summary: {
      total_sellers: totalSellers,
    },
    metadata: { query_time_ms: Date.now() - startTime, row_count: data.length },
  };
}
