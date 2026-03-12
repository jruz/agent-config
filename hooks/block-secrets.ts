import { preToolUseInputSchema } from "./types";
import { log } from "./logger";

type CheckResult = "skip" | "allow" | "block";

const pathBoundary = String.raw`(^|\s|\/)`;
const pathTrailer = String.raw`(\.|\/|\s|$)`;

function isDotEnv(filePath: string): boolean {
  return new RegExp(`${pathBoundary}\\.env${pathTrailer}`).test(filePath);
}

function isDotSsh(filePath: string): boolean {
  return new RegExp(`${pathBoundary}\\.ssh${pathTrailer}`).test(filePath);
}

export function checkFilePath(filePath: string): CheckResult {
  const isEncryptedEnv = /\.env\.[^.]+\.yaml$/.test(filePath);
  if (isEncryptedEnv) {
    return "allow";
  }

  const isSshConfig = filePath.endsWith(".ssh/config");
  if (isSshConfig) {
    return "allow";
  }

  if (/INSECURE/i.test(filePath)) {
    return "block";
  }

  if (isDotEnv(filePath) || isDotSsh(filePath)) {
    return "block";
  }

  return "allow";
}

export function checkToolInput(
  toolName: string,
  toolInput: Record<string, unknown>,
): CheckResult {
  if (toolName !== "Read" && toolName !== "Grep") {
    return "skip";
  }

  const filePath = toolInput["file_path"];
  if (typeof filePath !== "string") {
    return "skip";
  }

  return checkFilePath(filePath);
}

async function main() {
  const raw: unknown = await Bun.stdin.json().catch(() => null);
  const parsed = preToolUseInputSchema.safeParse(raw);
  if (!parsed.success) {
    await log("ERROR", "block_secrets", {
      reason: "schema mismatch — hook input changed?",
      input: JSON.stringify(raw),
      errors: parsed.error.issues,
    });
    return;
  }

  const data = parsed.data;
  const result = checkToolInput(data.tool_name, data.tool_input);

  if (result === "block") {
    await log("WARN", "block_secrets", {
      file_path: data.tool_input["file_path"],
      tool_name: data.tool_name,
    });
    console.log(
      JSON.stringify({
        decision: "block",
        reason: "Access to sensitive file blocked",
      }),
    );
    process.exit(2);
  }
}

void main();
