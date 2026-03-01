import { preToolUseInputSchema } from "./types";
import { log } from "./logger";

type Rule = {
  pattern: RegExp;
  message: string;
  exclude?: RegExp;
};

export function matchRule(command: string): Rule | undefined {
  return rules.find((rule) => {
    if (!rule.pattern.test(command)) return false;
    if (rule.exclude?.test(command)) return false;
    return true;
  });
}

export const rules: Rule[] = [
  { pattern: /cargo install --path/, message: "Use `just install` instead" },
  { pattern: /git -C/, message: "Use relative paths instead of `git -C`" },
  { pattern: /npm run/, message: "Use `just <task>` instead of `npm run`" },
  {
    pattern: /npx playwright install/,
    message: "Use `just playwright-install` instead",
  },
  { pattern: /npx run/, message: "Use `just <task>` instead of `npx run`" },
  { pattern: /SKIP_HOOKS/, message: "Don't skip hooks" },
  {
    pattern: /docker exec.*\benv\b/,
    message: "Never read container environment variables",
  },
  { pattern: /age --decrypt/, message: "Access to sensitive command blocked" },
  {
    pattern: /sops --decrypt/,
    message: "Don't decrypt sops files, just read them directly",
  },
  {
    pattern: /\.env(?!\.)/,
    message: "Never access .env files directly",
    exclude: /^git\s+(add|commit)\b/,
  },
  {
    pattern: /^gleam run/,
    message: "Use just run instead",
  },
  {
    pattern: /\bsecurity\b/,
    message: "Access to macOS security command blocked",
  },
  {
    pattern: /update-snapshots|update_snapshots/,
    message:
      "Only run update-snapshots after investigating the test results and confirming the diff is not a bug. Ask the user to run this command manually.",
  },
];

async function main() {
  const raw: unknown = await Bun.stdin.json().catch(() => null);
  const parsed = preToolUseInputSchema.safeParse(raw);
  if (!parsed.success) {
    await log("ERROR", "on_pretool_bash", {
      reason: "schema mismatch — hook input changed?",
      input: JSON.stringify(raw),
      errors: parsed.error.issues,
    });
    return;
  }

  const data = parsed.data;
  const command = data.tool_input["command"];
  if (typeof command !== "string") {
    return;
  }

  const match = matchRule(command);
  if (match) {
    await log("WARN", "on_pretool_bash", {
      command,
      blocked_by: match.message,
    });
    console.log(JSON.stringify({ decision: "block", reason: match.message }));
    process.exit(2);
  }
}

void main();
