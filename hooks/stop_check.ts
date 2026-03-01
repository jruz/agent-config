import { existsSync } from "node:fs";

function main() {
  if (!existsSync("justfile")) {
    return;
  }

  Bun.spawnSync(["just", "fix"]);
  const proc = Bun.spawnSync(["just", "check"], {
    stderr: "pipe",
    stdout: "pipe",
  });

  if (proc.exitCode !== 0) {
    const stderr = proc.stderr.toString();
    const stdout = proc.stdout.toString();
    const output = `${stderr}\n${stdout}`.trim();

    console.log(
      JSON.stringify({
        decision: "block",
        reason: `just check failed:\n${output}`,
      }),
    );
  }
}

main();
