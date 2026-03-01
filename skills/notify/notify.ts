import { log } from "../../hooks/logger";

const message = process.argv[2];
if (!message) {
  await log("ERROR", "notify", { reason: "usage: notify.ts <message>" });
  process.exit(1);
}

const toplevel = Bun.spawnSync(["git", "rev-parse", "--show-toplevel"]);
const title = toplevel.stdout.toString().trim().split("/").pop() ?? "Claude";
const icon = `${process.env["HOME"]}/.claude/hooks/clawd-icon.png`;

Bun.spawn([
  "/opt/homebrew/bin/terminal-notifier",
  "-message",
  message,
  "-title",
  title,
  "-contentImage",
  icon,
  "-sound",
  "default",
]);
