import { describe, expect, it } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

function readJson(filePath: string): Record<string, unknown> {
  return JSON.parse(readFileSync(filePath, "utf8")) as Record<string, unknown>;
}

describe("script consistency", () => {
  const repoRoot = resolve(process.cwd(), "..");
  const rootPackageJson = readJson(resolve(repoRoot, "package.json"));
  const backendPackageJson = readJson(resolve(process.cwd(), "package.json"));
  const makefile = readFileSync(resolve(repoRoot, "Makefile"), "utf8");

  it("keeps backend import-data path aligned with repository layout", () => {
    const backendScripts = backendPackageJson.scripts as Record<string, string>;
    expect(backendScripts["import-data"]).toContain("../data/scripts/import.ts");
  });

  it("keeps root import-data command aligned with backend script", () => {
    const rootScripts = rootPackageJson.scripts as Record<string, string>;
    expect(rootScripts["import-data"]).toContain("pnpm --filter backend");
  });

  it("keeps Makefile import-data target aligned with package scripts", () => {
    expect(makefile).toMatch(/import-data:.*\n\s+pnpm run import-data/);
  });
});
