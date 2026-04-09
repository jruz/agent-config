import { readFileSync } from "node:fs";
import { log } from "./log.ts";

type EnvEntry = [string, string];

const SECRET_PATTERN = /(_SECRET|_PASSWORD|_TOKEN|_KEY|_EMAIL)$/;

function parseLine(line: string): EnvEntry {
  const idx = line.indexOf("=");
  return [line.slice(0, idx), line.slice(idx + 1)];
}

function maskSecret([key, value]: EnvEntry): EnvEntry {
  return [key, SECRET_PATTERN.test(key) ? "***" : value];
}

function main() {
  let content: string;
  try {
    content = readFileSync(".env", "utf-8");
  } catch {
    log.error("No .env file found. Run: just sops-decrypt-dev");
    return;
  }

  const entries: EnvEntry[] = content
    .split("\n")
    .filter((l) => l.includes("="))
    .map(parseLine)
    .map(maskSecret);

  if (entries.length === 0) {
    log.warn("No entries found in .env");
    return;
  }

  const keyLengths = entries.map(([k]) => k.length);
  const maxKeyLen = Math.max(...keyLengths);
  entries.forEach(([key, value]) => {
    log.info(`  ${key.padEnd(maxKeyLen)}  ${value}`);
  });
}

main();
