import { appendFile, mkdir } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";

const HOME = homedir();
const LOG_DIR = join(HOME, "dev", ".claude", ".logs");
const LOG_PATH = join(LOG_DIR, "hooks.log");

type Severity = "TRACE" | "DEBUG" | "INFO" | "WARN" | "ERROR" | "FATAL";

export async function log(
  level: Severity,
  body: string,
  attributes: Record<string, unknown> = {},
) {
  const entry = {
    Attributes: attributes,
    Body: body,
    SeverityText: level,
    Timestamp: new Date().toISOString(),
  };

  await mkdir(LOG_DIR, { recursive: true });
  await appendFile(LOG_PATH, JSON.stringify(entry) + "\n");
}
