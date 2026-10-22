import { runGarbageCollection, type GCResult } from "../core/gc.js";
import { logger } from "../utils/logger.js";

export function handleGcCommand(
  options: { dryRun?: boolean } = {},
  rootDir: string = process.cwd()
): GCResult {
  if (options.dryRun) {
    logger.info("[DRY-RUN] Simulating Garbage Collection & Archival...");
  } else {
    logger.title("Running Memory Garbage Collection & Archival");
  }

  const result = runGarbageCollection(rootDir, { dryRun: options.dryRun });

  if (result.archivedTasksCount > 0) {
    logger.success(
      `${options.dryRun ? "Would archive" : "Archived"} ${result.archivedTasksCount} old progress item(s) to docs/memory/archive/completed-tasks.md`
    );
  } else {
    logger.info("Progress buffer within limit. No task archiving needed.");
  }

  if (result.supersededDecisionsCount > 0) {
    logger.success(
      `${options.dryRun ? "Would relocate" : "Relocated"} ${result.supersededDecisionsCount} superseded decision(s) to docs/memory/archive/decisions/:`
    );
    for (const d of result.relocatedDecisions) {
      logger.log(`  - ${logger.dim(d)}`);
    }
  } else {
    logger.info("No superseded decision records found.");
  }

  return result;
}
