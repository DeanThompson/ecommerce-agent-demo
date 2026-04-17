/**
 * Integration tests for query_customers MCP tool
 */

import { describe, it, expect } from "vitest";
import { queryOne } from "../../src/db/index.js";
import { queryCustomers } from "../../src/mcp/tools/queryCustomers.js";
import { expectLimitIndependentSummary } from "./helpers.js";

describe("queryCustomers", () => {
  describe("distribution analysis", () => {
    it("should return customer distribution by state", () => {
      const result = queryCustomers({
        analysis_type: "distribution",
        group_by: "state",
      });

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);

      if (Array.isArray(result.data) && result.data.length > 0) {
        const item = result.data[0];
        expect(item).toHaveProperty("state");
        expect(item).toHaveProperty("customer_count");
        expect(item).toHaveProperty("percentage");
      }
    });

    it("should return customer distribution by city", () => {
      const result = queryCustomers({
        analysis_type: "distribution",
        group_by: "city",
      });

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);

      if (Array.isArray(result.data) && result.data.length > 0) {
        const item = result.data[0];
        expect(item).toHaveProperty("city");
        expect(item).toHaveProperty("state");
        expect(item).toHaveProperty("customer_count");
      }
    });

    it("should disambiguate city distribution with state grouping", () => {
      const ambiguousCity = queryOne<{ city: string }>(`
        SELECT customer_city as city
        FROM customers
        GROUP BY customer_city
        HAVING COUNT(DISTINCT customer_state) > 1
        ORDER BY COUNT(*) DESC
        LIMIT 1
      `);

      if (!ambiguousCity?.city) {
        return;
      }

      const result = queryCustomers({
        analysis_type: "distribution",
        group_by: "city",
        limit: 5000,
      });

      expect(result.success).toBe(true);
      if (!Array.isArray(result.data)) {
        throw new Error("Expected array data for city distribution");
      }

      const rowsForCity = result.data.filter((row) => row.city === ambiguousCity.city);
      const uniqueStates = new Set(rowsForCity.map((row) => row.state));
      expect(uniqueStates.size).toBeGreaterThan(1);
    });

    it("should keep distribution summary independent from limit", () => {
      const lowLimit = queryCustomers({
        analysis_type: "distribution",
        group_by: "state",
        limit: 1,
      });
      const highLimit = queryCustomers({
        analysis_type: "distribution",
        group_by: "state",
        limit: 10,
      });

      expect(lowLimit.success).toBe(true);
      expect(highLimit.success).toBe(true);
      expectLimitIndependentSummary(lowLimit, highLimit, ["total_customers"]);
    });

    it("should filter by state when provided", () => {
      const result = queryCustomers({
        analysis_type: "distribution",
        group_by: "city",
        filters: { state: "SP" },
      });

      expect(result.success).toBe(true);
      if (Array.isArray(result.data) && result.data.length > 0) {
        expect(result.data.every((d) => d.state === "SP")).toBe(true);
      }
    });

    it("should filter by min_orders when provided", () => {
      const result = queryCustomers({
        analysis_type: "distribution",
        group_by: "state",
        filters: { min_orders: 2 },
      });

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
    });

    it("should respect limit parameter", () => {
      const result = queryCustomers({
        analysis_type: "distribution",
        group_by: "state",
        limit: 5,
      });

      expect(result.success).toBe(true);
      if (Array.isArray(result.data)) {
        expect(result.data.length).toBeLessThanOrEqual(5);
      }
    });
  });

  describe("repurchase analysis", () => {
    it("should return repurchase metrics", () => {
      const result = queryCustomers({
        analysis_type: "repurchase",
      });

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty("total_customers");
      expect(result.data).toHaveProperty("repurchase_customers");
      expect(result.data).toHaveProperty("repurchase_rate");
      expect(result.data).toHaveProperty("avg_orders_per_customer");
    });

    it("should filter repurchase by state", () => {
      const result = queryCustomers({
        analysis_type: "repurchase",
        filters: { state: "SP" },
      });

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty("repurchase_rate");
    });

    it("should filter repurchase by min_orders", () => {
      const result = queryCustomers({
        analysis_type: "repurchase",
        filters: { min_orders: 2 },
      });

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty("total_customers");
    });
  });

  describe("value_segment analysis", () => {
    it("should return customer value segments", () => {
      const result = queryCustomers({
        analysis_type: "value_segment",
      });

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);

      if (Array.isArray(result.data) && result.data.length > 0) {
        const item = result.data[0];
        expect(item).toHaveProperty("price_range");
        expect(item).toHaveProperty("order_count");
        expect(item).toHaveProperty("percentage");
      }
    });

    it("should keep value summary independent from limit", () => {
      const lowLimit = queryCustomers({
        analysis_type: "value_segment",
        limit: 1,
      });
      const highLimit = queryCustomers({
        analysis_type: "value_segment",
        limit: 10,
      });

      expect(lowLimit.success).toBe(true);
      expect(highLimit.success).toBe(true);
      expectLimitIndependentSummary(lowLimit, highLimit, ["total_customers"]);
    });

    it("should filter value segments by state", () => {
      const result = queryCustomers({
        analysis_type: "value_segment",
        filters: { state: "RJ" },
      });

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
    });

    it("should filter value segments by min_orders", () => {
      const result = queryCustomers({
        analysis_type: "value_segment",
        filters: { min_orders: 2 },
      });

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
    });
  });

  describe("error handling", () => {
    it("should return error for unknown analysis type", () => {
      const result = queryCustomers({
        analysis_type: "unknown_type" as never,
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("Unknown analysis type");
    });
  });
});
