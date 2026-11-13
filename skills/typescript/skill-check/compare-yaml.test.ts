import { expect, test } from "bun:test";
import { compareData } from "./compare-data.ts";

const compareWorkspace = (expected: string, actual: string | null) =>
  compareData({ actual, expected, path: "pnpm-workspace.yaml" });

test("allows project-only YAML keys without ignoring required values", () => {
  const findings = compareWorkspace(
    "minimumReleaseAge: 10080\n",
    "allowBuilds:\n  esbuild: false\nminimumReleaseAge: 10080\n",
  );
  expect(findings).toEqual([
    {
      actual: "10080\n",
      expected: "10080\n",
      path: "pnpm-workspace.yaml#minimumReleaseAge",
      status: "matching",
    },
  ]);
});

test("ignores YAML comments, style, and mapping key order", () => {
  const findings = compareWorkspace(
    "policy:\n  enabled: true\n  age: 10080\n",
    "# project policy\npolicy: {age: 10080, enabled: true}\n",
  );
  const statuses = findings.map((finding) => finding.status);
  expect(statuses).toEqual(["matching", "matching"]);
});

test("rejects changed values and does not coerce strings to numbers", () => {
  const changed = compareWorkspace(
    "minimumReleaseAge: 10080\n",
    "minimumReleaseAge: 0\n",
  );
  const stringValue = compareWorkspace(
    "minimumReleaseAge: 10080\n",
    'minimumReleaseAge: "10080"\n',
  );
  const statuses = [...changed, ...stringValue].map(
    (finding) => finding.status,
  );
  expect(statuses).toEqual(["changed", "changed"]);
});

test("requires YAML arrays to match exactly", () => {
  const findings = compareWorkspace(
    "packages:\n  - app\n",
    "packages:\n  - app\n  - extra\n",
  );
  const statuses = findings.map((finding) => finding.status);
  expect(statuses).toEqual(["changed"]);
});

test("reports missing YAML documents and keys", () => {
  const missingFile = compareWorkspace("minimumReleaseAge: 10080\n", null);
  const missingKey = compareWorkspace(
    "minimumReleaseAge: 10080\n",
    "allowBuilds: {}\n",
  );
  const paths = [...missingFile, ...missingKey].map((finding) => finding.path);
  expect(paths).toEqual([
    "pnpm-workspace.yaml",
    "pnpm-workspace.yaml#minimumReleaseAge",
  ]);
});

test("propagates malformed YAML instead of reporting ordinary drift", () => {
  expect(() =>
    compareWorkspace("minimumReleaseAge: 10080\n", "policy: ["),
  ).toThrow();
});

test("supports the yml extension", () => {
  const findings = compareData({
    actual: "enabled: false\n",
    expected: "enabled: true\n",
    path: "config.yml",
  });
  expect(findings).toEqual([
    {
      actual: "false\n",
      expected: "true\n",
      path: "config.yml#enabled",
      status: "changed",
    },
  ]);
});
