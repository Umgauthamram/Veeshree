import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { estimateTokens, truncateToTokens } from "../src/core/context/estimator.js";
import { explainContextBudget } from "../src/core/context/explain.js";
import { buildContext } from "../src/core/context/builder.js";
import { acquireLock, withLock } from "../src/core/memory/lock.js";
import { writeAtomic } from "../src/core/memory/atomic.js";
import {
  installAgentRules,
  updateAgentRules,
  uninstallAgentRules,
  injectAgentRuleBlock,
  removeAgentRuleBlock,
} from "../src/core/rules/manager.js";
import { redactContent, capDiffPayload, isDenylistedFile, filterDiffByDenylist } from "../src/core/redact/redactor.js";
import { sanitizeRelativePath } from "../src/utils/paths.js";
import { initializeVeeshree } from "../src/commands/init.js";
import { VeeError } from "../src/utils/errors.js";

describe("Core Utilities and Memory Subsystems Coverage Suite", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "vee-core-cov-"));
    initializeVeeshree(tempDir);
  });

  afterEach(() => {
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch {
      // ignore
    }
  });

  describe("estimator.ts and explain.ts", () => {
    it("estimates tokens and truncates text cleanly", () => {
      expect(estimateTokens("")).toBe(0);
      expect(estimateTokens("Hello world, this is a test sentence.")).toBeGreaterThan(0);

      const longText = "word ".repeat(500);
      const truncated = truncateToTokens(longText, 50);
      expect(estimateTokens(truncated)).toBeLessThanOrEqual(55);
    });

    it("formats explain context budget allocation", () => {
      const contextRes = buildContext(tempDir, { request: "auth", maxTokens: 1500 });
      const explained = explainContextBudget(contextRes);
      expect(explained).toContain("Token Allocation Breakdown");
      expect(explained).toContain("System Rules");
    });
  });

  describe("lock.ts and atomic.ts", () => {
    it("acquires, withLock, and releases process lock", async () => {
      const lockPath = path.join(tempDir, ".vee", "lock");
      expect(fs.existsSync(lockPath)).toBe(false);

      const lock = acquireLock(tempDir, 1000);
      expect(fs.existsSync(lockPath)).toBe(true);

      // Attempting lock with 100ms timeout should throw timeout error
      expect(() => acquireLock(tempDir, 100)).toThrow(VeeError);

      lock.release();
      expect(fs.existsSync(lockPath)).toBe(false);

      // Calling release a second time should be idempotent
      expect(() => lock.release()).not.toThrow();

      // withLock executes cleanly
      const res = await withLock(tempDir, async () => {
        return "locked-result";
      });
      expect(res).toBe("locked-result");
      expect(fs.existsSync(lockPath)).toBe(false);
    });

    it("writes files atomically and cleans up", () => {
      const targetFile = path.join(tempDir, "atomic-test.txt");
      writeAtomic(targetFile, "Hello atomic world!");
      expect(fs.existsSync(targetFile)).toBe(true);
      expect(fs.readFileSync(targetFile, "utf-8")).toBe("Hello atomic world!");

      fs.unlinkSync(targetFile);
      expect(fs.existsSync(targetFile)).toBe(false);
    });
  });

  describe("rules/manager.ts", () => {
    it("installs, updates, injects, and uninstalls agent rules", () => {
      const installed = installAgentRules(tempDir);
      expect(installed.length).toBeGreaterThan(0);

      const updated = updateAgentRules(tempDir);
      expect(updated.length).toBeGreaterThan(0);

      const customFile = path.join(tempDir, "CUSTOM_AGENT.md");
      const injected = injectAgentRuleBlock(customFile);
      expect(injected).toBe(true);
      const injectedAgain = injectAgentRuleBlock(customFile);
      expect(injectedAgain).toBe(false);

      const removedBlock = removeAgentRuleBlock(customFile);
      expect(removedBlock).toBe(true);

      const removed = uninstallAgentRules(tempDir);
      expect(removed.length).toBeGreaterThan(0);
    });
  });

  describe("redact/redactor.ts", () => {
    it("redacts sensitive content, tokens, headers, and objects", () => {
      const raw = `
        api_key: sk-ant-api03-abcdef1234567890abcdef1234567890
        jwt: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
        auth: Bearer secret_bearer_token_12345678
      `;
      const redacted = redactContent(raw);
      expect(redacted).toContain("[REDACTED:anthropic_key]");
      expect(redacted).toContain("[REDACTED:jwt_token]");

      // Capping payload
      const longPayload = "a".repeat(1000);
      const capped = capDiffPayload(longPayload, 100);
      expect(capped.length).toBeLessThanOrEqual(250);
      expect(capped).toContain("[Payload truncated");

      // Redact JSON content with secrets
      const jsonStr = JSON.stringify({
        password: "SuperSecretPassword123",
        secret_token: "sk-proj-abcdef12345678901234567890",
      });
      const redactedJson = redactContent(jsonStr);
      expect(redactedJson).toContain("[REDACTED:password]");
      expect(redactedJson).toContain("[REDACTED:openai_key]");

      // Denylist checks
      expect(isDenylistedFile(".env", tempDir)).toBe(true);
      expect(isDenylistedFile("server.key", tempDir)).toBe(true);
      expect(isDenylistedFile("src/index.ts", tempDir)).toBe(false);

      const diffWithEnv = `diff --git a/.env b/.env\n@@ -0,0 +1 @@\n+SECRET=123\n`;
      const filtered = filterDiffByDenylist(diffWithEnv, tempDir);
      expect(filtered).not.toContain("SECRET=123");
    });
  });

  describe("paths.ts", () => {
    it("sanitizes relative paths and rejects directory traversal", () => {
      expect(sanitizeRelativePath("foo/bar.ts")).toBe("foo/bar.ts");
      expect(sanitizeRelativePath("./foo/bar.ts")).toBe("foo/bar.ts");
      expect(() => sanitizeRelativePath("../outside.ts")).toThrow(VeeError);
      expect(() => sanitizeRelativePath("/etc/passwd")).toThrow(VeeError);
      expect(() => sanitizeRelativePath("foo\0bar.ts")).toThrow(VeeError);
    });
  });
});
