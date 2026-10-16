import { restoreSnapshot, listSnapshots } from "../core/snapshots/snapshot-manager.js";
import { buildIndex } from "../core/indexer.js";
import { logger } from "../utils/logger.js";

export function handleUndoCommand(stepStr?: string, rootDir: string = process.cwd()): void {
  const step = stepStr ? parseInt(stepStr, 10) : 1;
  const snapshots = listSnapshots(rootDir);

  if (snapshots.length === 0) {
    logger.info("No snapshots found in .vee/snapshots/. Nothing to undo.");
    return;
  }

  logger.title(`Undoing Last Memory Modification (Step ${step})`);
  const result = restoreSnapshot(step, rootDir);
  buildIndex(rootDir);

  logger.success(`Restored memory from snapshot ${logger.bold(result.restoredId)} (${result.timestamp}).`);
}
