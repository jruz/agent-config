import { readFileSync } from "node:fs";
import { log } from "./log.ts";

const SECRET_PATTERN = /(_SECRET|_PASSWORD|_TOKEN|_KEY|_EMAIL)$/;

function main() {
  let content: string;
  try {
    content = readFileSync(".env", "utf-8");
  } catch {
    log.error("No .env file found. Run: just sops-decrypt-dev");
    return;
  }

  const entries: [string, string][] = content
    .split("\n")
    .filter((l) => l.includes("="))
    .map((l) => {
      const parts = l.split("=");
      return [parts[0], parts[1]];
    })
    .map(([key, value]) => [key, SECRET_PATTERN.test(key) ? "***" : value]);

  if (entries.length === 0) {
    log.warn("No entries found in .env");
    return;
  }

  const maxKeyLen = Math.max(...entries.map(([k]) => k.length));
  entries.forEach(([key, value]) => {
    log.info(`  ${key.padEnd(maxKeyLen)}  ${value}`);
  });
}

main();
