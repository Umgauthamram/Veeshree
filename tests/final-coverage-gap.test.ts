import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { execSync } from "node:child_process";
import { EventEmitter } from "node:events";
import { initializeVeeshree } from "../src/commands/init.js";
import { handleMigrateCommand } from "../src/commands/migrate.js";
import { handleDecisionsCommand } from "../src/commands/decisions.js";
import { handleCaptureCommand } from "../src/commands/capture.js";
import { handleDoctorCommand } from "../src/commands/doctor.js";
import { scanRepository } from "../src/core/scanner.js";
import * as modelsModule from "../src/providers/models.js";
import * as resolverModule from "../src/providers/resolver.js";
import { VeeError } from "../src/utils/errors.js";
import { redactSecrets } from "../src/core/redact/patterns.js";
import { explainContextBudget } from "../src/core/context/explain.js";
import { acquireLock, withLock } from "../src/core/memory/lock.js";
import { logger } from "../src/utils/logger.js";
import {
  parseMarkdownFrontmatter,
  parseDecisionFrontmatter,
  stringifyMarkdownFrontmatter,
} from "../src/core/memory/frontmatter.js";
import { resolveEngine } from "../src/providers/resolver.js";
import {
  rejectProposal,
  acceptProposal,
  createProposal,
} from "../src/core/proposals/queue.js";
import { handleMcpToolCall } from "../src/mcp/tools.js";
import { getResolvedVersion } from "../src/utils/constants.js";
import { loadConfig, saveConfig } from "../src/core/config.js";
import * as authModule from "../src/core/auth.js";
import { acceptBaselines } from "../src/core/drift/baselines.js";
import { handleStatusCommand } from "../src/commands/status.js";
import { handleImportCommand } from "../src/commands/import.js";
import { handleKeysCommand } from "../src/commands/keys.js";
import { handleMcpCommand } from "../src/commands/mcp.js";
import { startDaemon, stopDaemon, getDaemonStatus } from "../src/core/watch/daemon.js";
import { startMemoryWatcher } from "../src/core/watch/watcher.js";
import { handleExportCommand } from "../src/commands/export.js";
import { handleUndoCommand } from "../src/commands/undo.js";
import { handleGcCommand } from "../src/commands/gc.js";
import { handleProposalsCommand } from "../src/commands/proposals.js";
import { generateCurrentStateTemplate } from "../src/core/templates.js";
import {
  installAgentRules,
  uninstallAgentRules,
  injectAgentRuleBlock,
} from "../src/core/rules/manager.js";
import { createMemorySnapshot } from "../src/core/snapshots/snapshot-manager.js";

