import { expect, test } from "bun:test";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { log } from "../files/scripts/lib/log.ts";
import { collectSnapshot } from "./snapshot.ts";

const writeFixtureFile = (
  root: string,
  path: string,
  contents: string,
): void => {
  const file = join(root, path);
  const directory = dirname(file);
  try {
    mkdirSync(directory, { recursive: true });
    writeFileSync(file, contents);
  } catch (error) {
    log.error(`cannot write fixture: ${file}`);
    throw error;
  }
};

const readFixtureFile = (path: string): string => {
  try {
    return readFileSync(path, "utf8");
  } catch (error) {
    log.error(`cannot read fixture: ${path}`);
    throw error;
  }
};

const withFixture = (run: (skill: string, project: string) => void): void => {
  const temporaryDirectory = tmpdir();
  const prefix = join(temporaryDirectory, "ts-skill-check-");
  const root = mkdtempSync(prefix);
  const skill = join(root, "skill");
  const project = join(root, "project with spaces");
  try {
    mkdirSync(project);
    [
      "tsconfig.json",
      ".oxlintrc.json",
      ".oxfmtrc.json",
      "knip.json",
      "pnpm-workspace.yaml",
      "package.json",
      "flake.nix",
      "scripts/sandbox.nu",
      "Dockerfile.node",
      ".envrc",
      "justfile",
      "scripts/lib/log.ts",
      "scripts/lib/output.ts",
      "scripts/lib/table.types.ts",
      "scripts/lib/table.test.ts",
      "scripts/new/nested/helper.ts",
      ".just/ts.justfile",
      ".just/bun.justfile",
      ".oxlint/plugin.ts",
      ".oxlint/rules/nested.ts",
    ].forEach((path) => {
      writeFixtureFile(skill, path, path);
    });
    run(skill, project);
  } finally {
    rmSync(root, { recursive: true });
  }
};

test("discovers every template file without collecting unrelated project files", () => {
  withFixture((skill, project) => {
    writeFixtureFile(project, "tsconfig.json", "project config");
    writeFixtureFile(project, ".oxlint/plugin.ts", "project plugin");
    writeFixtureFile(project, ".oxlint/extra.ts", "project addition");
    writeFixtureFile(project, "justfile", "project-specific root recipes");
    writeFixtureFile(project, ".just/ts.justfile", "check:\n    tsc\n");
    writeFixtureFile(project, ".just/extra.justfile", "project addition");
    writeFixtureFile(project, ".env", "must not be collected");
    const snapshot = collectSnapshot(project, skill);
    const paths = snapshot.files.map((file) => file.path);
    const tsconfig = snapshot.files.find(
      (file) => file.path === "tsconfig.json",
    );
    const sortedPaths = paths.toSorted();
    const expectedPaths = [
      "tsconfig.json",
      ".oxlintrc.json",
      ".oxfmtrc.json",
      "knip.json",
      "pnpm-workspace.yaml",
      "package.json",
      "flake.nix",
      "scripts/sandbox.nu",
      "Dockerfile.node",
      ".envrc",
      "justfile",
      "scripts/lib/log.ts",
      "scripts/lib/output.ts",
      "scripts/lib/table.types.ts",
      "scripts/lib/table.test.ts",
      "scripts/new/nested/helper.ts",
      ".just/bun.justfile",
      ".just/ts.justfile",
      ".oxlint/plugin.ts",
      ".oxlint/rules/nested.ts",
    ].toSorted();
    expect(sortedPaths).toEqual(expectedPaths);
    expect(tsconfig).toEqual({
      actual: "project config",
      expected: "tsconfig.json",
      path: "tsconfig.json",
    });
    const module = snapshot.files.find(
      (file) => file.path === ".just/ts.justfile",
    );
    expect(module?.actual).toBe("check:\n    tsc\n");
  });
});

test("new templates are required without updating a file list", () => {
  withFixture((skill, project) => {
    const path = "scripts/new-feature/.hidden/helper.ts";
    writeFixtureFile(skill, path, "new helper\n");
    const missing = collectSnapshot(project, skill).files.find(
      (file) => file.path === path,
    );
    expect(missing).toEqual({ actual: null, expected: "new helper\n", path });
    writeFixtureFile(project, path, "project helper\n");
    const present = collectSnapshot(project, skill).files.find(
      (file) => file.path === path,
    );
    expect(present).toEqual({
      actual: "project helper\n",
      expected: "new helper\n",
      path,
    });
  });
});

test("represents missing configs and modules without hiding errors", () => {
  withFixture((skill, project) => {
    const snapshot = collectSnapshot(project, skill);
    const allMissing = snapshot.files.every((file) => file.actual === null);
    const absentProject = join(project, "absent");
    const nonDirectoryProject = join(project, "tsconfig.json");
    expect(allMissing).toBe(true);
    expect(() => collectSnapshot(absentProject, skill)).toThrow();
    writeFixtureFile(project, "tsconfig.json", "{}");
    expect(() => collectSnapshot(nonDirectoryProject, skill)).toThrow(
      "not a directory",
    );
  });
});

test("does not modify project files", () => {
  withFixture((skill, project) => {
    writeFixtureFile(project, "package.json", '{"name":"project"}\n');
    collectSnapshot(project, skill);
    const path = join(project, "package.json");
    const contents = readFixtureFile(path);
    expect(contents).toBe('{"name":"project"}\n');
  });
});
