/**
 * Integration tests for query_reviews MCP tool
 */

import { describe, it, expect } from "vitest";
import { queryReviews } from "../../src/mcp/tools/queryReviews.js";
import { resolveExistingTableName } from "../../src/db/queryHelpers.js";

describe("queryReviews", () => {
  describe("score distribution (group_by: score)", () => {
    it("should return review score distribution", () => {
      const result = queryReviews({
        group_by: "score",
      });

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);

      if (Array.isArray(result.data) && result.data.length > 0) {
        const item = result.data[0];
        expect(item).toHaveProperty("review_score");
        expect(item).toHaveProperty("count");
        expect(item).toHaveProperty("percentage");
      }
    });

    it("should filter by score range", () => {
      const result = queryReviews({
        group_by: "score",
        score_filter: {
          min: 3,
          max: 5,
        },
      });

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
      if (Array.isArray(result.data) && result.data.length > 0) {
        expect(
          result.data.every((d) => d.review_score >= 3 && d.review_score <= 5),
        ).toBe(true);
      }
    });

    it("should include summary with bad review stats", () => {
      const result = queryReviews({
        group_by: "score",
      });

      expect(result.success).toBe(true);
      expect(result.summary).toHaveProperty("total_reviews");
      expect(result.summary).toHaveProperty("avg_score");
      expect(result.summary).toHaveProperty("bad_review_count");
      expect(result.summary).toHaveProperty("bad_review_rate");
    });
  });

  describe("category analysis (group_by: category)", () => {
    it("should use available category translation table and return category analysis", () => {
      const translationTable = resolveExistingTableName([
        "product_category_name_translation",
        "category_translation",
      ]);

      expect(translationTable).toBeTruthy();

      const result = queryReviews({
        group_by: "category",
      });

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);

      if (Array.isArray(result.data) && result.data.length > 0) {
        const item = result.data[0];
        expect(item).toHaveProperty("category");
        expect(item).toHaveProperty("avg_score");
        expect(item).toHaveProperty("review_count");
        expect(item).toHaveProperty("bad_review_count");
        expect(item).toHaveProperty("bad_review_rate");
      }
    });

    it("should respect limit parameter", () => {
      const result = queryReviews({
        group_by: "category",
        limit: 5,
      });

      expect(result.success).toBe(true);
      if (Array.isArray(result.data)) {
        expect(result.data.length).toBeLessThanOrEqual(5);
      }
    });

    it("should filter by score range", () => {
      const result = queryReviews({
        group_by: "category",
        score_filter: { min: 1, max: 3 },
      });

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
    });
  });

  describe("monthly analysis (group_by: month)", () => {
    it("should return monthly review analysis", () => {
      const result = queryReviews({
        group_by: "month",
      });

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);

      if (Array.isArray(result.data) && result.data.length > 0) {
        const item = result.data[0];
        expect(item).toHaveProperty("month");
        expect(item).toHaveProperty("avg_score");
        expect(item).toHaveProperty("review_count");
      }
    });

    it("should filter monthly data by score", () => {
      const result = queryReviews({
        group_by: "month",
        score_filter: { max: 2 },
      });

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
    });
  });

  describe("default behavior", () => {
    it("should default to score distribution when no group_by specified", () => {
      const result = queryReviews({});

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
      if (Array.isArray(result.data) && result.data.length > 0) {
        expect(result.data[0]).toHaveProperty("review_score");
      }
    });
  });

  describe("error handling", () => {
    it("should return empty data when filtering results in no matches", () => {
      const result = queryReviews({
        group_by: "score",
        score_filter: { min: 10, max: 10 },
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });
  });
});
