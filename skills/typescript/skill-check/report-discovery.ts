import { output } from "../files/scripts/lib/output.ts";
import { DiscoveryPatternsSchema } from "./discovery-patterns.ts";
import { parseDocument } from "./document.ts";

const printItems = (label: string, items: readonly string[]): void => {
  if (items.length === 0) return;
  const text = JSON.stringify(items, null, 2).replaceAll("\n", "\n  ");
  output.text(`  ${label}: ${text}`);
};

export const printDiscoveryPatterns = (
  expected: string,
  actual: string,
): void => {
  const baselineData = parseDocument(expected, "baseline patterns");
  const configuredData = parseDocument(actual, "configured patterns");
  const baseline = DiscoveryPatternsSchema.parse(baselineData);
  const configured = DiscoveryPatternsSchema.parse(configuredData);
  const extra = configured.filter((pattern) => !baseline.includes(pattern));
  const removed = baseline.filter((pattern) => !configured.includes(pattern));
  if (extra.length === 0 && removed.length === 0) {
    output.text("  item order or repetition changed");
    return;
  }
  printItems("extra items", extra);
  printItems("removed items", removed);
};
