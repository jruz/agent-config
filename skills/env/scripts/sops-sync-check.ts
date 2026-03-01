import { readdirSync, readFileSync } from "node:fs";
import process from "node:process";
import { log } from "./log.ts";

type EnvFile = { file: string; keys: string[] };

function findEnvFiles(): string[] {
  try {
    return readdirSync(".")
      .filter((f) => /^\.env\..+\.yaml$/.test(f))
      .sort();
  } catch (e) {
    log.error(`Failed to read directory: ${e}`);
    return [];
  }
}

function parseTopLevelKeys(file: string): string[] | null {
  try {
    const content = readFileSync(file, "utf-8");
    return content
      .split("\n")
      .filter((line) => /^\S+:/.test(line))
      .map((line) => line.split(":")[0])
      .filter((key) => key !== "sops")
      .sort();
  } catch (e) {
    log.error(`Failed to read ${file}: ${e}`);
    return null;
  }
}

function main() {
  const files = findEnvFiles();

  if (files.length < 2) {
    log.error(`Expected at least 2 env files, found: ${files.join(", ")}`);
    process.exit(1);
  }

  const parsed: EnvFile[] = files.flatMap((file) => {
    const keys = parseTopLevelKeys(file);
    if (keys === null) return [];
    return [{ file, keys }];
  });

  const reference = parsed[0];
  const allMatch = parsed
    .slice(1)
    .every(
      (entry) => JSON.stringify(entry.keys) === JSON.stringify(reference.keys),
    );

  if (allMatch) {
    log.info("OK: All files have the same keys");
    log.info(`Keys: ${reference.keys.join(", ")}`);
    return;
  }

  const allKeys = [...new Set(parsed.flatMap((entry) => entry.keys))].sort();

  log.error("FAIL: Keys do not match across files");
  console.log();

  allKeys
    .map((key) => ({
      key,
      missingFrom: parsed
        .filter((entry) => !entry.keys.includes(key))
        .map((entry) => entry.file),
    }))
    .filter(({ missingFrom }) => missingFrom.length > 0)
    .forEach(({ key, missingFrom }) => {
      console.log(`  ${key}`);
      console.log(`    missing from: ${missingFrom.join(", ")}`);
    });

  process.exit(1);
}

main();
