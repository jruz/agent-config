import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { collectSnapshot } from "./snapshot.ts";

const main = (): void => {
  const projectPath = process.cwd();
  const skillPath = resolve(import.meta.dir, "..");
  const repositoryPath = resolve(skillPath, "../..");
  const templatesPath = resolve(skillPath, "files");
  const snapshot = collectSnapshot(projectPath, templatesPath);
  const result = spawnSync(
    "sandbox",
    ["bun", "skills/typescript/skill-check/report.ts"],
    {
      cwd: repositoryPath,
      input: JSON.stringify(snapshot),
      stdio: ["pipe", "inherit", "inherit"],
    },
  );
  if (result.error !== undefined) throw result.error;
  if (result.status === null) {
    throw new Error(`comparison terminated: ${result.signal}`);
  }
  process.exitCode = result.status;
};

main();
