import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { execSync } from "node:child_process";
import { handleCaptureCommand } from "../src/commands/capture.js";
import { generateContext } from "../src/commands/context.js";
import { handleStatusCommand } from "../src/commands/status.js";
import { syncVeeshree } from "../src/commands/sync.js";
import { handleHooksCommand } from "../src/commands/hooks.js";
import { initializeVeeshree } from "../src/commands/init.js";
import { handleDecisionsCommand } from "../src/commands/decisions.js";
import { createProposal } from "../src/core/proposals/queue.js";
import { saveConfig, loadConfig } from "../src/core/config.js";
import * as extractorModule from "../src/core/extractor.js";
import { VeeError } from "../src/utils/errors.js";

describe("Capture, Context, Status, Sync, and Hooks Commands Coverage Suite", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "vee-cmd-cov-"));
    // Init git repo
    execSync("git init", { cwd: tempDir, stdio: "ignore" });
    execSync('git config user.email "test@example.com"', { cwd: tempDir, stdio: "ignore" });
    execSync('git config user.name "Test User"', { cwd: tempDir, stdio: "ignore" });
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

  describe("capture.ts", () => {
    it("handles errors for missing file and denylisted file", async () => {
      await expect(handleCaptureCommand({ file: path.join(tempDir, "missing.ts") }, tempDir)).rejects.toThrow(
        VeeError
      );

      const envFile = path.join(tempDir, ".env");
      fs.writeFileSync(envFile, "SECRET=123", "utf-8");
      await expect(handleCaptureCommand({ file: envFile }, tempDir)).rejects.toThrow(
        /Cannot capture denylisted or ignored file/
      );
    });

    it("handles showPayload and dryRun options", async () => {
      const codeFile = path.join(tempDir, "app.ts");
      fs.writeFileSync(codeFile, "export const apiKey = 'secret123';", "utf-8");

      const showRes = await handleCaptureCommand({ file: codeFile, showPayload: true }, tempDir);
      expect(showRes.payload).toBeDefined();

      const dryRes = await handleCaptureCommand({ file: codeFile, dryRun: true }, tempDir);
      expect(dryRes.payload).toBeDefined();
    });

    it("captures git diff and creates proposal", async () => {
      const srcFile = path.join(tempDir, "src.ts");
      fs.writeFileSync(srcFile, "console.log('initial');", "utf-8");
      execSync("git add src.ts", { cwd: tempDir, stdio: "ignore" });
      execSync('git commit -m "initial commit"', { cwd: tempDir, stdio: "ignore" });

      fs.writeFileSync(srcFile, "console.log('updated content');", "utf-8");

      vi.spyOn(extractorModule, "extractMemoryFromContent").mockResolvedValue({
        decisions: [
          {
            title: "Captured Decision",
            decision: "Use TypeScript",
            reason: "Better safety",
            alternatives_considered: [],
            linked_files: ["src.ts"],
            status: "active",
            tags: ["ts"],
          },
        ],
        current_state: {
          current_feature: "CLI Tests",
          completed_in_session: [],
          next_immediate_steps: [],
        },
        tasks: [],
        constraints: [],
        rejected_approaches: [],
        discoveries: [],
      });

      const res = await handleCaptureCommand({ diff: true }, tempDir);
      expect(res.proposal).toBeDefined();
      expect(res.autoApplied).toBe(false);
    });

    it("auto-applies low-risk proposal when --auto flag is provided and no decisions present", async () => {
      const codeFile = path.join(tempDir, "feature.ts");
      fs.writeFileSync(codeFile, "export const x = 42;", "utf-8");

      vi.spyOn(extractorModule, "extractMemoryFromContent").mockResolvedValue({
        current_state: {
          current_feature: "Auto feature",
          completed_in_session: ["Feature X"],
          next_immediate_steps: [],
        },
        tasks: [{ task_name: "Task A", action: "complete" }],
        constraints: [],
        rejected_approaches: [],
        discoveries: ["Learned something new"],
      });

      const res = await handleCaptureCommand({ file: codeFile, auto: true }, tempDir);
      expect(res.proposal).toBeDefined();
      expect(res.autoApplied).toBe(true);
    });

    it("flags high risk proposal when constraints are modified", async () => {
      const codeFile = path.join(tempDir, "rules.ts");
      fs.writeFileSync(codeFile, "export const y = 99;", "utf-8");

      vi.spyOn(extractorModule, "extractMemoryFromContent").mockResolvedValue({
        decisions: [],
        current_state: {
          current_feature: "Risk test",
          completed_in_session: [],
          next_immediate_steps: [],
        },
        tasks: [],
        constraints: [
          { rule: "Malicious bypass of security rules", type: "hard", source: "cli" },
        ],
        rejected_approaches: [],
        discoveries: [],
      });

      const res = await handleCaptureCommand({ file: codeFile }, tempDir);
      expect(res.proposal?.risk).toBe("high");
    });
  });

  describe("context.ts", () => {
    it("handles generateContext with explain (human and json), raw mode, and warnings", () => {
      // 1. Explain non-json
      const explainRes = generateContext(undefined, { explain: true }, tempDir);
      expect(explainRes.content).toBeDefined();

      // 2. Explain json
      const explainJsonRes = generateContext(undefined, { explain: true, json: true }, tempDir);
      expect(explainJsonRes.content).toBeDefined();

      // 3. Raw mode and XML format
      const rawRes = generateContext(undefined, { raw: true }, tempDir);
      expect(rawRes.content).toBeDefined();

      const xmlRes = generateContext(undefined, { format: "xml" }, tempDir);
      expect(xmlRes.content).toBeDefined();

      // 4. Stale warnings & overflow notices formatting
      handleDecisionsCommand({ subcommand: "new", title: "Drifted ADR" }, tempDir);
      fs.mkdirSync(path.join(tempDir, "src"), { recursive: true });
      fs.writeFileSync(path.join(tempDir, "src", "drifted.ts"), "export const a = 1;", "utf-8");
      handleDecisionsCommand(
        { subcommand: "link", id: "0001-drifted-adr", targetFile: "src/drifted.ts" },
        tempDir
      );
      // Mutate to create drift
      fs.writeFileSync(path.join(tempDir, "src", "drifted.ts"), "export const a = 2;", "utf-8");

      const humanContext = generateContext("drift test", { maxTokens: 100 }, tempDir);
      expect(humanContext.content).toBeDefined();
    });
  });

  describe("status.ts", () => {
    it("handles human status output with drift, pending proposals, and check mode", () => {
      // Add a drifted ADR
      handleDecisionsCommand({ subcommand: "new", title: "Test ADR for Status" }, tempDir);
      fs.mkdirSync(path.join(tempDir, "src"), { recursive: true });
      fs.writeFileSync(path.join(tempDir, "src", "test.ts"), "export const b = 1;", "utf-8");
      handleDecisionsCommand(
        { subcommand: "link", id: "0001-test-adr-for-status", targetFile: "src/test.ts" },
        tempDir
      );
      // Mutate to create drift
      fs.writeFileSync(path.join(tempDir, "src", "test.ts"), "export const b = 999;", "utf-8");

      // Add a pending proposal
      createProposal("cli", { decisions: [] }, "test", tempDir);

      // Human mode with check flag
      const statusRes = handleStatusCommand({ check: true }, tempDir);
      expect(statusRes.exitCode).toBe(1);
      expect(statusRes.activeDecisionsCount).toBeGreaterThan(0);
      expect(statusRes.pendingProposalsCount).toBeGreaterThan(0);
    });
  });

  describe("sync.ts", () => {
    it("handles sync human reporting on drifted codebase and accept all", () => {
      handleDecisionsCommand({ subcommand: "new", title: "Sync Test ADR" }, tempDir);
      fs.mkdirSync(path.join(tempDir, "src"), { recursive: true });
      fs.writeFileSync(path.join(tempDir, "src", "sync_file.ts"), "initial", "utf-8");
      handleDecisionsCommand(
        { subcommand: "link", id: "0001-sync-test-adr", targetFile: "src/sync_file.ts" },
        tempDir
      );

      // Mutate file to generate drift status
      fs.writeFileSync(path.join(tempDir, "src", "sync_file.ts"), "mutated", "utf-8");

      // Sync read-only report in human mode
      const readOnly = syncVeeshree(tempDir, {});
      expect(readOnly.report.hasDrift).toBe(true);
      expect(readOnly.exitCode).toBe(1);

      // Sync accept all in human mode
      const acceptAll = syncVeeshree(tempDir, { accept: "all" });
      expect(acceptAll.exitCode).toBe(0);
    });
  });

  describe("hooks.ts", () => {
    it("handles install, uninstall, and status in human readable mode", () => {
      // Status in git repo
      const statusGit = handleHooksCommand("status", tempDir, {});
      expect(statusGit).toBeDefined();

      // Install in human mode
      const installRes = handleHooksCommand("install", tempDir, {});
      expect(Array.isArray(installRes)).toBe(true);

      // Status with installed hooks
      handleHooksCommand("status", tempDir, {});

      // Uninstall in human mode
      const uninstallRes = handleHooksCommand("uninstall", tempDir, {});
      expect(Array.isArray(uninstallRes)).toBe(true);

      // Uninstall again when nothing to remove
      handleHooksCommand("uninstall", tempDir, {});

      // Unknown action
      expect(() => handleHooksCommand("unknown" as any, tempDir, {})).toThrow(VeeError);
    });

    it("handles hooks status in non-git directory", () => {
      const nonGitDir = fs.mkdtempSync(path.join(os.tmpdir(), "vee-nongit-"));
      try {
        const statusNonGit = handleHooksCommand("status", nonGitDir, {});
        expect((statusNonGit as any).isGitRepo).toBe(false);
      } finally {
        fs.rmSync(nonGitDir, { recursive: true, force: true });
      }
    });
  });
});
