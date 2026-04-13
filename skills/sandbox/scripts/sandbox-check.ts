import { accessSync, constants } from "fs";
import { homedir } from "os";
import { join } from "path";
import { log } from "./log";

const home = homedir();

type Result = { pass: boolean; msg: string };

const checkBlocked = (path: string): Result => {
  try {
    accessSync(path, constants.R_OK);
    return { pass: false, msg: `${path} — readable` };
  } catch {
    return { pass: true, msg: `${path} — access denied` };
  }
};

const blockedPaths = [
  join(home, ".ssh"),
  join(home, ".config/sops"),
  "/var/lib/sops-nix/key.txt",
  "/etc/initrd-host-key",
  "/run/secrets",
  "/etc/shadow",
  "/etc/passwd",
  "/etc/ssh",
  "/root",
  "/mnt/backup",
];

const results = blockedPaths.map(checkBlocked);
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
