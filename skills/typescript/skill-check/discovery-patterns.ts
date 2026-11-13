import { isDeepStrictEqual } from "node:util";
import { z } from "zod";
import type { Json } from "./schema.ts";
import type { Finding } from "./types.ts";

const PatternSchema = z.string();
export const DiscoveryPatternsSchema = z.array(PatternSchema).readonly();

export const compareDiscoveryPatterns = (
  path: string,
  expected: readonly Json[],
  actual: readonly Json[],
): readonly Finding[] => {
  const baseline = DiscoveryPatternsSchema.parse(expected);
  const configured = DiscoveryPatternsSchema.parse(actual);
  return [
    {
      actual: `${JSON.stringify(configured, null, 2)}\n`,
      expected: `${JSON.stringify(baseline, null, 2)}\n`,
      path,
      status: isDeepStrictEqual(baseline, configured) ? "matching" : "review",
    },
  ];
};
