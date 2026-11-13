import { isDeepStrictEqual } from "node:util";
import { parseDocument } from "./document.ts";
import { compareIgnorePatterns } from "./ignore-patterns.ts";
import { compareDiscoveryPatterns } from "./discovery-patterns.ts";
import { JsonSchema } from "./schema.ts";
import type { File, Json } from "./schema.ts";
import type { Finding } from "./types.ts";

const printValue = (value: Json): string =>
  `${JSON.stringify(value, null, 2)}\n`;

const compareValue = (
  path: string,
  expected: Json,
  actual: Json | undefined,
): readonly Finding[] => {
  const expectedText = printValue(expected);
  if (actual === undefined) {
    return [{ actual: null, expected: expectedText, path, status: "missing" }];
  }
  if (
    [
      ".oxfmtrc.json.ignorePatterns",
      ".oxlintrc.json.ignorePatterns",
      "tsconfig.json.exclude",
    ].includes(path) &&
    Array.isArray(expected) &&
    Array.isArray(actual)
  ) {
    return compareIgnorePatterns(path, expected, actual);
  }
  if (
    ["knip.json.entry", "knip.json.project"].includes(path) &&
    Array.isArray(expected) &&
    Array.isArray(actual)
  ) {
    return compareDiscoveryPatterns(path, expected, actual);
  }
  if (
    expected !== null &&
    typeof expected === "object" &&
    !Array.isArray(expected) &&
    actual !== null &&
    typeof actual === "object" &&
    !Array.isArray(actual)
  ) {
    return Object.entries(expected).flatMap(([key, value]) =>
      compareValue(`${path}.${key}`, value, actual[key]),
    );
  }
  return [
    {
      actual: printValue(actual),
      expected: expectedText,
      path,
      status: isDeepStrictEqual(expected, actual) ? "matching" : "changed",
    },
  ];
};

export const compareData = (file: File): readonly Finding[] => {
  const expectedJson = parseDocument(file.expected, `skill/${file.path}`);
  const expected = JsonSchema.parse(expectedJson);
  if (file.actual === null) {
    return [
      {
        actual: null,
        expected: file.expected,
        path: file.path,
        status: "missing",
      },
    ];
  }
  const actualJson = parseDocument(file.actual, `project/${file.path}`);
  const actual = JsonSchema.parse(actualJson);
  const findings = compareValue(file.path, expected, actual);
  return findings.map((finding) => ({
    ...finding,
    path: finding.path.replace(`${file.path}.`, `${file.path}#`),
  }));
};
