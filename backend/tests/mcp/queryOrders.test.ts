/**
 * Integration tests for query_orders MCP tool
 */

import { describe, it, expect } from "vitest";
import { queryOrders } from "../../src/mcp/tools/queryOrders.js";
import { expectLimitIndependentSummary } from "./helpers.js";

describe("queryOrders", () => {
  const baselineDateRange = {
    start_date: "2017-01-01",
    end_date: "2018-12-31",
  } as const;

  describe("status_distribution", () => {
    it("should return order status distribution for valid date range", () => {
      const result = queryOrders({
        ...baselineDateRange,
        analysis_type: "status_distribution",
      });

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.metadata.query_time_ms).toBeGreaterThanOrEqual(0);

      if (Array.isArray(result.data) && result.data.length > 0) {
        const item = result.data[0];
        expect(item).toHaveProperty("order_status");
        expect(item).toHaveProperty("count");
        expect(item).toHaveProperty("percentage");
      }
    });

    it("should keep summary independent from limit", () => {
      const lowLimit = queryOrders({
        ...baselineDateRange,
        analysis_type: "status_distribution",
        limit: 1,
      });
      const highLimit = queryOrders({
        ...baselineDateRange,
        analysis_type: "status_distribution",
        limit: 10,
      });

      expect(lowLimit.success).toBe(true);
      expect(highLimit.success).toBe(true);
      expectLimitIndependentSummary(lowLimit, highLimit, ["total_orders"]);
    });

    it("should return empty data for date range with no orders", () => {
      const result = queryOrders({
        start_date: "2000-01-01",
        end_date: "2000-12-31",
        analysis_type: "status_distribution",
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
      expect(result.message).toBeDefined();
    });

    it("should filter by state when provided", () => {
      const result = queryOrders({
        ...baselineDateRange,
        analysis_type: "status_distribution",
        filters: { state: "SP" },
      });

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
    });

    it("should respect limit parameter", () => {
      const result = queryOrders({
        ...baselineDateRange,
        analysis_type: "status_distribution",
        limit: 3,
      });

      expect(result.success).toBe(true);
      if (Array.isArray(result.data)) {
        expect(result.data.length).toBeLessThanOrEqual(3);
      }
    });
  });

  describe("delivery_analysis", () => {
    it("should return delivery metrics for valid date range", () => {
      const result = queryOrders({
        ...baselineDateRange,
        analysis_type: "delivery_analysis",
      });

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty("avg_delivery_days");
      expect(result.data).toHaveProperty("min_delivery_days");
      expect(result.data).toHaveProperty("max_delivery_days");
      expect(result.data).toHaveProperty("on_time_count");
      expect(result.data).toHaveProperty("overdue_count");
      expect(result.data).toHaveProperty("on_time_rate");
    });

    it("should apply status filter to delivery analysis", () => {
      const delivered = queryOrders({
        ...baselineDateRange,
        analysis_type: "delivery_analysis",
        filters: { status: "delivered" },
      });
      const shipped = queryOrders({
        ...baselineDateRange,
        analysis_type: "delivery_analysis",
        filters: { status: "shipped" },
      });

      expect(delivered.success).toBe(true);
      expect(shipped.success).toBe(true);
      expect(Number(delivered.summary?.total_orders ?? 0)).toBeGreaterThanOrEqual(
        Number(shipped.summary?.total_orders ?? 0),
      );
    });

    it("should filter by state when provided", () => {
      const result = queryOrders({
        ...baselineDateRange,
        analysis_type: "delivery_analysis",
        filters: { state: "SP" },
      });

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty("avg_delivery_days");
    });

    it("should include summary with on_time_rate", () => {
      const result = queryOrders({
        ...baselineDateRange,
        analysis_type: "delivery_analysis",
      });

      expect(result.success).toBe(true);
      expect(result.summary).toHaveProperty("on_time_rate");
    });
  });

  describe("delivery_by_region", () => {
    it("should return delivery data grouped by region", () => {
      const result = queryOrders({
        ...baselineDateRange,
        analysis_type: "delivery_by_region",
      });

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);

      if (Array.isArray(result.data) && result.data.length > 0) {
        const item = result.data[0];
        expect(item).toHaveProperty("state");
        expect(item).toHaveProperty("avg_delivery_days");
        expect(item).toHaveProperty("order_count");
      }
    });

    it("should keep region summary independent from limit", () => {
      const lowLimit = queryOrders({
        ...baselineDateRange,
        analysis_type: "delivery_by_region",
        limit: 1,
      });
      const highLimit = queryOrders({
        ...baselineDateRange,
        analysis_type: "delivery_by_region",
        limit: 10,
      });

      expect(lowLimit.success).toBe(true);
      expect(highLimit.success).toBe(true);
      expectLimitIndependentSummary(lowLimit, highLimit, ["total_orders"]);
    });

    it("should respect limit parameter", () => {
      const result = queryOrders({
        ...baselineDateRange,
        analysis_type: "delivery_by_region",
        limit: 5,
      });

      expect(result.success).toBe(true);
      if (Array.isArray(result.data)) {
        expect(result.data.length).toBeLessThanOrEqual(5);
      }
    });

    it("should filter by state when provided", () => {
      const result = queryOrders({
        ...baselineDateRange,
        analysis_type: "delivery_by_region",
        filters: { state: "SP" },
      });

      expect(result.success).toBe(true);
      if (Array.isArray(result.data) && result.data.length > 0) {
        expect(result.data.every((d) => d.state === "SP")).toBe(true);
      }
    });

    it("should apply status filter to delivery by region", () => {
      const delivered = queryOrders({
        ...baselineDateRange,
        analysis_type: "delivery_by_region",
        filters: { status: "delivered" },
      });
      const shipped = queryOrders({
        ...baselineDateRange,
        analysis_type: "delivery_by_region",
        filters: { status: "shipped" },
      });

      expect(delivered.success).toBe(true);
      expect(shipped.success).toBe(true);
      expect(Number(delivered.summary?.total_orders ?? 0)).toBeGreaterThanOrEqual(
        Number(shipped.summary?.total_orders ?? 0),
      );
    });
  });

  describe("error handling", () => {
    it("should return error for unknown analysis type", () => {
      const result = queryOrders({
        ...baselineDateRange,
        analysis_type: "unknown_type" as never,
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("Unknown analysis type");
    });
  });
});
