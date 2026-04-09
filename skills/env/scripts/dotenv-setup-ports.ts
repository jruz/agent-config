import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, resolve } from "node:path";
import process from "node:process";
import { log } from "./log.ts";

const PORT_VARS = ["APP_PORT", "POSTGRES_PORT", "ESBUILD_PORT"];
const BASE_PORT = 60000;
const PORT_GAP = 5;

type PortAssignment = readonly [string, number];

function readFile(path: string): string | null {
  try {
    return readFileSync(path, "utf-8");
  } catch {
    return null;
  }
}

function findSiblingEnvFiles(): string[] {
  const cwd = process.cwd();
  const parent = resolve(cwd, "..");
  try {
    return readdirSync(parent, { withFileTypes: true })
      .filter((d) => d.isDirectory() && resolve(parent, d.name) !== cwd)
      .map((d) => resolve(parent, d.name, ".env"))
      .filter((f) => existsSync(f));
  } catch (e) {
    log.error(`Failed to read directory ${parent}: ${String(e)}`);
    return [];
  }
}

function collectUsedPorts(files: string[]): number[] {
  return files
    .flatMap((f) => {
      const content = readFile(f);
      if (content === null) {
        log.error(`Failed to read ${f}`);
        return [];
      }
      return content.split("\n");
    })
    .filter((line) => /_PORT=\d/.test(line))
    .map((line) => Number(line.split("=")[1]))
    .sort((a, b) => a - b);
}

function printUsedPorts(files: string[]) {
  files.forEach((f) => {
    const content = readFile(f);
    if (content === null) {
      log.error(`Failed to read ${f}`);
      return;
    }
    const dir = dirname(f);
    const name = basename(dir);
    const ports = content
      .split("\n")
      .filter((l) => l.includes("_PORT="))
      .join(", ");
    log.warn(`  ${name}: ${ports}`);
  });
}

function assignPorts(usedPorts: number[]): PortAssignment[] {
  const last = usedPorts.at(-1);
  const base = last === undefined ? BASE_PORT : last + PORT_GAP;
  return PORT_VARS.map((v, i): PortAssignment => [v, base + i]);
}

function writeEnvFile(ports: PortAssignment[]) {
  const content = readFile(".env");
  if (content === null) {
    log.error("No .env file found. Run: just sops-decrypt-dev");
    return;
  }
  const env = content
    .split("\n")
    .map((line) => {
      const match = ports.find(([k]) => line.startsWith(`${k}=`));
      return match ? `${match[0]}=${match[1]}` : line;
    })
    .join("\n");
  try {
    writeFileSync(".env", env);
  } catch (e) {
    log.error(`Failed to write .env: ${String(e)}`);
  }
}

function main() {
  const siblings = findSiblingEnvFiles();
  const usedPorts = collectUsedPorts(siblings);

  if (usedPorts.length > 0) {
    log.warn("Ports in use by other worktrees:");
    printUsedPorts(siblings);
  }

  const ports = assignPorts(usedPorts);

  log.info("Setting ports for this worktree:");
  ports.forEach(([k, v]) => {
    log.info(`  ${k}=${v}`);
  });

  writeEnvFile(ports);
}

main();
