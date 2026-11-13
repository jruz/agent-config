import { expect, test } from "bun:test";
import { compareData } from "./compare-data.ts";
import type { Json } from "./schema.ts";

const comparePatterns = (expected: Json, actual: Json) =>
  compareData({
    actual: JSON.stringify({ ignorePatterns: actual }),
    expected: JSON.stringify({ ignorePatterns: expected }),
    path: ".oxfmtrc.json",
  });

test.each([
  { key: "exclude", path: "tsconfig.json" },
  { key: "ignorePatterns", path: ".oxlintrc.json" },
])(
  "requires baseline exclusions and reviews additions in $path",
  ({ path, key }) => {
    const compare = (actual: Json) =>
      compareData({
        actual: JSON.stringify({ [key]: actual }),
        expected: JSON.stringify({ [key]: ["node_modules/", "target/"] }),
        path,
      });
    const reordered = compare(["target/", "node_modules/"]);
    const reorderedStatuses = reordered.map((finding) => finding.status);
    expect(reorderedStatuses).toEqual(["matching"]);
    const added = compare(["target/", "node_modules/", "skills/synced/"]);
    const addedStatuses = added.map((finding) => finding.status);
    expect(addedStatuses).toEqual(["matching", "review"]);
    const replaced = compare(["target/", "skills/synced/"]);
    const replacedStatuses = replaced.map((finding) => finding.status);
    expect(replacedStatuses).toEqual(["missing", "review"]);
    const empty = compare([]);
    const emptyStatuses = empty.map((finding) => finding.status);
    expect(emptyStatuses).toEqual(["missing"]);
    const invalid = compare(false);
    const invalidStatuses = invalid.map((finding) => finding.status);
    expect(invalidStatuses).toEqual(["changed"]);
    expect(() => compare([42])).toThrow();
    const missing = compareData({
      actual: "{}",
      expected: JSON.stringify({ [key]: ["target/"] }),
      path,
    });
    const missingStatuses = missing.map((finding) => finding.status);
    expect(missingStatuses).toEqual(["missing"]);
  },
);

test("requires baseline patterns without depending on their order", () => {
  const findings = comparePatterns(
    ["tmp/", "node_modules/"],
    ["node_modules/", "tmp/"],
  );
  const statuses = findings.map((finding) => finding.status);
  expect(statuses).toEqual(["matching"]);
});

test("reports only additional patterns as review items", () => {
  const findings = comparePatterns(
    ["tmp/"],
    [".claude/", "tmp/", "project.lock"],
  );
  expect(findings).toEqual([
    {
      actual: '[\n  ".claude/",\n  "tmp/",\n  "project.lock"\n]\n',
      expected: '[\n  "tmp/"\n]\n',
      path: ".oxfmtrc.json#ignorePatterns",
      status: "matching",
    },
    {
      actual: '[\n  ".claude/",\n  "project.lock"\n]\n',
      expected: "[]\n",
      path: ".oxfmtrc.json#ignorePatterns",
      status: "review",
    },
  ]);
});

test("reports removed baseline patterns as missing requirements", () => {
  const findings = comparePatterns(["tmp/", "node_modules/"], ["tmp/"]);
  expect(findings).toEqual([
    {
      actual: '[\n  "tmp/"\n]\n',
      expected: '[\n  "node_modules/"\n]\n',
      path: ".oxfmtrc.json#ignorePatterns",
      status: "missing",
    },
  ]);
});

test("reports missing patterns and additions separately", () => {
  const findings = comparePatterns(["tmp/"], ["src/"]);
  const statuses = findings.map((finding) => finding.status);
  expect(statuses).toEqual(["missing", "review"]);
});

test("reports a missing ignorePatterns key", () => {
  const findings = compareData({
    actual: "{}",
    expected: '{"ignorePatterns":["tmp/"]}',
    path: ".oxfmtrc.json",
  });
  const statuses = findings.map((finding) => finding.status);
  expect(statuses).toEqual(["missing"]);
});

test("does not relax unrelated arrays or files", () => {
  const otherFile = compareData({
    actual: '{"ignorePatterns":["tmp/","src/"]}',
    expected: '{"ignorePatterns":["tmp/"]}',
    path: "config.json",
  });
  const otherField = compareData({
    actual: '{"other":["tmp/","src/"]}',
    expected: '{"other":["tmp/"]}',
    path: ".oxfmtrc.json",
  });
  const statuses = [...otherFile, ...otherField].map(
    (finding) => finding.status,
  );
  expect(statuses).toEqual(["changed", "changed"]);
});

test("validates that patterns are strings and rejects non-array settings", () => {
  expect(() => comparePatterns(["tmp/"], [42])).toThrow();
  const findings = comparePatterns(["tmp/"], false);
  const statuses = findings.map((finding) => finding.status);
  expect(statuses).toEqual(["changed"]);
});
