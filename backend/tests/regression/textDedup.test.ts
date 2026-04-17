import { describe, expect, it } from "vitest";
import {
  getUniqueTextChunk,
  normalizeTextChunkBoundary,
} from "../../src/agent/textDedup.js";

describe("getUniqueTextChunk", () => {
  it("returns full incoming text when nothing emitted", () => {
    expect(getUniqueTextChunk("", "hello")).toBe("hello");
  });

  it("returns empty when incoming already emitted", () => {
    expect(getUniqueTextChunk("hello world", "hello world")).toBe("");
    expect(getUniqueTextChunk("hello world", "world")).toBe("");
  });

  it("returns suffix when incoming starts with emitted text", () => {
    expect(getUniqueTextChunk("hello", "hello world")).toBe(" world");
  });

  it("returns non-overlapping suffix for overlap case", () => {
    expect(getUniqueTextChunk("according to query", "query result is ready")).toBe(
      " result is ready",
    );
  });

  it("returns incoming when no overlap exists", () => {
    expect(getUniqueTextChunk("foo", "bar")).toBe("bar");
  });
});

describe("normalizeTextChunkBoundary", () => {
  it("adds blank line before markdown heading when needed", () => {
    expect(
      normalizeTextChunkBoundary("前文句子结束。", "# 标题"),
    ).toBe("\n\n# 标题");
  });

  it("does not modify non-markdown chunk", () => {
    expect(normalizeTextChunkBoundary("前文句子结束。", "继续说明")).toBe(
      "继续说明",
    );
  });

  it("does not add extra boundary if chunk already starts with whitespace", () => {
    expect(normalizeTextChunkBoundary("前文句子结束。", "\n# 标题")).toBe(
      "\n# 标题",
    );
  });
});
