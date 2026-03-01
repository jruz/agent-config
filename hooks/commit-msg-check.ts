import { preToolUseInputSchema } from "./types";
import { log } from "./logger";

const COMMIT_TITLE_PATTERN = /^\[(feat|bugs|refa|deps|tool)\] \S+.*: .+/;

export function isGitCommit(command: string): boolean {
  return command.includes("git commit");
}

export function shouldSkip(command: string): boolean {
  return command.includes("--no-edit") || command.includes("--fixup");
}

export function extractTitle(command: string): string | undefined {
  const inlineMatch = /git commit\s+.*-m\s+"([^"\n]+)"/.exec(command);
  const captured = inlineMatch?.[1];
  if (captured) {
    return (captured.split("\n")[0] ?? captured).trim();
  }
  return command
    .split("\n")
    .find((line) => {
      const trimmed = line.trim();
      return (
        trimmed !== "" &&
        !line.startsWith("git commit") &&
        !trimmed.startsWith("$(cat") &&
        !trimmed.startsWith("Co-Authored") &&
        !trimmed.startsWith("EOF") &&
        !trimmed.startsWith(')"')
      );
    })
    ?.trim();
}

export function validateTitle(title: string): boolean {
  return COMMIT_TITLE_PATTERN.test(title);
}

async function main() {
  const raw: unknown = await Bun.stdin.json().catch(() => null);
  const parsed = preToolUseInputSchema.safeParse(raw);
  if (!parsed.success) {
    await log("ERROR", "commit_msg_check", {
      reason: "schema mismatch — hook input changed?",
      input: JSON.stringify(raw),
      errors: parsed.error.issues,
    });
    return;
  }

  const command = parsed.data.tool_input["command"];
  if (typeof command !== "string" || !isGitCommit(command)) {
    return;
  }

  if (shouldSkip(command)) {
    return;
  }

  const title = extractTitle(command);

  if (!title) {
    await log("ERROR", "commit_msg_check", {
      reason: "could not extract commit title",
      command,
    });
    console.log(
      JSON.stringify({
        decision: "block",
        reason: "Could not extract commit title",
      }),
    );
    process.exit(2);
  }

  if (!validateTitle(title)) {
    await log("WARN", "commit_msg_check", { title });
    console.log(
      JSON.stringify({
        decision: "block",
        reason: `Invalid commit title: '${title}' — Follow the Skill(commit) format`,
      }),
    );
    process.exit(2);
  }
}

void main();
