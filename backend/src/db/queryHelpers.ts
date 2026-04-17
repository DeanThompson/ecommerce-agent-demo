import { queryOne } from "./index.js";
import type { QueryResult } from "../types/index.js";

export function normalizeLimit(limit: number | undefined, fallback = 100): number {
  if (typeof limit !== "number" || !Number.isFinite(limit)) {
    return fallback;
  }

  const normalized = Math.floor(limit);
  return normalized > 0 ? normalized : fallback;
}

export async function queryTotalCount(
  sql: string,
  params: unknown[] = [],
): Promise<number> {
  const result = await queryOne<{ total_count?: number }>(
    `SELECT COUNT(*) as total_count FROM (${sql}) counted_rows`,
    params,
  );

  return Number(result?.total_count ?? 0);
}

export function emptyQueryResult<T>(
  startTime: number,
  message: string,
  summary: Record<string, number> = {},
): QueryResult<T[]> {
  return {
    success: true,
    data: [],
    summary,
    metadata: {
      query_time_ms: Date.now() - startTime,
      row_count: 0,
    },
    message,
  };
}
