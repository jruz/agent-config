import { expect, test } from "bun:test";
import { compareData } from "./compare-data.ts";
import type { Json } from "./schema.ts";

const comparePatterns = (key: string, expected: Json, actual: Json) =>
  compareData({
    actual: JSON.stringify({ [key]: actual }),
    expected: JSON.stringify({ [key]: expected }),
    path: "knip.json",
  });

test.each(["entry", "project"])(
  "reviews project-specific Knip %s patterns",
  (key) => {
    const findings = comparePatterns(
      key,
      ["src/**/*.ts"],
      ["hooks/*.ts!", "skills/**/*.ts"],
    );
    expect(findings).toEqual([
      {
        actual: '[\n  "hooks/*.ts!",\n  "skills/**/*.ts"\n]\n',
        expected: '[\n  "src/**/*.ts"\n]\n',
        path: `knip.json#${key}`,
        status: "review",
      },
    ]);
  },
);

test.each(["entry", "project"])("matches unchanged Knip %s patterns", (key) => {
  const findings = comparePatterns(key, ["src/**/*.ts"], ["src/**/*.ts"]);
  const statuses = findings.map((finding) => finding.status);
  expect(statuses).toEqual(["matching"]);
});

test("reviews reordered and empty discovery lists", () => {
  const reordered = comparePatterns(
    "entry",
    ["src/**", "!src/test/**"],
    ["!src/test/**", "src/**"],
  );
  const empty = comparePatterns("project", ["src/**"], []);
  const statuses = [...reordered, ...empty].map((finding) => finding.status);
  expect(statuses).toEqual(["review", "review"]);
});

test("does not relax missing keys or non-array discovery settings", () => {
  const missing = compareData({
    actual: "{}",
    expected: '{"entry":["src/**"]}',
    path: "knip.json",
  });
  const invalid = comparePatterns("project", ["src/**"], false);
  const statuses = [...missing, ...invalid].map((finding) => finding.status);
  expect(statuses).toEqual(["missing", "changed"]);
  expect(() => comparePatterns("entry", ["src/**"], [42])).toThrow();
});

test("keeps other Knip arrays strict", () => {
  const findings = comparePatterns(
    "ignoreDependencies",
    ["tool"],
    ["tool", "zod"],
  );
  const statuses = findings.map((finding) => finding.status);
  expect(statuses).toEqual(["changed"]);
});
