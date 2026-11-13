import { spawnSync } from "node:child_process";
import { copyFile, lstat, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { z } from "zod";
import { listTemplateFiles } from "../skill-check/snapshot.ts";

import type { PullResult } from "./pull.types.ts";

const MissingFileSchema = z.object({ code: z.literal("ENOENT") }).readonly();

export const gitPaths = (
  project: string,
  args: readonly string[],
): readonly string[] => {
  const result = spawnSync("git", args, { cwd: project, encoding: "utf8" });
  if (result.error !== undefined) throw result.error;
  if (result.status !== 0)
    throw new Error(`git failed: ${result.stderr.trim()}`);
  return result.stdout.split("\0").filter((path) => path !== "");
};

export const pullTemplates = async (
  project: string,
  templates: string,
  readGitPaths: typeof gitPaths,
): Promise<PullResult> => {
  const paths = listTemplateFiles(templates, "");
  const changed = new Set(
    readGitPaths(project, ["diff", "HEAD", "--name-only", "-z", "--"]),
  );
  const tracked = new Set(
    readGitPaths(project, ["ls-files", "--cached", "-z"]),
  );
  const pendingConflicts = paths.map(async (path) => {
    if (changed.has(path)) return path;
    const target = join(project, path);
    try {
      const existing = await lstat(target);
      return !tracked.has(path) || !existing.isFile() ? path : null;
    } catch (error) {
      const missing = MissingFileSchema.safeParse(error);
      if (missing.success) return null;
      throw error;
    }
  });
  const inspectedPaths = await Promise.all(pendingConflicts);
  const conflicts = inspectedPaths.filter((path) => path !== null);
  if (conflicts.length > 0) {
    return {
      error: { code: "dirty-targets", paths: conflicts },
      success: false,
    };
  }
  const pendingCopies = paths.map(async (path) => {
    const target = join(project, path);
    const source = join(templates, path);
    const directory = dirname(target);
    await mkdir(directory, { recursive: true });
    await copyFile(source, target);
  });
  await Promise.all(pendingCopies);
  return { data: paths, success: true };
};
