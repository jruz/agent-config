import { preToolUseInputSchema } from "./types";
import { log } from "./logger";

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
  if (data.tool_name !== "Read" && data.tool_name !== "Grep") {
    return;
  }

  const filePath = data.tool_input["file_path"];
  if (typeof filePath !== "string") {
    return;
  }

  const isEncryptedEnv = /\.env\.[^.]+\.yaml$/.test(filePath);
  if (isEncryptedEnv) {
    return;
  }

  const sensitivePattern = /(^|\s|\/)(\.env|\.ssh)(\.|\/|\s|$)/;
  if (sensitivePattern.test(filePath)) {
    await log("WARN", "block_secrets", {
      file_path: filePath,
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
