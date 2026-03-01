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
    console.log(
      JSON.stringify({
        systemMessage:
          "notify_system: schema mismatch — check hooks.log for details",
      }),
    );
    return;
  }

  const input = parsed.data;
  const project = input.cwd.split("/").pop() ?? "Claude";
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
