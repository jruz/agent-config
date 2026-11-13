import {
  accessSync,
  constants,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { log } from "./lib/log.ts";

type Result = { pass: boolean; msg: string };

const home = homedir();
const cwd = process.cwd();

const allowedPaths = [
  "/nix",
  "/dev",
  "/proc",
  "/tmp",
  "/etc/resolv.conf",
  "/etc/ssl",
  "/etc/static",
  "/etc/nix",
  "/run/current-system/sw",
  "/usr/bin/env",
  "/bin/sh",
  "/var/run/docker.sock",
  join(home, ".bun"),
  join(home, ".local/share/pnpm"),
  join(home, ".cache/pnpm"),
  join(home, ".cargo/registry"),
  join(home, ".cargo/git"),
  join(home, ".gitconfig"),
  join(home, ".ssh/known_hosts"),
  cwd,
];

const blockedPaths = [
  join(home, ".config/sops"),
  join(home, ".cargo/credentials.toml"),
  join(home, ".cargo/credentials"),
  "/var/lib/sops-nix/key.txt",
  "/etc/initrd-host-key",
  "/run/secrets",
  "/etc/shadow",
  "/etc/passwd",
  "/etc/ssh",
  "/root",
  "/mnt/backup",
];

const allowedEnv = [
  "HOME",
  "PATH",
  "PLAYWRIGHT_BROWSERS_PATH",
  "PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS",
  "PWD",
  "TMPDIR",
  "pnpm_config_cache_dir",
  "pnpm_config_store_dir",
];

const checkEnv = (): Result[] => {
  const unexpected = Object.keys(process.env).filter(
    (name) => !allowedEnv.includes(name),
  );
  if (unexpected.length === 0) {
    return [{ msg: "environment — only allowed variables", pass: true }];
  }
  return unexpected.map((name) => ({
    msg: `env ${name} — not allowed`,
    pass: false,
  }));
};

const isAncestor = (path: string): boolean =>
  allowedPaths.some((allowed) => allowed.startsWith(`${path}/`));

const listDir = (dir: string): string[] => {
  try {
    return readdirSync(dir).map((name) => join(dir, name));
  } catch (cause) {
    throw new Error(`Could not list ${dir}`, { cause });
  }
};

const removeProbe = (probe: string): void => {
  try {
    rmSync(probe);
  } catch (cause) {
    throw new Error(`Could not remove ${probe}`, { cause });
  }
};

const unexpectedEntries = (dir: string): string[] =>
  listDir(dir).flatMap((path) => {
    if (allowedPaths.includes(path)) return [];
    if (isAncestor(path)) return unexpectedEntries(path);
    return [path];
  });

const checkUnexpectedEntries = (): Result[] => {
  const unexpected = unexpectedEntries("/");
  if (unexpected.length === 0) {
    return [{ msg: "filesystem — only allowed entries", pass: true }];
  }
  return unexpected.map((path) => ({
    msg: `${path} — not allowed`,
    pass: false,
  }));
};

const checkBlocked = (path: string): Result => {
  try {
    accessSync(path, constants.R_OK);
    return { msg: `${path} — readable`, pass: false };
  } catch {
    return { msg: `${path} — blocked`, pass: true };
  }
};

const canWrite = (dir: string): boolean => {
  const probe = join(dir, `.sandbox-write-probe-${crypto.randomUUID()}`);
  try {
    writeFileSync(probe, "");
  } catch {
    return false;
  }
  removeProbe(probe);
  return true;
};

const checkWritable = (dir: string, expected: boolean): Result => {
  const writable = canWrite(dir);
  return {
    msg: `${dir} — ${writable ? "writable" : "read-only"}`,
    pass: writable === expected,
  };
};

const results = [
  ...checkEnv(),
  ...checkUnexpectedEntries(),
  ...blockedPaths.map(checkBlocked),
  checkWritable(cwd, true),
  checkWritable("/tmp", true),
  checkWritable("/nix", false),
  checkWritable("/etc/ssl", false),
];

results.forEach((r) => {
  if (r.pass) {
    log.ok(r.msg);
  } else {
    log.error(r.msg);
  }
});

if (results.some((r) => !r.pass)) {
  process.exit(1);
}
