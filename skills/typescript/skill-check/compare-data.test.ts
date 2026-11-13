import { expect, test } from "bun:test";
import { compareData } from "./compare-data.ts";
import type { Json } from "./schema.ts";

const compareValues = (expected: Json, actual: Json) =>
  compareData({
    actual: JSON.stringify(actual),
    expected: JSON.stringify(expected),
    path: "config.json",
  });

test("compares required nested values while allowing project-only keys", () => {
  const findings = compareValues(
    { compilerOptions: { module: "NodeNext", strict: true } },
    {
      compilerOptions: { jsx: "react-jsx", module: "NodeNext", strict: true },
      exclude: ["dist"],
    },
  );
  expect(findings).toEqual([
    {
      actual: '"NodeNext"\n',
      expected: '"NodeNext"\n',
      path: "config.json#compilerOptions.module",
      status: "matching",
    },
    {
      actual: "true\n",
      expected: "true\n",
      path: "config.json#compilerOptions.strict",
      status: "matching",
    },
  ]);
});

test("ignores JSON formatting and object key order", () => {
  const findings = compareData({
    actual: '{\n  "tabWidth": 2,\n  "semi": true\n}\n',
    expected: '{"semi":true,"tabWidth":2}',
    path: ".oxfmtrc.json",
  });
  const statuses = findings.map((finding) => finding.status);
  expect(statuses).toEqual(["matching", "matching"]);
});

test("reports missing values separately from null values", () => {
  const findings = compareValues(
    { absent: null, nullable: null, required: true },
    { nullable: null, required: null },
  );
  expect(findings).toEqual([
    {
      actual: null,
      expected: "null\n",
      path: "config.json#absent",
      status: "missing",
    },
    {
      actual: "null\n",
      expected: "null\n",
      path: "config.json#nullable",
      status: "matching",
    },
    {
      actual: "null\n",
      expected: "true\n",
      path: "config.json#required",
      status: "changed",
    },
  ]);
});

test("reports missing objects and changed object types at their path", () => {
  const missing = compareValues({ rules: { strict: "error" } }, {});
  const changed = compareValues(
    { rules: { strict: "error" } },
    { rules: false },
  );
  expect(missing).toEqual([
    {
      actual: null,
      expected: '{\n  "strict": "error"\n}\n',
      path: "config.json#rules",
      status: "missing",
    },
  ]);
  expect(changed).toEqual([
    {
      actual: "false\n",
      expected: '{\n  "strict": "error"\n}\n',
      path: "config.json#rules",
      status: "changed",
    },
  ]);
});

test("requires arrays to match exactly including order and length", () => {
  const added = compareValues(
    { plugins: ["typescript"] },
    { plugins: ["typescript", "node"] },
  );
  const reordered = compareValues(
    { lib: ["ESNext", "DOM"] },
    { lib: ["DOM", "ESNext"] },
  );
  const removed = compareValues({ lib: ["ESNext"] }, { lib: [] });
  const statuses = [...added, ...reordered, ...removed].map(
    (finding) => finding.status,
  );
  expect(statuses).toEqual(["changed", "changed", "changed"]);
});

test("compares objects within arrays without depending on key order", () => {
  const findings = compareValues(
    { rules: [{ options: { enabled: true }, severity: "error" }] },
    { rules: [{ options: { enabled: true }, severity: "error" }] },
  );
  const statuses = findings.map((finding) => finding.status);
  expect(statuses).toEqual(["matching"]);
});

test("enforces every baseline package key, not just dependencies", () => {
  const findings = compareValues(
    { private: true, type: "module" },
    { private: false, type: "commonjs" },
  );
  const statuses = findings.map((finding) => finding.status);
  expect(statuses).toEqual(["changed", "changed"]);
});

test("empty objects allow project additions but still require object types", () => {
  const extended = compareValues(
    { settings: {} },
    { settings: { project: true } },
  );
  const replaced = compareValues({ settings: {} }, { settings: [] });
  expect(extended).toEqual([]);
  expect(replaced).toEqual([
    {
      actual: "[]\n",
      expected: "{}\n",
      path: "config.json#settings",
      status: "changed",
    },
  ]);
});

test("handles JSON root values without coercion", () => {
  const findings = compareValues(true, 1);
  expect(findings).toEqual([
    {
      actual: "1\n",
      expected: "true\n",
      path: "config.json",
      status: "changed",
    },
  ]);
});
