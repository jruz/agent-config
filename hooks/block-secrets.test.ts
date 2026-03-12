import { describe, expect, test } from "bun:test";
import { checkFilePath, checkToolInput } from "./block-secrets";

describe("checkToolInput", () => {
  test("skips non-Read/Grep tools", () => {
    expect(checkToolInput("Bash", { file_path: ".env" })).toBe("skip");
    expect(checkToolInput("Write", { file_path: ".ssh/id_rsa" })).toBe("skip");
    expect(checkToolInput("Edit", { file_path: ".env" })).toBe("skip");
  });

  test("skips when file_path is not a string", () => {
    expect(checkToolInput("Read", {})).toBe("skip");
    expect(checkToolInput("Read", { file_path: 123 })).toBe("skip");
    expect(checkToolInput("Grep", { file_path: null })).toBe("skip");
  });

  test("delegates to checkFilePath for Read", () => {
    expect(checkToolInput("Read", { file_path: ".env" })).toBe("block");
    expect(checkToolInput("Read", { file_path: "src/main.rs" })).toBe("allow");
  });

  test("delegates to checkFilePath for Grep", () => {
    expect(checkToolInput("Grep", { file_path: ".env" })).toBe("block");
    expect(checkToolInput("Grep", { file_path: "src/main.rs" })).toBe("allow");
  });
});

describe("checkFilePath", () => {
  describe("encrypted env files — allowed", () => {
    test("allows .env.production.yaml", () => {
      expect(checkFilePath(".env.production.yaml")).toBe("allow");
    });

    test("allows .env.staging.yaml", () => {
      expect(checkFilePath(".env.staging.yaml")).toBe("allow");
    });

    test("allows path with .env.local.yaml", () => {
      expect(checkFilePath("/app/config/.env.local.yaml")).toBe("allow");
    });
  });

  describe("ssh config — allowed", () => {
    test("allows .ssh/config", () => {
      expect(checkFilePath(".ssh/config")).toBe("allow");
    });

    test("allows full path .ssh/config", () => {
      expect(checkFilePath("/home/user/.ssh/config")).toBe("allow");
    });
  });

  describe("sensitive .env paths — blocked", () => {
    test("blocks bare .env", () => {
      expect(checkFilePath(".env")).toBe("block");
    });

    test("blocks .env.local", () => {
      expect(checkFilePath(".env.local")).toBe("block");
    });

    test("blocks .env.production", () => {
      expect(checkFilePath(".env.production")).toBe("block");
    });

    test("blocks /app/.env", () => {
      expect(checkFilePath("/app/.env")).toBe("block");
    });

    test("blocks /app/.env.local", () => {
      expect(checkFilePath("/app/.env.local")).toBe("block");
    });
  });

  describe("sensitive .ssh paths — blocked", () => {
    test("blocks .ssh/id_rsa", () => {
      expect(checkFilePath(".ssh/id_rsa")).toBe("block");
    });

    test("blocks /home/user/.ssh/id_ed25519", () => {
      expect(checkFilePath("/home/user/.ssh/id_ed25519")).toBe("block");
    });

    test("blocks .ssh/known_hosts", () => {
      expect(checkFilePath(".ssh/known_hosts")).toBe("block");
    });
  });

  describe("INSECURE in filename — blocked", () => {
    test("blocks INSECURE uppercase", () => {
      expect(checkFilePath("/app/INSECURE_keys.txt")).toBe("block");
    });

    test("blocks insecure lowercase", () => {
      expect(checkFilePath("/app/insecure_config.yaml")).toBe("block");
    });

    test("blocks mixed case", () => {
      expect(checkFilePath("Insecure_notes.md")).toBe("block");
    });

    test("blocks INSECURE mid-filename", () => {
      expect(checkFilePath("local-wireguard-INSECURE.conf")).toBe("block");
    });
  });

  describe("safe paths — allowed", () => {
    test("allows src/main.rs", () => {
      expect(checkFilePath("src/main.rs")).toBe("allow");
    });

    test("allows package.json", () => {
      expect(checkFilePath("package.json")).toBe("allow");
    });

    test("blocks .env.example (matches sensitive pattern)", () => {
      expect(checkFilePath(".env.example")).toBe("block");
    });

    test("allows .envrc", () => {
      expect(checkFilePath(".envrc")).toBe("allow");
    });
  });
});
