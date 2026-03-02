import { execSync } from "node:child_process";
import process from "node:process";
import { log } from "./log.ts";

const PORT_VARS = ["APP_PORT", "POSTGRES_PORT", "ESBUILD_PORT"];

function findListeners(port: string): string[] {
  try {
    const out = execSync(`lsof -ti:${port} -sTCP:LISTEN`, {
      encoding: "utf-8",
    });
    return out.trim().split("\n").filter(Boolean);
  } catch {
    return [];
  }
}

function killPids(pids: string[]) {
  pids.forEach((pid) => {
    try {
      execSync(`kill ${pid}`);
    } catch (e) {
      log.error(`Failed to kill pid ${pid}: ${String(e)}`);
    }
  });
}

function main() {
  PORT_VARS.forEach((name) => {
    const port = process.env[name];
    if (!port) {
      log.warn(`${name} is not set, skipping`);
      return;
    }
    const pids = findListeners(port);
    if (pids.length === 0) return;
    killPids(pids);
    log.info(`killed ${name}=${port} (pid ${pids.join(", ")})`);
  });
}

main();
