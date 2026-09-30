import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { logger } from "../utils/logger.js";
import { extractMemoryFromContent } from "./extractor.js";
import { reconcileExtraction } from "./reconciler.js";
import { buildIndex } from "./indexer.js";
import { resolveActiveEngine } from "./engine-resolver.js";

export interface WatcherOptions {
  debounceMs?: number;
  provider?: string;
  model?: string;
  onExtracted?: (summary: string) => void;
}

/**
 * Ambient background file watcher that observes code modifications,
 * captures Git diffs when changes settle, and automatically updates memory.
 */
export async function startMemoryWatcher(
  rootDir: string = process.cwd(),
  options: WatcherOptions = {}
): Promise<{ stop: () => void }> {
  const debounceTime = options.debounceMs || 5000;
  let debounceTimer: NodeJS.Timeout | null = null;
  let isExtracting = false;

  logger.title("Veeshree Ambient Memory Watcher");

  // Verify engine resolution
  try {
    const engine = await resolveActiveEngine(rootDir, options.provider, options.model);
    logger.info(`Active Extraction Engine: ${logger.bold(engine.provider)} (${engine.model}) via ${engine.source}`);
  } catch (err: any) {
    logger.warn(`No active AI engine detected yet. Memory watcher will run indexing without AI extraction.`);
  }

  logger.info(`Watching workspace for code modifications (settle debounce: ${debounceTime / 1000}s)...`);
  logger.info("Press Ctrl+C to stop.\n");

  const ignoreList = [
    "node_modules",
    ".git",
    ".vee",
    "dist",
    "build",
    ".next",
    "coverage",
    ".DS_Store",
  ];

  function shouldIgnore(filePath: string): boolean {
    const normalized = filePath.replace(/\\/g, "/");
    return ignoreList.some((pattern) => normalized.includes(`/${pattern}/`) || normalized.endsWith(`/${pattern}`));
  }

  async function triggerAutonomousReconciliation() {
    if (isExtracting) return;
    isExtracting = true;

    try {
      // 1. Check if git diff exists
      let diff = "";
      try {
        diff = execSync("git diff HEAD", {
          cwd: rootDir,
          encoding: "utf-8",
          stdio: ["pipe", "pipe", "ignore"],
        });
      } catch {
        // Not a git repo or no commits yet
      }

      // Re-index code hashes
      buildIndex(rootDir);

      if (diff && diff.trim().length > 30) {
        logger.info(`[AMBIENT] Detected settled code changes (${diff.split("\n").length} diff lines). Extracting memory...`);
        try {
          const delta = await extractMemoryFromContent(diff, rootDir, options.provider, options.model);
          const report = reconcileExtraction(delta, rootDir);
          buildIndex(rootDir);

          const totalChanges = report.newDecisions.length + report.updatedFiles.length;

          if (totalChanges > 0) {
            logger.success(`[AMBIENT] Auto-updated memory: +${report.newDecisions.length} new decisions, ${report.updatedFiles.length} updated files.`);
          }
        } catch (extractErr: any) {
          logger.warn(`[AMBIENT] Background extraction skipped: ${extractErr?.message || extractErr}`);
        }
      }
    } catch {
      // ignore
    } finally {
      isExtracting = false;
    }
  }

  const watcher = fs.watch(
    rootDir,
    { recursive: true },
    (eventType, filename) => {
      if (!filename || shouldIgnore(filename)) return;

      // Reset debounce timer on every change
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        triggerAutonomousReconciliation();
      }, debounceTime);
    }
  );

  return {
    stop: () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      watcher.close();
    },
  };
}
