import { execFileSync } from "node:child_process";
import { readdirSync } from "node:fs";
import process from "node:process";

import { log } from "./log.ts";

const findEnvFiles = (): string[] => {
  try {
    return readdirSync(".").filter((f) => /^\.env\.\w+\.yaml$/.test(f));
  } catch {
    log.error("Failed to read current directory");
    process.exit(1);
  }
};

const sopsExtract = (file: string, key: string): string => {
  try {
    return execFileSync("sops", ["decrypt", "--extract", `["${key}"]`, file], {
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    }).trim();
  } catch {
    log.error(`Failed to extract ${key} from ${file}`);
    process.exit(1);
  }
};

const sopsSet = (file: string, key: string, value: string): void => {
  try {
    execFileSync("sops", ["set", file, `["${key}"]`, `"${value}"`], {
      stdio: ["pipe", "pipe", "pipe"],
    });
    execFileSync("sops", ["--ignore-mac", "--rotate", "--in-place", file], {
      stdio: ["pipe", "pipe", "pipe"],
    });
  } catch {
    log.error(`Failed to set ${key} in ${file}`);
    process.exit(1);
  }
};

const sopsUnset = (file: string, key: string): void => {
  try {
    execFileSync("sops", ["unset", file, `["${key}"]`], {
      stdio: ["pipe", "pipe", "pipe"],
    });
  } catch {
    log.error(`Failed to unset ${key} from ${file}`);
    process.exit(1);
  }
};

const renameKey = (file: string, oldKey: string, newKey: string): void => {
  const value = sopsExtract(file, oldKey);
  sopsSet(file, newKey, value);
  sopsUnset(file, oldKey);
};

const main = () => {
  const args = process.argv.slice(2);

  const [oldKey, newKey] = args;

  if (!oldKey || !newKey) {
    log.error("Usage: sops-rename-key.ts <old-key> <new-key>");
    process.exit(1);
  }
  const files = findEnvFiles();

  if (files.length === 0) {
    log.error("No .env.*.yaml files found");
    process.exit(1);
  }

  files.forEach((file) => {
    log.info(`${file}: ${oldKey} -> ${newKey}`);
    renameKey(file, oldKey, newKey);
  });
};

main();
