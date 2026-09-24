import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { initializeVeeshree } from "../src/commands/init.js";
import { buildIndex, loadOrBuildIndex } from "../src/core/indexer.js";
import { assembleContext, estimateTokens } from "../src/core/context.js";

describe("Phase 2: Indexing, Retrieval & Hash Integrity", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "vee-phase2-test-"));
    initializeVeeshree(tempDir);
  });

  afterEach(() => {
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch {
      // ignore
    }
  });

  it("builds index and computes SHA-256 hashes of linked source files", () => {
    // 1. Create a mock source file
    const srcDir = path.join(tempDir, "src", "lib");
    fs.mkdirSync(srcDir, { recursive: true });
    const redisSourcePath = path.join(srcDir, "redis.ts");
    fs.writeFileSync(redisSourcePath, "export const redisClient = { connect: () => true };", "utf-8");

    // 2. Create an ADR referencing the source file
    const adrPath = path.join(tempDir, "docs", "memory", "decisions", "caching.md");
    const adrContent = `---
title: "Redis Caching Strategy"
status: "active"
tags: ["redis", "cache", "performance"]
linked_files: ["src/lib/redis.ts"]
---

# Redis Caching Strategy

## Context
Need fast caching layer.

## Decision
Use Redis in-memory cache.
`;
    fs.writeFileSync(adrPath, adrContent, "utf-8");

    // 3. Build index
    const indexData = buildIndex(tempDir);
    expect(indexData.documents.length).toBeGreaterThan(0);

    const cachingDoc = indexData.documents.find((d) => d.title === "Redis Caching Strategy");
    expect(cachingDoc).toBeDefined();
    expect(cachingDoc?.linked_files).toContain("src/lib/redis.ts");
    expect(cachingDoc?.linked_hashes["src/lib/redis.ts"]).toBeDefined();
    expect(cachingDoc?.stale).toBe(false);

    // 4. Modify source file to test drift detection
    fs.writeFileSync(redisSourcePath, "export const redisClient = { connect: () => false, updated: true };", "utf-8");

    // Re-index and verify stale flag
    const updatedIndex = buildIndex(tempDir);
    const updatedCachingDoc = updatedIndex.documents.find((d) => d.title === "Redis Caching Strategy");
    expect(updatedCachingDoc?.stale).toBe(true);
  });

  it("assembles prompt context obeying token budget allocations", () => {
    // Add multiple decisions
    const decisionsDir = path.join(tempDir, "docs", "memory", "decisions");
    
    fs.writeFileSync(
      path.join(decisionsDir, "auth.md"),
      `---
title: "Authentication Strategy"
status: "active"
tags: ["auth", "jwt", "security"]
linked_files: []
---

# Authentication Strategy
We use JWT authentication with short-lived access tokens.
`,
      "utf-8"
    );

    fs.writeFileSync(
      path.join(decisionsDir, "database.md"),
      `---
title: "PostgreSQL Database Engine"
status: "active"
tags: ["database", "postgres", "sql"]
linked_files: []
---

# PostgreSQL Database Engine
We use PostgreSQL for all relational data persistence.
`,
      "utf-8"
    );

    // Assemble context for request "PostgreSQL setup"
    const result = assembleContext(tempDir, {
      request: "PostgreSQL database configuration",
      maxTokens: 1500,
    });

    expect(result.prompt).toContain("SYSTEM CONTEXT & RULES");
    expect(result.prompt).toContain("ACTIVE ARCHITECTURAL CONSTRAINTS");
    expect(result.prompt).toContain("ACTIVE PROJECT STATE SNAPSHOT");
    expect(result.prompt).toContain("PostgreSQL Database Engine");
    expect(result.totalEstimatedTokens).toBeLessThanOrEqual(1500);
  });

  it("injects stale warning notice when a decision record is stale", () => {
    const srcDir = path.join(tempDir, "src");
    fs.mkdirSync(srcDir, { recursive: true });
    const authFile = path.join(srcDir, "auth.ts");
    fs.writeFileSync(authFile, "const initialAuth = 1;", "utf-8");

    const adrPath = path.join(tempDir, "docs", "memory", "decisions", "auth.md");
    fs.writeFileSync(
      adrPath,
      `---
title: "Auth Decision"
status: "active"
tags: ["auth"]
linked_files: ["src/auth.ts"]
---

# Auth Decision
Details about authentication.
`,
      "utf-8"
    );

    // First index
    buildIndex(tempDir);

    // Drift code
    fs.writeFileSync(authFile, "const modifiedAuth = 2;", "utf-8");
    buildIndex(tempDir);

    const context = assembleContext(tempDir, { request: "auth" });
    expect(context.prompt).toContain("STALE RECORD NOTICE");
    expect(context.staleWarnings.length).toBeGreaterThan(0);
  });
});
