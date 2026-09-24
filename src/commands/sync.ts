import { logger } from "../utils/logger.js";
import { buildIndex } from "../core/indexer.js";

export function syncVeeshree(rootDir: string = process.cwd()): void {
  logger.title("Synchronizing Veeshree Memory & Code Hashes");

  const indexData = buildIndex(rootDir);

  logger.info(`Indexed ${logger.bold(String(indexData.documents.length))} memory documents.`);

  let staleCount = 0;
  for (const doc of indexData.documents) {
    if (doc.stale) {
      staleCount++;
      logger.warn(`Stale drift detected in: ${logger.bold(doc.path)} (linked files: ${doc.linked_files.join(", ")})`);
    }
  }

  if (staleCount === 0) {
    logger.success("All memory records are in sync with codebase hashes.");
  } else {
    logger.warn(`Found ${staleCount} stale record(s). Code has drifted from memory decisions.`);
  }

  logger.success("Saved updated index to .vee/index.json");
}
