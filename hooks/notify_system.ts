import { notificationInputSchema } from "./types";
import { log } from "./logger";

async function main() {
  const raw: unknown = await Bun.stdin.json().catch(() => null);
  const parsed = notificationInputSchema.safeParse(raw);

  if (!parsed.success) {
    await log("ERROR", "notify_system", {
      reason: "schema mismatch — hook input changed?",
      input: JSON.stringify(raw),
      errors: parsed.error.issues,
    });
    const output = JSON.stringify({
      systemMessage:
        "notify_system: schema mismatch — check hooks.log for details",
    });
    console.log(output);
    return;
  }

  const input = parsed.data;
  const project = input.cwd.split("/").pop();
  if (!project) {
    await log("ERROR", "notify_system", {
      reason: "could not extract project name from cwd",
      cwd: input.cwd,
    });
    return;
  }
  const icon = `${process.env["HOME"]}/.claude/hooks/clawd-icon.png`;

  Bun.spawn([
    "/opt/homebrew/bin/terminal-notifier",
    "-message",
    input.message,
    "-title",
    project,
    "-contentImage",
    icon,
    "-sound",
    "default",
  ]);
}

void main();
