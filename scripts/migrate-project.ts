import {
  existsSync,
  readdirSync,
  renameSync,
  readFileSync,
  writeFileSync,
  statSync,
} from "fs";
import { join } from "path";
import { log } from "./log";

const args = process.argv.slice(2);
const [oldPath, newPath] = args;
if (args.length !== 2 || oldPath === undefined || newPath === undefined) {
  log.error("Usage: migrate-project <old-path> <new-path>");
  log.error(
    "Example: migrate-project /mnt/work/projects/trader /home/jruz/dev/trader",
  );
  process.exit(1);
}

const home = process.env["HOME"];
if (home === undefined) {
  log.error("HOME not set");
  process.exit(1);
}
const claudeDir = join(home, ".claude");
const projectsDir = join(claudeDir, "projects");
const historyFile = join(claudeDir, "history.jsonl");

const pathToKey = (p: string): string => p.replaceAll("/", "-");

const oldKey = pathToKey(oldPath);
const newKey = pathToKey(newPath);

const matchesOldKey = (name: string): boolean =>
  name === oldKey || name.startsWith(`${oldKey}-`);

const safeReaddir = (dir: string): string[] => {
  try {
    return readdirSync(dir);
  } catch (err) {
    log.error(`failed to read dir ${dir}: ${String(err)}`);
    process.exit(1);
  }
};

const projectDirs = safeReaddir(projectsDir).filter(matchesOldKey);

if (projectDirs.length === 0) {
  log.error(`no project directories found matching ${oldKey}`);
  process.exit(1);
}

log.ok(`found ${projectDirs.length} project directories to migrate`);
projectDirs.forEach((d) => {
  log.ok(`  ${d}`);
});

const escapeRegex = (s: string): string =>
  s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const oldPathRegex = new RegExp(escapeRegex(oldPath), "g");

const countOccurrences = (content: string): number => {
  const matches = content.match(oldPathRegex);
  if (matches === null) return 0;
  return matches.length;
};

const replaceInFile = (filePath: string): number => {
  let content: string;
  try {
    content = readFileSync(filePath, "utf-8");
  } catch (err) {
    log.error(`failed to read ${filePath}: ${String(err)}`);
    process.exit(1);
  }
  const count = countOccurrences(content);
  if (count === 0) return 0;
  const replaced = content.replaceAll(oldPath, newPath);
  try {
    writeFileSync(filePath, replaced);
  } catch (err) {
    log.error(`failed to write ${filePath}: ${String(err)}`);
    process.exit(1);
  }
  return count;
};

const isDirectory = (full: string): boolean => {
  try {
    return statSync(full).isDirectory();
  } catch (err) {
    log.error(`failed to stat ${full}: ${String(err)}`);
    process.exit(1);
  }
};

const walkFiles = (
  dir: string,
  predicate: (name: string) => boolean,
): string[] => {
  const entries = safeReaddir(dir);
  return entries.flatMap((entry) => {
    const full = join(dir, entry);
    if (isDirectory(full)) return walkFiles(full, predicate);
    if (predicate(entry)) return [full];
    return [];
  });
};

const isTargetFile = (name: string): boolean =>
  name.endsWith(".jsonl") || name.endsWith(".meta.json");

type MigrationResult = {
  files: number;
  replacements: number;
};

const migrateDir = (dir: string): MigrationResult => {
  const oldDir = join(projectsDir, dir);
  const newDirName = dir.replace(oldKey, newKey);
  const newDir = join(projectsDir, newDirName);

  if (existsSync(newDir)) {
    log.error(`target directory already exists: ${newDirName}`);
    process.exit(1);
  }

  const files = walkFiles(oldDir, isTargetFile);
  const counts = files.map(replaceInFile);
  const replacements = counts.reduce((sum, c) => sum + c, 0);
  const changed = counts.filter((c) => c > 0).length;

  try {
    renameSync(oldDir, newDir);
  } catch (err) {
    log.error(`failed to rename ${oldDir}: ${String(err)}`);
    process.exit(1);
  }
  log.ok(
    `${dir} → ${newDirName} (${files.length} files scanned, ${changed} updated)`,
  );
  return { files: changed, replacements };
};

const results = projectDirs.map(migrateDir);
let totalFiles = results.reduce((sum, r) => sum + r.files, 0);
let totalReplacements = results.reduce((sum, r) => sum + r.replacements, 0);

if (existsSync(historyFile)) {
  const count = replaceInFile(historyFile);
  if (count > 0) {
    totalReplacements += count;
    totalFiles += 1;
    log.ok(`history.jsonl — ${count} replacements`);
  }
}

log.ok(
  `migrated ${projectDirs.length} directories, ${totalReplacements} path replacements across ${totalFiles} files`,
);
