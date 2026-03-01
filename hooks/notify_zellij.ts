import { execSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { log } from "./logger";

async function main() {
  const paneId = process.env["ZELLIJ_PANE_ID"];
  const session = process.env["ZELLIJ_SESSION_NAME"];
  if (!paneId || !session) {
    return;
  }

  try {
    const tmpdir = execSync("getconf DARWIN_USER_TEMP_DIR", {
      encoding: "utf-8",
    }).trim();
    const uid = execSync("id -u", { encoding: "utf-8" }).trim();
    const dir = join(tmpdir, `zellij-${uid}`, "tab-renamer-signals", session);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, paneId), "question");
  } catch (e) {
    await log("ERROR", "notify_zellij", {
      reason: e instanceof Error ? e.message : String(e),
    });
  }
}

void main();
