/**
 * Query Reviews MCP Tool
 * Supports score distribution, category analysis, and monthly analysis
 */

import { queryAll, queryOne } from "../../db/index.js";
import {
  emptyQueryResult,
  normalizeLimit,
} from "../../db/queryHelpers.js";
import type {
  QueryResult,
  ScoreDistribution,
  CategoryReviewAnalysis,
  MonthlyReviewAnalysis,
} from "../../types/index.js";

export interface QueryReviewsInput {
  score_filter?: {
    min?: number;
    max?: number;
  };
  group_by?: "score" | "category" | "month";
  include_comments?: boolean;
  limit?: number;
}

export async function queryReviews(
  params: QueryReviewsInput,
): Promise<
  QueryResult<
  ScoreDistribution[] | CategoryReviewAnalysis[] | MonthlyReviewAnalysis[]
  >
> {
  const startTime = Date.now();
  const { score_filter, group_by = "score", limit } = params;

  const normalizedLimit = normalizeLimit(limit, 100);

  try {
    switch (group_by) {
      case "score":
        return await queryScoreDistribution(
          score_filter,
          normalizedLimit,
          startTime,
        );
      case "category":
        return await queryCategoryAnalysis(
          score_filter,
          normalizedLimit,
          startTime,
        );
      case "month":
        return await queryMonthlyAnalysis(
          score_filter,
          normalizedLimit,
          startTime,
        );
      default:
        return await queryScoreDistribution(
          score_filter,
          normalizedLimit,
          startTime,
        );
    }
  } catch (error) {
    console.error("Query reviews error:", error);
    return {
      success: false,
      data: [],
      metadata: { query_time_ms: Date.now() - startTime, row_count: 0 },
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

function buildReviewScoreFilter(scoreFilter: { min?: number; max?: number } | undefined): {
  whereClause: string;
  params: unknown[];
} {
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (scoreFilter?.min !== undefined) {
    conditions.push("review_score >= ?");
    params.push(scoreFilter.min);
  }

  if (scoreFilter?.max !== undefined) {
    conditions.push("review_score <= ?");
    params.push(scoreFilter.max);
  }

  return {
    whereClause:
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "",
    params,
  };
}

async function queryScoreDistribution(
  scoreFilter: { min?: number; max?: number } | undefined,
  limit: number,
  startTime: number,
): Promise<QueryResult<ScoreDistribution[]>> {
  const { whereClause, params } = buildReviewScoreFilter(scoreFilter);

  const sql = `
    WITH filtered_reviews AS (
      SELECT review_score
      FROM order_reviews
      ${whereClause}
    ),
    total AS (
      SELECT COUNT(*) as total_count FROM filtered_reviews
    )
    SELECT
      review_score,
      COUNT(*) as count,
      ROUND(COUNT(*) * 100.0 / (SELECT total_count FROM total), 2) as percentage
    FROM filtered_reviews
    GROUP BY review_score
    ORDER BY review_score DESC
    LIMIT ?
  `;

  const data = await queryAll<ScoreDistribution>(sql, [...params, limit]);

  if (data.length === 0) {
    return emptyQueryResult<ScoreDistribution>(
      startTime,
      "未找到符合条件的评价分布数据",
      {
        total_reviews: 0,
        avg_score: 0,
        bad_review_count: 0,
        bad_review_rate: 0,
      },
    );
  }

  const summary = await queryOne<{
    total_reviews: number | null;
    avg_score: number | null;
    bad_review_count: number | null;
  }>(
    `
      SELECT
        COUNT(*) as total_reviews,
        ROUND(AVG(review_score), 2) as avg_score,
        SUM(CASE WHEN review_score <= 2 THEN 1 ELSE 0 END) as bad_review_count
      FROM order_reviews
      ${whereClause}
    `,
    params,
  );

  const totalReviews = Number(summary?.total_reviews ?? 0);
  const badReviewCount = Number(summary?.bad_review_count ?? 0);

  return {
    success: true,
    data,
    summary: {
      total_reviews: totalReviews,
      avg_score: Number(summary?.avg_score ?? 0),
      bad_review_count: badReviewCount,
      bad_review_rate:
        totalReviews > 0
          ? Math.round((badReviewCount / totalReviews) * 10000) / 100
          : 0,
    },
    metadata: { query_time_ms: Date.now() - startTime, row_count: data.length },
  };
}

async function queryCategoryAnalysis(
  scoreFilter: { min?: number; max?: number } | undefined,
  limit: number,
  startTime: number,
): Promise<QueryResult<CategoryReviewAnalysis[]>> {
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (scoreFilter?.min !== undefined) {
    conditions.push("r.review_score >= ?");
    params.push(scoreFilter.min);
  }
  if (scoreFilter?.max !== undefined) {
    conditions.push("r.review_score <= ?");
    params.push(scoreFilter.max);
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const categoryField =
    "COALESCE(ct.product_category_name_english, p.product_category_name, 'Unknown')";
  const translationJoin =
    "LEFT JOIN product_category_name_translation ct ON p.product_category_name = ct.product_category_name";

  const sql = `
    SELECT
      ${categoryField} as category,
      ROUND(AVG(r.review_score), 2) as avg_score,
      COUNT(*) as review_count,
      SUM(CASE WHEN r.review_score <= 2 THEN 1 ELSE 0 END) as bad_review_count,
      ROUND(SUM(CASE WHEN r.review_score <= 2 THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as bad_review_rate
    FROM order_reviews r
    JOIN orders o ON r.order_id = o.order_id
    JOIN order_items oi ON o.order_id = oi.order_id
    JOIN products p ON oi.product_id = p.product_id
    ${translationJoin}
    ${whereClause}
    GROUP BY category
    ORDER BY bad_review_rate DESC
    LIMIT ?
  `;

  const data = await queryAll<CategoryReviewAnalysis>(sql, [...params, limit]);

  if (data.length === 0) {
    return emptyQueryResult<CategoryReviewAnalysis>(
      startTime,
      "未找到符合条件的品类评价数据",
      { total_categories: 0 },
    );
  }

  const totalCategories = await queryOne<{ total_categories: number }>(
    `
      SELECT COUNT(*) as total_categories
      FROM (
        SELECT ${categoryField} as category
        FROM order_reviews r
        JOIN orders o ON r.order_id = o.order_id
        JOIN order_items oi ON o.order_id = oi.order_id
        JOIN products p ON oi.product_id = p.product_id
        ${translationJoin}
        ${whereClause}
        GROUP BY category
      ) category_groups
    `,
    params,
  );

  return {
    success: true,
    data,
    summary: {
      total_categories: Number(totalCategories?.total_categories ?? data.length),
    },
    metadata: { query_time_ms: Date.now() - startTime, row_count: data.length },
  };
}

async function queryMonthlyAnalysis(
  scoreFilter: { min?: number; max?: number } | undefined,
  limit: number,
  startTime: number,
): Promise<QueryResult<MonthlyReviewAnalysis[]>> {
  const { whereClause, params } = buildReviewScoreFilter(scoreFilter);

  const sql = `
    SELECT
      strftime(CAST(review_creation_date AS DATE), '%Y-%m') as month,
      ROUND(AVG(review_score), 2) as avg_score,
      COUNT(*) as review_count
    FROM order_reviews
    ${whereClause}
    GROUP BY month
    ORDER BY month
    LIMIT ?
  `;

  const data = await queryAll<MonthlyReviewAnalysis>(sql, [...params, limit]);

  if (data.length === 0) {
    return emptyQueryResult<MonthlyReviewAnalysis>(
      startTime,
      "未找到符合条件的月度评价数据",
    );
  }

  return {
    success: true,
    data,
    metadata: { query_time_ms: Date.now() - startTime, row_count: data.length },
  };
}
