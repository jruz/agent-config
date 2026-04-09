import { accessSync, readdirSync, constants } from "fs";
import { homedir } from "os";
import { basename, dirname, join } from "path";
import { log } from "./log";

const home = homedir();
const scriptDir = dirname(import.meta.filename);
const projectDir = dirname(scriptDir);
const projectName = basename(projectDir);
const projectsDir = dirname(projectDir);

type Result = { pass: boolean; msg: string };

const checkBlocked = (path: string): Result => {
  try {
    accessSync(path, constants.R_OK);
    return { pass: false, msg: `${path} — readable` };
  } catch {
    return { pass: true, msg: `${path} — access denied` };
  }
};

const checkDirAllowlist = (dir: string, allowed: string[]): Result => {
  try {
    const entries = readdirSync(dir);
    const unexpected = entries.filter((e) => !allowed.includes(e));
    if (unexpected.length > 0) {
      return {
        pass: false,
        msg: `${dir} — leaked: ${unexpected.join(", ")}`,
      };
    }
    const label =
      allowed.length > 0 ? `only ${allowed.join(", ")} visible` : "empty";
    return { pass: true, msg: `${dir} — ${label}` };
  } catch {
    return { pass: true, msg: `${dir} — access denied` };
  }
};

const blockedPaths = [
  join(home, ".config/sops"),
  "/var/lib/sops-nix/key.txt",
  "/etc/initrd-host-key",
  "/run/secrets",
  "/etc/shadow",
  "/etc/passwd",
  "/root",
  "/mnt/backup",
];

const sshDir = join(home, ".ssh");
const results = [
  checkDirAllowlist(sshDir, ["known_hosts"]),
  checkDirAllowlist(projectsDir, [projectName]),
  ...blockedPaths.map(checkBlocked),
];
results.forEach((r) => {
  if (r.pass) {
    log.ok(r.msg);
  } else {
    log.error(r.msg);
  }
});

const failures = results.filter((r) => !r.pass);
if (failures.length > 0) {
  process.exit(1);
}
