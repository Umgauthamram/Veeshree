import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { initializeVeeshree } from "../src/commands/init.js";
import { handleDecisionsCommand } from "../src/commands/decisions.js";
import { handleKeysCommand } from "../src/commands/keys.js";
import { handleConfigCommand } from "../src/commands/config.js";
import { handleSearchCommand } from "../src/commands/search.js";
import { handleHooksCommand } from "../src/commands/hooks.js";
import { handleProposalsCommand } from "../src/commands/proposals.js";
import { handleWatchCommand } from "../src/commands/watch.js";
import { generateContext } from "../src/commands/context.js";
import { syncVeeshree } from "../src/commands/sync.js";
import { handleExportCommand } from "../src/commands/export.js";
import { handleImportCommand } from "../src/commands/import.js";
import { handleUndoCommand } from "../src/commands/undo.js";
import { handleGcCommand } from "../src/commands/gc.js";
import { handleModelsCommand, handleModelsUseCommand, handleModelsPullCommand } from "../src/commands/models.js";
import { handleDoctorCommand } from "../src/commands/doctor.js";
import { handleRejectCommand } from "../src/commands/reject.js";
import { handleReviewCommand } from "../src/commands/review.js";
import { handleRulesCommand } from "../src/commands/rules.js";
import { handleMcpCommand } from "../src/commands/mcp.js";
import { handleCaptureCommand } from "../src/commands/capture.js";
import { handleCompletionCommand } from "../src/commands/completion.js";
import { handleCiCommand } from "../src/commands/ci.js";
import { handleAcceptCommand } from "../src/commands/accept.js";
import { handleStatusCommand } from "../src/commands/status.js";
import { handleMigrateCommand } from "../src/commands/migrate.js";
import { scanRepository } from "../src/core/scanner.js";
import { resolveActiveEngine } from "../src/core/models.js";
import { extractMemoryFromContent } from "../src/core/extractor.js";
import { loadConfig } from "../src/core/config.js";
import { assertCloudConsent } from "../src/core/redact/redactor.js";
import { setApiKey } from "../src/core/auth.js";
import { createProposal } from "../src/core/proposals/queue.js";
import { VeeError } from "../src/utils/errors.js";
import { vi } from "vitest";

