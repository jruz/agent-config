import { expect, test } from "bun:test";
import { unifiedDiff } from "./diff.ts";

test("omits unchanged files", () => {
  const diff = unifiedDiff("config", "same\n", "same\n");
  expect(diff).toBe("");
});

test("renders replacements with surrounding context", () => {
  const diff = unifiedDiff(
    "config",
    "before\nold\nafter\n",
    "before\nnew\nafter\n",
  );
  expect(diff).toBe(
    "--- skill/config\n+++ project/config\n@@ -1,3 +1,3 @@\n before\n-old\n+new\n after\n",
  );
});

test("renders empty files, insertions, and deletions", () => {
  const creation = unifiedDiff("config", "", "new\n");
  const deletion = unifiedDiff("config", "old\n", "");
  const insertion = unifiedDiff(
    "config",
    "before\nafter\n",
    "before\nnew\nafter\n",
  );
  expect(creation).toBe(
    "--- skill/config\n+++ project/config\n@@ -0,0 +1,1 @@\n+new\n",
  );
  expect(deletion).toBe(
    "--- skill/config\n+++ project/config\n@@ -1,1 +0,0 @@\n-old\n",
  );
  expect(insertion).toContain(" before\n+new\n after\n");
});

test("preserves final newline differences", () => {
  const diff = unifiedDiff("config", "same\n", "same");
  expect(diff).toContain("-same\n+same\n\\ No newline at end of file\n");
});

test("limits unchanged context at both ends", () => {
  const before = "0\n1\n2\n3\n4\nold\n6\n7\n8\n9\n10\n";
  const after = before.replace("old", "new");
  const diff = unifiedDiff("config", before, after);
  expect(diff).toContain("@@ -3,7 +3,7 @@");
  expect(diff).not.toContain(" 0\n");
  expect(diff).not.toContain(" 10\n");
});
