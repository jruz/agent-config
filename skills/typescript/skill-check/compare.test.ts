import { expect, test } from "bun:test";
import { compareSnapshot } from "./compare.ts";
import { SnapshotSchema } from "./schema.ts";

const compareFile = (path: string, expected: string, actual: string | null) => {
  const snapshot = SnapshotSchema.parse({
    files: [{ actual, expected, path }],
  });
  return compareSnapshot(snapshot).map((finding) => ({
    path: finding.path,
    status: finding.status,
  }));
};

test("reports matching, changed, and missing config files", () => {
  const matching = compareFile("knip.ts", "export {};\n", "export {};\n");
  const changed = compareFile("knip.ts", "export {};\n", "export {};");
  const missing = compareFile(".oxlint/plugin.ts", "export {};\n", null);
  expect(matching).toEqual([{ path: "knip.ts", status: "matching" }]);
  expect(changed).toEqual([{ path: "knip.ts", status: "changed" }]);
  expect(missing).toEqual([{ path: ".oxlint/plugin.ts", status: "missing" }]);
});

test("allows project manifest additions and different key ordering", () => {
  const expected = JSON.stringify({
    devDependencies: { typescript: "7.0.2" },
    engines: { node: "24.0.0" },
    scripts: { check: "tsc" },
  });
  const actual = JSON.stringify({
    dependencies: { zod: "4.0.0" },
    devDependencies: { other: "1.0.0", typescript: "7.0.2" },
    engines: { bun: "1.4.4", node: "24.0.0" },
    name: "project",
    scripts: { check: "tsc", start: "node src/main.ts" },
  });
  const findings = compareFile("package.json", expected, actual);
  expect(findings).toEqual([
    { path: "package.json#devDependencies.typescript", status: "matching" },
    { path: "package.json#engines.node", status: "matching" },
    { path: "package.json#scripts.check", status: "matching" },
  ]);
});

test("reports changed pins and missing manifest entries and sections", () => {
  const expected = JSON.stringify({
    devDependencies: { oxlint: "1.89.0", typescript: "7.0.2" },
    scripts: { check: "tsc" },
  });
  const actual = JSON.stringify({ devDependencies: { typescript: "6.0.3" } });
  const findings = compareFile("package.json", expected, actual);
  expect(findings).toEqual([
    { path: "package.json#devDependencies.oxlint", status: "missing" },
    { path: "package.json#devDependencies.typescript", status: "changed" },
    { path: "package.json#scripts", status: "missing" },
  ]);
});

test("reports a missing manifest once", () => {
  const findings = compareFile(
    "package.json",
    '{"scripts":{"check":"tsc"}}',
    null,
  );
  expect(findings).toEqual([{ path: "package.json", status: "missing" }]);
});

test("rejects malformed manifests rather than claiming drift", () => {
  expect(() => compareFile("package.json", "{}", "not json")).toThrow();
  const findings = compareFile(
    "package.json",
    '{"scripts":{"check":"tsc"}}',
    '{"scripts":{"check":42}}',
  );
  expect(findings).toEqual([
    { path: "package.json#scripts.check", status: "changed" },
  ]);
});

test("compares module source directly", () => {
  const matching = compareFile(
    ".just/ts.justfile",
    "check:\n    tsc\n",
    "check:\n    tsc\n",
  );
  const changed = compareFile(
    ".just/bun.justfile",
    "test:\n    bun test\n",
    "test:\n    bun test ./scripts\n",
  );
  const missing = compareFile(".just/ts.justfile", "check:\n    tsc\n", null);
  expect(matching).toEqual([{ path: ".just/ts.justfile", status: "matching" }]);
  expect(changed).toEqual([{ path: ".just/bun.justfile", status: "changed" }]);
  expect(missing).toEqual([{ path: ".just/ts.justfile", status: "missing" }]);
});

test.each([
  "scripts/sandbox.nu",
  "Dockerfile.node",
  "scripts/lib/log.ts",
  "scripts/lib/output.ts",
  "scripts/lib/table.ts",
  "scripts/lib/table.types.ts",
  "scripts/lib/streams.test.ts",
  "scripts/lib/table.test.ts",
])("compares %s exactly", (path) => {
  const matching = compareFile(path, "baseline\n", "baseline\n");
  const changed = compareFile(path, "baseline\n", "modified\n");
  const missing = compareFile(path, "baseline\n", null);
  expect(matching).toEqual([{ path, status: "matching" }]);
  expect(changed).toEqual([{ path, status: "changed" }]);
  expect(missing).toEqual([{ path, status: "missing" }]);
});

test.each(["flake.nix", ".envrc", "justfile"])(
  "requires review for changed %s but fails when missing",
  (path) => {
    const matching = compareFile(path, "baseline\n", "baseline\n");
    const changed = compareFile(path, "baseline\n", "project config\n");
    const missing = compareFile(path, "baseline\n", null);
    expect(matching).toEqual([{ path, status: "matching" }]);
    expect(changed).toEqual([{ path, status: "review" }]);
    expect(missing).toEqual([{ path, status: "missing" }]);
  },
);

test("rejects malformed snapshots", () => {
  expect(() => SnapshotSchema.parse({})).toThrow();
});
