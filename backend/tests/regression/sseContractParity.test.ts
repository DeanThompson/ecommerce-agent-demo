import { describe, expect, it } from "vitest";
import {
  SSE_EVENT_TYPES as backendSseEventTypes,
  LOG_CATEGORIES as backendLogCategories,
  LOG_LEVELS as backendLogLevels,
} from "../../src/types/index.js";
import {
  SSE_EVENT_TYPES as frontendSseEventTypes,
  LOG_CATEGORIES as frontendLogCategories,
  LOG_LEVELS as frontendLogLevels,
} from "../../../frontend/src/types/index.ts";

describe("SSE and logging contract parity", () => {
  it("keeps SSE event names aligned across backend and frontend", () => {
    expect([...backendSseEventTypes]).toEqual([...frontendSseEventTypes]);
  });

  it("keeps log category definitions aligned across backend and frontend", () => {
    expect([...backendLogCategories]).toEqual([...frontendLogCategories]);
  });

  it("keeps log levels aligned across backend and frontend", () => {
    expect([...backendLogLevels]).toEqual([...frontendLogLevels]);
  });
});
