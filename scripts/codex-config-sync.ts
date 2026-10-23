import { chmodSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import {
  parse,
  stringify,
  TomlDate,
  type TomlTable,
  type TomlValue,
} from "smol-toml";
import { log } from "./lib/log.ts";

const SCRIPT_DIR = dirname(import.meta.filename);
const PROJECT_DIR = dirname(SCRIPT_DIR);
const SHARED_CONFIG_PATH = join(PROJECT_DIR, "codex/config.shared.toml");
const CODEX_CONFIG_PATH = "/home/jruz/.codex/config.toml";

type Entry = readonly [string, TomlValue];

const formatError = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  return String(error);
};

const fail = (message: string): never => {
  log.error(message);
  process.exit(1);
};

const readToml = (filePath: string): TomlTable => {
  try {
    const content = readFileSync(filePath, "utf-8");
    return parse(content);
  } catch (error) {
    return fail(`toml read failed: ${filePath}: ${formatError(error)}`);
  }
};

const isTomlTable = (value: TomlValue): value is TomlTable => {
  if (Array.isArray(value)) return false;
  if (value instanceof TomlDate) return false;
  return typeof value === "object";
};

const cloneValue = (value: TomlValue): TomlValue => {
  if (Array.isArray(value)) return value.map(cloneValue);
  if (isTomlTable(value)) return mergeTables(value, {});
  return value;
};

const mergeValue = (
  currentValue: TomlValue | undefined,
  sharedValue: TomlValue,
): TomlValue => {
  if (currentValue === undefined) return cloneValue(sharedValue);
  if (isTomlTable(currentValue) && isTomlTable(sharedValue)) {
    return mergeTables(currentValue, sharedValue);
  }
  return cloneValue(sharedValue);
};

const currentEntry = ([key, value]: Entry): Entry => [key, cloneValue(value)];

const sharedEntry =
  (current: TomlTable) =>
  ([key, value]: Entry): Entry => [key, mergeValue(current[key], value)];

const mergeTables = (current: TomlTable, shared: TomlTable): TomlTable => {
  const currentEntries = Object.entries(current);
  const clonedCurrentEntries = currentEntries.map(currentEntry);
  const clonedCurrent = Object.fromEntries(clonedCurrentEntries);
  const sharedEntries = Object.entries(shared);
  const mergeSharedEntry = sharedEntry(current);
  const mergedSharedEntries = sharedEntries.map(mergeSharedEntry);
  const mergedShared = Object.fromEntries(mergedSharedEntries);
  return { ...clonedCurrent, ...mergedShared };
};

const writeCodexConfig = (config: TomlTable): void => {
  try {
    const content = stringify(config);
    writeFileSync(CODEX_CONFIG_PATH, content);
    chmodSync(CODEX_CONFIG_PATH, 0o600);
  } catch (error) {
    fail(`toml sync failed: ${CODEX_CONFIG_PATH}: ${formatError(error)}`);
  }
};

const main = (): void => {
  const current = readToml(CODEX_CONFIG_PATH);
  const shared = readToml(SHARED_CONFIG_PATH);
  const merged = mergeTables(current, shared);
  writeCodexConfig(merged);
  log.ok(`wrote ${CODEX_CONFIG_PATH}`);
};

main();
