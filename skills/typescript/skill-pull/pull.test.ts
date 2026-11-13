import { expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { pullTemplates } from "./pull.ts";
import type { gitPaths } from "./pull.ts";

const writeFixtureFile = async (
  root: string,
  path: string,
  text: string,
): Promise<void> => {
  const target = join(root, path);
  const directory = dirname(target);
  await mkdir(directory, { recursive: true });
  await writeFile(target, text);
};

const readFixtureFile = async (root: string, path: string): Promise<string> => {
  const target = join(root, path);
  return readFile(target, "utf8");
};

const gitState =
  (changed: readonly string[]): typeof gitPaths =>
  (_project, args) => {
    switch (args[0]) {
      case "diff":
        return changed;
      case "ls-files":
        return ["justfile", "project-only.txt"];
      default:
        throw new Error(`unexpected git command: ${args.join(" ")}`);
    }
  };

const withFixture = async (
  run: (project: string, templates: string) => Promise<void>,
): Promise<void> => {
  const temporary = tmpdir();
  const prefix = join(temporary, "skill-pull-");
  const root = await mkdtemp(prefix);
  const project = join(root, "project with spaces");
  const templates = join(root, "templates");
  try {
    await writeFixtureFile(project, "justfile", "project recipes\n");
    await writeFixtureFile(project, "project-only.txt", "keep me\n");
    await writeFixtureFile(templates, "justfile", "template recipes\n");
    await writeFixtureFile(templates, ".hidden/nested.ts", "helper\n");
    await run(project, templates);
  } finally {
    await rm(root, { recursive: true });
  }
};

test("copies every template including hidden files and preserves project-only files", async () => {
  await withFixture(async (project, templates) => {
    const readGitPaths = gitState([]);
    const result = await pullTemplates(project, templates, readGitPaths);
    expect(result).toEqual({
      data: [".hidden/nested.ts", "justfile"],
      success: true,
    });
    const recipes = await readFixtureFile(project, "justfile");
    const helper = await readFixtureFile(project, ".hidden/nested.ts");
    const projectOnly = await readFixtureFile(project, "project-only.txt");
    expect(recipes).toBe("template recipes\n");
    expect(helper).toBe("helper\n");
    expect(projectOnly).toBe("keep me\n");
  });
});

test("refuses changed tracked targets before copying any files", async () => {
  await withFixture(async (project, templates) => {
    await writeFixtureFile(project, "justfile", "local edits\n");
    const readGitPaths = gitState(["justfile"]);
    const result = await pullTemplates(project, templates, readGitPaths);
    expect(result).toEqual({
      error: { code: "dirty-targets", paths: ["justfile"] },
      success: false,
    });
    const helper = join(project, ".hidden/nested.ts");
    const helperExists = existsSync(helper);
    const recipes = await readFixtureFile(project, "justfile");
    expect(helperExists).toBe(false);
    expect(recipes).toBe("local edits\n");
  });
});

test("refuses deleted tracked targets rather than recreating them", async () => {
  await withFixture(async (project, templates) => {
    const recipes = join(project, "justfile");
    await rm(recipes);
    const readGitPaths = gitState(["justfile"]);
    const result = await pullTemplates(project, templates, readGitPaths);
    expect(result.success).toBe(false);
    const helper = join(project, ".hidden/nested.ts");
    const recipesExist = existsSync(recipes);
    const helperExists = existsSync(helper);
    expect(recipesExist).toBe(false);
    expect(helperExists).toBe(false);
  });
});

test.each(["untracked", "ignored"])(
  "refuses existing %s template targets",
  async (state) => {
    await withFixture(async (project, templates) => {
      await writeFixtureFile(project, ".hidden/nested.ts", "local helper\n");
      if (state === "ignored")
        await writeFixtureFile(project, ".gitignore", ".hidden/\n");
      const readGitPaths = gitState([]);
      const result = await pullTemplates(project, templates, readGitPaths);
      expect(result).toEqual({
        error: { code: "dirty-targets", paths: [".hidden/nested.ts"] },
        success: false,
      });
      const recipes = await readFixtureFile(project, "justfile");
      const helper = await readFixtureFile(project, ".hidden/nested.ts");
      expect(recipes).toBe("project recipes\n");
      expect(helper).toBe("local helper\n");
    });
  },
);

test("allows unrelated uncommitted changes", async () => {
  await withFixture(async (project, templates) => {
    await writeFixtureFile(project, "project-only.txt", "local edits\n");
    const readGitPaths = gitState(["project-only.txt"]);
    const result = await pullTemplates(project, templates, readGitPaths);
    expect(result.success).toBe(true);
    const projectOnly = await readFixtureFile(project, "project-only.txt");
    expect(projectOnly).toBe("local edits\n");
  });
});

test("propagates unexpected git failures before copying", async () => {
  await withFixture(async (project, templates) => {
    const failure = new Error("git unavailable");
    const failGit: typeof gitPaths = () => {
      throw failure;
    };
    const result = pullTemplates(project, templates, failGit);
    const error = await result.then(
      () => {
        throw new Error("expected rejection: pull resolved");
      },
      (error: unknown) => error,
    );
    expect(error).toBe(failure);
    const helper = join(project, ".hidden/nested.ts");
    const helperExists = existsSync(helper);
    expect(helperExists).toBe(false);
  });
});
