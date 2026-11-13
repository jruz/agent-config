import { expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { join } from "node:path";

const reportConfigPatterns = (
  path: string,
  key: string,
  expected: readonly string[],
  actual: readonly string[],
) => {
  const entrypoint = join(import.meta.dir, "report.ts");
  const input = JSON.stringify({
    files: [
      {
        actual: JSON.stringify({ [key]: actual }),
        expected: JSON.stringify({ [key]: expected }),
        path,
      },
    ],
  });
  const result = spawnSync("bun", [entrypoint], { encoding: "utf8", input });
  if (result.error !== undefined) throw result.error;
  return result;
};

test("shows a unified diff for flake review findings", () => {
  const input = JSON.stringify({
    files: [{ actual: "project\n", expected: "baseline\n", path: "flake.nix" }],
  });
  const result = spawnSync("bun", [join(import.meta.dir, "report.ts")], {
    encoding: "utf8",
    input,
  });
  if (result.error !== undefined) throw result.error;
  expect(result.status).toBe(1);
  expect(result.stdout).toContain("REVIEW flake.nix");
  expect(result.stdout).toContain("-baseline");
  expect(result.stdout).toContain("+project");
  expect(result.stderr).toContain("failures: 0; review: 1");
});

const reportPatterns = (actual: readonly string[]) =>
  reportConfigPatterns(".oxfmtrc.json", "ignorePatterns", ["tmp/"], actual);

test.each([
  { key: "exclude", path: "tsconfig.json" },
  { key: "ignorePatterns", path: ".oxlintrc.json" },
])("reports additional exclusions as review in $path", ({ path, key }) => {
  const result = reportConfigPatterns(
    path,
    key,
    ["target/"],
    ["target/", "skills/synced/"],
  );
  expect(result.status).toBe(1);
  expect(result.stdout).toContain(`REVIEW ${path}#${key}`);
  expect(result.stdout).toContain("extra items:");
  expect(result.stdout).not.toContain('"target/"');
  expect(result.stderr).toContain("failures: 0; review: 1");
});

test.each(["entry", "project"])(
  "reports only extra and removed Knip %s items",
  (key) => {
    const result = reportConfigPatterns(
      "knip.json",
      key,
      ["scripts/*.ts!", "src/**"],
      ["scripts/*.ts!", "hooks/**"],
    );
    expect(result.status).toBe(1);
    expect(result.stdout).toContain(`REVIEW knip.json#${key}`);
    expect(result.stdout).toContain('extra items: [\n    "hooks/**"\n  ]');
    expect(result.stdout).toContain('removed items: [\n    "src/**"\n  ]');
    expect(result.stdout).not.toContain('"scripts/*.ts!"');
    expect(result.stdout).not.toContain("baseline:");
    expect(result.stdout).not.toContain("actual:");
    expect(result.stderr).toContain("failures: 0; review: 1");
  },
);

test.each([
  {
    actual: ["scripts/**", "hooks/**"],
    expected: ["scripts/**"],
    hidden: "removed items:",
    name: "additions",
    shown: "extra items:",
  },
  {
    actual: ["scripts/**"],
    expected: ["scripts/**", "src/**"],
    hidden: "extra items:",
    name: "removals",
    shown: "removed items:",
  },
])(
  "reports Knip $name without empty lists",
  ({ expected, actual, shown, hidden }) => {
    const result = reportConfigPatterns("knip.json", "entry", expected, actual);
    expect(result.status).toBe(1);
    expect(result.stdout).toContain(shown);
    expect(result.stdout).not.toContain(hidden);
    expect(result.stdout).not.toContain('"scripts/**"');
    expect(result.stderr).toContain("failures: 0; review: 1");
  },
);

test.each([
  {
    actual: ["!src/tests/**", "src/**"],
    expected: ["src/**", "!src/tests/**"],
  },
  { actual: ["src/**", "src/**"], expected: ["src/**"] },
])("keeps order and repetition changes visible", ({ expected, actual }) => {
  const result = reportConfigPatterns("knip.json", "project", expected, actual);
  expect(result.status).toBe(1);
  expect(result.stdout).toContain("item order or repetition changed");
  expect(result.stdout).not.toContain("extra items:");
  expect(result.stdout).not.toContain("removed items:");
  expect(result.stderr).toContain("failures: 0; review: 1");
});

test("matching exclusions exit successfully without matching output", () => {
  const result = reportPatterns(["tmp/"]);
  expect(result.status).toBe(0);
  expect(result.stdout).toBe("");
  expect(result.stderr).toContain("failures: 0; review: 0");
});

test("additional exclusions are visible review items and still exit nonzero", () => {
  const result = reportPatterns(["tmp/", "src/"]);
  expect(result.status).toBe(1);
  expect(result.stdout).toContain("REVIEW .oxfmtrc.json#ignorePatterns");
  expect(result.stdout).toContain("extra items:");
  expect(result.stdout).toContain('"src/"');
  expect(result.stdout).not.toContain('"tmp/"');
  expect(result.stderr).toContain("failures: 0; review: 1");
});

test("removed baseline exclusions remain failures", () => {
  const result = reportPatterns([]);
  expect(result.status).toBe(1);
  expect(result.stdout).toContain("MISSING .oxfmtrc.json#ignorePatterns");
  expect(result.stderr).toContain("failures: 1; review: 0");
});

test("separates findings with blank lines and colors their headings", () => {
  const result = reportPatterns(["src/"]);
  expect(result.stdout).toContain(
    "\x1b[31mMISSING .oxfmtrc.json#ignorePatterns\x1b[0m",
  );
  expect(result.stdout).toContain(
    "\n\n\x1b[36mREVIEW .oxfmtrc.json#ignorePatterns\x1b[0m",
  );
});
