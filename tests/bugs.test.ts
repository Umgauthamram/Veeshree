import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { initializeVeeshree } from "../src/commands/init.js";
import { checkWorkspaceDrift } from "../src/core/drift/status.js";
import { acceptBaselines } from "../src/core/drift/baselines.js";
import {
  safeLiteralReplace,
  slugifyTitle,
  getNextAdrNumber,
  updateSectionBody,
  normalizeTaskName,
} from "../src/core/memory/section-editor.js";
import { reconcileExtractionSafe } from "../src/core/reconcile/reconciler.js";
import { buildContext } from "../src/core/context/builder.js";
import type { ExtractionDelta } from "../src/schemas/extraction.schema.js";

describe("BUG-1 to BUG-7: Core Engine Bug Fixes & Regression Guardrails", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "vee-bugs-test-"));
    initializeVeeshree(tempDir);
  });

  afterEach(() => {
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch {
      // ignore
    }
  });

  it("BUG-1 & BUG-2: detects drift in fresh clone without index.json and clears on acceptBaselines", async () => {
    // Create source file
    const srcDir = path.join(tempDir, "src");
    fs.mkdirSync(srcDir, { recursive: true });
    const authFile = path.join(srcDir, "auth.ts");
    fs.writeFileSync(authFile, "export const auth = 'initial-v1';", "utf-8");

    // Create ADR with committed baseline hash in frontmatter
    const delta: ExtractionDelta = {
      summary: "Auth decision",
      decisions: [
        {
          title: "Session Authentication",
          status: "active",
          decision: "Use session-based auth",
          reason: "Simple and robust",
          linked_files: ["src/auth.ts"],
        },
      ],
      current_state: { current_feature: "Auth", completed_in_session: [], next_immediate_steps: [] },
      tasks: [],
      constraints: [],
      rejected_approaches: [],
      discoveries: [],
    };

    await reconcileExtractionSafe(delta, tempDir);

    // Simulate fresh clone in CI: remove .vee/index.json
    const indexPath = path.join(tempDir, ".vee", "index.json");
    if (fs.existsSync(indexPath)) {
      fs.unlinkSync(indexPath);
    }

    // Verify baseline hash is committed in ADR frontmatter
    let drift = checkWorkspaceDrift(tempDir);
    expect(drift.hasDrift).toBe(false);

    // Modify source file -> drift detected purely from frontmatter without cache
    fs.writeFileSync(authFile, "export const auth = 'modified-v2-drifted';", "utf-8");

    drift = checkWorkspaceDrift(tempDir);
    expect(drift.hasDrift).toBe(true);
    expect(drift.records.some((r) => r.isDrifted)).toBe(true);

    // BUG-1: Accept baselines -> updates frontmatter and clears drift flag
    const res = acceptBaselines("--all", tempDir);
    expect(res.updatedAdrs.length).toBe(1);

    const postAcceptDrift = checkWorkspaceDrift(tempDir);
    expect(postAcceptDrift.hasDrift).toBe(false);
  });

  it("BUG-3: safeLiteralReplace preserves exact literal $&, $1, $` in text replacements", () => {
    const original = "Hello TARGET World!";
    const replacement = "Price is $& and ref is $1 and backtick is $`";

    const result = safeLiteralReplace(original, "TARGET", replacement);
    expect(result).toBe("Hello Price is $& and ref is $1 and backtick is $` World!");
  });

  it("BUG-4: same-slug ADRs do not overwrite and non-Latin titles default safely to decision", async () => {
    // 1. Same-slug ADRs
    const delta1: ExtractionDelta = {
      summary: "First decision",
      decisions: [{ title: "Database Choice", decision: "PostgreSQL", reason: "ACID" }],
      current_state: { current_feature: "DB", completed_in_session: [], next_immediate_steps: [] },
      tasks: [],
      constraints: [],
      rejected_approaches: [],
      discoveries: [],
    };

    const res1 = await reconcileExtractionSafe(delta1, tempDir);
    expect(res1.newDecisions[0]).toContain("0001-database-choice.md");

    const delta2: ExtractionDelta = {
      summary: "Second decision with same title",
      decisions: [{ title: "Database Choice", decision: "CockroachDB", reason: "Distributed" }],
      current_state: { current_feature: "DB", completed_in_session: [], next_immediate_steps: [] },
      tasks: [],
      constraints: [],
      rejected_approaches: [],
      discoveries: [],
    };

    const res2 = await reconcileExtractionSafe(delta2, tempDir);
    expect(res2.newDecisions[0]).toContain("0002-database-choice.md");

    // Both files must exist on disk
    expect(fs.existsSync(path.join(tempDir, "docs", "memory", "decisions", "0001-database-choice.md"))).toBe(true);
    expect(fs.existsSync(path.join(tempDir, "docs", "memory", "decisions", "0002-database-choice.md"))).toBe(true);

    // 2. Non-Latin title
    const nonLatinSlug = slugifyTitle("データベース設計");
    expect(nonLatinSlug).toBe("decision");

    const delta3: ExtractionDelta = {
      summary: "Non-Latin title",
      decisions: [{ title: "データベース設計", decision: "UTF8", reason: "International" }],
      current_state: { current_feature: "DB", completed_in_session: [], next_immediate_steps: [] },
      tasks: [],
      constraints: [],
      rejected_approaches: [],
      discoveries: [],
    };

    const res3 = await reconcileExtractionSafe(delta3, tempDir);
    expect(res3.newDecisions[0]).toContain("0003-decision.md");
    expect(fs.existsSync(path.join(tempDir, "docs", "memory", "decisions", "0003-decision.md"))).toBe(true);
  });

  it("BUG-5: rolling progress prepends items without wiping section 4 or file tail", () => {
    const originalDoc = `# Current Project State

## 1. System Overview
Overview content

## 2. Active Feature
Feature content

## 3. Recent Progress (Rolling Snapshot - Max 5)
- Prior task 1

## 4. Next Immediate Steps
- [ ] Next step A
- [ ] Next step B

## Tail Notes
Important tail notes that must never be deleted!`;

    const updated = updateSectionBody(
      originalDoc,
      "3. Recent Progress (Rolling Snapshot - Max 5)",
      "- New completed task\n- Prior task 1"
    );

    expect(updated).toContain("## 4. Next Immediate Steps");
    expect(updated).toContain("- [ ] Next step A");
    expect(updated).toContain("## Tail Notes");
    expect(updated).toContain("Important tail notes that must never be deleted!");
    expect(updated).toContain("- New completed task");
  });

  it("BUG-6: handles 'remove' task action and uses normalized exact line deduplication", async () => {
    const tasksPath = path.join(tempDir, "docs", "memory", "tasks.md");
    fs.writeFileSync(
      tasksPath,
      `# Tasks & Immediate Roadmap

## Active Tasks
- [ ] Build User Interface
- [ ] Build User Interface Components
- [ ] Set up Docker container
`,
      "utf-8"
    );

    // Remove task "Build User Interface" - should NOT remove "Build User Interface Components"
    const removeDelta: ExtractionDelta = {
      summary: "Remove UI task",
      decisions: [],
      current_state: { current_feature: "UI", completed_in_session: [], next_immediate_steps: [] },
      tasks: [{ task_name: "Build User Interface", action: "remove" }],
      constraints: [],
      rejected_approaches: [],
      discoveries: [],
    };

    await reconcileExtractionSafe(removeDelta, tempDir);

    const updatedTasks = fs.readFileSync(tasksPath, "utf-8");
    expect(updatedTasks).not.toContain("- [ ] Build User Interface\n");
    expect(updatedTasks).toContain("- [ ] Build User Interface Components");
    expect(updatedTasks).toContain("- [ ] Set up Docker container");
  });

  it("BUG-7: token cap strictly limits constraints tier to 400 tokens and preserves pinned rules", () => {
    // Generate 200 constraints
    const rules: string[] = [];
    for (let i = 1; i <= 200; i++) {
      if (i === 100) {
        rules.push(`- **Rule ${i}**: [pin] Critical pinned safety rule that must never be dropped.`);
      } else {
        rules.push(`- **Rule ${i}**: Normal constraint guideline for system component ${i}.`);
      }
    }

    const constraintsPath = path.join(tempDir, "docs", "memory", "constraints.md");
    fs.writeFileSync(constraintsPath, `# Active Architectural Constraints\n\n## Hard Constraints\n${rules.join("\n")}`, "utf-8");

    // Add a decision so we verify room remains for at least one decision
    const decisionsDir = path.join(tempDir, "docs", "memory", "decisions");
    fs.writeFileSync(
      path.join(decisionsDir, "0001-test-dec.md"),
      `---\ntitle: "Core Engine Decision"\nstatus: "active"\n---\n\n# Core Engine Decision\nEngine details.`,
      "utf-8"
    );

    const result = buildContext(tempDir, { maxTokens: 2000 });

    const constraintsTier = result.tiers.find((t) => t.tier === "Constraints");
    expect(constraintsTier).toBeDefined();
    expect(constraintsTier?.tokens).toBeLessThanOrEqual(400);
    expect(constraintsTier?.truncated).toBe(true);

    // Pinned rule must be present despite truncation
    expect(result.content).toContain("[pin] Critical pinned safety rule");

    // Decisions tier must have room and be included
    const decisionsTier = result.tiers.find((t) => t.tier === "Decisions");
    expect(decisionsTier).toBeDefined();
    expect(decisionsTier?.tokens).toBeGreaterThan(0);
    expect(result.content).toContain("Core Engine Decision");

    // Total content tokens must strictly stay within total ceiling
    expect(result.totalTokens).toBeLessThanOrEqual(2000);
  });
});