describe("Final Coverage Gap Closure Suite", () => {
  let tempDir: string;
  const originalPlatform = process.platform;

  beforeEach(() => {
    Object.defineProperty(process, "platform", { value: originalPlatform, configurable: true });
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "vee-final-gap-"));
    execSync("git init", { cwd: tempDir, stdio: "ignore" });
    execSync('git config user.email "test@example.com"', { cwd: tempDir, stdio: "ignore" });
    execSync('git config user.name "Test User"', { cwd: tempDir, stdio: "ignore" });
    initializeVeeshree(tempDir);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    Object.defineProperty(process, "platform", { value: originalPlatform, configurable: true });
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch {
      // ignore
    }
  });

  describe("migrate.ts un-prefixed ADR renaming", () => {
    it("renames legacy ADR filenames without 0000- prefix and calculates hashes", async () => {
      const legacyAdrPath = path.join(
        tempDir,
        "docs",
        "memory",
        "decisions",
        "legacy-architecture.md"
      );
      fs.writeFileSync(
        legacyAdrPath,
        `---\ntitle: Legacy Architecture\nstatus: active\nlinked_files:\n  - src/legacy.ts\n---\n# Legacy Architecture\nDetails`,
        "utf-8"
      );

      const legacyCode = path.join(tempDir, "src", "legacy.ts");
      fs.mkdirSync(path.dirname(legacyCode), { recursive: true });
      fs.writeFileSync(legacyCode, "export const leg = 1;", "utf-8");

      const res = await handleMigrateCommand({}, tempDir);
      expect(res.adrsUpdated).toBeGreaterThan(0);
      expect(fs.existsSync(legacyAdrPath)).toBe(false);

      const files = fs.readdirSync(path.join(tempDir, "docs", "memory", "decisions"));
      const renamed = files.find((f) => f.includes("legacy-architecture"));
      expect(renamed).toBeDefined();
      expect(/^\d{4}-/.test(renamed!)).toBe(true);
    });
  });

  describe("init.ts dryRun and agent selection branches", () => {
    it("handles dry-run and selected agents in fresh directory", () => {
      const freshDir = fs.mkdtempSync(path.join(os.tmpdir(), "vee-dry-init-"));
      try {
        const dryReport = initializeVeeshree(freshDir, { dryRun: true, agents: "claude,cursor" });
        expect(dryReport.seededFiles.length).toBeGreaterThan(0);
        expect(fs.existsSync(path.join(freshDir, "docs", "memory"))).toBe(false);
      } finally {
        fs.rmSync(freshDir, { recursive: true, force: true });
      }
    });
  });

  describe("decisions.ts supersede chain and list stale drift display", () => {
    it("displays supersedes and superseded_by chains and stale drift in list", () => {
      // 1. Create first ADR
      handleDecisionsCommand({ subcommand: "new", title: "Original Architecture" }, tempDir);
      // Link to file
      const codePath = path.join(tempDir, "src", "app.ts");
      fs.mkdirSync(path.dirname(codePath), { recursive: true });
      fs.writeFileSync(codePath, "export const v = 1;", "utf-8");
      handleDecisionsCommand(
        { subcommand: "link", id: "0001-original-architecture", targetFile: "src/app.ts" },
        tempDir
      );

      // 2. Supersede it
      handleDecisionsCommand(
        {
          subcommand: "supersede",
          id: "0001-original-architecture",
          title: "Next Gen Architecture",
        },
        tempDir
      );

      // Mutate file to cause stale code drift
      fs.writeFileSync(codePath, "export const v = 2;", "utf-8");

      // Show old ADR (has superseded_by)
      handleDecisionsCommand({ subcommand: "show", id: "0001-original-architecture" }, tempDir);

      // Show new ADR (has supersedes)
      handleDecisionsCommand({ subcommand: "show", id: "0002-next-gen-architecture" }, tempDir);

      // List decisions in human mode (displays linked files and stale code drift badge)
      handleDecisionsCommand({ subcommand: "list" }, tempDir);
    });
  });

  describe("capture.ts git diff fallback and stdin reading", () => {
    it("handles capture with stdin streaming", async () => {
      const stdinMock = new EventEmitter();
      (stdinMock as any).isTTY = false;
      (stdinMock as any).setEncoding = vi.fn();

      const origStdin = process.stdin;
      Object.defineProperty(process, "stdin", { value: stdinMock, configurable: true });

      setTimeout(() => {
        stdinMock.emit("data", "export const capturedByStdin = true;");
        stdinMock.emit("end");
      }, 10);

      const res = await handleCaptureCommand({ showPayload: true }, tempDir);
      expect(res.payload).toContain("capturedByStdin");

      Object.defineProperty(process, "stdin", { value: origStdin, configurable: true });
    });
  });

  describe("scanner.ts Pages and App routes, README.rst, and feature branches", () => {
    it("detects pages/api, app/api, README.rst, and git feature branches", () => {
      // Create Pages router
      const pageApi = path.join(tempDir, "pages", "api", "users.ts");
      fs.mkdirSync(path.dirname(pageApi), { recursive: true });
      fs.writeFileSync(pageApi, "export default function handler() {}", "utf-8");

      // Create App router
      const appApi = path.join(tempDir, "app", "api", "auth", "route.ts");
      fs.mkdirSync(path.dirname(appApi), { recursive: true });
      fs.writeFileSync(appApi, "export function GET() {}", "utf-8");

      // Create README.rst
      const rstPath = path.join(tempDir, "README.rst");
      fs.writeFileSync(rstPath, "Project Title\n==============\nThis is a project description paragraph.\n", "utf-8");

      // Checkout a feature branch
      execSync("git checkout -b feat/payment-gateway", { cwd: tempDir, stdio: "ignore" });
      execSync("git add .", { cwd: tempDir, stdio: "ignore" });
      execSync('git commit -m "add feature files"', { cwd: tempDir, stdio: "ignore" });

      const scanned = scanRepository(tempDir);
      expect(scanned.apiEndpoints.length).toBeGreaterThan(0);
      expect(scanned.activeFeatureFocus).toContain("payment-gateway");
      expect(scanned.recentCommits.length).toBeGreaterThan(0);
    });
  });

  describe("daemon.ts non-win32 process.kill branch", () => {
    it("uses process.kill on non-win32 platforms", () => {
      const origPlatform = process.platform;
      try {
        Object.defineProperty(process, "platform", { value: "linux", configurable: true });

        const killSpy = vi.spyOn(process, "kill").mockImplementation(() => true);

        // Write PID file
        const pidFile = path.join(tempDir, ".vee", "watch.pid");
        fs.mkdirSync(path.dirname(pidFile), { recursive: true });
        fs.writeFileSync(pidFile, "54321", "utf-8");

        const res = stopDaemon(tempDir);

        expect(killSpy).toHaveBeenCalledWith(54321, "SIGTERM");
        expect(res.stopped).toBe(true);
      } finally {
        Object.defineProperty(process, "platform", { value: origPlatform, configurable: true });
      }
    });
  });

  describe("doctor.ts model check failure and ERR_INVALID_MODEL branches", () => {
    it("handles doctor model verification failure and invalid model error", async () => {
      // 1. Model verification returns ok: false
      vi.spyOn(resolverModule, "resolveEngine").mockResolvedValueOnce({
        provider: "ollama",
        model: "unsupported-model",
      } as any);
      vi.spyOn(modelsModule, "verifyModelEndpoint").mockResolvedValueOnce({
        ok: false,
        message: "Model verification failed for testing",
        remedy: "Configure valid model",
      });

      const docRes1 = (await handleDoctorCommand({}, tempDir)) as any;
      const modelCheckFail = docRes1.checks.find((c: any) => c.name === "Model Verification");
      expect(modelCheckFail?.status).toBe("fail");

      // 2. resolveEngine throws ERR_INVALID_MODEL
      vi.spyOn(resolverModule, "resolveEngine").mockRejectedValueOnce(
        new VeeError("Invalid model configured", "ERR_INVALID_MODEL")
      );

      const docRes2 = (await handleDoctorCommand({}, tempDir)) as any;
      const modelValFail = docRes2.checks.find((c: any) => c.name === "Model Validation");
      expect(modelValFail?.status).toBe("fail");
    });
  });

  describe("patterns.ts redaction branches", () => {
    it("handles pre-redacted secret values without double redacting", () => {
      const alreadyRedacted = 'secret = "[REDACTED:secret]"';
      expect(redactSecrets(alreadyRedacted)).toBe(alreadyRedacted);

      const secretStr = 'secret = "a8fbc9238e12d4a7b0c9e12847562819"';
      expect(redactSecrets(secretStr)).toContain("[REDACTED:secret]");
    });
  });

  describe("explain.ts context budget breakdown branches", () => {
    it("formats budget with notes, overflowNotice, and staleWarnings", () => {
      const formatted = explainContextBudget({
        totalTokens: 1500,
        maxTokens: 2000,
        tiers: [
          {
            tier: "constraints",
            tokens: 300,
            cap: 400,
            truncated: true,
            notes: "truncated due to cap",
          },
          {
            tier: "tasks",
            tokens: 200,
            cap: 250,
            truncated: false,
          },
        ],
        overflowNotice: "Total context exceeded standard allocation",
        staleWarnings: ["src/app.ts has drifted"],
      } as any);

      expect(formatted).toContain("=== Veeshree Context Token Allocation Breakdown ===");
      expect(formatted).toContain("truncated due to cap");
      expect(formatted).toContain("Total context exceeded standard allocation");
      expect(formatted).toContain("src/app.ts has drifted");
    });
  });

  describe("lock.ts concurrency, stale lock breaking, and retry branches", () => {
    it("acquires, breaks stale lock, handles double release, and withLock", async () => {
      // 1. acquire and release
      const handle = acquireLock(tempDir);
      handle.release();
      handle.release(); // second release is a no-op

      // 2. stale lock cleanup
      const lockPath = path.join(tempDir, ".vee", "lock");
      fs.mkdirSync(path.dirname(lockPath), { recursive: true });
      fs.writeFileSync(lockPath, JSON.stringify({ pid: 12345, time: new Date(0).toISOString() }), "utf-8");
      const oldTime = (Date.now() - 120000) / 1000;
      fs.utimesSync(lockPath, oldTime, oldTime);

      const handle2 = acquireLock(tempDir);
      expect(handle2).toBeDefined();
      handle2.release();

      // 3. withLock
      const val = await withLock(tempDir, () => 999);
      expect(val).toBe(999);

      // 4. lock timeout
      const blockingLock = acquireLock(tempDir);
      expect(() => acquireLock(tempDir, 100)).toThrow();
      blockingLock.release();
    });
  });

  describe("logger.ts quiet, debug, json, and styling branches", () => {
    it("exercises all logger branches", () => {
      // quiet mode
      logger.setQuiet(true);
      expect(logger.isQuiet()).toBe(true);
      logger.debug("dbg");
      logger.info("inf");
      logger.success("suc");
      logger.warn("wrn");
      logger.log("lg");
      logger.title("ttl");

      // debug level and json mode
      logger.setQuiet(false);
      logger.setLevel("debug");
      logger.setJson(true);
      expect(logger.isJson()).toBe(true);
      logger.debug("dbg-json");
      logger.info("inf-json");
      logger.success("suc-json");
      logger.warn("wrn-json");
      logger.error("err-json");

      // non-json
      logger.setJson(false);
      logger.debug("dbg-plain");
      logger.error("err-plain");
      expect(logger.magenta("m")).toBeDefined();

      // restore
      logger.setLevel("info");
    });
  });

  describe("frontmatter.ts fallback and edge-case branches", () => {
    it("handles empty yaml, invalid yaml, invalid frontmatter schema, and empty data stringify", () => {
      // Empty yaml
      const p1 = parseMarkdownFrontmatter("---\n\n---\nbody text");
      expect(p1.content).toBe("body text");

      // Invalid yaml syntax
      const p2 = parseMarkdownFrontmatter("---\n: invalid: yaml :\n---\nbody text");
      expect(p2.content).toContain("body text");

      // Invalid ADR frontmatter schema
      const p3 = parseDecisionFrontmatter("---\nstatus: non_existent_status\n---\nbody");
      expect(p3.data.status).toBe("active");
      expect(p3.data.tags).toEqual([]);

      // stringify empty data
      const str = stringifyMarkdownFrontmatter({}, "just body");
      expect(str.trim()).toBe("just body");
    });
  });

  describe("resolver.ts provider resolution branches", () => {
    it("resolves local and cloud providers with fallback models", async () => {
      // Enable cloud consent for testing cloud providers
      const cfg = loadConfig(tempDir);
      cfg.privacy = { allow_cloud: true };
      saveConfig(cfg, tempDir);

      // Ollama
      const ollamaEngine = await resolveEngine(tempDir, "ollama", "llama3.2");
      expect(ollamaEngine.provider).toBe("ollama");

      // LM Studio
      const lmEngine = await resolveEngine(tempDir, "lmstudio", "default");
      expect(lmEngine.provider).toBe("lmstudio");

      // Groq (mock auth)
      vi.spyOn(authModule, "getApiKey").mockReturnValue("gsk_fake_groq_key");
      const groqEngine = await resolveEngine(tempDir, "groq", "llama-3.3-70b-versatile");
      expect(groqEngine.provider).toBe("groq");

      // Nvidia (mock auth)
      const nvidiaEngine = await resolveEngine(tempDir, "nvidia", "meta/llama-3.1-70b-instruct");
      expect(nvidiaEngine.provider).toBe("nvidia");

      // Unsupported provider
      await expect(resolveEngine(tempDir, "fake_unknown" as any)).rejects.toThrow("Unsupported AI model provider");
    });
  });

  describe("queue.ts accept/reject proposal parameter overloads and error branches", () => {
    it("handles acceptProposal and rejectProposal overloads and errors", async () => {
      const p1 = createProposal(
        {
          current_state: { summary: "", key_decisions: [], active_context: "", completed_in_session: [], next_immediate_steps: [] },
          tasks: [],
          constraints: [],
          rejected_approaches: [],
          discoveries: [],
        },
        tempDir
      );

      // Overload: reviewer and rootDir
      const acc = await acceptProposal(p1.id, "reviewerA", tempDir);
      expect(acc.proposal.status).toBe("accepted");

      // Already accepted error
      await expect(acceptProposal(p1.id, "reviewerA", tempDir)).rejects.toThrow("already accepted");

      // Non-existent error
      await expect(acceptProposal("prop-9999", "reviewerA", tempDir)).rejects.toThrow("not found");

      const p2 = createProposal(
        {
          current_state: { summary: "", key_decisions: [], active_context: "", completed_in_session: [], next_immediate_steps: [] },
          tasks: [],
          constraints: [],
          rejected_approaches: [],
          discoveries: [],
        },
        tempDir
      );

      // Overload: rootDir as second arg
      const rej = rejectProposal(p2.id, tempDir);
      expect(rej.proposal.status).toBe("rejected");

      // Already rejected error
      expect(() => rejectProposal(p2.id, tempDir)).toThrow("already rejected");

      // Non-existent error
      expect(() => rejectProposal("prop-9999", tempDir)).toThrow("not found");
    });
  });

  describe("mcp/tools.ts auto-apply low-risk proposal branch", () => {
    it("automatically applies low-risk proposal when config.proposals.auto_apply_low_risk is true", async () => {
      const config = loadConfig(tempDir);
      config.proposals = config.proposals || {};
      config.proposals.auto_apply_low_risk = true;
      saveConfig(config, tempDir);

      const resStr = await handleMcpToolCall(
        "update_task",
        { name: "Build feature", action: "add" },
        tempDir
      );
      const res = JSON.parse(resStr);
      expect(res.status).toBe("accepted");
      expect(res.message).toContain("applied automatically");
    });
  });

  describe("constants.ts version resolution branch", () => {
    it("returns version from globalThis.__VERSION__", () => {
      (globalThis as any).__VERSION__ = "9.9.9-test";
      try {
        expect(getResolvedVersion()).toBe("9.9.9-test");
      } finally {
        delete (globalThis as any).__VERSION__;
      }
    });
  });

  describe("lock.ts edge cases", () => {
    it("handles fresh dir without .vee and unexpected fs errors", () => {
      const freshNoVee = fs.mkdtempSync(path.join(os.tmpdir(), "vee-lock-edge-"));
      try {
        const h = acquireLock(freshNoVee);
        expect(h).toBeDefined();
        h.release();
      } finally {
        fs.rmSync(freshNoVee, { recursive: true, force: true });
      }

      // fs.openSync throws non-EEXIST error
      vi.spyOn(fs, "openSync").mockImplementationOnce(() => {
        throw new Error("Permission denied");
      });
      expect(() => acquireLock(tempDir, 100)).toThrow("Permission denied");

      // fs.unlinkSync throws in stale lock check
      const lockPath = path.join(tempDir, ".vee", "lock");
      fs.writeFileSync(lockPath, "{}", "utf-8");
      const oldTime = (Date.now() - 120000) / 1000;
      fs.utimesSync(lockPath, oldTime, oldTime);
      vi.spyOn(fs, "statSync").mockImplementationOnce(() => {
        throw new Error("Disk error");
      });
      const h2 = acquireLock(tempDir);
      h2.release();
    });
  });

  describe("baselines.ts acceptance and string entry branches", () => {
    it("handles string entries in linked_files and non-existent ADR targets", () => {
      // 1. Non-existent target throws
      expect(() => acceptBaselines("non-existent-adr-id", tempDir)).toThrow("not found or has no drifted files");

      // 2. ADR with string entry in linked_files
      const adrPath = path.join(tempDir, "docs", "memory", "decisions", "0005-string-entry.md");
      const codePath = path.join(tempDir, "src", "sample.ts");
      fs.mkdirSync(path.dirname(codePath), { recursive: true });
      fs.writeFileSync(codePath, "export const sample = 1;", "utf-8");

      fs.writeFileSync(
        adrPath,
        `---\nid: 0005-string-entry\ntitle: String Entry ADR\nstatus: active\nlinked_files:\n  - src/sample.ts\n---\n# Content`,
        "utf-8"
      );

      const res = acceptBaselines("0005-string-entry", tempDir);
      expect(res.updatedAdrs).toContain("0005-string-entry");
    });
  });

  describe("status.ts tasks, current focus, and check exitCode branches", () => {
    it("reads completed/pending tasks and current focus from markdown", () => {
      const tasksPath = path.join(tempDir, "docs", "memory", "tasks.md");
      fs.writeFileSync(tasksPath, "# Tasks\n- [x] Task 1\n- [ ] Task 2\n", "utf-8");

      const statePath = path.join(tempDir, "docs", "memory", "current-state.md");
      fs.writeFileSync(statePath, "# State\n- **Current Focus**: Payments integration\n", "utf-8");

      const res = handleStatusCommand({ quiet: true }, tempDir);
      expect(res.currentFocus).toBe("Payments integration");
      expect(res.completedTasks).toBe(1);
      expect(res.totalTasks).toBe(2);
      expect(res.exitCode).toBe(0);
    });
  });

  describe("import.ts parse error, missing file, and proposal staging branches", () => {
    it("handles missing file and invalid JSON bundle", () => {
      expect(() => handleImportCommand("non-existent-file.json", {}, tempDir)).toThrow("Import file not found");

      const badJsonPath = path.join(tempDir, "bad.json");
      fs.writeFileSync(badJsonPath, "{ not valid json", "utf-8");
      expect(() => handleImportCommand(badJsonPath, {}, tempDir)).toThrow("Failed to parse JSON bundle");
    });
  });

  describe("keys.ts set global and unknown action branches", () => {
    it("handles global key set and unknown action", () => {
      const setKeySpy = vi.spyOn(authModule, "setApiKey").mockImplementation(() => {});
      handleKeysCommand("set", "gemini", "sample-gemini-key", {}, tempDir);
      expect(setKeySpy).toHaveBeenCalled();
      expect(() => handleKeysCommand("unknown" as any, undefined, undefined, {}, tempDir)).toThrow("Unknown keys action");
    });
  });

  describe("mcp.ts install argument validation", () => {
    it("throws when client is missing", async () => {
      await expect(handleMcpCommand("install", {}, tempDir)).rejects.toThrow("Usage: vee mcp install --client");
    });
  });

  describe("doctor.ts model check verified branch", () => {
    it("handles doctor model verification success", async () => {
      vi.spyOn(resolverModule, "resolveEngine").mockResolvedValueOnce({
        provider: "gemini",
        model: "gemini-2.0-flash",
      } as any);
      vi.spyOn(modelsModule, "verifyModelEndpoint").mockResolvedValueOnce({
        ok: true,
      });

      const docRes = await handleDoctorCommand({}, tempDir);
      const verifiedCheck = docRes.checks.find((c) => c.name === "Active Engine");
      expect(verifiedCheck?.status).toBe("ok");
      expect(verifiedCheck?.message).toContain("verified");
    });
  });

  describe("daemon.ts win32 stop and dead process startup branches", () => {
    it("handles win32 stop and dead process cleanup", () => {
      // 1. stopDaemon win32
      const pidPath = path.join(tempDir, ".vee", "watch.pid");
      fs.mkdirSync(path.dirname(pidPath), { recursive: true });
      fs.writeFileSync(pidPath, "88888", "utf-8");
      const origPlatform = process.platform;
      try {
        Object.defineProperty(process, "platform", { value: "win32", configurable: true });
        vi.spyOn(process, "kill").mockImplementation(() => true);
        const res = stopDaemon(tempDir);
        expect(res.stopped).toBe(true);
      } finally {
        Object.defineProperty(process, "platform", { value: origPlatform, configurable: true });
      }

      // 2. getDaemonStatus stale pid cleanup
      const pidPath2 = path.join(tempDir, ".vee", "watch.pid");
      fs.writeFileSync(pidPath2, "77777", "utf-8");
      vi.spyOn(process, "kill").mockImplementation(() => {
        throw new Error("ESRCH");
      });
      const status = getDaemonStatus(tempDir);
      expect(status.running).toBe(false);
      expect(fs.existsSync(pidPath2)).toBe(false);
    });
  });

  describe("watcher.ts polling fallback branch", () => {
    it("falls back to polling when fs.watch throws", async () => {
      vi.spyOn(fs, "watch").mockImplementationOnce(() => {
        throw new Error("Recursive watch not supported");
      });
      const handle = await startMemoryWatcher(tempDir);
      expect(handle).toBeDefined();
      expect(typeof handle.stop).toBe("function");
      handle.stop();
    });
  });

  describe("export.ts markdown format and missing dir branches", () => {
    it("handles format: 'md' and missing memory dir", () => {
      let stdoutContent = "";
      const writeSpy = vi.spyOn(process.stdout, "write").mockImplementation((str: any) => {
        stdoutContent += str;
        return true;
      });
      handleExportCommand({ format: "md" }, tempDir);
      expect(stdoutContent).toContain("<!-- FILE: docs/memory/");

      const emptyDir = fs.mkdtempSync(path.join(os.tmpdir(), "vee-no-mem-"));
      try {
        handleExportCommand({}, emptyDir);
      } finally {
        fs.rmSync(emptyDir, { recursive: true, force: true });
      }
      writeSpy.mockRestore();
    });
  });

  describe("undo.ts stepStr branch", () => {
    it("handles explicit stepStr argument", () => {
      createMemorySnapshot(tempDir, "Step 1 snapshot");
      createMemorySnapshot(tempDir, "Step 2 snapshot");
      handleUndoCommand("2", tempDir);
    });
  });

  describe("gc.ts dry-run branches", () => {
    it("handles dry-run archiving and decision relocation", () => {
      const adrPath = path.join(tempDir, "docs", "memory", "decisions", "0009-superseded.md");
      fs.writeFileSync(
        adrPath,
        `---\nid: 0009-superseded\ntitle: Old ADR\nstatus: superseded\nsuperseded_by: 0010-new\nlinked_files: []\n---\n# Old`,
        "utf-8"
      );
      const res = handleGcCommand({ dryRun: true }, tempDir);
      expect(res.supersededDecisionsCount).toBeGreaterThan(0);
    });
  });

  describe("proposals.ts status and risk badge display branches", () => {
    it("displays accepted, rejected, and high risk proposals in human format", async () => {
      // High-risk proposal (modifying constraints)
      createProposal(
        {
          current_state: { current_feature: "", completed_in_session: [], next_immediate_steps: [] },
          tasks: [],
          constraints: [{ rule: "Never touch production without approval", type: "hard" }],
          rejected_approaches: [],
          discoveries: [],
        },
        tempDir
      );

      // Rejected proposal
      const p2 = createProposal(
        {
          current_state: { summary: "", key_decisions: [], active_context: "", completed_in_session: [], next_immediate_steps: [] },
          tasks: [],
          constraints: [],
          rejected_approaches: [],
          discoveries: [],
        },
        tempDir
      );
      rejectProposal(p2.id, tempDir);

      // Accepted proposal
      const p3 = createProposal(
        {
          current_state: { summary: "", key_decisions: [], active_context: "", completed_in_session: [], next_immediate_steps: [] },
          tasks: [],
          constraints: [],
          rejected_approaches: [],
          discoveries: [],
        },
        tempDir
      );
      await acceptProposal(p3.id, tempDir);

      const list = handleProposalsCommand({}, tempDir);
      expect(list.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe("templates.ts full field generation branches", () => {
    it("generates state template with all architecture fields populated", () => {
      const fullTemplate = generateCurrentStateTemplate({
        name: "Enterprise App",
        purpose: "Multi-tenant banking system",
        activeBranch: "feature/auth",
        activeFeatureFocus: "JWT session invalidation",
        languages: ["TypeScript", "Rust"],
        frameworks: ["Next.js", "Express"],
        databases: ["PostgreSQL", "Redis"],
        domainEntities: ["Account", "Transaction"],
        apiEndpoints: ["/api/v1/auth", "/api/v1/accounts"],
        infrastructure: ["Docker", "Kubernetes"],
        recentCommits: ["feat: add audit log", "fix: transaction race condition"],
      });
      expect(fullTemplate).toContain("Enterprise App");
      expect(fullTemplate).toContain("TypeScript, Rust");
      expect(fullTemplate).toContain("Next.js, Express");
      expect(fullTemplate).toContain("PostgreSQL, Redis");
      expect(fullTemplate).toContain("JWT session invalidation");
    });
  });

  describe("rules/manager.ts appending, updating, and single injection branches", () => {
    it("handles appending to existing instructions and injectAgentRuleBlock in new directory", () => {
      // 1. Appending to existing instructions
      const claudePath = path.join(tempDir, "CLAUDE.md");
      fs.writeFileSync(claudePath, "# Custom Instructions\nKeep answers brief.\n", "utf-8");
      installAgentRules(tempDir, ["claude"]);
      expect(fs.readFileSync(claudePath, "utf-8")).toContain("# Custom Instructions");

      // 2. Uninstalling rules leaves custom instructions intact
      uninstallAgentRules(tempDir, ["claude"]);
      const afterUninstall = fs.readFileSync(claudePath, "utf-8");
      expect(afterUninstall).toContain("# Custom Instructions");

      // 3. injectAgentRuleBlock creating parent directories
      const nestedRule = path.join(tempDir, "nested", "sub", "AGENT.md");
      const injected = injectAgentRuleBlock(nestedRule);
      expect(injected).toBe(true);
      expect(fs.existsSync(nestedRule)).toBe(true);
      const injectedAgain = injectAgentRuleBlock(nestedRule);
      expect(injectedAgain).toBe(false);
    });
  });

  describe("additional edge-case branch tests", () => {
    it("covers export json, undo default, and templates fallback", () => {
      // 1. Export json
      let stdoutContent = "";
      const writeSpy = vi.spyOn(process.stdout, "write").mockImplementation((str: any) => {
        stdoutContent += str;
        return true;
      });
      handleExportCommand({ format: "json" }, tempDir);
      expect(stdoutContent).toContain("{");
      writeSpy.mockRestore();

      // 2. Undo default stepStr
      createMemorySnapshot(tempDir, "Step default snapshot");
      handleUndoCommand(undefined, tempDir);

      // 3. Templates fallback
      const emptyTemplate = generateCurrentStateTemplate({
        name: "Empty App",
        purpose: "",
        activeBranch: "",
        activeFeatureFocus: "",
        languages: [],
        frameworks: [],
        databases: [],
        domainEntities: [],
        apiEndpoints: [],
        infrastructure: [],
        recentCommits: [],
      });
      expect(emptyTemplate).toContain("Standard software project");
      expect(emptyTemplate).toContain("Project Initialization & Core Architecture");

      // 4. Frontmatter empty body
      const parsed = parseMarkdownFrontmatter("---\ntitle: Only Header\n---");
      expect(parsed.data.title).toBe("Only Header");
      expect(parsed.content).toBe("");
    });

    it("covers migrate errors, pre-existing backup, and corrupt index", async () => {
      const noMem = fs.mkdtempSync(path.join(os.tmpdir(), "vee-no-mem-mig-"));
      try {
        await expect(handleMigrateCommand({}, noMem)).rejects.toThrow("docs/memory directory not found");
      } finally {
        fs.rmSync(noMem, { recursive: true, force: true });
      }

      const backupDir = path.join(tempDir, ".vee", "backup-0.3.x");
      fs.mkdirSync(backupDir, { recursive: true });
      fs.writeFileSync(path.join(backupDir, "old.txt"), "old", "utf-8");

      const indexPath = path.join(tempDir, ".vee", "index.json");
      fs.writeFileSync(indexPath, "{ bad json", "utf-8");

      const res = await handleMigrateCommand({}, tempDir);
      expect(res.success).toBe(true);
    });

    it("covers capture diff failure in non-git dir and TTY stdin", async () => {
      const nonGit = fs.mkdtempSync(path.join(os.tmpdir(), "vee-no-git-cap-"));
      try {
        await expect(handleCaptureCommand({ diff: true }, nonGit)).rejects.toThrow("Failed to read git diff");
      } finally {
        fs.rmSync(nonGit, { recursive: true, force: true });
      }

      const origStdin = process.stdin;
      Object.defineProperty(process, "stdin", { value: { isTTY: true }, configurable: true });
      await expect(handleCaptureCommand({}, tempDir)).rejects.toThrow();
      Object.defineProperty(process, "stdin", { value: origStdin, configurable: true });
    });

    it("covers status human drift list and proposals reminder", () => {
      const codePath = path.join(tempDir, "src", "status-drift.ts");
      fs.mkdirSync(path.dirname(codePath), { recursive: true });
      fs.writeFileSync(codePath, "export const st = 1;", "utf-8");

      const adr1 = path.join(tempDir, "docs", "memory", "decisions", "0020-active.md");
      fs.writeFileSync(
        adr1,
        `---\nid: 0020-active\ntitle: Active ADR\nstatus: active\nlinked_files:\n  - path: src/status-drift.ts\n    sha256: oldhash\n---\n# Active`,
        "utf-8"
      );

      const adr2 = path.join(tempDir, "docs", "memory", "decisions", "0021-superseded.md");
      fs.writeFileSync(
        adr2,
        `---\nid: 0021-superseded\ntitle: Superseded ADR\nstatus: superseded\nlinked_files: []\n---\n# Superseded`,
        "utf-8"
      );

      createProposal(
        {
          current_state: { current_feature: "", completed_in_session: [], next_immediate_steps: [] },
          tasks: [],
          constraints: [],
          rejected_approaches: [],
          discoveries: [],
        },
        tempDir
      );

      const res = handleStatusCommand({ check: true }, tempDir);
      expect(res.exitCode).toBe(1);
      expect(res.activeDecisionsCount).toBeGreaterThan(0);
      expect(res.supersededDecisionsCount).toBeGreaterThan(0);
      expect(res.pendingProposalsCount).toBeGreaterThan(0);
    });

    it("covers baselines path traversal error handling", () => {
      const adrPath = path.join(tempDir, "docs", "memory", "decisions", "0030-bad-path.md");
      fs.writeFileSync(
        adrPath,
        `---\nid: 0030-bad-path\ntitle: Bad Path ADR\nstatus: active\nlinked_files:\n  - path: ../../outside.ts\n---\n# Content`,
        "utf-8"
      );
      const res = acceptBaselines("all", tempDir);
      expect(res.updatedAdrs).toBeDefined();
    });

    it("covers export default format, gc live archive, import proposal staging, and lock release error", () => {
      // 1. Export default format (options.format is undefined)
      let stdoutContent = "";
      const writeSpy = vi.spyOn(process.stdout, "write").mockImplementation((str: any) => {
        stdoutContent += str;
        return true;
      });
      handleExportCommand({}, tempDir);
      expect(stdoutContent).toContain("{");
      writeSpy.mockRestore();

      // 2. GC live archive
      const tasksFile = path.join(tempDir, "docs", "memory", "tasks.md");
      fs.writeFileSync(
        tasksFile,
        "# Tasks\n" + Array.from({ length: 30 }, (_, i) => `- [x] Completed item ${i}`).join("\n") + "\n",
        "utf-8"
      );
      const gcRes = handleGcCommand({}, tempDir);
      expect(gcRes.archivedTasksCount).toBeGreaterThan(0);

      // 3. Import bundle without --yes that modifies constraints (stages proposal)
      const stagedBundle = path.join(tempDir, "staged-bundle.json");
      fs.writeFileSync(
        stagedBundle,
        JSON.stringify({
          manifest: {
            format: "veeshree-memory-export",
            version: "1.0.0",
            exported_at: new Date().toISOString(),
          },
          files: [{ path: "docs/memory/constraints.md", content: "# Staged Constraints\n" }],
        }),
        "utf-8"
      );
      const impRes = handleImportCommand(stagedBundle, {}, tempDir);
      expect(impRes.proposal).toBeDefined();

      // 4. Lock release error handling
      const lockH = acquireLock(tempDir);
      vi.spyOn(fs, "unlinkSync").mockImplementationOnce(() => {
        throw new Error("Cannot unlink lock");
      });
      lockH.release();

      // 5. Baselines specific target with multiple ADRs
      const adrA = path.join(tempDir, "docs", "memory", "decisions", "0050-target-a.md");
      const adrB = path.join(tempDir, "docs", "memory", "decisions", "0051-target-b.md");
      const codeA = path.join(tempDir, "src", "code-a.ts");
      fs.mkdirSync(path.dirname(codeA), { recursive: true });
      fs.writeFileSync(codeA, "export const a = 1;", "utf-8");
      fs.writeFileSync(
        adrA,
        `---\nid: 0050-target-a\ntitle: ADR A\nstatus: active\nlinked_files:\n  - path: src/code-a.ts\n    sha256: old\n---\n# A`,
        "utf-8"
      );
      fs.writeFileSync(
        adrB,
        `---\nid: 0051-target-b\ntitle: ADR B\nstatus: active\nlinked_files: []\n---\n# B`,
        "utf-8"
      );
      const res = acceptBaselines("0050-target-a", tempDir);
      expect(res.updatedAdrs).toContain("0050-target-a");
    });
  });
});
