const splitLines = (text: string): readonly string[] => {
  const lines = text.match(/[^\n]*\n|[^\n]+$/g);
  return lines === null ? [] : lines;
};

const commonPrefix = (
  left: readonly string[],
  right: readonly string[],
): number => {
  const index = left.findIndex((line, position) => line !== right[position]);
  return index === -1 ? left.length : index;
};

const renderLines = (prefix: string, lines: readonly string[]): string =>
  lines
    .map((line) =>
      line.endsWith("\n")
        ? `${prefix}${line}`
        : `${prefix}${line}\n\\ No newline at end of file\n`,
    )
    .join("");

const range = (start: number, count: number): string =>
  `${count === 0 ? start : start + 1},${count}`;

export const unifiedDiff = (
  path: string,
  expected: string,
  actual: string,
): string => {
  if (expected === actual) return "";
  const before = splitLines(expected);
  const after = splitLines(actual);
  const prefix = commonPrefix(before, after);
  const beforeRemaining = before.slice(prefix).toReversed();
  const afterRemaining = after.slice(prefix).toReversed();
  const suffix = commonPrefix(beforeRemaining, afterRemaining);
  const start = Math.max(0, prefix - 3);
  const beforeEnd = Math.min(before.length, before.length - suffix + 3);
  const afterEnd = Math.min(after.length, after.length - suffix + 3);
  const leading = before.slice(start, prefix);
  const removed = before.slice(prefix, before.length - suffix);
  const added = after.slice(prefix, after.length - suffix);
  const trailing = before.slice(before.length - suffix, beforeEnd);
  return [
    `--- skill/${path}\n+++ project/${path}\n`,
    `@@ -${range(start, beforeEnd - start)} +${range(start, afterEnd - start)} @@\n`,
    renderLines(" ", leading),
    renderLines("-", removed),
    renderLines("+", added),
    renderLines(" ", trailing),
  ].join("");
};
