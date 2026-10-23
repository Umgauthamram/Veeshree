import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { isEnoent, VeeError } from "../src/utils/errors.js";
import { writeAtomic } from "../src/core/memory/atomic.js";
import { resolveEngine } from "../src/providers/resolver.js";
import { OllamaExtractor } from "../src/providers/ollama.js";
import { scanRepository } from "../src/core/scanner.js";
import {
  createMemorySnapshot,
  restoreSnapshot,
  restoreMemorySnapshot,
  listSnapshots,
} from "../src/core/snapshots/snapshot-manager.js";
import { setApiKey, getApiKey, removeApiKey, loadGlobalCredentials } from "../src/core/auth.js";
import { installGitHooks, uninstallGitHooks, getHooksStatus } from "../src/core/hooks/manager.js";
import { buildContext } from "../src/core/context/builder.js";
import { initializeVeeshree } from "../src/commands/init.js";

describe("Error Branches and Resiliency Tests", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "vee-error-branches-"));
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

  describe("utils/errors.ts: isEnoent", () => {
    it("correctly identifies ENOENT error codes across input types", () => {
      expect(isEnoent(null)).toBe(false);
      expect(isEnoent(undefined)).toBe(false);
      expect(isEnoent("ENOENT")).toBe(false);
      expect(isEnoent(404)).toBe(false);
      expect(isEnoent({})).toBe(false);
      expect(isEnoent({ code: "EACCES" })).toBe(false);
      expect(isEnoent({ code: "ENOENT" })).toBe(true);

      const err = new Error("File not found");
      (err as any).code = "ENOENT";
      expect(isEnoent(err)).toBe(true);

      const err2 = new Error("Permission denied");
      (err2 as any).code = "EPERM";
      expect(isEnoent(err2)).toBe(false);
    });
  });

  describe("core/memory/atomic.ts", () => {
    it("handles chmod failure on non-win32 platforms without crashing", () => {
      const originalPlatform = process.platform;
      Object.defineProperty(process, "platform", { value: "linux", configurable: true });

      const spyChmod = vi.spyOn(fs, "chmodSync").mockImplementation(() => {
        throw new Error("chmod mock failure");
      });

      const testFile = path.join(tempDir, "atomic-test.txt");
      try {
        writeAtomic(testFile, "hello", { mode: 0o600 });
        expect(fs.readFileSync(testFile, "utf-8")).toBe("hello");
      } finally {
        spyChmod.mockRestore();
        Object.defineProperty(process, "platform", { value: originalPlatform, configurable: true });
      }
    });

    it("cleans up temporary file and handles unlink failure when rename fails", () => {
      const testFile = path.join(tempDir, "atomic-fail.txt");
      vi.spyOn(fs, "renameSync").mockImplementation(() => {
        throw new Error("Simulated rename error");
      });
      const spyUnlink = vi.spyOn(fs, "unlinkSync").mockImplementation(() => {
        const err: any = new Error("EBUSY");
        err.code = "EBUSY";
        throw err;
      });

      expect(() => writeAtomic(testFile, "data")).toThrow("Simulated rename error");
      spyUnlink.mockRestore();
    });

    it("handles unlink ENOENT gracefully when temp file already removed", () => {
      const testFile = path.join(tempDir, "atomic-fail-enoent.txt");
      vi.spyOn(fs, "renameSync").mockImplementation(() => {
        throw new Error("Simulated rename error 2");
      });
      vi.spyOn(fs, "unlinkSync").mockImplementation(() => {
        const err: any = new Error("ENOENT");
        err.code = "ENOENT";
        throw err;
      });

      expect(() => writeAtomic(testFile, "data")).toThrow("Simulated rename error 2");
    });
  });

  describe("providers/resolver.ts", () => {
    it("resolves all supported providers: groq, nvidia, ollama, lmstudio", async () => {
      // Ollama
      const ollama = await resolveEngine(tempDir, "ollama", "llama3.2");
      expect(ollama.provider).toBe("ollama");
      expect(ollama.model).toBe("llama3.2");

      // LmStudio
      const lmstudio = await resolveEngine(tempDir, "lmstudio", "default");
      expect(lmstudio.provider).toBe("lmstudio");

      // Groq (with mock cloud consent)
      process.env.VEE_ALLOW_CLOUD = "1";
      process.env.GROQ_API_KEY = "dummy-groq-key";
      try {
        const groq = await resolveEngine(tempDir, "groq", "llama-3.3-70b-versatile");
        expect(groq.provider).toBe("groq");

        // Nvidia
        process.env.NVIDIA_API_KEY = "dummy-nvidia-key";
        const nvidia = await resolveEngine(tempDir, "nvidia", "meta/llama-3.1-70b-instruct");
        expect(nvidia.provider).toBe("nvidia");
      } finally {
        delete process.env.VEE_ALLOW_CLOUD;
        delete process.env.GROQ_API_KEY;
        delete process.env.NVIDIA_API_KEY;
      }
    });

    it("throws ERR_INVALID_ARGS on unsupported provider", async () => {
      await expect(resolveEngine(tempDir, "nonexistent-provider")).rejects.toThrow(VeeError);
    });

    it("warns but allows unlisted model without throwing error", async () => {
      const result = await resolveEngine(tempDir, "ollama", "future-custom-model-2027");
      expect(result.model).toBe("future-custom-model-2027");
      expect(result.provider).toBe("ollama");
    });
  });

  describe("providers/ollama.ts", () => {
    it("falls back to llama3.2 when Ollama tags endpoint fails", async () => {
      const extractor = new OllamaExtractor();
      const origFetch = globalThis.fetch;
      globalThis.fetch = vi.fn().mockRejectedValue(new Error("Network connection refused"));

      try {
        const model = await (extractor as any).selectNonEmbeddingModel("http://127.0.0.1:11434");
        expect(model).toBe("llama3.2");
      } finally {
        globalThis.fetch = origFetch;
      }
    });

    it("filters out embedding models and picks first generative model", async () => {
      const extractor = new OllamaExtractor();
      const origFetch = globalThis.fetch;
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          models: [
            { name: "nomic-embed-text:latest" },
            { name: "bge-m3:latest" },
            { name: "mistral:latest" },
          ],
        }),
      } as any);

      try {
        const model = await (extractor as any).selectNonEmbeddingModel("http://127.0.0.1:11434");
        expect(model).toBe("mistral:latest");
      } finally {
        globalThis.fetch = origFetch;
      }
    });
  });

  describe("core/scanner.ts", () => {
    it("handles non-ENOENT read errors gracefully when inspecting readme", () => {
      const readmePath = path.join(tempDir, "README.md");
      fs.writeFileSync(readmePath, "# Title\n\nSome purpose description.\n");

      const origRead = fs.readFileSync;
      vi.spyOn(fs, "readFileSync").mockImplementation((p: any, ...args: any[]) => {
        if (typeof p === "string" && p.includes("README.md")) {
          const err: any = new Error("EPERM: Operation not permitted");
          err.code = "EPERM";
          throw err;
        }
        return origRead(p, ...args);
      });

      const scanned = scanRepository(tempDir);
      expect(scanned).toBeDefined();
    });

    it("detects Python, Rust, and Go project architectures", () => {
      const pyDir = fs.mkdtempSync(path.join(os.tmpdir(), "vee-py-"));
      try {
        fs.writeFileSync(path.join(pyDir, "pyproject.toml"), "[project]\nname = 'test-pkg'\n");
        const pyScan = scanRepository(pyDir);
        expect(pyScan.languages).toContain("Python");
      } finally {
        fs.rmSync(pyDir, { recursive: true, force: true });
      }

      const rustDir = fs.mkdtempSync(path.join(os.tmpdir(), "vee-rust-"));
      try {
        fs.writeFileSync(path.join(rustDir, "Cargo.toml"), "[package]\nname = 'rust-pkg'\n");
        const rustScan = scanRepository(rustDir);
        expect(rustScan.languages).toContain("Rust");
      } finally {
        fs.rmSync(rustDir, { recursive: true, force: true });
      }

      const goDir = fs.mkdtempSync(path.join(os.tmpdir(), "vee-go-"));
      try {
        fs.writeFileSync(path.join(goDir, "go.mod"), "module example.com/pkg\n");
        const goScan = scanRepository(goDir);
        expect(goScan.languages).toContain("Go");
      } finally {
        fs.rmSync(goDir, { recursive: true, force: true });
      }
    });
  });

  describe("core/snapshots/snapshot-manager.ts", () => {
    it("throws VeeError when restoring snapshot with invalid step", () => {
      expect(() => restoreSnapshot(999, tempDir)).toThrow(VeeError);
    });

    it("restores memory snapshot by snapshot id or returns false if not found", () => {
      const snap = createMemorySnapshot(tempDir, "Test Snapshot");
      expect(snap.id).toBeDefined();

      const success = restoreMemorySnapshot(tempDir, snap.id);
      expect(success).toBe(true);

      const notFound = restoreMemorySnapshot(tempDir, "nonexistent-id");
      expect(notFound).toBe(false);
    });

    it("lists snapshots and respects pruning", () => {
      for (let i = 0; i < 3; i++) {
        createMemorySnapshot(tempDir, `Snapshot ${i}`);
      }
      const list = listSnapshots(tempDir);
      expect(list.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe("core/auth.ts", () => {
    it("handles key storage and removal locally and globally", () => {
      setApiKey("gemini", "test-secret-key", tempDir, false);
      const retrieved = getApiKey("gemini", tempDir);
      expect(retrieved).toBe("test-secret-key");

      removeApiKey("gemini", tempDir, false);
      const afterRemoval = getApiKey("gemini", tempDir);
      expect(afterRemoval).toBeUndefined();

      // Corrupted global credentials file handling
      const credsPath = path.join(os.homedir(), ".veeshree", "credentials.json");
      if (fs.existsSync(credsPath)) {
        const backup = fs.readFileSync(credsPath, "utf-8");
        try {
          fs.writeFileSync(credsPath, "{ broken json", "utf-8");
          const loaded = loadGlobalCredentials();
          expect(loaded).toEqual({});
        } finally {
          fs.writeFileSync(credsPath, backup, "utf-8");
        }
      }
    });
  });

  describe("core/hooks/manager.ts", () => {
    it("installs, checks status, and uninstalls git hooks", () => {
      const gitHooksDir = path.join(tempDir, ".git", "hooks");
      fs.mkdirSync(gitHooksDir, { recursive: true });

      const installed = installGitHooks(tempDir, { blockOnDrift: true });
      expect(installed.length).toBe(3);

      const status = getHooksStatus(tempDir);
      expect(status.installed).toBe(true);
      expect(status.preCommitInstalled).toBe(true);

      const uninstalled = uninstallGitHooks(tempDir);
      expect(uninstalled.length).toBe(3);

      const statusAfter = getHooksStatus(tempDir);
      expect(statusAfter.installed).toBe(false);
    });
  });

  describe("core/context/builder.ts", () => {
    it("builds context in markdown, json, and xml formats", () => {
      const md = buildContext(tempDir, { format: "markdown", maxTokens: 1000 });
      expect(md.content).toContain("VEESHREE PERSISTENCE LAYER");

      const json = buildContext(tempDir, { format: "json", maxTokens: 1000 });
      expect(() => JSON.parse(json.content)).not.toThrow();

      const xml = buildContext(tempDir, { format: "xml", maxTokens: 1000 });
      expect(xml.content).toContain("<veeshree_context");
    });
  });

  describe("core/gc.ts and error resiliency", () => {
    it("handles corrupted decision file gracefully during garbage collection", async () => {
      const { runGarbageCollection } = await import("../src/core/gc.js");
      const decisionsDir = path.join(tempDir, "docs", "memory", "decisions");
      fs.mkdirSync(decisionsDir, { recursive: true });

      // Corrupted decision file
      fs.writeFileSync(path.join(decisionsDir, "corrupted.md"), "--- INVALID YAML ---\ntitle:\n---\n", "utf-8");

      // Valid superseded decision file
      fs.writeFileSync(
        path.join(decisionsDir, "0001-old.md"),
        `---\nid: "0001-old"\ntitle: "Old Decision"\nstatus: "superseded"\ndate: "2026-01-01"\n---\nOld content\n`,
        "utf-8"
      );

      // Tasks file with completed items
      const tasksFile = path.join(tempDir, "docs", "memory", "tasks.md");
      fs.writeFileSync(tasksFile, `# Tasks\n- [x] Done item 1\n- [ ] Pending item\n- [X] Done item 2\n`, "utf-8");

      const gcResult = runGarbageCollection(tempDir, { dryRun: false });
      expect(gcResult.supersededDecisionsCount).toBe(1);
      expect(gcResult.archivedTasksCount).toBe(2);
    });
  });

  describe("core/redact/denylist.ts: matchesSimpleGlob", () => {
    it("matches files with various glob patterns and handles edge cases", async () => {
      const { matchesSimpleGlob } = await import("../src/core/redact/denylist.js");

      expect(matchesSimpleGlob("file.txt", "")).toBe(false);
      expect(matchesSimpleGlob("file.txt", "   ")).toBe(false);
      expect(matchesSimpleGlob("file.txt", "# comment")).toBe(false);

      expect(matchesSimpleGlob("src/secret.key", "*.key")).toBe(true);
      expect(matchesSimpleGlob("src/index.ts", "*.key")).toBe(false);
      expect(matchesSimpleGlob("node_modules/pkg/index.js", "node_modules/")).toBe(true);
      expect(matchesSimpleGlob(".env.local", ".env*")).toBe(true);
      expect(matchesSimpleGlob("build/output.log", "**/output.log")).toBe(true);
    });
  });

  describe("core/redact/redactor.ts: redactContent & capDiffPayload", () => {
    it("redacts credentials, keys, and tokens and caps payload by maxBytes", async () => {
      const { redactContent, capDiffPayload } = await import("../src/core/redact/redactor.js");

      const input = "Here is my key: AIzaSyD9837452938475928347592834752938 and secret: sk-ant-api03-12345678901234567890";
      const redacted = redactContent(input);
      expect(redacted).not.toContain("AIzaSy");
      expect(redacted).not.toContain("sk-ant-api03");

      const longPayload = "line 1\nline 2\nline 3\nline 4\nline 5\n";
      const capped = capDiffPayload(longPayload, 15);
      expect(capped).toContain("truncated");
    });
  });

  describe("commands/doctor.ts", () => {
    it("runs doctor diagnostics without crashing", async () => {
      const { handleDoctorCommand } = await import("../src/commands/doctor.js");
      const logs: string[] = [];
      const origLog = console.log;
      console.log = (...args: any[]) => logs.push(args.join(" "));

      try {
        await handleDoctorCommand({}, tempDir);
        expect(logs.some((l) => l.includes("Diagnostics") || l.includes("Memory Scaffold") || l.includes("Veeshree Doctor"))).toBe(true);
      } finally {
        console.log = origLog;
      }
    });
  });

  describe("core/watch/daemon.ts branches", () => {
    it("handles stale PID file, unparseable PID, and stopDaemon when stopped", async () => {
      const { getDaemonStatus, stopDaemon } = await import("../src/core/watch/daemon.js");

      // 1. Stop when stopped
      const stoppedRes = stopDaemon(tempDir);
      expect(stoppedRes.stopped).toBe(false);

      // 2. Unparseable PID file
      const pidFile = path.join(tempDir, ".vee", "watch.pid");
      fs.mkdirSync(path.dirname(pidFile), { recursive: true });
      fs.writeFileSync(pidFile, "invalid-pid-not-a-number\n", "utf-8");
      const statusNaN = getDaemonStatus(tempDir);
      expect(statusNaN.running).toBe(false);
      expect(fs.existsSync(pidFile)).toBe(false); // cleaned up stale file

      // 3. Stale dead PID file
      fs.writeFileSync(pidFile, "9999999\n", "utf-8");
      const statusDead = getDaemonStatus(tempDir);
      expect(statusDead.running).toBe(false);
      expect(fs.existsSync(pidFile)).toBe(false); // cleaned up
    });
  });

  describe("commands/mcp.ts and mcp/tools.ts complete tool execution", () => {
    it("handles handleMcpCommand install errors and success", async () => {
      const { handleMcpCommand } = await import("../src/commands/mcp.js");

      await expect(handleMcpCommand("install", { client: undefined }, tempDir)).rejects.toThrow(VeeError);

      await handleMcpCommand("install", { client: "cursor" }, tempDir);
      const cursorConfig = path.join(tempDir, ".cursor", "mcp.json");
      expect(fs.existsSync(cursorConfig)).toBe(true);
    });

    it("exercises handleMcpToolCall across all tools and error branches", async () => {
      const { handleMcpToolCall } = await import("../src/mcp/tools.js");

      // Unknown tool
      await expect(handleMcpToolCall("unknown_tool", {}, tempDir)).rejects.toThrow(VeeError);

      // get_context
      await expect(handleMcpToolCall("get_context", { max_tokens: -1 }, tempDir)).rejects.toThrow(VeeError);
      const ctx = await handleMcpToolCall("get_context", { task: "Refactor auth" }, tempDir);
      expect(ctx).toBeDefined();

      // search_memory
      await expect(handleMcpToolCall("search_memory", { query: "" }, tempDir)).rejects.toThrow(VeeError);
      const searchRes = await handleMcpToolCall("search_memory", { query: "architecture" }, tempDir);
      expect(searchRes).toBeDefined();

      // get_decision
      await expect(handleMcpToolCall("get_decision", { id: "" }, tempDir)).rejects.toThrow(VeeError);
      await expect(handleMcpToolCall("get_decision", { id: "nonexistent-adr" }, tempDir)).rejects.toThrow(VeeError);

      // list_decisions
      await expect(handleMcpToolCall("list_decisions", { status: "invalid-status" }, tempDir)).rejects.toThrow(VeeError);
      const listAll = await handleMcpToolCall("list_decisions", { status: "all" }, tempDir);
      expect(listAll).toBeDefined();

      // check_drift
      await expect(handleMcpToolCall("check_drift", { id: "inv@lid-id" }, tempDir)).rejects.toThrow(VeeError);
      const driftRes = await handleMcpToolCall("check_drift", {}, tempDir);
      expect(driftRes).toBeDefined();

      // propose_decision
      await expect(handleMcpToolCall("propose_decision", { title: "" }, tempDir)).rejects.toThrow(VeeError);
      const propDec = await handleMcpToolCall(
        "propose_decision",
        { title: "Use Rust Engine", decision: "Rewrite engine", reason: "Speed" },
        tempDir
      );
      expect(propDec).toContain("Decision proposal created");

      // propose_constraint
      await expect(handleMcpToolCall("propose_constraint", { rule: "" }, tempDir)).rejects.toThrow(VeeError);
      const propCon = await handleMcpToolCall("propose_constraint", { rule: "Never use eval()" }, tempDir);
      expect(propCon).toContain("Constraint proposal created");

      // update_task
      await expect(handleMcpToolCall("update_task", { name: "" }, tempDir)).rejects.toThrow(VeeError);
      const propTask = await handleMcpToolCall("update_task", { name: "Benchmark queries", action: "add" }, tempDir);
      expect(propTask).toContain("Task update proposal recorded");
    });
  });

  describe("core/watch/watcher.ts error branches", () => {
    it("handles writeWatchLog failure and fs.watch failure with fallback to polling", async () => {
      const { writeWatchLog, startMemoryWatcher } = await import("../src/core/watch/watcher.js");

      // 1. writeWatchLog append failure
      const spyAppend = vi.spyOn(fs, "appendFileSync").mockImplementation(() => {
        throw new Error("Append disk full");
      });
      expect(() => writeWatchLog(tempDir, "info", "test line")).not.toThrow();
      spyAppend.mockRestore();

      // 2. startMemoryWatcher with fs.watch throwing immediately
      const spyWatch = vi.spyOn(fs, "watch").mockImplementation(() => {
        throw new Error("Recursive watch not supported");
      });

      const watcherInst = await startMemoryWatcher(tempDir, { debounceSeconds: 0.1 });
      expect(watcherInst).toBeDefined();
      expect(typeof watcherInst.stop).toBe("function");
      watcherInst.stop();
      spyWatch.mockRestore();
    });
  });

  describe("core/snapshots/snapshot-manager.ts corrupt meta", () => {
    it("handles corrupt meta.json during listSnapshots", async () => {
      const { createMemorySnapshot, listSnapshots } = await import("../src/core/snapshots/snapshot-manager.js");
      createMemorySnapshot(tempDir, "Valid snapshot");

      const snapshotsDir = path.join(tempDir, ".vee", "snapshots");
      const fakeDir = path.join(snapshotsDir, "snap_corrupted");
      fs.mkdirSync(fakeDir, { recursive: true });
      fs.writeFileSync(path.join(fakeDir, "meta.json"), "broken json!", "utf-8");

      const snaps = listSnapshots(tempDir);
      expect(snaps.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("core/proposals/queue.ts defaults and reviewer branches", () => {
    it("handles default rootDir and reviewer in acceptProposal and rejectProposal", async () => {
      const { createProposal, acceptProposal, rejectProposal } = await import("../src/core/proposals/queue.js");

      const prop1 = createProposal("cli", { decisions: [], current_state: { current_feature: "", completed_in_session: [], next_immediate_steps: [] }, tasks: [], constraints: [], rejected_approaches: [], discoveries: [] }, "test", tempDir);
      const prop2 = createProposal("cli", { decisions: [], current_state: { current_feature: "", completed_in_session: [], next_immediate_steps: [] }, tasks: [], constraints: [], rejected_approaches: [], discoveries: [] }, "test", tempDir);

      const accRes = await acceptProposal(prop1.id, tempDir);
      expect(accRes.success).toBe(true);
      expect(accRes.proposal.status).toBe("accepted");

      const rejRes = rejectProposal(prop2.id, tempDir);
      expect(rejRes.success).toBe(true);
      expect(rejRes.proposal.status).toBe("rejected");
    });
  });

  describe("commands/migrate.ts ADR renaming and route detection in scanner.ts", () => {
    it("renames un-numbered ADR in migrate and detects API routes in scanner", async () => {
      const { handleMigrateCommand } = await import("../src/commands/migrate.js");
      const { scanRepository } = await import("../src/core/scanner.js");

      // Unnumbered ADR
      const decDir = path.join(tempDir, "docs", "memory", "decisions");
      fs.mkdirSync(decDir, { recursive: true });
      fs.writeFileSync(
        path.join(decDir, "unprefixed-decision.md"),
        `---\ntitle: "Unprefixed Decision"\nstatus: "active"\n---\nDecision body\n`,
        "utf-8"
      );

      await handleMigrateCommand({}, tempDir);
      const renumbered = fs.readdirSync(decDir).find((f) => f.includes("unprefixed-decision"));
      expect(renumbered).toBeDefined();
      expect(/^\d{4}-/.test(renumbered!)).toBe(true);

      // Scanner with API route directory
      const apiDir = path.join(tempDir, "app", "api", "users");
      fs.mkdirSync(apiDir, { recursive: true });
      fs.writeFileSync(path.join(apiDir, "route.ts"), "export async function GET() {}", "utf-8");

      const scanResult = scanRepository(tempDir);
      expect(scanResult.apiEndpoints.length).toBeGreaterThan(0);
    });
  });

  describe("auth, init, and resolver config branches", () => {
    it("handles globalCreds lookup in getApiKey and listApiKeys", async () => {
      const { saveGlobalCredentials, getApiKey, listApiKeys, removeApiKey } = await import("../src/core/auth.js");
      const credsPath = path.join(os.homedir(), ".veeshree", "credentials.json");
      const backup = fs.existsSync(credsPath) ? fs.readFileSync(credsPath, "utf-8") : null;

      try {
        saveGlobalCredentials({ gemini: "global-gemini-secret" });
        const retrieved = getApiKey("gemini", tempDir);
        expect(retrieved).toBe("global-gemini-secret");

        const keys = listApiKeys(tempDir);
        expect(keys.gemini.configured).toBe(true);
        expect(keys.gemini.isGlobal).toBe(true);

        // Remove key without isGlobal argument
        removeApiKey("gemini", tempDir);
        expect(getApiKey("gemini", tempDir)).toBeUndefined();
      } finally {
        if (backup !== null) {
          fs.writeFileSync(credsPath, backup, "utf-8");
        } else if (fs.existsSync(credsPath)) {
          fs.unlinkSync(credsPath);
        }
      }
    });

    it("handles git hooks install error during init", async () => {
      const { initializeVeeshree } = await import("../src/commands/init.js");
      const hooksManager = await import("../src/core/hooks/manager.js");
      const spyHooks = vi.spyOn(hooksManager, "installGitHooks").mockImplementation(() => {
        throw new Error("Simulated git hook installation failure");
      });

      const initDir = fs.mkdtempSync(path.join(os.tmpdir(), "vee-init-fail-"));
      try {
        fs.mkdirSync(path.join(initDir, ".git", "hooks"), { recursive: true });
        expect(() => initializeVeeshree(initDir)).not.toThrow();
      } finally {
        spyHooks.mockRestore();
        fs.rmSync(initDir, { recursive: true, force: true });
      }
    });

    it("resolves engine with config.extractor and default_extractor", async () => {
      const { saveConfig, loadConfig } = await import("../src/core/config.js");
      const { resolveEngine } = await import("../src/providers/resolver.js");

      // 1. config.extractor with base_url
      const cfg = loadConfig(tempDir);
      cfg.extractor = { provider: "ollama", model: "llama3.2", base_url: "http://custom-ollama:11434" };
      saveConfig(cfg, tempDir);

      const res1 = await resolveEngine(tempDir);
      expect(res1.provider).toBe("ollama");
      expect(res1.baseUrl).toBe("http://custom-ollama:11434");

      // 2. config.default_extractor fallback
      delete cfg.extractor;
      cfg.default_extractor = { provider: "lmstudio", model: "default" };
      saveConfig(cfg, tempDir);

      const res2 = await resolveEngine(tempDir);
      expect(res2.provider).toBe("lmstudio");
    });
  });

  describe("additional deep branch coverage tests", () => {
    it("exercises daemon startDaemon and stopDaemon edge cases", async () => {
      const daemonModule = await import("../src/core/watch/daemon.js");

      // 1. startDaemon when daemon already running
      const pidPathRunning = path.join(tempDir, ".vee", "watch.pid");
      fs.mkdirSync(path.dirname(pidPathRunning), { recursive: true });
      fs.writeFileSync(pidPathRunning, String(process.pid), "utf-8");

      await expect(daemonModule.startDaemon(tempDir)).rejects.toThrow("Watcher daemon is already running");
      fs.unlinkSync(pidPathRunning);

      // 2. stopDaemon on non-win32 platform with kill error and unlink error
      const originalPlatform = process.platform;
      Object.defineProperty(process, "platform", { value: "linux", configurable: true });

      const pidPath = path.join(tempDir, ".vee", "watch.pid");
      fs.mkdirSync(path.dirname(pidPath), { recursive: true });
      fs.writeFileSync(pidPath, String(process.pid), "utf-8");

      const spyKill = vi.spyOn(process, "kill").mockImplementation((pid, signal) => {
        if (signal === "SIGTERM") {
          throw new Error("No such process");
        }
        return true;
      });

      const spyUnlink = vi.spyOn(fs, "unlinkSync").mockImplementation(() => {
        throw new Error("EPERM on unlink");
      });

      try {
        const stopRes = daemonModule.stopDaemon(tempDir);
        expect(stopRes.stopped).toBe(true);
        expect(stopRes.pid).toBe(process.pid);
      } finally {
        spyKill.mockRestore();
        spyUnlink.mockRestore();
        Object.defineProperty(process, "platform", { value: originalPlatform, configurable: true });
      }
    });

    it("exercises gc rename failure branch when moving superseded decisions", async () => {
      const { runGarbageCollection } = await import("../src/core/gc.js");
      const decDir = path.join(tempDir, "docs", "memory", "decisions");
      fs.mkdirSync(decDir, { recursive: true });
      fs.writeFileSync(
        path.join(decDir, "0002-old.md"),
        `---\nid: "0002-old"\ntitle: "Old 2"\nstatus: "superseded"\n---\nOld content\n`,
        "utf-8"
      );

      const origRename = fs.renameSync;
      const spyRename = vi.spyOn(fs, "renameSync").mockImplementation((oldP: any, newP: any) => {
        if (typeof oldP === "string" && oldP.includes("0002-old.md")) {
          const err: any = new Error("EPERM: Permission denied");
          err.code = "EPERM";
          throw err;
        }
        return origRename(oldP, newP);
      });

      try {
        const gcRes = runGarbageCollection(tempDir, { dryRun: false });
        expect(gcRes).toBeDefined();
      } finally {
        spyRename.mockRestore();
      }
    });

    it("exercises watcher error event on FSWatcher", async () => {
      const { startMemoryWatcher } = await import("../src/core/watch/watcher.js");
      const { EventEmitter } = await import("node:events");

      const fakeWatcher = new EventEmitter() as any;
      fakeWatcher.close = vi.fn();

      const spyWatch = vi.spyOn(fs, "watch").mockReturnValue(fakeWatcher);

      const watcher = await startMemoryWatcher(tempDir, { debounceSeconds: 0.1 });
      // Emit error event on watcher
      fakeWatcher.emit("error", new Error("Simulated watch internal error"));

      watcher.stop();
      spyWatch.mockRestore();
    });

    it("exercises scanner route directory failure branch", async () => {
      const { scanRepository } = await import("../src/core/scanner.js");
      const apiDir = path.join(tempDir, "app", "api", "failing");
      fs.mkdirSync(apiDir, { recursive: true });

      const origReaddir = fs.readdirSync;
      vi.spyOn(fs, "readdirSync").mockImplementation((p: any, ...args: any[]) => {
        if (typeof p === "string" && p.includes("failing")) {
          const err: any = new Error("EACCES: permission denied");
          err.code = "EACCES";
          throw err;
        }
        return origReaddir(p, ...args);
      });

      const res = scanRepository(tempDir);
      expect(res).toBeDefined();
    });

    it("exercises full stack and entity detection in scanner.ts", async () => {
      const { scanRepository } = await import("../src/core/scanner.js");
      const testDir = fs.mkdtempSync(path.join(os.tmpdir(), "vee-scanner-full-"));

      try {
        // requirements.txt
        fs.writeFileSync(
          path.join(testDir, "requirements.txt"),
          "django==5.0\nfastapi\nflask\nsqlalchemy\npsycopg2\npymongo\nredis\ncelery\n",
          "utf-8"
        );

        // models.py
        fs.writeFileSync(
          path.join(testDir, "models.py"),
          "class User(models.Model):\n  pass\nclass Order(models.Model):\n  pass\nclass Meta(object):\n  pass\n",
          "utf-8"
        );

        // prisma schema
        const prismaDir = path.join(testDir, "prisma");
        fs.mkdirSync(prismaDir, { recursive: true });
        fs.writeFileSync(
          path.join(prismaDir, "schema.prisma"),
          "model Account {\n  id Int @id\n}\n",
          "utf-8"
        );

        const scanned = scanRepository(testDir);
        expect(scanned.languages).toContain("Python");
        expect(scanned.frameworks).toContain("Django");
        expect(scanned.frameworks).toContain("FastAPI");
        expect(scanned.frameworks).toContain("Flask");
        expect(scanned.databases).toContain("SQLAlchemy");
        expect(scanned.databases).toContain("PostgreSQL");
        expect(scanned.databases).toContain("MongoDB");
        expect(scanned.databases).toContain("Redis");
        expect(scanned.infrastructure).toContain("Celery Task Worker");
        expect(scanned.domainEntities).toContain("User");
        expect(scanned.domainEntities).toContain("Order");
        expect(scanned.domainEntities).toContain("Account");
      } finally {
        fs.rmSync(testDir, { recursive: true, force: true });
      }
    });

    it("exercises initializeVeeshree on existing project with languages, frameworks, and databases", async () => {
      const { initializeVeeshree } = await import("../src/commands/init.js");
      const existingDir = fs.mkdtempSync(path.join(os.tmpdir(), "vee-init-existing-"));

      try {
        fs.writeFileSync(
          path.join(existingDir, "package.json"),
          JSON.stringify({
            name: "existing-app",
            version: "1.0.0",
            dependencies: {
              react: "^18.0.0",
              next: "^14.0.0",
              prisma: "^5.0.0",
              pg: "^8.0.0",
            },
          }),
          "utf-8"
        );

        const report = initializeVeeshree(existingDir);
        expect(report.isExistingProject).toBe(true);
        expect(report.languages.length).toBeGreaterThan(0);
        expect(report.frameworks.length).toBeGreaterThan(0);
      } finally {
        fs.rmSync(existingDir, { recursive: true, force: true });
      }
    });

    it("exercises listSnapshots when snapshots directory does not exist", async () => {
      const { listSnapshots } = await import("../src/core/snapshots/snapshot-manager.js");
      const emptyDir = fs.mkdtempSync(path.join(os.tmpdir(), "vee-no-snap-"));
      try {
        const list = listSnapshots(emptyDir);
        expect(list).toEqual([]);
      } finally {
        fs.rmSync(emptyDir, { recursive: true, force: true });
      }
    });

    it("exercises doctor fail branches for gitignore and fix branches for hooks", async () => {
      const { handleDoctorCommand } = await import("../src/commands/doctor.js");
      const docDir = fs.mkdtempSync(path.join(os.tmpdir(), "vee-doc-fix-"));

      try {
        // Init minimal memory scaffold
        fs.mkdirSync(path.join(docDir, "docs", "memory"), { recursive: true });
        fs.mkdirSync(path.join(docDir, ".vee"), { recursive: true });
        fs.writeFileSync(path.join(docDir, ".vee", "config.json"), "{}", "utf-8");
        // No .gitignore, and git repo present without hooks
        fs.mkdirSync(path.join(docDir, ".git", "hooks"), { recursive: true });

        // Doctor without fix -> flags gitignore fail and hooks warn
        await handleDoctorCommand({ fix: false }, docDir);

        // Doctor with fix -> auto installs hooks and fixes gitignore
        await handleDoctorCommand({ fix: true }, docDir);
      } finally {
        fs.rmSync(docDir, { recursive: true, force: true });
      }
    });

    it("exercises queue auto GC error handling during acceptProposal", async () => {
      const { createProposal, acceptProposal } = await import("../src/core/proposals/queue.js");
      const gcModule = await import("../src/core/gc.js");

      const prop = createProposal("cli", { decisions: [], current_state: { current_feature: "", completed_in_session: [], next_immediate_steps: [] }, tasks: [], constraints: [], rejected_approaches: [], discoveries: [] }, "test", tempDir);

      const spyGc = vi.spyOn(gcModule, "runGarbageCollection").mockImplementation(() => {
        throw new Error("Simulated auto GC failure");
      });

      try {
        const res = await acceptProposal(prop.id, tempDir);
        expect(res.success).toBe(true);
      } finally {
        spyGc.mockRestore();
      }
    });

    it("exercises migrate hash failure and unlink failure branches", async () => {
      const { handleMigrateCommand } = await import("../src/commands/migrate.js");
      const hasherModule = await import("../src/core/drift/hasher.js");
      const migDir = fs.mkdtempSync(path.join(os.tmpdir(), "vee-mig-fail-"));

      try {
        const decDir = path.join(migDir, "docs", "memory", "decisions");
        fs.mkdirSync(decDir, { recursive: true });
        fs.writeFileSync(
          path.join(decDir, "unlinked-decision.md"),
          `---\ntitle: "Decision"\nstatus: "active"\nlinked_files:\n  - path: "src/nonexistent.ts"\n---\nBody\n`,
          "utf-8"
        );

        // Spy hasher throwing error on calculation
        const spyHash = vi.spyOn(hasherModule, "calculateNormalizedFileHash").mockImplementation(() => {
          throw new Error("Simulated hasher failure");
        });

        // Spy unlinkSync throwing error
        const origUnlink = fs.unlinkSync;
        const spyUnlink = vi.spyOn(fs, "unlinkSync").mockImplementation((p: any) => {
          if (typeof p === "string" && p.includes("unlinked-decision.md")) {
            throw new Error("Simulated unlink failure");
          }
          return origUnlink(p);
        });

        try {
          await handleMigrateCommand({}, migDir);
        } finally {
          spyHash.mockRestore();
          spyUnlink.mockRestore();
        }
      } finally {
        fs.rmSync(migDir, { recursive: true, force: true });
      }
    });

    it("exercises lock stale unlink, double release, and lock timeout branches", async () => {
      const { acquireLock } = await import("../src/core/memory/lock.js");
      const lockFile = path.join(tempDir, ".vee", "lock");
      fs.mkdirSync(path.dirname(lockFile), { recursive: true });

      // Stale lock file (> 60s old)
      fs.writeFileSync(lockFile, "old lock", "utf-8");
      const pastTime = (Date.now() - 120000) / 1000;
      fs.utimesSync(lockFile, pastTime, pastTime);

      const lock = acquireLock(tempDir, 100);
      expect(lock).toBeDefined();

      // Double release
      lock.release();
      expect(() => lock.release()).not.toThrow();

      // Lock timeout branch
      fs.writeFileSync(lockFile, "active lock", "utf-8");
      expect(() => acquireLock(tempDir, 60)).toThrow(VeeError);
      fs.unlinkSync(lockFile);
    });

    it("exercises doctor constraints token cap warning branch", async () => {
      const { handleDoctorCommand } = await import("../src/commands/doctor.js");
      const constraintsPath = path.join(tempDir, "docs", "memory", "constraints.md");

      // Generate large constraints file > 400 tokens
      const heavyRules = Array.from({ length: 60 }, (_, i) => `- Rule ${i}: Maintain zero lock-in with strict adherence to architectural principles, domain separation, and backwards compatibility.`).join("\n");
      fs.writeFileSync(constraintsPath, `# Hard Constraints\n${heavyRules}\n`, "utf-8");

      await handleDoctorCommand({}, tempDir);
    });

    it("exercises import ADR with object linked_files branch", async () => {
      const { importMemoryFromArchive } = await import("../src/core/transfer/export-import.js");

      const bundle = {
        manifest: {
          format: "veeshree-memory-export" as const,
          version: "1.0.0",
          exported_at: new Date().toISOString(),
        },
        files: [
          {
            path: "docs/memory/decisions/0005-imported.md",
            content: `---\nid: "0005-imported"\ntitle: "Imported Decision"\nstatus: "active"\nlinked_files:\n  - path: "src/sample.ts"\n    sha256: "dummy-hash"\n---\nImported body\n`,
          },
        ],
      };

      const res = importMemoryFromArchive(tempDir, bundle, { yes: true });
      expect(res.restoredFiles.length).toBeGreaterThan(0);
    });

    it("exercises constants, paths, and process branch coverage", async () => {
      const { getResolvedVersion } = await import("../src/utils/constants.js");
      const { normalizeContent, sanitizeRelativePath } = await import("../src/utils/paths.js");
      const { validateModelName, runCommandSafe, runCommandInteractive } = await import("../src/utils/process.js");

      // 1. constants getResolvedVersion global override
      const customGlobal = globalThis as unknown as { __VERSION__?: string };
      const originalVersion = customGlobal.__VERSION__;
      customGlobal.__VERSION__ = "3.2.1-test";
      expect(getResolvedVersion()).toBe("3.2.1-test");
      if (originalVersion !== undefined) {
        customGlobal.__VERSION__ = originalVersion;
      } else {
        delete customGlobal.__VERSION__;
      }

      // 2. paths normalizeContent BOM and CR
      const bomContent = "\uFEFFline1\r\nline2\rline3\n";
      expect(normalizeContent(bomContent)).toBe("line1\nline2\nline3\n");

      // 3. process validateModelName security violation
      expect(() => validateModelName("model; rm -rf /")).toThrow();

      // 4. process runCommandSafe failure
      expect(() => runCommandSafe("non_existent_binary_xyz123", ["arg"])).toThrow();

      // 5. process runCommandInteractive error and non-zero exit
      expect(() => runCommandInteractive("non_existent_binary_xyz123", [])).toThrow();
      expect(() => runCommandInteractive("node", ["-e", "process.exit(2)"])).toThrow();
    });

    it("exercises doctor git tracking check and gitignore fix branch", async () => {
      const { handleDoctorCommand } = await import("../src/commands/doctor.js");
      const processModule = await import("../src/utils/process.js");

      // Test gitTracked is non-empty
      const spyRun = vi.spyOn(processModule, "runCommandSafe").mockImplementation((file, args) => {
        if (args.includes("ls-files")) {
          return ".vee/config.json";
        }
        return "";
      });

      // Remove .vee/config.json from .gitignore
      const gitignorePath = path.join(tempDir, ".gitignore");
      fs.writeFileSync(gitignorePath, "node_modules\n");

      const res = await handleDoctorCommand({ fix: true }, tempDir);
      expect(res.checks.some((c) => c.name === "Git Tracking Status" && c.status === "fail")).toBe(true);
      expect(res.checks.some((c) => c.name === ".vee/config.json in .gitignore" && c.fixed)).toBe(true);

      spyRun.mockRestore();
    });

    it("exercises auth parseEnvFile error and key management branches", async () => {
      const { setApiKey, removeApiKey, getApiKey } = await import("../src/core/auth.js");

      // config without keys object
      const configPath = path.join(tempDir, ".vee", "config.json");
      const cfg = JSON.parse(fs.readFileSync(configPath, "utf-8"));
      delete cfg.keys;
      fs.writeFileSync(configPath, JSON.stringify(cfg, null, 2));

      setApiKey("anthropic", "test-key-123", tempDir, false);
      expect(getApiKey("anthropic", tempDir)).toBe("test-key-123");

      // remove local only
      removeApiKey("anthropic", tempDir, false);
      expect(getApiKey("anthropic", tempDir)).toBeUndefined();

      // remove with default isGlobal undefined
      setApiKey("anthropic", "test-key-456", tempDir, false);
      removeApiKey("anthropic", tempDir);
      expect(getApiKey("anthropic", tempDir)).toBeUndefined();

      // fs error when reading .env
      const envPath = path.join(tempDir, ".env");
      fs.writeFileSync(envPath, "SECRET=1\n");
      const spyRead = vi.spyOn(fs, "readFileSync").mockImplementation((p) => {
        if (String(p).endsWith(".env")) {
          const err = new Error("EACCES permission denied") as NodeJS.ErrnoException;
          err.code = "EACCES";
          throw err;
        }
        return "";
      });

      // should not crash
      expect(getApiKey("openai", tempDir)).toBeUndefined();
      spyRead.mockRestore();
    });

    it("exercises watcher proposal high-risk warning and extraction failure backoff", async () => {
      const { startMemoryWatcher } = await import("../src/core/watch/watcher.js");
      const extractorModule = await import("../src/core/extractor.js");
      const queueModule = await import("../src/core/proposals/queue.js");

      // High risk proposal branch
      const spyExtract = vi.spyOn(extractorModule, "extractMemoryFromContent").mockResolvedValue({
        summary: "High risk change",
        suggested_decisions: [],
        suggested_file_updates: [],
      });
      const spyCreate = vi.spyOn(queueModule, "createProposal").mockReturnValue({
        id: "prop_high_123",
        created_at: new Date().toISOString(),
        source: "watch",
        risk: "high",
        rationale: "High risk test",
        delta: {
          summary: "High risk change",
          suggested_decisions: [],
          suggested_file_updates: [],
        },
      } as any);

      const watcherHigh = await startMemoryWatcher(tempDir, {
        debounceSeconds: 0.02,
        auto: true,
      });

      fs.mkdirSync(path.join(tempDir, "src"), { recursive: true });
      // trigger change
      fs.writeFileSync(path.join(tempDir, "src", "high_risk_sample.ts"), "export const x = 1;\n");
      await new Promise((resolve) => setTimeout(resolve, 80));
      watcherHigh.stop();
      spyCreate.mockRestore();
      spyExtract.mockRestore();

      // Extraction error failure branch
      const spyExtractFail = vi.spyOn(extractorModule, "extractMemoryFromContent").mockRejectedValueOnce(
        new Error("Extraction API rate limited")
      );

      const watcherFail = await startMemoryWatcher(tempDir, {
        debounceSeconds: 0.02,
        auto: true,
      });

      fs.writeFileSync(path.join(tempDir, "src", "high_risk_sample.ts"), "export const x = 2;\n");
      await new Promise((resolve) => setTimeout(resolve, 80));
      watcherFail.stop();
      spyExtractFail.mockRestore();
    });
  });
});

