import { log } from "./logger";

async function main() {
  const proc = Bun.spawnSync(["slop-detector"], {
    stderr: "pipe",
    stdout: "pipe",
  });

  if (proc.exitCode !== 0) {
    const stderr = proc.stderr.toString();
    const stdout = proc.stdout.toString();
    const output = `${stderr}\n${stdout}`.trim();
    await log("ERROR", "stop_slop", { exitCode: proc.exitCode });
    console.log(
      JSON.stringify({
        decision: "block",
        reason: `slop-detector failed:\n${output}`,
      }),
    );
  }
}

void main();
