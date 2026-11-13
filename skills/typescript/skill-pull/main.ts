import { resolve } from "node:path";
import { log } from "../files/scripts/lib/log.ts";
import { gitPaths, pullTemplates } from "./pull.ts";
import type { PullErrorCode, PullFailure } from "./pull.types.ts";

const errorLabels: Readonly<Record<PullErrorCode, string>> = {
  "dirty-targets": "uncommitted template targets",
};

const failureMessage = (failure: PullFailure): string =>
  `${errorLabels[failure.code]}:\n${failure.paths.join("\n")}`;

const main = async (): Promise<void> => {
  const templates = resolve(import.meta.dir, "../files");
  const project = process.cwd();
  const result = await pullTemplates(project, templates, gitPaths);
  if (!result.success) {
    const message = failureMessage(result.error);
    log.error(message);
    process.exitCode = 1;
    return;
  }
  log.ok(`copied templates: ${result.data.length}`);
  log.info(
    "review git diff, merge project configuration, then run just ts::skill-check",
  );
};

await main();
