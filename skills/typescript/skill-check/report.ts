import { log } from "../files/scripts/lib/log.ts";
import { output } from "../files/scripts/lib/output.ts";
import { compareSnapshot } from "./compare.ts";
import { parseDocument } from "./document.ts";
import { unifiedDiff } from "./diff.ts";
import { SnapshotSchema } from "./schema.ts";
import { printDiscoveryPatterns } from "./report-discovery.ts";
import type { Finding } from "./types.ts";

const headingColors: Readonly<Record<Finding["status"], string>> = {
  changed: "\x1b[33m",
  matching: "\x1b[32m",
  missing: "\x1b[31m",
  review: "\x1b[36m",
};

const printFinding = (finding: Finding): void => {
  const color = headingColors[finding.status];
  output.text(`${color}${finding.status.toUpperCase()} ${finding.path}\x1b[0m`);
  if (
    finding.status === "review" &&
    [
      ".oxfmtrc.json#ignorePatterns",
      ".oxlintrc.json#ignorePatterns",
      "tsconfig.json#exclude",
    ].includes(finding.path) &&
    finding.actual !== null
  ) {
    const extra = finding.actual.trimEnd().replaceAll("\n", "\n  ");
    output.text(`  extra items: ${extra}`);
    return;
  }
  if (
    finding.status === "review" &&
    ["knip.json#entry", "knip.json#project"].includes(finding.path) &&
    finding.actual !== null
  ) {
    printDiscoveryPatterns(finding.expected, finding.actual);
    return;
  }
  if (/\.(?:json|ya?ml)(?:#|$)/.test(finding.path)) {
    const expected = finding.expected.trimEnd().replaceAll("\n", "\n  ");
    const label = finding.status === "review" ? "baseline" : "required";
    output.text(`  ${label}: ${expected}`);
    if (finding.actual !== null) {
      const actual = finding.actual.trimEnd().replaceAll("\n", "\n  ");
      output.text(`  actual:   ${actual}`);
    }
    return;
  }
  if (
    (finding.status !== "changed" && finding.status !== "review") ||
    finding.actual === null
  )
    return;
  const diff = unifiedDiff(finding.path, finding.expected, finding.actual);
  const text = diff.trimEnd();
  output.text(text);
};

const main = async (): Promise<void> => {
  const text = await Bun.stdin.text();
  const input = parseDocument(text, "snapshot.json");
  const snapshot = SnapshotSchema.parse(input);
  const findings = compareSnapshot(snapshot);
  const differences = findings.filter(
    (finding) => finding.status !== "matching",
  );
  differences.forEach((finding, index) => {
    if (index > 0) output.text("");
    printFinding(finding);
  });
  const review = differences.filter((finding) => finding.status === "review");
  const failures = differences.length - review.length;
  log.info(`failures: ${failures}; review: ${review.length}`);
  process.exitCode = differences.length === 0 ? 0 : 1;
};

await main();
