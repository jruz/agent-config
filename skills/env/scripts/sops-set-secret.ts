import { execFileSync } from "node:child_process";
import process from "node:process";
import { createInterface } from "node:readline";

import { log } from "./log.ts";

const readSecret = (): Promise<string> => {
  const rl = createInterface({ input: process.stdin, output: process.stderr });
  return new Promise((resolve) => {
    rl.question("Secret: ", (answer) => {
      rl.close();
      const trimmed = answer.trim();
      resolve(trimmed);
    });
  });
};

const sopsSet = (file: string, key: string, secret: string): void => {
  try {
    execFileSync("sops", ["set", file, `["${key}"]`, `"${secret}"`]);
    execFileSync("sops", ["--ignore-mac", "--rotate", "--in-place", file]);
  } catch (err) {
    log.error(`Failed on ${file}: ${String(err)}`);
    process.exit(1);
  }
};

const main = async () => {
  const envs = process.argv.slice(2, -1);
  const key = process.argv.at(-1);

  if (envs.length === 0 || !key) {
    log.error("Usage: sops-set-secret.ts <env...> <key>");
    process.exit(1);
  }

  const secret = await readSecret();

  envs
    .map((env) => `.env.${env}.yaml`)
    .forEach((file) => {
      sopsSet(file, key, secret);
      log.info(`  ${file}`);
    });
};

void main();
