import { describe, expect, it } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

type PackageJson = {
  scripts: Record<string, string>;
};

function readPackageJson(path: string): PackageJson {
  return JSON.parse(readFileSync(path, "utf8")) as PackageJson;
}

describe("test command mode", () => {
  const backendPackage = readPackageJson(resolve(process.cwd(), "package.json"));
  const rootPackage = readPackageJson(resolve(process.cwd(), "..", "package.json"));

  it("runs backend tests in deterministic non-watch mode by default", () => {
    expect(backendPackage.scripts.test).toContain("vitest run");
    expect(backendPackage.scripts.test).not.toContain("watch");
  });

  it("provides explicit watch command for local iteration", () => {
    expect(backendPackage.scripts["test:watch"]).toContain("vitest");
  });

  it("keeps root CI test alias aligned to deterministic sub-commands", () => {
    expect(rootPackage.scripts["test:ci"]).toContain("pnpm -r test:ci");
  });
});
