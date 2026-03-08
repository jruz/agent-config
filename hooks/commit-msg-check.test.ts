import { describe, expect, test } from "bun:test";
import {
  isGitCommit,
  shouldSkip,
  extractTitle,
  validateTitle,
} from "./commit-msg-check";

describe("isGitCommit", () => {
  test("returns true for git commit command", () => {
    expect(isGitCommit('git commit -m "msg"')).toBe(true);
  });

  test("returns true for heredoc git commit", () => {
    expect(isGitCommit("git commit -m \"$(cat <<'EOF'\nmsg\nEOF\n)\"")).toBe(
      true,
    );
  });

  test("returns false for other git commands", () => {
    expect(isGitCommit("git push origin main")).toBe(false);
  });

  test("returns false for non-git commands", () => {
    expect(isGitCommit("echo hello")).toBe(false);
  });
});

describe("shouldSkip", () => {
  test("skips --no-edit", () => {
    expect(shouldSkip("git commit --no-edit")).toBe(true);
  });

  test("skips --fixup", () => {
    expect(shouldSkip("git commit --fixup abc123")).toBe(true);
  });

  test("does not skip regular commit", () => {
    expect(shouldSkip('git commit -m "msg"')).toBe(false);
  });
});

describe("extractTitle", () => {
  describe("inline -m form", () => {
    test("extracts simple title", () => {
      const cmd = 'git commit -m "[feat] Auth: add login"';
      expect(extractTitle(cmd)).toBe("[feat] Auth: add login");
    });

    test("extracts title from multiline -m message", () => {
      const cmd = 'git commit -m "[feat] Auth: add login\n\nBody text here"';
      expect(extractTitle(cmd)).toBe("[feat] Auth: add login");
    });

    test("extracts title with flags before -m", () => {
      const cmd = 'git commit --no-verify -m "[refa] Config: update settings"';
      expect(extractTitle(cmd)).toBe("[refa] Config: update settings");
    });

    test("trims whitespace from title", () => {
      const cmd = 'git commit -m "  [feat] Auth: add login  "';
      expect(extractTitle(cmd)).toBe("[feat] Auth: add login");
    });
  });

  describe("heredoc form", () => {
    test("extracts title from heredoc", () => {
      const cmd = [
        `git commit -m "$(cat <<'EOF'`,
        "[feat] Auth: add login",
        "",
        "Co-Authored-By: Claude <noreply@anthropic.com>",
        "EOF",
        `)"`,
      ].join("\n");
      expect(extractTitle(cmd)).toBe("[feat] Auth: add login");
    });

    test("skips blank lines", () => {
      const cmd = [
        `git commit -m "$(cat <<'EOF'`,
        "",
        "",
        "[bugs] Fix: resolve crash",
        "EOF",
        `)"`,
      ].join("\n");
      expect(extractTitle(cmd)).toBe("[bugs] Fix: resolve crash");
    });

    test("skips Co-Authored lines", () => {
      const cmd = [
        `git commit -m "$(cat <<'EOF'`,
        "Co-Authored-By: Someone <x@y.com>",
        "[feat] Auth: add login",
        "EOF",
        `)"`,
      ].join("\n");
      expect(extractTitle(cmd)).toBe("[feat] Auth: add login");
    });

    test("skips EOF lines", () => {
      const cmd = [`git commit -m "$(cat <<'EOF'`, "EOF", ')"'].join("\n");
      expect(extractTitle(cmd)).toBeUndefined();
    });

    test('skips )" closing lines', () => {
      const cmd = [
        `git commit -m "$(cat <<'EOF'`,
        ')"',
        "[deps] Cargo: bump serde",
        "EOF",
        `)"`,
      ].join("\n");
      expect(extractTitle(cmd)).toBe("[deps] Cargo: bump serde");
    });
  });

  describe("cd prefix", () => {
    test("extracts title when prefixed with cd &&", () => {
      const cmd = 'cd /Users/jruz/dev/dotfiles && git commit -m "[bugs] Deff: Update source hash"';
      expect(extractTitle(cmd)).toBe("[bugs] Deff: Update source hash");
    });

    test("extracts title when prefixed with subshell cd &&", () => {
      const cmd = '(cd /Users/jruz/dev/dotfiles && git commit -m "[bugs] Deff: Update source hash")';
      expect(extractTitle(cmd)).toBe("[bugs] Deff: Update source hash");
    });

    test("extracts title from cd && with multiline -m", () => {
      const cmd = 'cd /some/path && git commit -m "[feat] Auth: Add login\n\nCo-Authored-By: Claude <noreply@anthropic.com>"';
      expect(extractTitle(cmd)).toBe("[feat] Auth: Add login");
    });
  });

  describe("edge cases", () => {
    test("returns undefined when no title found", () => {
      const cmd = [`git commit -m "$(cat <<'EOF'`, "", "", "EOF", `)"`].join(
        "\n",
      );
      expect(extractTitle(cmd)).toBeUndefined();
    });

    test("returns undefined for empty command", () => {
      expect(extractTitle("git commit")).toBeUndefined();
    });
  });
});

describe("validateTitle", () => {
  test("accepts [feat] prefix", () => {
    expect(validateTitle("[feat] Area: description")).toBe(true);
  });

  test("accepts [bugs] prefix", () => {
    expect(validateTitle("[bugs] Area: description")).toBe(true);
  });

  test("accepts [refa] prefix", () => {
    expect(validateTitle("[refa] Area: description")).toBe(true);
  });

  test("accepts [deps] prefix", () => {
    expect(validateTitle("[deps] Area: description")).toBe(true);
  });

  test("accepts [tool] prefix", () => {
    expect(validateTitle("[tool] Area: description")).toBe(true);
  });

  test("rejects unknown tag", () => {
    expect(validateTitle("[chore] Area: description")).toBe(false);
  });

  test("rejects missing brackets", () => {
    expect(validateTitle("feat Area: description")).toBe(false);
  });

  test("rejects missing colon", () => {
    expect(validateTitle("[feat] Area description")).toBe(false);
  });

  test("rejects missing area", () => {
    expect(validateTitle("[feat] : description")).toBe(false);
  });

  test("rejects missing description after colon", () => {
    expect(validateTitle("[feat] Area:")).toBe(false);
  });

  test("rejects empty string", () => {
    expect(validateTitle("")).toBe(false);
  });

  test("accepts multi-word area", () => {
    expect(validateTitle("[feat] Auth module: add login")).toBe(true);
  });

  test("rejects missing space after tag", () => {
    expect(validateTitle("[feat]Area: description")).toBe(false);
  });
});
