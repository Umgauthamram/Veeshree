import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { handleMigrateCommand } from "../src/commands/migrate.js";
import { handleDoctorCommand } from "../src/commands/doctor.js";
import { loadConfig } from "../src/core/config.js";
import { parseDecisionFrontmatter } from "../src/core/memory/frontmatter.js";

describe("Quality Gate 10: 0.3.x to 1.0.0 Migration & Compatibility", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "vee-migrate-test-"));
  });

  afterEach(() => {
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch {
      // ignore
    }
  });

  it("migrates a 0.3.x legacy project cleanly to 1.0.0 and passes doctor diagnostics", async () => {
    // 1. Create a 0.3.x fixture project
    const veeDir = path.join(tempDir, ".vee");
    const memoryDir = path.join(tempDir, "docs", "memory");
    const decisionsDir = path.join(memoryDir, "decisions");
    const srcDir = path.join(tempDir, "src");

    fs.mkdirSync(veeDir, { recursive: true });
    fs.mkdirSync(decisionsDir, { recursive: true });
    fs.mkdirSync(srcDir, { recursive: true });

    // Legacy source file
    const authSource = path.join(srcDir, "auth.ts");
    fs.writeFileSync(authSource, "export const authSecret = 'auth-token';", "utf-8");

    // Legacy config (0.3.x format)
    const legacyConfig = {
      version: "0.3.1",
      default_extractor: {
        provider: "gemini",
        model: "gemini-1.5-flash",
      },
      settings: {
        max_context_tokens: 1800,
        auto_sync_on_commit: true,
      },
      keys: {
        gemini: "AIzaSyLegacyKey123",
      },
    };
    fs.writeFileSync(path.join(veeDir, "config.json"), JSON.stringify(legacyConfig, null, 2), "utf-8");

    // Legacy memory files
    fs.writeFileSync(path.join(memoryDir, "current-state.md"), "# Current State\n\n## 1. System Overview\nLegacy app\n", "utf-8");
    fs.writeFileSync(path.join(memoryDir, "tasks.md"), "# Tasks\n- [ ] Initial task\n", "utf-8");
    fs.writeFileSync(path.join(memoryDir, "constraints.md"), "# Constraints\n- Always use TypeScript\n", "utf-8");
    fs.writeFileSync(path.join(memoryDir, "rejected.md"), "# Rejected\n", "utf-8");
    fs.writeFileSync(path.join(memoryDir, "discoveries.md"), "# Discoveries\n", "utf-8");

    // Legacy ADR with string array linked_files
    const legacyAdr = `---
title: "JWT Authentication Architecture"
status: "active"
tags: ["auth", "jwt"]
linked_files:
  - "src/auth.ts"
---

# JWT Authentication Architecture
We use JWTs for authentication.
`;
    fs.writeFileSync(path.join(decisionsDir, "0001-jwt-auth.md"), legacyAdr, "utf-8");

    // 2. Run Migration
    const migrateResult = await handleMigrateCommand(tempDir);
    expect(migrateResult.success).toBe(true);
    expect(migrateResult.adrsUpdated).toBeGreaterThanOrEqual(1);

    // 3. Verify Config is upgraded to 1.0.0
    const upgradedConfig = loadConfig(tempDir);
    expect(upgradedConfig.schema_version).toBe(1);
    expect(upgradedConfig.version).toBe("1.0.0");
    expect(upgradedConfig.extractor.provider).toBe("gemini");
    expect(upgradedConfig.extractor.model).toBe("gemini-1.5-flash");
    expect(upgradedConfig.context.max_tokens).toBe(1800);
    expect(upgradedConfig.privacy.allow_cloud).toBe(false); // safe by default

    // 4. Verify ADR frontmatter was migrated with SHA-256 baseline
    const upgradedAdrContent = fs.readFileSync(path.join(decisionsDir, "0001-jwt-auth.md"), "utf-8");
    const parsedAdr = parseDecisionFrontmatter(upgradedAdrContent);
    const linked = parsedAdr.data.linked_files as Array<{ path: string; sha256?: string }>;
    expect(Array.isArray(linked)).toBe(true);
    expect(linked[0]?.path).toBe("src/auth.ts");
    expect(linked[0]?.sha256).toBeDefined();
    expect(linked[0]?.sha256?.length).toBe(64);

    // 5. Verify doctor passes cleanly
    const doctorResult = await handleDoctorCommand(tempDir);
    expect(doctorResult.checks.some((c) => c.status === "error")).toBe(false);
  });
});
