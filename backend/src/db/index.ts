/**
 * Database Connection Module
 * DuckDB connection for analytical queries
 */

import { DuckDBConnection, DuckDBInstance } from "@duckdb/node-api";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { existsSync } from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DEFAULT_DB_PATH = join(
  __dirname,
  "..",
  "..",
  "..",
  "data",
  "ecommerce.duckdb",
);

let instance: DuckDBInstance | null = null;
let connection: DuckDBConnection | null = null;

async function tableExists(
  conn: DuckDBConnection,
  tableName: string,
): Promise<boolean> {
  const result = await conn.runAndReadAll(
    `
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema NOT IN ('information_schema', 'pg_catalog')
        AND table_name = ?
      LIMIT 1
    `,
    [tableName],
  );
  return result.getRowObjectsJson().length > 0;
}

async function ensureAnalyticsViews(conn: DuckDBConnection): Promise<void> {
  if (!(await tableExists(conn, "orders"))) {
    return;
  }

  const hasTranslation = await tableExists(
    conn,
    "product_category_name_translation",
  );
  const translationJoin = hasTranslation
    ? "LEFT JOIN product_category_name_translation t ON p.product_category_name = t.product_category_name"
    : "";
  const categoryExpression = hasTranslation
    ? "COALESCE(t.product_category_name_english, p.product_category_name, 'Unknown')"
    : "COALESCE(p.product_category_name, 'Unknown')";

  await conn.run(`
    CREATE OR REPLACE TEMP VIEW v_order_sales AS
    SELECT
      o.order_id,
      o.order_status,
      o.order_purchase_timestamp,
      c.customer_id,
      c.customer_unique_id,
      c.customer_city,
      c.customer_state,
      oi.product_id,
      oi.price,
      oi.freight_value,
      p.product_category_name,
      ${categoryExpression} as category_english
    FROM orders o
    LEFT JOIN customers c ON o.customer_id = c.customer_id
    LEFT JOIN order_items oi ON o.order_id = oi.order_id
    LEFT JOIN products p ON oi.product_id = p.product_id
    ${translationJoin}
    WHERE o.order_status = 'delivered'
  `);

  await conn.run(`
    CREATE OR REPLACE TEMP VIEW v_order_details AS
    SELECT
      o.order_id,
      o.order_status,
      o.order_purchase_timestamp,
      c.customer_id,
      c.customer_unique_id,
      c.customer_city,
      c.customer_state,
      oi.product_id,
      oi.price,
      oi.freight_value,
      p.product_category_name,
      ${categoryExpression} as category_english,
      oi.seller_id,
      sel.seller_city,
      sel.seller_state,
      r.review_score
    FROM orders o
    LEFT JOIN customers c ON o.customer_id = c.customer_id
    LEFT JOIN order_items oi ON o.order_id = oi.order_id
    LEFT JOIN products p ON oi.product_id = p.product_id
    ${translationJoin}
    LEFT JOIN sellers sel ON oi.seller_id = sel.seller_id
    LEFT JOIN order_reviews r ON o.order_id = r.order_id
    WHERE o.order_status = 'delivered'
  `);
}

export async function initDatabase(): Promise<DuckDBConnection> {
  if (connection) return connection;

  const dbPath = process.env.DATABASE_PATH || DEFAULT_DB_PATH;

  if (!existsSync(dbPath)) {
    throw new Error(
      `DuckDB file not found at ${dbPath}. Generate it with: pnpm import-data`,
    );
  }

  instance = await DuckDBInstance.create(dbPath, {
    threads: process.env.DUCKDB_THREADS || "4",
  });
  connection = await instance.connect();

  await ensureAnalyticsViews(connection);

  return connection;
}

export function getDatabase(): DuckDBConnection {
  if (!connection) {
    throw new Error("Database not initialized. Call initDatabase() first.");
  }
  return connection;
}

export function closeDatabase(): void {
  if (connection) {
    connection.closeSync();
    connection = null;
  }
  if (instance) {
    instance.closeSync();
    instance = null;
  }
}

export async function isDatabaseReady(): Promise<boolean> {
  try {
    if (!connection) return false;
    const result = await queryOne<{ count?: number }>(
      "SELECT COUNT(*) as count FROM orders",
    );
    return Number(result?.count ?? 0) > 0;
  } catch {
    return false;
  }
}

export async function queryAll<T = Record<string, unknown>>(
  sql: string,
  params: unknown[] = [],
): Promise<T[]> {
  const conn = getDatabase();
  const result = await conn.runAndReadAll(sql, params as never[]);
  return result.getRowObjectsJson() as T[];
}

export async function queryOne<T = Record<string, unknown>>(
  sql: string,
  params: unknown[] = [],
): Promise<T | null> {
  const results = await queryAll<T>(sql, params);
  return results.length > 0 ? results[0] : null;
}

export async function execute(sql: string, params: unknown[] = []): Promise<void> {
  const conn = getDatabase();
  await conn.run(sql, params as never[]);
}

export {
  emptyQueryResult,
  normalizeLimit,
  queryTotalCount,
} from "./queryHelpers.js";
