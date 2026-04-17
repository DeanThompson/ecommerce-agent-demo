import { expect } from "vitest";

export function expectLimitIndependentSummary(
  smallerLimitResult: { summary?: Record<string, number> },
  largerLimitResult: { summary?: Record<string, number> },
  summaryKeys: string[],
): void {
  for (const key of summaryKeys) {
    expect(smallerLimitResult.summary?.[key]).toBeDefined();
    expect(largerLimitResult.summary?.[key]).toBeDefined();
    expect(smallerLimitResult.summary?.[key]).toBe(largerLimitResult.summary?.[key]);
  }
}

export function expectSuccessWithArrayData(result: {
  success: boolean;
  data: unknown;
}): void {
  expect(result.success).toBe(true);
  expect(Array.isArray(result.data)).toBe(true);
}
