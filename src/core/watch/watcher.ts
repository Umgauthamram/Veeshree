import fs from "node:fs";
import path from "node:path";
import { logger } from "../../utils/logger.js";
import { runCommandSafe } from "../../utils/process.js";
import { isDenylistedFile } from "../redact/denylist.js";
import { redactContent, capDiffPayload } from "../redact/redactor.js";
import { extractMemoryFromContent } from "../extractor.js";
import { createProposal, acceptProposal } from "../proposals/queue.js";
import { loadWatchState, saveWatchState, computeDiffFingerprint, canMakeWatchCall } from "./diff-state.js";
import { loadConfig } from "../config.js";
import { WATCH_LOG_FILE_REL, LOGS_DIR_REL } from "../../utils/constants.js";

export interface WatcherOptions {
  debounceSeconds?: number;
  provider?: string;
  model?: string;
  auto?: boolean;
  onExtracted?: (summary: string) => void;
}

/**
 * Appends a log line to .vee/logs/watch.log
 */
export function writeWatchLog(rootDir: string, level: string, message: string): void {
  try {
    const logsDir = path.join(rootDir, LOGS_DIR_REL);
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
    const logPath = path.join(rootDir, WATCH_LOG_FILE_REL);
    const line = `[${new Date().toISOString()}] [${level.toUpperCase()}] ${message}\n`;
    fs.appendFileSync(logPath, line, "utf-8");
  } catch {
    // ignore
  }
}

/**
 * Ambient background file watcher that observes code modifications,
 * captures Git diffs when changes settle, and saves proposals.
 */
