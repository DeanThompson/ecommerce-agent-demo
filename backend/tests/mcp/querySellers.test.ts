/**
 * Integration tests for query_sellers MCP tool
 */

import { describe, it, expect } from "vitest";
import { querySellers } from "../../src/mcp/tools/querySellers.js";
import { expectLimitIndependentSummary } from "./helpers.js";

describe("querySellers", () => {
  describe("ranking analysis", () => {
    it("should return seller ranking by sales", () => {
      const result = querySellers({
        analysis_type: "ranking",
        sort_by: "sales",
      });

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);

      if (Array.isArray(result.data) && result.data.length > 0) {
        const item = result.data[0];
        expect(item).toHaveProperty("seller_id");
        expect(item).toHaveProperty("total_sales");
        expect(item).toHaveProperty("order_count");
      }
    });

    it("should keep ranking summary independent from limit", () => {
      const lowLimit = querySellers({
        analysis_type: "ranking",
        sort_by: "sales",
        limit: 1,
      });
      const highLimit = querySellers({
        analysis_type: "ranking",
        sort_by: "sales",
        limit: 10,
      });

      expect(lowLimit.success).toBe(true);
      expect(highLimit.success).toBe(true);
      expectLimitIndependentSummary(lowLimit, highLimit, ["total_sellers"]);
    });

    it("should return seller ranking by orders", () => {
      const result = querySellers({
        analysis_type: "ranking",
        sort_by: "orders",
      });

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
    });

    it("should return seller ranking by score", () => {
      const result = querySellers({
        analysis_type: "ranking",
        sort_by: "score",
      });

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
    });

    it("should filter by state", () => {
      const result = querySellers({
        analysis_type: "ranking",
        sort_by: "sales",
        filters: { state: "SP" },
      });

      expect(result.success).toBe(true);
      if (Array.isArray(result.data) && result.data.length > 0) {
        expect(result.data.every((d) => d.seller_state === "SP")).toBe(true);
      }
    });

    it("should filter by min_orders", () => {
      const result = querySellers({
        analysis_type: "ranking",
        sort_by: "sales",
        filters: { min_orders: 10 },
      });

      expect(result.success).toBe(true);
      if (Array.isArray(result.data) && result.data.length > 0) {
        expect(result.data.every((d) => d.order_count >= 10)).toBe(true);
      }
    });

    it("should respect limit parameter", () => {
      const result = querySellers({
        analysis_type: "ranking",
        sort_by: "sales",
        limit: 5,
      });

      expect(result.success).toBe(true);
      if (Array.isArray(result.data)) {
        expect(result.data.length).toBeLessThanOrEqual(5);
      }
    });
  });

  describe("distribution analysis", () => {
    it("should return seller distribution by state", () => {
      const result = querySellers({
        analysis_type: "distribution",
      });

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);

      if (Array.isArray(result.data) && result.data.length > 0) {
        const item = result.data[0];
        expect(item).toHaveProperty("state");
        expect(item).toHaveProperty("seller_count");
        expect(item).toHaveProperty("percentage");
      }
    });

    it("should keep distribution summary independent from limit", () => {
      const lowLimit = querySellers({
        analysis_type: "distribution",
        limit: 1,
      });
      const highLimit = querySellers({
        analysis_type: "distribution",
        limit: 10,
      });

      expect(lowLimit.success).toBe(true);
      expect(highLimit.success).toBe(true);
      expectLimitIndependentSummary(lowLimit, highLimit, ["total_sellers"]);
    });

    it("should filter distribution by state", () => {
      const result = querySellers({
        analysis_type: "distribution",
        filters: { state: "SP" },
      });

      expect(result.success).toBe(true);
      if (Array.isArray(result.data) && result.data.length > 0) {
        expect(result.data.every((d) => d.state === "SP")).toBe(true);
      }
    });

    it("should filter distribution by min_orders", () => {
      const result = querySellers({
        analysis_type: "distribution",
        filters: { min_orders: 5 },
      });

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
    });
  });

  describe("performance analysis", () => {
    it("should return seller performance data", () => {
      const result = querySellers({
        analysis_type: "performance",
      });

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);

      if (Array.isArray(result.data) && result.data.length > 0) {
        const item = result.data[0];
        expect(item).toHaveProperty("seller_id");
        expect(item).toHaveProperty("avg_score");
        expect(item).toHaveProperty("order_count");
      }
    });

    it("should keep performance summary independent from limit", () => {
      const lowLimit = querySellers({
        analysis_type: "performance",
        limit: 1,
      });
      const highLimit = querySellers({
        analysis_type: "performance",
        limit: 10,
      });

      expect(lowLimit.success).toBe(true);
      expect(highLimit.success).toBe(true);
      expectLimitIndependentSummary(lowLimit, highLimit, ["total_sellers"]);
    });

    it("should filter performance by min_orders", () => {
      const result = querySellers({
        analysis_type: "performance",
        filters: { min_orders: 10 },
      });

      expect(result.success).toBe(true);
      if (Array.isArray(result.data) && result.data.length > 0) {
        expect(result.data.every((d) => d.order_count >= 10)).toBe(true);
      }
    });
  });

  describe("error handling", () => {
    it("should return error for unknown analysis type", () => {
      const result = querySellers({
        analysis_type: "unknown_type" as never,
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("Unknown analysis type");
    });
  });
});
