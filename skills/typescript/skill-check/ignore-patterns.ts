import { z } from "zod";
import type { Json } from "./schema.ts";
import type { Finding } from "./types.ts";

const PatternSchema = z.string();
const PatternsSchema = z.array(PatternSchema).readonly();

export const compareIgnorePatterns = (
  path: string,
  expected: readonly Json[],
  actual: readonly Json[],
): readonly Finding[] => {
  const required = PatternsSchema.parse(expected);
  const configured = PatternsSchema.parse(actual);
  const missing = required.filter((pattern) => !configured.includes(pattern));
  const extra = configured.filter((pattern) => !required.includes(pattern));
  const baseline: Finding = {
    actual: `${JSON.stringify(configured, null, 2)}\n`,
    expected: `${JSON.stringify(missing.length === 0 ? required : missing, null, 2)}\n`,
    path,
    status: missing.length === 0 ? "matching" : "missing",
  };
  if (extra.length === 0) return [baseline];
  return [
    baseline,
    {
      actual: `${JSON.stringify(extra, null, 2)}\n`,
      expected: "[]\n",
      path,
      status: "review",
    },
  ];
};
