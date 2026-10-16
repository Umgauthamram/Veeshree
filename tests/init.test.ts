import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { scanRepository } from "../src/core/scanner.js";
import { initializeVeeshree } from "../src/commands/init.js";
import { loadConfig } from "../src/core/config.js";

describe("Phase 1: Scanner and Init Engine", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "vee-test-"));
  });

  afterEach(() => {
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch {
      // ignore
    }
  });

  it("scans repository and detects node/react/prisma stack", () => {
    // Write mock package.json
    fs.writeFileSync(
      path.join(tempDir, "package.json"),
      JSON.stringify({
        name: "mock-app",
        dependencies: {
          next: "^14.0.0",
          react: "^18.0.0",
          "@prisma/client": "^5.0.0",
          redis: "^4.0.0",
        },
      }),
      "utf-8"
    );

    const scanned = scanRepository(tempDir);
    expect(scanned.name).toBe("mock-app");
    expect(scanned.frameworks).toContain("Next.js");
    expect(scanned.frameworks).toContain("React");
    expect(scanned.databases).toContain("Prisma ORM");
    expect(scanned.databases).toContain("Redis");
    expect(scanned.languages).toContain("JavaScript / TypeScript");
  });

  it("initializes veeshree directory hierarchy and files", () => {
    // Write mock package.json
    fs.writeFileSync(
      path.join(tempDir, "package.json"),
      JSON.stringify({ name: "my-service", dependencies: { express: "^4.18.0", pg: "^8.0.0" } }),
      "utf-8"
    );

    initializeVeeshree(tempDir);

    // Assert directories
    expect(fs.existsSync(path.join(tempDir, ".vee"))).toBe(true);
    expect(fs.existsSync(path.join(tempDir, "docs", "memory"))).toBe(true);
    expect(fs.existsSync(path.join(tempDir, "docs", "memory", "decisions"))).toBe(true);
    expect(fs.existsSync(path.join(tempDir, "docs", "memory", "archive"))).toBe(true);

    // Assert files
    expect(fs.existsSync(path.join(tempDir, ".vee", "config.json"))).toBe(true);
    expect(fs.existsSync(path.join(tempDir, "docs", "memory", "current-state.md"))).toBe(true);
    expect(fs.existsSync(path.join(tempDir, "docs", "memory", "tasks.md"))).toBe(true);
    expect(fs.existsSync(path.join(tempDir, "docs", "memory", "constraints.md"))).toBe(true);
    expect(fs.existsSync(path.join(tempDir, "docs", "memory", "rejected.md"))).toBe(true);
    expect(fs.existsSync(path.join(tempDir, "docs", "memory", "discoveries.md"))).toBe(true);
    expect(fs.existsSync(path.join(tempDir, "docs", "memory", "decisions", "database.md"))).toBe(true);

    // Validate config content
    const config = loadConfig(tempDir);
    expect(config.version).toBe("1.0.0");
    expect(config.default_extractor.provider).toBe("gemini");
    expect(config.settings.max_context_tokens).toBe(2000);

    // Validate current-state content
    const currentState = fs.readFileSync(path.join(tempDir, "docs", "memory", "current-state.md"), "utf-8");
    expect(currentState).toContain("my-service");
    expect(currentState).toContain("Express");
    expect(currentState).toContain("PostgreSQL");
  });

  it("is idempotent and does not overwrite existing files without force", () => {
    initializeVeeshree(tempDir);

    const tasksPath = path.join(tempDir, "docs", "memory", "tasks.md");
    fs.writeFileSync(tasksPath, "# Custom Tasks", "utf-8");

    // Run again without force
    initializeVeeshree(tempDir, { force: false });
    expect(fs.readFileSync(tasksPath, "utf-8")).toBe("# Custom Tasks");

    // Run again with force
    initializeVeeshree(tempDir, { force: true });
    expect(fs.readFileSync(tasksPath, "utf-8")).not.toBe("# Custom Tasks");
  });
});
