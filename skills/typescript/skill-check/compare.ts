import { compareData } from "./compare-data.ts";
import type { Snapshot } from "./schema.ts";
import type { Finding } from "./types.ts";

const compareText = (
  path: string,
  expected: string,
  actual: string | null,
): Finding => {
  if (actual === null) return { actual, expected, path, status: "missing" };
  if (expected === actual) {
    return { actual, expected, path, status: "matching" };
  }
  return {
    actual,
    expected,
    path,
    status: ["flake.nix", ".envrc", "justfile"].includes(path)
      ? "review"
      : "changed",
  };
};

export const compareSnapshot = (snapshot: Snapshot): readonly Finding[] =>
  snapshot.files.flatMap((file) =>
    /\.(?:json|ya?ml)$/.test(file.path)
      ? compareData(file)
      : [compareText(file.path, file.expected, file.actual)],
  );
