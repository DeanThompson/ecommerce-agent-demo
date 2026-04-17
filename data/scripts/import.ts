/**
 * Data Import Script
 * Imports Olist CSV files into DuckDB
 */

import { DuckDBInstance } from "@duckdb/node-api";
import { existsSync, rmSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "..");
const RAW_DIR = join(DATA_DIR, "raw");
const DB_PATH = join(DATA_DIR, "ecommerce.duckdb");

const CSV_FILES = [
  { name: "olist_orders_dataset.csv", table: "orders" },
  { name: "olist_order_items_dataset.csv", table: "order_items" },
  { name: "olist_products_dataset.csv", table: "products" },
  { name: "olist_customers_dataset.csv", table: "customers" },
  { name: "olist_sellers_dataset.csv", table: "sellers" },
  { name: "olist_order_payments_dataset.csv", table: "order_payments" },
  { name: "olist_order_reviews_dataset.csv", table: "order_reviews" },
  { name: "olist_geolocation_dataset.csv", table: "geolocation" },
  {
    name: "product_category_name_translation.csv",
    table: "product_category_name_translation",
  },
];

function sqlLiteralPath(path: string): string {
  return path.replace(/\\/g, "/").replace(/'/g, "''");
}

async function main(): Promise<void> {
  console.log("=== Olist Data Import (DuckDB) ===\n");

  const availableFiles = CSV_FILES.filter((f) => existsSync(join(RAW_DIR, f.name)));
  if (availableFiles.length === 0) {
    console.error("Error: No CSV files found in data/raw/");
    console.error("Please download the Olist dataset from Kaggle:");
    console.error("https://www.kaggle.com/datasets/olistbr/brazilian-ecommerce");
    process.exit(1);
  }

  if (existsSync(DB_PATH)) {
    rmSync(DB_PATH);
  }

  const instance = await DuckDBInstance.create(DB_PATH, { threads: "4" });
  const connection = await instance.connect();

  try {
    for (const { name, table } of CSV_FILES) {
      const filePath = join(RAW_DIR, name);
      if (!existsSync(filePath)) {
        console.warn(`Skipping ${name}: file not found`);
        continue;
      }

      console.log(`Importing ${table} from CSV ...`);
      const literalPath = sqlLiteralPath(filePath);
      await connection.run(`
        CREATE OR REPLACE TABLE ${table} AS
        SELECT *
        FROM read_csv_auto(
          '${literalPath}',
          HEADER = true,
          SAMPLE_SIZE = -1,
          IGNORE_ERRORS = true
        )
      `);
    }

    console.log("\nCreating lightweight analytical views ...");
    await connection.run(`
      CREATE OR REPLACE VIEW v_order_sales AS
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
        COALESCE(
          t.product_category_name_english,
          p.product_category_name,
          'Unknown'
        ) as category_english
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.customer_id
      LEFT JOIN order_items oi ON o.order_id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.product_id
      LEFT JOIN product_category_name_translation t
        ON p.product_category_name = t.product_category_name
      WHERE o.order_status = 'delivered'
    `);

    const summary = await connection.runAndReadAll(`
      SELECT
        COUNT(*) as total_rows,
        COUNT(DISTINCT order_id) as total_orders
      FROM v_order_sales
    `);
    const [stats] = summary.getRowObjectsJson();

    console.log("\n=== Import Complete ===");
    console.log(`Database: ${DB_PATH}`);
    console.log(`Rows in v_order_sales: ${stats?.total_rows ?? 0}`);
    console.log(`Distinct orders: ${stats?.total_orders ?? 0}`);
  } finally {
    connection.closeSync();
    instance.closeSync();
  }
}

main().catch((error) => {
  console.error("Import failed:", error);
  process.exit(1);
});