describe("Commands Full Coverage Test Suite", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "vee-cmd-cov-"));
    initializeVeeshree(tempDir);
  });

  afterEach(() => {
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch {
      // ignore
    }
  });

  describe("decisions.ts", () => {
    it("handles new, show, list, link, and supersede commands", () => {
      // 1. new ADR
      expect(() => handleDecisionsCommand({ subcommand: "new" }, tempDir)).toThrow(VeeError);
      handleDecisionsCommand({ subcommand: "new", title: "Use Fastify" }, tempDir);

      const adrFile = path.join(tempDir, "docs", "memory", "decisions", "0001-use-fastify.md");
      expect(fs.existsSync(adrFile)).toBe(true);

      // 2. show ADR
      expect(() => handleDecisionsCommand({ subcommand: "show" }, tempDir)).toThrow(VeeError);
      expect(() => handleDecisionsCommand({ subcommand: "show", id: "9999-missing" }, tempDir)).toThrow(VeeError);
      handleDecisionsCommand({ subcommand: "show", id: "0001-use-fastify" }, tempDir);

      // 3. list ADRs (default, all, by status, json)
      const listActive = handleDecisionsCommand({ subcommand: "list" }, tempDir) as any[];
      expect(listActive.length).toBeGreaterThan(0);

      const listAll = handleDecisionsCommand({ subcommand: "list", all: true }, tempDir) as any[];
      expect(listAll.length).toBeGreaterThan(0);

      const listProposed = handleDecisionsCommand({ subcommand: "list", status: "proposed" }, tempDir) as any[];
      expect(Array.isArray(listProposed)).toBe(true);

      const listJson = handleDecisionsCommand({ subcommand: "list", json: true }, tempDir) as any[];
      expect(Array.isArray(listJson)).toBe(true);

      // 4. link source file to ADR
      const dummyFile = path.join(tempDir, "src", "server.ts");
      fs.mkdirSync(path.dirname(dummyFile), { recursive: true });
      fs.writeFileSync(dummyFile, "export const app = {};", "utf-8");

      expect(() => handleDecisionsCommand({ subcommand: "link" }, tempDir)).toThrow(VeeError);
      expect(() => handleDecisionsCommand({ subcommand: "link", id: "0001-use-fastify" }, tempDir)).toThrow(VeeError);
      expect(() => handleDecisionsCommand({ subcommand: "link", id: "9999", targetFile: dummyFile }, tempDir)).toThrow(VeeError);

      handleDecisionsCommand({ subcommand: "link", id: "0001-use-fastify", targetFile: "src/server.ts" }, tempDir);
      // Link again to test existing index update branch
      handleDecisionsCommand({ subcommand: "link", id: "0001-use-fastify", targetFile: "src/server.ts" }, tempDir);

      // 5. supersede ADR
      expect(() => handleDecisionsCommand({ subcommand: "supersede" }, tempDir)).toThrow(VeeError);
      expect(() => handleDecisionsCommand({ subcommand: "supersede", id: "9999", title: "New" }, tempDir)).toThrow(VeeError);

      handleDecisionsCommand(
        { subcommand: "supersede", id: "0001-use-fastify", title: "Migrate to Express" },
        tempDir
      );

      const newAdrFile = path.join(tempDir, "docs", "memory", "decisions", "0002-migrate-to-express.md");
      expect(fs.existsSync(newAdrFile)).toBe(true);
    });
  });

  describe("keys.ts", () => {
    it("handles list, set, update, and remove commands with local/global targets", () => {
      // 1. list
      const keysList = handleKeysCommand("list", undefined, undefined, {}, tempDir) as Record<string, any>;
      expect(keysList.gemini).toBeDefined();

      const keysJson = handleKeysCommand("list", undefined, undefined, { json: true }, tempDir) as Record<string, any>;
      expect(keysJson.gemini).toBeDefined();

      // 2. set
      expect(() => handleKeysCommand("set", undefined, undefined, {}, tempDir)).toThrow(VeeError);
      expect(() => handleKeysCommand("set", "invalid_provider", "key123", {}, tempDir)).toThrow(VeeError);

      handleKeysCommand("set", "gemini", "AIzaTestKey12345678901234567890", { local: true }, tempDir);

      // 3. update
      expect(() => handleKeysCommand("update", undefined, undefined, {}, tempDir)).toThrow(VeeError);
      handleKeysCommand("update", "gemini", "AIzaUpdatedKey12345678901234567890", { local: true }, tempDir);

      // 4. remove
      expect(() => handleKeysCommand("remove", undefined, undefined, {}, tempDir)).toThrow(VeeError);
      handleKeysCommand("remove", "gemini", undefined, { local: true }, tempDir);
    });
  });

  describe("config.ts", () => {
    it("handles path, list, get, and set commands", () => {
      // 1. path
      handleConfigCommand("path", undefined, undefined, {}, tempDir);
      handleConfigCommand("path", undefined, undefined, { global: true }, tempDir);

      // 2. list
      handleConfigCommand("list", undefined, undefined, {}, tempDir);
      handleConfigCommand("list", undefined, undefined, { json: true }, tempDir);

      // 3. get
      expect(() => handleConfigCommand("get", undefined, undefined, {}, tempDir)).toThrow(VeeError);
      handleConfigCommand("get", "privacy.allow_cloud", undefined, {}, tempDir);
      handleConfigCommand("get", "non_existent_key", undefined, {}, tempDir);
      handleConfigCommand("get", "context", undefined, {}, tempDir);

      // 4. set
      expect(() => handleConfigCommand("set", undefined, undefined, {}, tempDir)).toThrow(VeeError);
      handleConfigCommand("set", "privacy.allow_cloud", "true", {}, tempDir);
      handleConfigCommand("set", "context.max_tokens", "3000", {}, tempDir);
      handleConfigCommand("set", "extractor.model", "gemini-2.0-flash", {}, tempDir);
    });
  });

  describe("search.ts", () => {
    it("handles keyword search with and without json and archived flags", () => {
      expect(() => handleSearchCommand("", {}, tempDir)).toThrow(VeeError);
      expect(() => handleSearchCommand("   ", {}, tempDir)).toThrow(VeeError);

      const res = handleSearchCommand("memory", {}, tempDir);
      expect(Array.isArray(res)).toBe(true);

      const resJson = handleSearchCommand("memory", { json: true }, tempDir);
      expect(Array.isArray(resJson)).toBe(true);

      const resArchived = handleSearchCommand("nonexistentkeywordxyz", { archived: true }, tempDir);
      expect(resArchived.length).toBe(0);
    });
  });

  describe("hooks.ts", () => {
    it("handles install, uninstall, and status actions with json mode", () => {
      const gitDir = path.join(tempDir, ".git");
      fs.mkdirSync(path.join(gitDir, "hooks"), { recursive: true });

      const installed = handleHooksCommand("install", tempDir);
      expect(Array.isArray(installed)).toBe(true);

      const installedJson = handleHooksCommand("install", tempDir, { json: true });
      expect(installedJson).toBeDefined();

      const status = handleHooksCommand("status", tempDir);
      expect(status).toBeDefined();

      const statusJson = handleHooksCommand("status", tempDir, { json: true });
      expect(statusJson).toBeDefined();

      const removed = handleHooksCommand("uninstall", tempDir);
      expect(Array.isArray(removed)).toBe(true);

      const removedJson = handleHooksCommand("uninstall", tempDir, { json: true });
      expect(removedJson).toBeDefined();
    });
  });

  describe("proposals.ts", () => {
    it("lists proposals by status filter and json formatting", () => {
      // Empty list
      const empty = handleProposalsCommand({}, tempDir);
      expect(empty).toEqual([]);

      // Create dummy proposal
      createProposal(
        "test",
        {
          decisions: [],
          current_state: {
            current_feature: "test feature",
            completed_in_session: [],
            next_immediate_steps: [],
          },
          tasks: [{ task_name: "Task 1", action: "add" }],
          constraints: [],
          rejected_approaches: [],
          discoveries: [],
        },
        "test_agent",
        tempDir
      );

      const list = handleProposalsCommand({}, tempDir);
      expect(list.length).toBeGreaterThan(0);

      const listJson = handleProposalsCommand({ json: true }, tempDir);
      expect(listJson.length).toBeGreaterThan(0);

      const listPending = handleProposalsCommand({ status: "pending" }, tempDir);
      expect(listPending.length).toBeGreaterThan(0);

      const listAccepted = handleProposalsCommand({ status: "accepted" }, tempDir);
      expect(listAccepted.length).toBe(0);
    });
  });

  describe("watch.ts", () => {
    it("handles watch status and stop subcommands", () => {
      const status = handleWatchCommand({ subcommand: "status" }, tempDir);
      expect(status).toBeDefined();

      const statusJson = handleWatchCommand({ subcommand: "status", json: true }, tempDir);
      expect(statusJson).toBeDefined();

      const stop = handleWatchCommand({ subcommand: "stop" }, tempDir);
      expect(stop).toBeDefined();

      const stopJson = handleWatchCommand({ subcommand: "stop", json: true }, tempDir);
      expect(stopJson).toBeDefined();
    });
  });

  describe("context.ts", () => {
    it("generates context in markdown, json, xml, and explain modes", () => {
      const md = generateContext(undefined, { format: "markdown" }, tempDir);
      expect(md.content).toBeDefined();

      const json = generateContext(undefined, { json: true }, tempDir);
      expect(json.content).toBeDefined();

      const xml = generateContext(undefined, { format: "xml" }, tempDir);
      expect(xml.content).toBeDefined();

      const raw = generateContext("implement auth", { raw: true, tasks: true, maxTokens: 1000 }, tempDir);
      expect(raw.content).toBeDefined();

      const explain = generateContext(undefined, { explain: true }, tempDir);
      expect(explain).toBeDefined();

      const explainJson = generateContext(undefined, { explain: true, json: true }, tempDir);
      expect(explainJson).toBeDefined();
    });
  });

  describe("sync.ts", () => {
    it("handles read-only sync, accept target, accept all, and dry-run", () => {
      const syncRead = syncVeeshree(tempDir);
      expect(syncRead.exitCode).toBe(0);

      const syncJson = syncVeeshree(tempDir, { json: true });
      expect(syncJson.report).toBeDefined();

      const dryRun = syncVeeshree(tempDir, { accept: "all", dryRun: true });
      expect(dryRun.acceptedCount).toBe(0);

      const dryRunJson = syncVeeshree(tempDir, { accept: "all", dryRun: true, json: true });
      expect(dryRunJson.acceptedCount).toBe(0);

      const acceptAll = syncVeeshree(tempDir, { all: true });
      expect(acceptAll.exitCode).toBe(0);

      expect(() => syncVeeshree(tempDir, { accept: true as any })).toThrow(VeeError);
    });
  });

  describe("export.ts & import.ts & undo.ts & gc.ts", () => {
    it("handles export, import, undo, and gc operations", () => {
      // 1. Export
      handleExportCommand({ format: "json" }, tempDir);
      handleExportCommand({ format: "md" }, tempDir);

      // 2. Import
      const bundlePath = path.join(tempDir, "export-test.json");
      fs.writeFileSync(
        bundlePath,
        JSON.stringify({
          manifest: { format: "veeshree-memory-export", version: "1.0.0" },
          files: [{ path: "docs/memory/tasks.md", content: "- [ ] Custom imported task\n" }],
        }),
        "utf-8"
      );

      expect(() => handleImportCommand("", {}, tempDir)).toThrow(VeeError);
      expect(() => handleImportCommand("missing-file.json", {}, tempDir)).toThrow(VeeError);

      const importRes = handleImportCommand(bundlePath, { yes: true }, tempDir);
      expect(importRes.importedFiles).toBeGreaterThan(0);

      // 3. Undo
      expect(() => handleUndoCommand("invalid", tempDir)).toThrow(VeeError);
      handleUndoCommand(1, tempDir);

      // 4. Gc
      handleGcCommand({ dryRun: true }, tempDir);
      handleGcCommand({}, tempDir);
    });
  });

  describe("models.ts", () => {
    it("handles models list, use, and pull command handlers", async () => {
      await handleModelsCommand(tempDir);
      expect(() => handleModelsUseCommand("", "", tempDir)).toThrow(VeeError);
      handleModelsUseCommand("gemini", "gemini-2.0-flash", tempDir);
      expect(() => handleModelsPullCommand("")).toThrow(VeeError);
    });
  });

  describe("doctor.ts", () => {
    it("runs doctor checks and fix flags", async () => {
      const doc = await handleDoctorCommand({}, tempDir);
      expect(doc.checks.length).toBeGreaterThan(0);

      const docJson = await handleDoctorCommand({ json: true }, tempDir);
      expect(docJson.checks.length).toBeGreaterThan(0);

      const docFix = await handleDoctorCommand({ fix: true }, tempDir);
      expect(docFix.checks.length).toBeGreaterThan(0);
    });
  });

  describe("reject.ts and review.ts", () => {
    it("handles reject and review commands", () => {
      expect(() => handleRejectCommand("", tempDir)).toThrow(VeeError);

      const proposal = createProposal(
        "cli",
        {
          decisions: [{ title: "Review Test", decision: "Test review flow", reason: "testing" }],
          constraints: [{ type: "hard", rule: "rule1" }],
          tasks: [{ task_name: "task1", action: "add" }],
          current_state: { current_feature: "testing feature" },
        },
        "test-runner",
        tempDir
      );

      const pending = handleReviewCommand(tempDir);
      expect(pending.length).toBeGreaterThan(0);

      expect(() => handleRejectCommand(proposal.id, tempDir)).not.toThrow();

      // Empty review queue
      const emptyReview = handleReviewCommand(tempDir);
      expect(emptyReview.length).toBe(0);
    });
  });

  describe("rules.ts", () => {
    it("handles list, update, and uninstall actions", () => {
      handleRulesCommand("list", {}, tempDir);
      handleRulesCommand("update", {}, tempDir);
      handleRulesCommand("uninstall", { agents: "cursor,claude" }, tempDir);
      expect(() => handleRulesCommand("invalid" as any, {}, tempDir)).toThrow(VeeError);
    });
  });

  describe("mcp.ts", () => {
    it("handles mcp install command", async () => {
      await expect(handleMcpCommand("install", {}, tempDir)).rejects.toThrow(VeeError);
      await handleMcpCommand("install", { client: "claude", noInstall: true }, tempDir);
    });
  });

  describe("capture.ts", () => {
    it("handles file capture, payload preview, and denylist validation", async () => {
      const sampleFile = path.join(tempDir, "sample.txt");
      fs.writeFileSync(sampleFile, "const token = 'sk-proj-test12345678901234567890';", "utf-8");

      const preview = await handleCaptureCommand({ file: sampleFile, showPayload: true }, tempDir);
      expect(preview.payload).toBeDefined();
      expect(preview.payload).toContain("[REDACTED:openai_key]");

      // Denylisted file capture throws security violation
      const envFile = path.join(tempDir, ".env");
      fs.writeFileSync(envFile, "SECRET=123", "utf-8");
      await expect(handleCaptureCommand({ file: envFile }, tempDir)).rejects.toThrow(VeeError);

      // Empty content error
      const emptyFile = path.join(tempDir, "empty.txt");
      fs.writeFileSync(emptyFile, "", "utf-8");
      await expect(handleCaptureCommand({ file: emptyFile }, tempDir)).rejects.toThrow(VeeError);
    });
  });

  describe("completion.ts", () => {
    it("generates completion scripts for all supported shells", () => {
      expect(() => handleCompletionCommand("bash")).not.toThrow();
      expect(() => handleCompletionCommand("zsh")).not.toThrow();
      expect(() => handleCompletionCommand("fish")).not.toThrow();
      expect(() => handleCompletionCommand("powershell")).not.toThrow();
    });
  });

  describe("ci.ts", () => {
    it("generates GitHub Actions CI workflow", () => {
      handleCiCommand("init", tempDir);
      const wf = path.join(tempDir, ".github", "workflows", "veeshree.yml");
      expect(fs.existsSync(wf)).toBe(true);
      expect(fs.readFileSync(wf, "utf-8")).toContain("Verify Architectural Drift");
    });
  });

  describe("accept.ts", () => {
    it("handles accept specific and all-low proposals", async () => {
      await expect(handleAcceptCommand("", {}, tempDir)).rejects.toThrow(VeeError);
      await expect(handleAcceptCommand("9999-missing", {}, tempDir)).rejects.toThrow(VeeError);

      const p1 = createProposal(
        "cli",
        {
          decisions: [{ title: "Accept ADR", decision: "accept", reason: "test" }],
        },
        "runner",
        tempDir
      );

      // Dry run specific
      const dry = await handleAcceptCommand(p1.id, { dryRun: true }, tempDir);
      expect(dry).toEqual([p1.id]);

      // Dry run all-low
      const dryAll = await handleAcceptCommand(undefined, { allLow: true, dryRun: true }, tempDir);
      expect(dryAll.length).toBeGreaterThan(0);

      // Accept specific
      const accepted = await handleAcceptCommand(p1.id, {}, tempDir);
      expect(accepted).toEqual([p1.id]);

      // All low when empty
      const emptyAllLow = await handleAcceptCommand(undefined, { allLow: true }, tempDir);
      expect(emptyAllLow.length).toBe(0);
    });
  });

  describe("status.ts", () => {
    it("handles status check and json modes", () => {
      const statusRes = handleStatusCommand({}, tempDir);
      expect(statusRes.currentFocus).toBeDefined();

      const statusJson = handleStatusCommand({ json: true }, tempDir);
      expect(statusJson.driftReport).toBeDefined();

      const statusCheck = handleStatusCommand({ check: true, quiet: true }, tempDir);
      expect(statusCheck.exitCode).toBe(0);
    });
  });

  describe("migrate.ts", () => {
    it("handles migrate command dry-run and live migration", async () => {
      const dry = await handleMigrateCommand({ dryRun: true }, tempDir);
      expect(dry.success).toBe(true);

      const live = await handleMigrateCommand({}, tempDir);
      expect(live.success).toBe(true);
    });
  });

  describe("scanner.ts and models.ts and extractor.ts", () => {
    it("scans repository architecture and resolves active engine", async () => {
      // Create rich mock project files
      fs.writeFileSync(path.join(tempDir, "README.md"), "# Mock Project\n\nThis is a sample project for testing scanner architecture.\nSecond paragraph here.\n", "utf-8");
      fs.writeFileSync(path.join(tempDir, "package.json"), JSON.stringify({
        name: "test-app",
        dependencies: {
          next: "14.0.0",
          react: "18.0.0",
          prisma: "5.0.0",
          tailwindcss: "3.0.0",
        }
      }), "utf-8");

      fs.writeFileSync(path.join(tempDir, "requirements.txt"), "fastapi==0.100.0\nsqlalchemy==2.0.0\n", "utf-8");
      fs.writeFileSync(path.join(tempDir, "go.mod"), "module example.com/mod\n\ngo 1.22\n\nrequire github.com/gin-gonic/gin v1.9.0\n", "utf-8");
      fs.writeFileSync(path.join(tempDir, "Cargo.toml"), '[package]\nname = "rust-app"\n\n[dependencies]\nactix-web = "4"\n', "utf-8");
      fs.writeFileSync(path.join(tempDir, "docker-compose.yml"), "version: '3'\nservices:\n  app:\n    image: node:20\n", "utf-8");

      const prismaDir = path.join(tempDir, "prisma");
      fs.mkdirSync(prismaDir, { recursive: true });
      fs.writeFileSync(path.join(prismaDir, "schema.prisma"), "model User {\n  id Int @id\n}\n", "utf-8");

      const appApiDir = path.join(tempDir, "app", "api", "users");
      fs.mkdirSync(appApiDir, { recursive: true });
      fs.writeFileSync(path.join(appApiDir, "route.ts"), "export async function GET() {}", "utf-8");

      const scanned = scanRepository(tempDir);
      expect(scanned.name).toBe("test-app");
      expect(scanned.frameworks).toContain("Next.js");
      expect(scanned.frameworks).toContain("FastAPI");
      expect(scanned.frameworks).toContain("Gin");
      expect(scanned.frameworks).toContain("Actix-web");
      expect(scanned.infrastructure).toContain("Docker Compose");
      expect(scanned.domainEntities).toContain("User");
      expect(scanned.apiEndpoints).toContain("/api/users");

      // Test resolveActiveEngine
      const resolved = await resolveActiveEngine(tempDir, "ollama", "llama3.2");
      expect(resolved.provider).toBe("ollama");
      expect(resolved.isLocal).toBe(true);

      const resolvedLm = await resolveActiveEngine(tempDir, "lmstudio", "local-model");
      expect(resolvedLm.provider).toBe("lmstudio");

      setApiKey("groq", "gsk_test1234567890", tempDir, false);
      setApiKey("nvidia", "nvapi-test1234567890", tempDir, false);
      setApiKey("openai", "sk-proj-test1234567890", tempDir, false);
      setApiKey("gemini", "AIzaTest1234567890", tempDir, false);

      const resolvedGroq = await resolveActiveEngine(tempDir, "groq");
      expect(resolvedGroq.provider).toBe("groq");

      const resolvedNvidia = await resolveActiveEngine(tempDir, "nvidia");
      expect(resolvedNvidia.provider).toBe("nvidia");

      const resolvedOpenai = await resolveActiveEngine(tempDir, "openai");
      expect(resolvedOpenai.provider).toBe("openai");

      const resolvedGemini = await resolveActiveEngine(tempDir, "gemini");
      expect(resolvedGemini.provider).toBe("gemini");

      setApiKey("unsupported_provider" as any, "dummy-key-123", tempDir, false);
      await expect(resolveActiveEngine(tempDir, "unsupported_provider" as any)).rejects.toThrow(/Unsupported provider/);

      // Test extractor
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  decisions: [],
                  current_state: { current_feature: "Extracted feature" },
                  tasks: [],
                  constraints: [],
                  rejected_approaches: [],
                  discoveries: [],
                }),
              },
            },
          ],
        }),
      } as any);

      const extracted = await extractMemoryFromContent("test content", tempDir, "lmstudio", "default");
      expect(extracted.current_state?.current_feature).toBe("Extracted feature");
    });
  });

  describe("environment overrides and cloud consent", () => {
    it("handles config environment variable overrides", () => {
      const origProvider = process.env.VEE_PROVIDER;
      const origModel = process.env.VEE_MODEL;
      const origCloud = process.env.VEE_ALLOW_CLOUD;
      const origTokens = process.env.VEE_MAX_TOKENS;

      try {
        process.env.VEE_PROVIDER = "groq";
        process.env.VEE_MODEL = "llama-3.3-70b-versatile";
        process.env.VEE_ALLOW_CLOUD = "true";
        process.env.VEE_MAX_TOKENS = "2500";

        const cfg = loadConfig(tempDir);
        expect(cfg.extractor?.provider).toBe("groq");
        expect(cfg.extractor?.model).toBe("llama-3.3-70b-versatile");
        expect(cfg.privacy?.allow_cloud).toBe(true);
        expect(cfg.context?.max_tokens).toBe(2500);
      } finally {
        if (origProvider) process.env.VEE_PROVIDER = origProvider; else delete process.env.VEE_PROVIDER;
        if (origModel) process.env.VEE_MODEL = origModel; else delete process.env.VEE_MODEL;
        if (origCloud) process.env.VEE_ALLOW_CLOUD = origCloud; else delete process.env.VEE_ALLOW_CLOUD;
        if (origTokens) process.env.VEE_MAX_TOKENS = origTokens; else delete process.env.VEE_MAX_TOKENS;
      }
    });

    it("verifies assertCloudConsent with consent granted and declined", async () => {
      // Consent explicitly granted
      await expect(assertCloudConsent({ privacy: { allow_cloud: true, max_payload_bytes: 10000 } }, undefined, tempDir)).resolves.not.toThrow();

      // Consent required in non-interactive environment
      await expect(assertCloudConsent({ privacy: { allow_cloud: false, max_payload_bytes: 10000 } }, undefined, tempDir)).rejects.toThrow(VeeError);
    });
  });

  describe("human command print loops (non-json modes)", () => {
    it("exercises search, proposals, watch, and sync human formatting", async () => {
      // 1. Search in human mode
      expect(() => handleSearchCommand("", {}, tempDir)).toThrow(VeeError);
      handleSearchCommand("architecture", {}, tempDir);
      handleSearchCommand("completely_unmatched_query_xyz", {}, tempDir);

      // 2. Proposals in human mode
      const emptyProposals = fs.mkdtempSync(path.join(os.tmpdir(), "vee-empty-prop-"));
      try {
        initializeVeeshree(emptyProposals);
        handleProposalsCommand({}, emptyProposals);
      } finally {
        fs.rmSync(emptyProposals, { recursive: true, force: true });
      }

      const p1 = createProposal(
        {
          decisions: [{ title: "Human Proposal", decision: "Test human formatting", reason: "testing" }],
        },
        tempDir
      );
      const p2 = createProposal(
        {
          constraints: [{ rule: "Bypass test", type: "hard", source: "cli" }],
        },
        tempDir
      );
      handleProposalsCommand({}, tempDir);

      // 3. Review command in human mode
      const emptyReviewDir = fs.mkdtempSync(path.join(os.tmpdir(), "vee-empty-rev-"));
      try {
        initializeVeeshree(emptyReviewDir);
        handleReviewCommand(emptyReviewDir);
      } finally {
        fs.rmSync(emptyReviewDir, { recursive: true, force: true });
      }

      createProposal(
        {
          decisions: [{ title: "Review Decision", decision: "Architecture review", reason: "testing" }],
          constraints: [{ rule: "Strict typing", type: "hard", source: "cli" }],
          tasks: [{ task_name: "Complete Phase D", action: "complete" }],
          current_state: { current_feature: "Phase D Review" },
        },
        tempDir
      );
      handleReviewCommand(tempDir);

      // 4. Accept command in human mode
      await expect(handleAcceptCommand(undefined, {}, tempDir)).rejects.toThrow(VeeError);
      await expect(handleAcceptCommand("non-existent-proposal-id", {}, tempDir)).rejects.toThrow(VeeError);
      await handleAcceptCommand(p1.id, { dryRun: true }, tempDir);
      await handleAcceptCommand("--all-low", { dryRun: true }, tempDir);

      // 5. Undo command in human mode
      const emptySnapDir = fs.mkdtempSync(path.join(os.tmpdir(), "vee-empty-snap-"));
      try {
        initializeVeeshree(emptySnapDir);
        handleUndoCommand("1", emptySnapDir);
      } finally {
        fs.rmSync(emptySnapDir, { recursive: true, force: true });
      }
      handleUndoCommand("1", tempDir);

      // 6. GC command in human mode
      handleGcCommand({ dryRun: true }, tempDir);
      handleGcCommand({}, tempDir);

      // 7. Keys command in human mode
      handleKeysCommand("list", undefined, undefined, {}, tempDir);

      // 8. Doctor command in human mode
      handleDoctorCommand({ fix: true }, tempDir);

      // 9. Watch subcommands in human mode
      handleWatchCommand({ subcommand: "status" }, tempDir);
      handleWatchCommand({ subcommand: "stop" }, tempDir);

      // 10. Import command errors & markdown bundle parsing
      const mdBundlePath = path.join(tempDir, "bundle.md");
      fs.writeFileSync(
        mdBundlePath,
        `<!-- FILE: docs/memory/current-state.md -->\n# Current State\n<!-- END FILE -->\n<!-- FILE: docs/memory/tasks.md -->\n# Tasks\n<!-- END FILE -->`,
        "utf-8"
      );
      handleImportCommand(mdBundlePath, { yes: true }, tempDir);

      const invalidManifestPath = path.join(tempDir, "invalid-manifest.json");
      fs.writeFileSync(
        invalidManifestPath,
        JSON.stringify({ manifest: { format: "invalid-format" } }),
        "utf-8"
      );
      expect(() => handleImportCommand(invalidManifestPath, {}, tempDir)).toThrow(VeeError);

      const emptyBundlePath = path.join(tempDir, "empty-bundle.json");
      fs.writeFileSync(emptyBundlePath, JSON.stringify({}), "utf-8");
      expect(() => handleImportCommand(emptyBundlePath, {}, tempDir)).toThrow(VeeError);

      // 11. Sync command with invalid args and human reporting
      expect(() => syncVeeshree(tempDir, { accept: true })).toThrow(VeeError);
      syncVeeshree(tempDir, {});
    });
  });
});

