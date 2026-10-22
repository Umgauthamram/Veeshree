import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { writeWatchLog, startMemoryWatcher } from "../src/core/watch/watcher.js";
import { resolveCliEntrypoint, getDaemonStatus, startDaemon, stopDaemon } from "../src/core/watch/daemon.js";
import {
  loadWatchState,
  saveWatchState,
  computeDiffFingerprint,
  canMakeWatchCall,
  filterOutProcessedHunks,
} from "../src/core/watch/diff-state.js";
import { initializeVeeshree } from "../src/commands/init.js";
import { WATCH_PID_FILE_REL, WATCH_LOG_FILE_REL } from "../src/utils/constants.js";

describe("Watcher and Daemon Coverage Suite", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "vee-watch-cov-"));
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

  describe("diff-state.ts", () => {
    it("manages watch state, rate limiting, and diff fingerprints", () => {
      const state = loadWatchState(tempDir);
      expect(state.processedHunkHashes).toBeDefined();

      state.lastDiffFingerprint = "fingerprint123";
      saveWatchState(state, tempDir);

      const reloaded = loadWatchState(tempDir);
      expect(reloaded.lastDiffFingerprint).toBe("fingerprint123");

      const fp1 = computeDiffFingerprint("diff --git a/foo.ts");
      const fp2 = computeDiffFingerprint("diff --git a/foo.ts");
      const fp3 = computeDiffFingerprint("diff --git a/bar.ts");
      expect(fp1).toBe(fp2);
      expect(fp1).not.toBe(fp3);

      // Rate limiting: canMakeWatchCall
      const allow1 = canMakeWatchCall(10, reloaded);
      expect(allow1).toBe(true);

      // Hunk filtering
      const rawDiff = `diff --git a/a.ts b/a.ts\n@@ -1,2 +1,2 @@\n-old\n+new\n`;
      const { filteredDiff, newHashes } = filterOutProcessedHunks(rawDiff, reloaded.processedHunkHashes);
      expect(filteredDiff).toContain("new");
      expect(newHashes.length).toBeGreaterThan(0);
    });
  });

  describe("watcher.ts", () => {
    it("writes watch log entries and starts/stops ambient watcher", async () => {
      writeWatchLog(tempDir, "info", "Testing watch log");
      writeWatchLog(tempDir, "debug", "Debug watch log");

      const logPath = path.join(tempDir, WATCH_LOG_FILE_REL);
      expect(fs.existsSync(logPath)).toBe(true);
      const content = fs.readFileSync(logPath, "utf-8");
      expect(content).toContain("[INFO] Testing watch log");

      const watcher = await startMemoryWatcher(tempDir, { debounceSeconds: 1, auto: false });
      expect(watcher).toBeDefined();
      expect(typeof watcher.stop).toBe("function");

      // Trigger file modification to exercise watch handler
      const dummy = path.join(tempDir, "src", "dummy.ts");
      fs.mkdirSync(path.dirname(dummy), { recursive: true });
      fs.writeFileSync(dummy, "export const x = 1;", "utf-8");

      watcher.stop();
    });
  });

  describe("daemon.ts", () => {
    it("resolves cli entrypoint and checks daemon status", async () => {
      const entry = resolveCliEntrypoint(tempDir);
      expect(entry).toBeDefined();
      expect(fs.existsSync(entry)).toBe(true);

      const initialStatus = getDaemonStatus(tempDir);
      expect(initialStatus.running).toBe(false);

      // Test stale PID cleanup
      const pidPath = path.join(tempDir, WATCH_PID_FILE_REL);
      fs.writeFileSync(pidPath, "999999999", "utf-8"); // non-existent PID
      const staleStatus = getDaemonStatus(tempDir);
      expect(staleStatus.running).toBe(false);
      expect(fs.existsSync(pidPath)).toBe(false); // Should have unlinked stale file

      // Test real daemon start & stop
      const { pid } = await startDaemon(tempDir, { debounce: "5" });
      expect(pid).toBeGreaterThan(0);
      const runningStatus = getDaemonStatus(tempDir);
      expect(runningStatus.running).toBe(true);

      // Exercise watch status while running (non-json)
      const { handleWatchCommand } = await import("../src/commands/watch.js");
      await handleWatchCommand({ subcommand: "status" }, tempDir);

      // Exercise watch stop while running (non-json)
      await handleWatchCommand({ subcommand: "stop" }, tempDir);

      const stoppedStatus = getDaemonStatus(tempDir);
      expect(stoppedStatus.running).toBe(false);
    });
  });
});