export async function startMemoryWatcher(
  rootDir: string = process.cwd(),
  options: WatcherOptions = {}
): Promise<{ stop: () => void }> {
  const config = loadConfig(rootDir);
  const debounceTimeMs = (options.debounceSeconds || config.watch?.debounce_seconds || 5) * 1000;
  const maxCallsPerHour = config.watch?.max_calls_per_hour || 30;
  const isAuto = options.auto !== undefined ? options.auto : (config.watch?.auto || false);

  let debounceTimer: NodeJS.Timeout | null = null;
  let isProcessing = false;
  let backoffAttempts = 0;

  writeWatchLog(rootDir, "info", `Watcher started (debounce: ${debounceTimeMs / 1000}s, auto: ${isAuto})`);
  logger.title("Veeshree Ambient Memory Watcher");
  logger.info(`Watching workspace for code modifications (settle debounce: ${debounceTimeMs / 1000}s)...`);
  logger.info(`Auto-apply low risk deltas: ${isAuto ? logger.green("ENABLED") : logger.dim("DISABLED (proposals only)")}`);
  logger.info("Press Ctrl+C to stop.\n");

  async function processCodeModifications() {
    if (isProcessing) return;
    isProcessing = true;

    try {
      const state = loadWatchState(rootDir);

      // 1. Collect tracked git diff
      let diff = "";
      try {
        diff = runCommandSafe("git", ["diff", "HEAD"], { cwd: rootDir });
      } catch (err: any) {
        writeWatchLog(rootDir, "debug", `git diff HEAD error: ${err?.message || err}`);
      }

      // 2. Collect untracked files respecting denylist
      try {
        const untrackedOutput = runCommandSafe("git", ["ls-files", "--others", "--exclude-standard"], { cwd: rootDir });
        const untrackedFiles = untrackedOutput.split("\n").map((f) => f.trim()).filter(Boolean);

        for (const file of untrackedFiles.slice(0, 5)) {
          const filePath = path.join(rootDir, file);
          if (!isDenylistedFile(filePath, rootDir) && fs.existsSync(filePath)) {
            try {
              const fileContent = fs.readFileSync(filePath, "utf-8");
              diff += `\n--- /dev/null\n+++ b/${file}\n@@ -0,0 +1,50 @@\n${fileContent.slice(0, 3000)}\n`;
            } catch {
              // ignore
            }
          }
        }
      } catch {
        // ignore
      }

      if (!diff || diff.trim().length < 30) {
        return;
      }

      // 3. Diff fingerprint deduplication (BUG-8 fix)
      const fingerprint = computeDiffFingerprint(diff);
      if (fingerprint === state.lastDiffFingerprint) {
        writeWatchLog(rootDir, "debug", `Diff fingerprint unchanged (${fingerprint}). Skipping extraction.`);
        return;
      }

      // 4. Rate limiting
      if (!canMakeWatchCall(maxCallsPerHour, state)) {
        writeWatchLog(rootDir, "warn", `Hourly API ceiling reached (${maxCallsPerHour} calls/hr). Skipping.`);
        logger.warn(`[WATCH] Hourly API limit reached (${maxCallsPerHour} calls/hr). Skipping extraction.`);
        return;
      }

      // 5. Redaction and size cap
      const maxPayload = config.privacy?.max_payload_bytes || 24576;
      const redactedDiff = redactContent(diff);
      const cappedDiff = capDiffPayload(redactedDiff, maxPayload);

      writeWatchLog(rootDir, "info", `Extracting memory for changed code (${diff.split("\n").length} lines)...`);
      logger.info(`[WATCH] Detected code changes (${diff.split("\n").length} diff lines). Extracting memory...`);

      // 6. Extraction
      const delta = await extractMemoryFromContent(cappedDiff, rootDir, options.provider, options.model);

      // Increment call count
      state.callsThisHour++;
      state.lastDiffFingerprint = fingerprint;
      state.lastProcessedAt = new Date().toISOString();
      saveWatchState(state, rootDir);

      // 7. Create Proposal (SEC-1)
      const proposal = createProposal("watch", delta, "watch_daemon", rootDir);
      writeWatchLog(rootDir, "info", `Created proposal ${proposal.id} (risk: ${proposal.risk})`);

      if (isAuto && proposal.risk === "low") {
        const { reconcileResult } = await acceptProposal(proposal.id, "watch_auto", rootDir);
        const total = reconcileResult.newDecisions.length + reconcileResult.updatedFiles.length;
        logger.success(`[WATCH] Auto-applied low-risk proposal ${proposal.id} (+${reconcileResult.newDecisions.length} decisions, ${reconcileResult.updatedFiles.length} files updated).`);
        writeWatchLog(rootDir, "info", `Auto-applied proposal ${proposal.id} (${total} updates)`);
      } else {
        if (proposal.risk === "high") {
          logger.warn(`[WATCH] Generated HIGH-RISK proposal ${logger.bold(proposal.id)}. Requires human review: run 'vee review'`);
        } else {
          logger.info(`[WATCH] Generated pending proposal ${logger.bold(proposal.id)}. Review with 'vee review' or 'vee accept ${proposal.id}'`);
        }
      }

      backoffAttempts = 0;
    } catch (err: any) {
      backoffAttempts++;
      const backoffSec = Math.min(60, Math.pow(2, backoffAttempts));
      writeWatchLog(rootDir, "error", `Watch extraction failure: ${err?.message || err} (backing off ${backoffSec}s)`);
      logger.warn(`[WATCH] Extraction failed: ${err?.message || err}`);
    } finally {
      isProcessing = false;
    }
  }

  // Node 20+ recursive watch
  let watcher: fs.FSWatcher | null = null;
  try {
    watcher = fs.watch(
      rootDir,
      { recursive: true },
      (_eventType, filename) => {
        if (!filename) return;
        const normalized = filename.replace(/\\/g, "/");

        // Immediately filter out memory files, .vee, and denylisted files
        if (
          normalized.startsWith("docs/memory") ||
          normalized.startsWith(".vee") ||
          normalized.includes("node_modules") ||
          normalized.includes(".git") ||
          normalized.includes("dist") ||
          normalized.includes(".next")
        ) {
          return;
        }

        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          processCodeModifications();
        }, debounceTimeMs);
      }
    );
  } catch (watchErr: any) {
    writeWatchLog(rootDir, "error", `Recursive fs.watch failed, falling back to polling: ${watchErr.message}`);
    // Polling fallback every 2 seconds
    const interval = setInterval(() => {
      processCodeModifications();
    }, 2000);

    return {
      stop: () => {
        clearInterval(interval);
      },
    };
  }

  return {
    stop: () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      if (watcher) watcher.close();
      writeWatchLog(rootDir, "info", "Watcher stopped.");
    },
  };
}
