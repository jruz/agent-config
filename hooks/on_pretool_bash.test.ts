import { describe, expect, test } from "bun:test";
import { matchRule } from "./on_pretool_bash";

function blocked(command: string): string | undefined {
  return matchRule(command)?.message;
}

describe("cargo install --path", () => {
  test("blocks cargo install --path", () => {
    expect(blocked("cargo install --path .")).toBe(
      "Use `just install` instead",
    );
  });

  test("allows cargo install from registry", () => {
    expect(blocked("cargo install ripgrep")).toBeUndefined();
  });
});

describe("git -C", () => {
  test("blocks git -C", () => {
    expect(blocked("git -C /some/path status")).toBe(
      "Use relative paths instead of `git -C`",
    );
  });

  test("allows regular git commands", () => {
    expect(blocked("git status")).toBeUndefined();
  });
});

describe("npm run", () => {
  test("blocks npm run", () => {
    expect(blocked("npm run build")).toBe(
      "Use `just <task>` instead of `npm run`",
    );
  });

  test("allows npm install", () => {
    expect(blocked("npm install lodash")).toBeUndefined();
  });
});

describe("npx playwright install", () => {
  test("blocks npx playwright install", () => {
    expect(blocked("npx playwright install")).toBe(
      "Use `just playwright-install` instead",
    );
  });

  test("allows npx playwright test", () => {
    expect(blocked("npx playwright test")).toBeUndefined();
  });
});

describe("npx run", () => {
  test("blocks npx run", () => {
    expect(blocked("npx run build")).toBe(
      "Use `just <task>` instead of `npx run`",
    );
  });
});

describe("SKIP_HOOKS", () => {
  test("blocks SKIP_HOOKS", () => {
    expect(blocked("SKIP_HOOKS=1 git commit")).toBe("Don't skip hooks");
  });
});

describe("docker exec env", () => {
  test("blocks docker exec with env", () => {
    expect(blocked("docker exec mycontainer env")).toBe(
      "Never read container environment variables",
    );
  });

  test("allows docker exec without env", () => {
    expect(blocked("docker exec mycontainer ls")).toBeUndefined();
  });
});

describe("age --decrypt", () => {
  test("blocks age --decrypt", () => {
    expect(blocked("age --decrypt secret.age")).toBe(
      "Access to sensitive command blocked",
    );
  });
});

describe("sops --decrypt", () => {
  test("blocks sops --decrypt", () => {
    expect(blocked("sops --decrypt secrets.yaml")).toBe(
      "Don't decrypt sops files, just read them directly",
    );
  });
});

describe(".env files", () => {
  test("blocks reading .env", () => {
    expect(blocked("cat .env")).toBe("Never access .env files directly");
  });

  test("blocks .env in path", () => {
    expect(blocked("source /app/.env")).toBe(
      "Never access .env files directly",
    );
  });

  test("allows .env.example", () => {
    expect(blocked("cat .env.example")).toBeUndefined();
  });

  test("allows git add .env", () => {
    expect(blocked("git add .env")).toBeUndefined();
  });

  test("allows git commit with .env in message", () => {
    expect(blocked('git commit -m "update .env"')).toBeUndefined();
  });
});

describe("gleam run", () => {
  test("blocks gleam run", () => {
    expect(blocked("gleam run")).toBe("Use just run instead");
  });

  test("allows gleam build", () => {
    expect(blocked("gleam build")).toBeUndefined();
  });

  test("blocks gleam run with redirections", () => {
    expect(blocked("gleam run 2>&1")).toBe("Use just run instead");
  });

  test("does not block gleam run mid-command", () => {
    expect(blocked("echo gleam run")).toBeUndefined();
  });
});

describe("security command", () => {
  test("blocks security command", () => {
    expect(blocked("security find-generic-password")).toBe(
      "Access to macOS security command blocked",
    );
  });
});

describe("update-snapshots", () => {
  test("blocks update-snapshots", () => {
    expect(blocked("npx playwright test --update-snapshots")).toBeDefined();
  });

  test("blocks update_snapshots", () => {
    expect(blocked("pytest --update_snapshots")).toBeDefined();
  });
});

describe("git filter-branch --all", () => {
  test("blocks git filter-branch with --all", () => {
    expect(
      blocked(
        "git filter-branch --force --index-filter 'git rm --cached --ignore-unmatch PLAN.md' --prune-empty -- --all",
      ),
    ).toBe(
      "Never use --all with git filter-branch — it overwrites backup branches. Target specific branches instead.",
    );
  });

  test("allows commit message mentioning filter-branch --all", () => {
    expect(
      blocked('git commit -m "[feat] Hooks: Block git filter-branch --all"'),
    ).toBeUndefined();
  });

  test("allows git filter-branch on specific branch", () => {
    expect(
      blocked(
        "git filter-branch --force --index-filter 'git rm --cached --ignore-unmatch PLAN.md' --prune-empty -- main",
      ),
    ).toBeUndefined();
  });
});

describe("allowed commands", () => {
  test("allows ls", () => {
    expect(blocked("ls -la")).toBeUndefined();
  });

  test("allows just build", () => {
    expect(blocked("just build")).toBeUndefined();
  });

  test("allows cargo build", () => {
    expect(blocked("cargo build")).toBeUndefined();
  });
});
