import { notificationInputSchema } from "./types";
import { log } from "./logger";

const notifyMacos = (project: string, message: string) => {
  const icon = `${process.env["HOME"]}/.claude/hooks/clawd-icon.png`;
  Bun.spawn([
    "/opt/homebrew/bin/terminal-notifier",
    "-message",
    message,
    "-title",
    project,
    "-contentImage",
    icon,
    "-sound",
    "default",
  ]);
};

const notifyNtfy = async (project: string, message: string) => {
  const channel = process.env["NTFY_CHANNEL"];
  if (!channel) {
    throw new Error("NTFY_CHANNEL env var is not set");
  }
  const response = await fetch(`https://ntfy.sh/${channel}`, {
    method: "POST",
    headers: { Title: project },
    body: message,
  });
  if (!response.ok) {
    throw new Error(`ntfy request failed: ${response.status}`);
  }
};

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

  if (process.platform === "darwin") {
    notifyMacos(project, input.message);
  } else if (process.platform === "linux") {
    await notifyNtfy(project, input.message);
  } else {
    await log("ERROR", "notify_system", {
      reason: `unsupported platform: ${process.platform}`,
    });
  }
}

void main();
