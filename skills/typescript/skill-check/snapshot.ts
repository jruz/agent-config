import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { log } from "../files/scripts/lib/log.ts";
import type { Snapshot } from "./schema.ts";

const readProjectFile = (path: string): string | null => {
  try {
    const stats = statSync(path, { throwIfNoEntry: false });
    if (stats === undefined) return null;
    return readFileSync(path, "utf8");
  } catch (error) {
    log.error(`cannot read file: ${path}`);
    throw error;
  }
};

export const listTemplateFiles = (
  skill: string,
  directory: string,
): readonly string[] => {
  const path = join(skill, directory);
  try {
    return readdirSync(path, { withFileTypes: true })
      .toSorted((left, right) => left.name.localeCompare(right.name))
      .flatMap((entry) => {
        const entryPath = join(directory, entry.name);
        return entry.isDirectory()
          ? listTemplateFiles(skill, entryPath)
          : [entryPath];
      });
  } catch (error) {
    log.error(`cannot list directory: ${path}`);
    throw error;
  }
};

export const collectSnapshot = (project: string, skill: string): Snapshot => {
  try {
    if (!statSync(project).isDirectory()) {
      throw new Error(`not a directory: ${project}`);
    }
    const paths = listTemplateFiles(skill, "");
    return {
      files: paths.map((path) => {
        const expectedPath = join(skill, path);
        const actualPath = join(project, path);
        return {
          actual: readProjectFile(actualPath),
          expected: readFileSync(expectedPath, "utf8"),
          path,
        };
      }),
    };
  } catch (error) {
    log.error(`cannot collect project: ${project}`);
    throw error;
  }
};
