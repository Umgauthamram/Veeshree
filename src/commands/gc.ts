import { runGarbageCollection } from "../core/gc.js";
import { logger } from "../utils/logger.js";

export function handleGcCommand(rootDir: string = process.cwd()): void {
  logger.title("Running Memory Garbage Collection & Archival");

  const result = runGarbageCollection(rootDir);

  if (result.archivedTasksCount > 0) {
    logger.success(`Archived ${result.archivedTasksCount} old progress item(s) to docs/memory/archive/completed-tasks.md`);
  } else {
    logger.info("Progress buffer within limit (<=5 items). No task archiving needed.");
  }

  if (result.supersededDecisionsCount > 0) {
    logger.success(`Relocated ${result.supersededDecisionsCount} superseded decision(s) to docs/memory/archive/decisions/:`);
    for (const d of result.relocatedDecisions) {
      console.log(`  - ${logger.dim(d)}`);
    }
  } else {
    logger.info("No superseded decision records found.");
  }

  logger.success("Memory index synchronized and cleaned.");
}
