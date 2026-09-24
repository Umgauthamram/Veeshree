import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { initializeVeeshree } from "../src/commands/init.js";
import { setApiKey, getApiKey, removeApiKey, listApiKeys, maskKey } from "../src/core/auth.js";
import { reconcileExtraction } from "../src/core/reconciler.js";
import { detectAvailableModels } from "../src/core/models.js";
import type { ExtractionDelta } from "../src/types/index.js";

describe("Phase 3: AI Extraction & Background Processing", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "vee-phase3-test-"));
    initializeVeeshree(tempDir);
  });

  afterEach(() => {
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch {
      // ignore
    }
  });

  it("manages provider API keys with masking and local config persistence", () => {
    expect(maskKey("sk-1234567890abcdef")).toBe("sk-1...cdef");
    expect(maskKey("short")).toBe("********");

    // Set key
    setApiKey("gemini", "AIzaSySecretGeminiKey123456", tempDir);
    expect(getApiKey("gemini", tempDir)).toBe("AIzaSySecretGeminiKey123456");

    // List keys
    const keys = listApiKeys(tempDir);
    expect(keys.gemini.configured).toBe(true);
    expect(keys.gemini.masked).toBe("AIza...3456");
    expect(keys.openai.configured).toBe(false);

    // Remove key
    removeApiKey("gemini", tempDir);
    expect(getApiKey("gemini", tempDir)).toBeUndefined();
  });

  it("probes local model runtimes and cloud credentials", async () => {
    const runtimes = await detectAvailableModels(tempDir);
    expect(runtimes.length).toBeGreaterThanOrEqual(4);

    const geminiRuntime = runtimes.find((r) => r.provider === "gemini");
    expect(geminiRuntime).toBeDefined();

    const ollamaRuntime = runtimes.find((r) => r.provider === "ollama");
    expect(ollamaRuntime).toBeDefined();
    expect(ollamaRuntime?.endpoint).toBe("http://127.0.0.1:11434");
  });

  it("reconciles structured ExtractionDelta JSON into markdown memory", () => {
    const mockDelta: ExtractionDelta = {
      decisions: [
        {
          title: "Message Queue Architecture",
          decision: "Use BullMQ with Redis for background task scheduling.",
          reason: "Need transactional reliability and delayed retries.",
          alternatives_considered: ["RabbitMQ", "Kafka"],
          linked_files: ["src/workers/queue.ts"],
          status: "active",
          tags: ["queue", "redis", "bullmq"],
        },
      ],
      current_state: {
        current_feature: "Background Queue Integration",
        completed_in_session: ["Created BullMQ queue worker"],
        next_immediate_steps: ["Implement dead letter queue handling"],
      },
      tasks: [
        { task_name: "Bootstrap foundational architecture & core dependencies", action: "complete" },
        { task_name: "Add telemetry monitoring for BullMQ", action: "add" },
      ],
      constraints: [
        { rule: "All background workers must implement idempotent job handlers", type: "hard" },
      ],
      rejected_approaches: [
        { approach: "In-memory JavaScript setTimeout queue", reason: "Loses queue state on process crashes." },
      ],
      discoveries: [
        "Redis cluster mode requires specific hash tag wrapping for keys.",
      ],
    };

    const reconcileResult = reconcileExtraction(mockDelta, tempDir);
    expect(reconcileResult.newDecisions.length).toBe(1);
    expect(reconcileResult.newDecisions[0]).toContain("message-queue-architecture.md");

    // 1. Verify ADR was created
    const adrPath = path.join(tempDir, "docs", "memory", "decisions", "message-queue-architecture.md");
    expect(fs.existsSync(adrPath)).toBe(true);
    const adrContent = fs.readFileSync(adrPath, "utf-8");
    expect(adrContent).toContain("BullMQ with Redis");
    expect(adrContent).toContain("RabbitMQ");

    // 2. Verify current-state.md updated
    const currentState = fs.readFileSync(path.join(tempDir, "docs", "memory", "current-state.md"), "utf-8");
    expect(currentState).toContain("Background Queue Integration");
    expect(currentState).toContain("Created BullMQ queue worker");
    expect(currentState).toContain("Implement dead letter queue handling");

    // 3. Verify tasks.md updated
    const tasks = fs.readFileSync(path.join(tempDir, "docs", "memory", "tasks.md"), "utf-8");
    expect(tasks).toContain("- [x] Bootstrap foundational architecture");
    expect(tasks).toContain("- [ ] Add telemetry monitoring for BullMQ");

    // 4. Verify constraints.md updated
    const constraints = fs.readFileSync(path.join(tempDir, "docs", "memory", "constraints.md"), "utf-8");
    expect(constraints).toContain("All background workers must implement idempotent job handlers");

    // 5. Verify rejected.md updated
    const rejected = fs.readFileSync(path.join(tempDir, "docs", "memory", "rejected.md"), "utf-8");
    expect(rejected).toContain("In-memory JavaScript setTimeout queue");
    expect(rejected).toContain("Loses queue state on process crashes");

    // 6. Verify discoveries.md updated
    const discoveries = fs.readFileSync(path.join(tempDir, "docs", "memory", "discoveries.md"), "utf-8");
    expect(discoveries).toContain("Redis cluster mode requires specific hash tag wrapping");
  });
});
