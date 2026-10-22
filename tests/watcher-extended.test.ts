import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { execSync } from "node:child_process";
import { startMemoryWatcher, writeWatchLog } from "../src/core/watch/watcher.js";
import { initializeVeeshree } from "../src/commands/init.js";
import * as extractorModule from "../src/core/extractor.js";
import { loadWatchState } from "../src/core/watch/diff-state.js";

describe("Watcher Extended Processing Cycle Suite", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "vee-watch-ext-"));
    execSync("git init", { cwd: tempDir, stdio: "ignore" });
    execSync('git config user.email "test@example.com"', { cwd: tempDir, stdio: "ignore" });
    execSync('git config user.name "Test User"', { cwd: tempDir, stdio: "ignore" });
    initializeVeeshree(tempDir);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch {
      // ignore
    }
  });

  it("handles writeWatchLog when directory already exists", () => {
    writeWatchLog(tempDir, "warn", "Warning message");
    writeWatchLog(tempDir, "error", "Error message");
    const logFile = path.join(tempDir, ".vee", "logs", "watch.log");
    expect(fs.existsSync(logFile)).toBe(true);
  });

  it("triggers watcher processing cycle and auto-applies low-risk delta", async () => {
    // Commit an initial file
    const srcFile = path.join(tempDir, "feature.ts");
    fs.writeFileSync(srcFile, "export const v = 1;", "utf-8");
    execSync("git add feature.ts", { cwd: tempDir, stdio: "ignore" });
    execSync('git commit -m "initial commit"', { cwd: tempDir, stdio: "ignore" });

    // Mock extractor to return a low risk delta without decisions
    vi.spyOn(extractorModule, "extractMemoryFromContent").mockResolvedValue({
      current_state: {
        current_feature: "Watcher Feature",
        completed_in_session: ["Feature Done"],
        next_immediate_steps: [],
      },
      tasks: [{ task_name: "Watch Task", action: "complete" }],
      constraints: [],
      rejected_approaches: [],
      discoveries: [],
    });

    const watcher = await startMemoryWatcher(tempDir, { debounceSeconds: 0.1, auto: true });

    // Modify file to trigger watcher
    fs.writeFileSync(srcFile, "export const v = 2;\nexport const extra = 'diff content longer than 20 chars';", "utf-8");

    // Wait for debounce and processing (e.g. 500ms)
    await new Promise((resolve) => setTimeout(resolve, 600));

    watcher.stop();

    // Verify watch state updated
    const state = loadWatchState(tempDir);
    expect(state.callsThisHour).toBeGreaterThan(0);
    expect(state.lastDiffFingerprint).toBeDefined();
  });

  it("handles extraction error and backoff in watcher", async () => {
    const srcFile = path.join(tempDir, "error.ts");
    fs.writeFileSync(srcFile, "export const e = 1;", "utf-8");
    execSync("git add error.ts", { cwd: tempDir, stdio: "ignore" });
    execSync('git commit -m "initial error commit"', { cwd: tempDir, stdio: "ignore" });

    vi.spyOn(extractorModule, "extractMemoryFromContent").mockRejectedValue(
      new Error("LLM Rate Limit Reached")
    );

    const watcher = await startMemoryWatcher(tempDir, { debounceSeconds: 0.1, auto: false });

    // Mutate file to generate diff
    fs.writeFileSync(srcFile, "export const e = 999;\nexport const diff_stuff = 'extra lines here';", "utf-8");

    await new Promise((resolve) => setTimeout(resolve, 600));

    watcher.stop();

    const logFile = path.join(tempDir, ".vee", "logs", "watch.log");
    const content = fs.readFileSync(logFile, "utf-8");
    expect(content).toContain("backing off");
  });
});
