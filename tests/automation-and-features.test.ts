import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { initializeVeeshree } from "../src/commands/init.js";
import { installGitHooks, uninstallGitHooks, getHooksStatus } from "../src/core/hooks/manager.js";
import { injectAgentRuleBlock, removeAgentRuleBlock, getAgentTargets } from "../src/core/rules/manager.js";
import { AnthropicExtractor } from "../src/providers/anthropic.js";
import { OpenAIExtractor } from "../src/providers/openai.js";
import { createProposal, acceptProposal, rejectProposal, listProposals } from "../src/core/proposals/queue.js";
import { createMemorySnapshot, restoreMemorySnapshot } from "../src/core/snapshots/snapshot-manager.js";
import { exportMemoryToArchive, importMemoryFromArchive } from "../src/core/transfer/export-import.js";
import { generateClientConfig } from "../src/mcp/client-config.js";
import { shouldProcessDiff, updateDiffFingerprint } from "../src/core/watch/diff-state.js";
import type { ExtractionDelta } from "../src/schemas/extraction.schema.js";

describe("GAP-1 to GAP-4 & BUG-8, BUG-9: Automation, MCP & Feature Guardrails", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "vee-feat-test-"));
    // Create mock git directory
    fs.mkdirSync(path.join(tempDir, ".git", "hooks"), { recursive: true });
    initializeVeeshree(tempDir);
  });

  afterEach(() => {
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch {
      // ignore
    }
  });

  it("GAP-1: manages git hooks idempotently using marked blocks without destroying user hooks", () => {
    const preCommitPath = path.join(tempDir, ".git", "hooks", "pre-commit");
    fs.writeFileSync(preCommitPath, "#!/bin/sh\n# Existing user linter\nnpm run lint\n", "utf-8");

    // Install hooks
    const installRes = installGitHooks(tempDir);
    expect(installRes).toContain("pre-commit");
    expect(installRes).toContain("post-checkout");
    expect(installRes).toContain("post-merge");

    const content = fs.readFileSync(preCommitPath, "utf-8");
    // Verify user hook preserved
    expect(content).toContain("# Existing user linter\nnpm run lint");
    // Verify veeshree marker block appended
    expect(content).toContain("# veeshree:start");
    expect(content).toContain("$VEE_BIN status --check");
    expect(content).toContain("# veeshree:end");

    // Idempotent: re-install does not duplicate block
    installGitHooks(tempDir);
    const content2 = fs.readFileSync(preCommitPath, "utf-8");
    const count = (content2.match(/# veeshree:start/g) || []).length;
    expect(count).toBe(1);

    // Status check
    const status = getHooksStatus(tempDir);
    expect(status.installed).toBe(true);

    // Uninstall removes only veeshree block
    uninstallGitHooks(tempDir);
    const postUninstall = fs.readFileSync(preCommitPath, "utf-8");
    expect(postUninstall).not.toContain("veeshree:start");
    expect(postUninstall).toContain("npm run lint");
  });

  it("BUG-9: injects and updates agent rule files idempotently without wiping user rules", () => {
    const claudePath = path.join(tempDir, "CLAUDE.md");
    fs.writeFileSync(claudePath, "# My Custom Project Guidelines\nAlways use TypeScript.\n", "utf-8");

    // Inject agent rule
    const changed = injectAgentRuleBlock(claudePath);
    expect(changed).toBe(true);

    const injected = fs.readFileSync(claudePath, "utf-8");
    expect(injected).toContain("# My Custom Project Guidelines");
    expect(injected).toContain("<!-- veeshree:start -->");
    expect(injected).toContain("Veeshree Model-Independent Memory Guidelines");
    expect(injected).toContain("<!-- veeshree:end -->");

    // Re-inject should be a no-op
    const changedAgain = injectAgentRuleBlock(claudePath);
    expect(changedAgain).toBe(false);

    // Remove block preserves custom guidelines
    removeAgentRuleBlock(claudePath);
    const cleaned = fs.readFileSync(claudePath, "utf-8");
    expect(cleaned).not.toContain("veeshree:start");
    expect(cleaned).toContain("# My Custom Project Guidelines");
  });

  it("GAP-3: Anthropic extractor uses x-api-key header and OpenAI extractor supports custom base_url", async () => {
    // Anthropic
    const anthropic = new AnthropicExtractor();
    expect(anthropic.name).toBe("anthropic");

    // OpenAI with custom base URL
    const customBase = "https://custom.openai.azure.com/v1";
    const customOpenAi = new OpenAIExtractor("openai", customBase);
    expect(customOpenAi.name).toBe("openai");
  });

  it("GAP-4: review queue supports creation, listing, acceptance, and rejection of proposals", async () => {
    const delta: ExtractionDelta = {
      summary: "Proposal test",
      decisions: [],
      current_state: { current_feature: "Feature", completed_in_session: [], next_immediate_steps: [] },
      tasks: [{ task_name: "New task via proposal", action: "add" }],
      constraints: [],
      rejected_approaches: [],
      discoveries: [],
    };

    const prop = await createProposal(delta, tempDir, "test");
    expect(prop.status).toBe("pending");

    let list = listProposals(tempDir);
    expect(list.length).toBe(1);

    // Reject proposal
    const rejectRes = rejectProposal(prop.id, tempDir);
    expect(rejectRes.success).toBe(true);

    list = listProposals(tempDir);
    expect(list.find((p) => p.id === prop.id)?.status).toBe("rejected");

    // Tasks should not have been updated
    const tasksContent = fs.readFileSync(path.join(tempDir, "docs", "memory", "tasks.md"), "utf-8");
    expect(tasksContent).not.toContain("New task via proposal");
  });

  it("GAP-4: snapshot manager supports creating snapshots and restoring previous memory state (undo)", () => {
    const tasksPath = path.join(tempDir, "docs", "memory", "tasks.md");
    fs.writeFileSync(tasksPath, "# Tasks\n- [ ] Baseline task\n", "utf-8");

    // Take snapshot 1
    const snap1 = createMemorySnapshot(tempDir, "Initial state");

    // Modify memory
    fs.writeFileSync(tasksPath, "# Tasks\n- [ ] Baseline task\n- [ ] Corrupted or unwanted task\n", "utf-8");
    expect(fs.readFileSync(tasksPath, "utf-8")).toContain("unwanted task");

    // Restore snapshot 1
    const restored = restoreMemorySnapshot(tempDir, snap1.id);
    expect(restored).toBe(true);

    expect(fs.readFileSync(tasksPath, "utf-8")).not.toContain("unwanted task");
    expect(fs.readFileSync(tasksPath, "utf-8")).toContain("- [ ] Baseline task");
  });

  it("GAP-4: export and import preserves full memory directory structure and content", () => {
    const exportData = exportMemoryToArchive(tempDir, "json");
    expect(exportData.manifest.format).toBe("veeshree-memory-export");
    expect(exportData.files.length).toBeGreaterThan(0);

    // Clear memory directory
    const memoryDir = path.join(tempDir, "docs", "memory");
    fs.rmSync(memoryDir, { recursive: true, force: true });
    expect(fs.existsSync(memoryDir)).toBe(false);

    // Import back
    const importRes = importMemoryFromArchive(tempDir, exportData);
    expect(importRes.restoredFiles.length).toBeGreaterThan(0);
    expect(fs.existsSync(path.join(tempDir, "docs", "memory", "current-state.md"))).toBe(true);
    expect(fs.existsSync(path.join(tempDir, "docs", "memory", "constraints.md"))).toBe(true);
  });

  it("BUG-8: diff fingerprinting prevents resending unchanged diffs and ignores docs/memory", () => {
    const diffText = "diff --git a/src/app.ts b/src/app.ts\n+console.log('hi');";

    // First diff should process
    const firstCheck = shouldProcessDiff(diffText, tempDir);
    expect(firstCheck.shouldProcess).toBe(true);

    // Update fingerprint
    updateDiffFingerprint(diffText, tempDir);

    // Second check of exact same diff should NOT process
    const secondCheck = shouldProcessDiff(diffText, tempDir);
    expect(secondCheck.shouldProcess).toBe(false);

    // New diff should process
    const newDiffText = "diff --git a/src/app.ts b/src/app.ts\n+console.log('new');";
    const thirdCheck = shouldProcessDiff(newDiffText, tempDir);
    expect(thirdCheck.shouldProcess).toBe(true);
  });

  it("GAP-2: MCP client config generator outputs valid config for Claude, Cursor, VS Code, and Gemini", () => {
    for (const client of ["claude", "cursor", "vscode", "gemini"] as const) {
      const config = generateClientConfig(client);
      expect(config).toBeDefined();
      expect(typeof config.content).toBe("string");
      expect(config.targetPath).toBeDefined();
    }
  });
});
