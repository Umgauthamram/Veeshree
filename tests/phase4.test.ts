import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { initializeVeeshree } from "../src/commands/init.js";
import { runGarbageCollection } from "../src/core/gc.js";
import { searchMemory } from "../src/core/search.js";
import { buildIndex } from "../src/core/indexer.js";

describe("Phase 4: State Management & Developer Interface", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "vee-phase4-test-"));
    initializeVeeshree(tempDir);
  });

  afterEach(() => {
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch {
      // ignore
    }
  });

  it("archives progress items exceeding rolling buffer limit (5 items)", () => {
    const currentStatePath = path.join(tempDir, "docs", "memory", "current-state.md");
    const testContent = `# Current Project State

## 1. System Overview
- **Project Name**: test-app

## 2. Active Feature / Milestone
- **Current Focus**: Archiving Testing

## 3. Recent Progress (Rolling Snapshot - Max 5)
- Milestone 1: Setup
- Milestone 2: Models
- Milestone 3: Auth
- Milestone 4: Database
- Milestone 5: Indexing
- Milestone 6: Capture
- Milestone 7: Garbage Collector

## 4. Next Immediate Steps
- [ ] Next step
`;
    fs.writeFileSync(currentStatePath, testContent, "utf-8");

    const gcResult = runGarbageCollection(tempDir);
    expect(gcResult.archivedTasksCount).toBe(2);

    // Verify current-state.md only has 5 items
    const updatedState = fs.readFileSync(currentStatePath, "utf-8");
    expect(updatedState).toContain("Milestone 1: Setup");
    expect(updatedState).toContain("Milestone 5: Indexing");
    expect(updatedState).not.toContain("Milestone 6: Capture");
    expect(updatedState).not.toContain("Milestone 7: Garbage Collector");

    // Verify archive/completed-tasks.md has the 2 excess items
    const archivePath = path.join(tempDir, "docs", "memory", "archive", "completed-tasks.md");
    expect(fs.existsSync(archivePath)).toBe(true);
    const archiveContent = fs.readFileSync(archivePath, "utf-8");
    expect(archiveContent).toContain("Milestone 6: Capture");
    expect(archiveContent).toContain("Milestone 7: Garbage Collector");
  });

  it("moves superseded decisions to archive/decisions/ directory", () => {
    const decisionsDir = path.join(tempDir, "docs", "memory", "decisions");
    const adrPath = path.join(decisionsDir, "old-caching.md");

    fs.writeFileSync(
      adrPath,
      `---
title: "Memcached Strategy"
status: "superseded"
tags: ["caching", "memcached"]
linked_files: []
---

# Memcached Strategy
Superseded by Redis.
`,
      "utf-8"
    );

    const gcResult = runGarbageCollection(tempDir);
    expect(gcResult.supersededDecisionsCount).toBe(1);
    expect(gcResult.relocatedDecisions).toContain("old-caching.md");

    // Verify file is moved
    expect(fs.existsSync(adrPath)).toBe(false);
    const archivedAdrPath = path.join(tempDir, "docs", "memory", "archive", "decisions", "old-caching.md");
    expect(fs.existsSync(archivedAdrPath)).toBe(true);
  });

  it("searches memory records and honors archive filters", () => {
    const decisionsDir = path.join(tempDir, "docs", "memory", "decisions");
    const archiveDecisionsDir = path.join(tempDir, "docs", "memory", "archive", "decisions");
    fs.mkdirSync(archiveDecisionsDir, { recursive: true });

    // Active ADR
    fs.writeFileSync(
      path.join(decisionsDir, "active-postgres.md"),
      `---
title: "PostgreSQL Production DB"
status: "active"
tags: ["sql", "postgres"]
linked_files: []
---

# PostgreSQL Production DB
Using PostgreSQL for relational data.
`,
      "utf-8"
    );

    // Archived ADR
    fs.writeFileSync(
      path.join(archiveDecisionsDir, "archived-mongo.md"),
      `---
title: "MongoDB Strategy"
status: "superseded"
tags: ["nosql", "mongo"]
linked_files: []
---

# MongoDB Strategy
Discarded in favor of relational model.
`,
      "utf-8"
    );

    buildIndex(tempDir);

    // Active search for Postgres
    const postgresResults = searchMemory("PostgreSQL", {}, tempDir);
    expect(postgresResults.length).toBeGreaterThan(0);
    expect(postgresResults[0].title).toBe("PostgreSQL Production DB");

    // Search without --archived should NOT find MongoDB
    const mongoStandardResults = searchMemory("MongoDB", { includeArchived: false }, tempDir);
    expect(mongoStandardResults.length).toBe(0);

    // Search with --archived SHOULD find MongoDB
    const mongoArchivedResults = searchMemory("MongoDB", { includeArchived: true }, tempDir);
    expect(mongoArchivedResults.length).toBeGreaterThan(0);
    expect(mongoArchivedResults[0].title).toBe("MongoDB Strategy");
  });

  it("archives completed tasks (- [x]) from tasks.md to archive/completed-tasks.md", () => {
    const tasksPath = path.join(tempDir, "docs", "memory", "tasks.md");
    const testTasksContent = `# Project Tasks & Milestones

## Active Tasks
- [x] Implement OAuth2 login with GitHub
- [ ] Add Redis cache layer
- [x] Configure production logging
- [ ] Write integration test suite
`;
    fs.writeFileSync(tasksPath, testTasksContent, "utf-8");

    const gcResult = runGarbageCollection(tempDir);
    expect(gcResult.archivedTasksCount).toBe(2);

    // Verify tasks.md no longer has the completed tasks
    const updatedTasks = fs.readFileSync(tasksPath, "utf-8");
    expect(updatedTasks).not.toContain("Implement OAuth2 login with GitHub");
    expect(updatedTasks).not.toContain("Configure production logging");
    expect(updatedTasks).toContain("- [ ] Add Redis cache layer");
    expect(updatedTasks).toContain("- [ ] Write integration test suite");

    // Verify completed tasks exist in docs/memory/archive/completed-tasks.md
    const archivePath = path.join(tempDir, "docs", "memory", "archive", "completed-tasks.md");
    expect(fs.existsSync(archivePath)).toBe(true);
    const archiveContent = fs.readFileSync(archivePath, "utf-8");
    expect(archiveContent).toContain("- [x] Implement OAuth2 login with GitHub");
    expect(archiveContent).toContain("- [x] Configure production logging");
  });
});
