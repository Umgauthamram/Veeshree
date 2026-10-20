import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { initializeVeeshree } from "../src/commands/init.js";
import { installMcpClientConfig } from "../src/mcp/client-config.js";
import { resolveCliEntrypoint, getDaemonStatus, stopDaemon } from "../src/core/watch/daemon.js";
import { generateContext } from "../src/commands/context.js";
import { handleStatusCommand } from "../src/commands/status.js";
import { syncVeeshree } from "../src/commands/sync.js";
import { handleProposalsCommand } from "../src/commands/proposals.js";
import { handleDecisionsCommand } from "../src/commands/decisions.js";
import { handleDoctorCommand } from "../src/commands/doctor.js";
import { handleSearchCommand } from "../src/commands/search.js";
import { handleConfigCommand } from "../src/commands/config.js";
import { handleKeysCommand } from "../src/commands/keys.js";
import { handleHooksCommand } from "../src/commands/hooks.js";
import { handleWatchCommand } from "../src/commands/watch.js";

describe("Phase A: Release Blockers Regression Suite", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "vee-phase-a-"));
    initializeVeeshree(tempDir);
  });

  afterEach(() => {
    try {
      stopDaemon(tempDir);
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch {
      // ignore
    }
  });

  describe("A1: MCP Install Configurations and --root / --no-install", () => {
    it("installs claude-code without --root unless explicitly requested", () => {
      const res = installMcpClientConfig("claude-code", tempDir);
      expect(fs.existsSync(res.configPath)).toBe(true);

      const parsed = JSON.parse(fs.readFileSync(res.configPath, "utf-8"));
      expect(parsed.mcpServers.veeshree).toBeDefined();
      expect(parsed.mcpServers.veeshree.command).toBe("npx");
      // Should NOT include --root for project-local config without explicit root
      expect(parsed.mcpServers.veeshree.args).not.toContain("--root");
    });

    it("includes --root when explicitly specified in options", () => {
      const customRoot = path.join(tempDir, "custom-subproject");
      const res = installMcpClientConfig("cursor", tempDir, { root: customRoot });
      const parsed = JSON.parse(fs.readFileSync(res.configPath, "utf-8"));
      expect(parsed.mcpServers.veeshree.args).toContain("--root");
      expect(parsed.mcpServers.veeshree.args).toContain(path.resolve(customRoot));
    });

    it("resolves real binary when noInstall is true", () => {
      const res = installMcpClientConfig("cursor", tempDir, { noInstall: true });
      const parsed = JSON.parse(fs.readFileSync(res.configPath, "utf-8"));
      expect(parsed.mcpServers.veeshree.args).toContain("mcp");
      expect(parsed.mcpServers.veeshree.command).not.toBe("npx");
    });
  });

  describe("A2: Daemon Entrypoint and Liveness", () => {
    it("resolves a valid existing entrypoint file", () => {
      const entrypoint = resolveCliEntrypoint(tempDir);
      expect(fs.existsSync(entrypoint)).toBe(true);
      expect(entrypoint).toMatch(/\.(js|ts)$/);
    });

    it("verifies daemon status reports not running initially", () => {
      const status = getDaemonStatus(tempDir);
      expect(status.running).toBe(false);
    });
  });

  describe("A3: Strict JSON Output Mode Across Commands", () => {
    it("context --json produces valid JSON on stdout", () => {
      const logSpy = vi.spyOn(process.stdout, "write").mockImplementation(() => true);
      generateContext("test query", { json: true }, tempDir);

      expect(logSpy).toHaveBeenCalled();
      const raw = logSpy.mock.calls[0][0] as string;
      expect(() => JSON.parse(raw)).not.toThrow();
      const parsed = JSON.parse(raw);
      expect(parsed.total_tokens).toBeDefined();
      logSpy.mockRestore();
    });

    it("status --json produces valid JSON on stdout", () => {
      const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
      handleStatusCommand({ json: true }, tempDir);

      expect(logSpy).toHaveBeenCalled();
      const raw = logSpy.mock.calls[0][0] as string;
      expect(() => JSON.parse(raw)).not.toThrow();
      const parsed = JSON.parse(raw);
      expect(parsed.currentFocus).toBeDefined();
      expect(parsed.drift).toBeDefined();
      logSpy.mockRestore();
    });

    it("sync --json produces valid JSON on stdout", () => {
      const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
      syncVeeshree(tempDir, { json: true });

      expect(logSpy).toHaveBeenCalled();
      const raw = logSpy.mock.calls[0][0] as string;
      expect(() => JSON.parse(raw)).not.toThrow();
      const parsed = JSON.parse(raw);
      expect(parsed.records).toBeDefined();
      logSpy.mockRestore();
    });

    it("sync --accept all --json produces valid JSON on stdout", () => {
      const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
      syncVeeshree(tempDir, { accept: "all", json: true });

      expect(logSpy).toHaveBeenCalled();
      const raw = logSpy.mock.calls[0][0] as string;
      expect(() => JSON.parse(raw)).not.toThrow();
      const parsed = JSON.parse(raw);
      expect(parsed.target).toBe("all");
      expect(parsed.report).toBeDefined();
      logSpy.mockRestore();
    });

    it("proposals --json produces valid JSON on stdout", () => {
      const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
      handleProposalsCommand({ json: true }, tempDir);

      expect(logSpy).toHaveBeenCalled();
      const raw = logSpy.mock.calls[0][0] as string;
      expect(() => JSON.parse(raw)).not.toThrow();
      const parsed = JSON.parse(raw);
      expect(Array.isArray(parsed)).toBe(true);
      logSpy.mockRestore();
    });

    it("decisions --json produces valid JSON on stdout", () => {
      const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
      handleDecisionsCommand({ subcommand: "list", json: true }, tempDir);

      expect(logSpy).toHaveBeenCalled();
      const raw = logSpy.mock.calls[0][0] as string;
      expect(() => JSON.parse(raw)).not.toThrow();
      const parsed = JSON.parse(raw);
      expect(Array.isArray(parsed)).toBe(true);
      logSpy.mockRestore();
    });

    it("doctor --json produces valid JSON on stdout", async () => {
      const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
      await handleDoctorCommand({ json: true }, tempDir);

      expect(logSpy).toHaveBeenCalled();
      const raw = logSpy.mock.calls[0][0] as string;
      expect(() => JSON.parse(raw)).not.toThrow();
      const parsed = JSON.parse(raw);
      expect(parsed.checks).toBeDefined();
      expect(Array.isArray(parsed.checks)).toBe(true);
      logSpy.mockRestore();
    });

    it("search --json produces valid JSON on stdout", () => {
      const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
      handleSearchCommand("architecture", { json: true }, tempDir);

      expect(logSpy).toHaveBeenCalled();
      const raw = logSpy.mock.calls[0][0] as string;
      expect(() => JSON.parse(raw)).not.toThrow();
      const parsed = JSON.parse(raw);
      expect(Array.isArray(parsed)).toBe(true);
      logSpy.mockRestore();
    });

    it("config list --json produces valid JSON on stdout", () => {
      const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
      handleConfigCommand("list", undefined, undefined, { json: true }, tempDir);

      expect(logSpy).toHaveBeenCalled();
      const raw = logSpy.mock.calls[0][0] as string;
      expect(() => JSON.parse(raw)).not.toThrow();
      const parsed = JSON.parse(raw);
      expect(parsed.version).toBeDefined();
      logSpy.mockRestore();
    });

    it("keys list --json produces valid JSON on stdout", () => {
      const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
      handleKeysCommand("list", undefined, undefined, { json: true }, tempDir);

      expect(logSpy).toHaveBeenCalled();
      const raw = logSpy.mock.calls[0][0] as string;
      expect(() => JSON.parse(raw)).not.toThrow();
      const parsed = JSON.parse(raw);
      expect(parsed.gemini).toBeDefined();
      logSpy.mockRestore();
    });

    it("hooks status --json produces valid JSON on stdout", () => {
      const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
      handleHooksCommand("status", tempDir, { json: true });

      expect(logSpy).toHaveBeenCalled();
      const raw = logSpy.mock.calls[0][0] as string;
      expect(() => JSON.parse(raw)).not.toThrow();
      const parsed = JSON.parse(raw);
      expect(parsed.isGitRepo).toBeDefined();
      logSpy.mockRestore();
    });

    it("watch status --json produces valid JSON on stdout", async () => {
      const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
      await handleWatchCommand({ subcommand: "status", json: true }, tempDir);

      expect(logSpy).toHaveBeenCalled();
      const raw = logSpy.mock.calls[0][0] as string;
      expect(() => JSON.parse(raw)).not.toThrow();
      const parsed = JSON.parse(raw);
      expect(parsed.running).toBe(false);
      logSpy.mockRestore();
    });
  });
});
