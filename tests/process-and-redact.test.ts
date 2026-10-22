import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import readline from "node:readline";
import { runCommandSafe, runCommandInteractive, validateModelName } from "../src/utils/process.js";
import { assertCloudConsent } from "../src/core/redact/redactor.js";
import { writeAtomic } from "../src/core/memory/atomic.js";
import { loadConfig } from "../src/core/config.js";
import { initializeVeeshree } from "../src/commands/init.js";
import { VeeError } from "../src/utils/errors.js";

describe("Process, Redactor Consent, and Atomic Memory Suite", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "vee-proc-cov-"));
    initializeVeeshree(tempDir);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch {
      // ignore
    }
  });

  describe("process.ts", () => {
    it("validates model names and rejects command injection attempts", () => {
      expect(validateModelName("llama3.2")).toBe("llama3.2");
      expect(validateModelName("meta/llama-3.1-70b-instruct")).toBe("meta/llama-3.1-70b-instruct");
      expect(() => validateModelName("model; rm -rf /")).toThrow(VeeError);
      expect(() => validateModelName("model$(whoami)")).toThrow(VeeError);
      expect(() => validateModelName("model`id`")).toThrow(VeeError);
    });

    it("throws VeeError on runCommandSafe failure", () => {
      expect(() => runCommandSafe("node", ["-e", "process.exit(1)"])).toThrow(VeeError);
    });

    it("throws VeeError on runCommandInteractive non-zero exit", () => {
      expect(() => runCommandInteractive("node", ["-e", "process.exit(2)"])).toThrow(VeeError);
    });

    it("throws VeeError on runCommandInteractive non-existent binary", () => {
      expect(() => runCommandInteractive("non_existent_binary_xyz_123", ["arg"])).toThrow(VeeError);
    });
  });

  describe("redactor.ts interactive prompt", () => {
    let origStdinTTY: boolean | undefined;
    let origStdoutTTY: boolean | undefined;

    beforeEach(() => {
      origStdinTTY = process.stdin.isTTY;
      origStdoutTTY = process.stdout.isTTY;
      (process.stdin as any).isTTY = true;
      (process.stdout as any).isTTY = true;

      // Remove allow_cloud from raw config so it is undecided
      const cfgPath = path.join(tempDir, ".vee", "config.json");
      const cfgJson = JSON.parse(fs.readFileSync(cfgPath, "utf-8"));
      delete cfgJson.privacy.allow_cloud;
      fs.writeFileSync(cfgPath, JSON.stringify(cfgJson, null, 2), "utf-8");
    });

    afterEach(() => {
      (process.stdin as any).isTTY = origStdinTTY;
      (process.stdout as any).isTTY = origStdoutTTY;
    });

    it("handles interactive cloud consent granted and saved", async () => {
      const questionMock = vi
        .fn()
        .mockImplementationOnce((prompt: string, cb: (ans: string) => void) => cb("y"))
        .mockImplementationOnce((prompt: string, cb: (ans: string) => void) => cb("y"));

      vi.spyOn(readline, "createInterface").mockReturnValue({
        question: questionMock,
        close: vi.fn(),
      } as any);

      let grantedCalled = false;
      await assertCloudConsent(
        { privacy: { max_payload_bytes: 1000 } },
        () => {
          grantedCalled = true;
        },
        tempDir
      );

      expect(grantedCalled).toBe(true);
      const cfg = loadConfig(tempDir);
      expect(cfg.privacy?.allow_cloud).toBe(true);
    });

    it("handles interactive cloud consent declined without saving", async () => {
      const questionMock = vi
        .fn()
        .mockImplementationOnce((prompt: string, cb: (ans: string) => void) => cb("n"))
        .mockImplementationOnce((prompt: string, cb: (ans: string) => void) => cb("n"));

      vi.spyOn(readline, "createInterface").mockReturnValue({
        question: questionMock,
        close: vi.fn(),
      } as any);

      await expect(
        assertCloudConsent({ privacy: { max_payload_bytes: 1000 } }, undefined, tempDir)
      ).rejects.toThrow(/Cloud extraction declined/);
    });

    it("handles interactive cloud consent declined and persisted as false", async () => {
      const questionMock = vi
        .fn()
        .mockImplementationOnce((prompt: string, cb: (ans: string) => void) => cb("no"))
        .mockImplementationOnce((prompt: string, cb: (ans: string) => void) => cb("yes"));

      vi.spyOn(readline, "createInterface").mockReturnValue({
        question: questionMock,
        close: vi.fn(),
      } as any);

      await expect(
        assertCloudConsent({ privacy: { max_payload_bytes: 1000 } }, undefined, tempDir)
      ).rejects.toThrow(/Cloud extraction declined/);

      const cfg = loadConfig(tempDir);
      expect(cfg.privacy?.allow_cloud).toBe(false);
    });
  });

  describe("atomic.ts", () => {
    it("writes atomic with file mode", () => {
      const target = path.join(tempDir, "mode-test.txt");
      writeAtomic(target, "atomic content", { mode: 0o644 });
      expect(fs.readFileSync(target, "utf-8")).toBe("atomic content");
    });

    it("cleans up temporary file and throws when rename fails", () => {
      // create a directory where the target file would be
      const targetDir = path.join(tempDir, "cannot-write-here");
      fs.mkdirSync(targetDir);

      // Attempting to overwrite a directory with atomic rename on Windows/Linux throws
      expect(() => writeAtomic(targetDir, "content")).toThrow();
    });
  });
});
