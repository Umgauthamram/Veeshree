import { loadOrBuildIndex } from "../core/indexer.js";
import { logger } from "../utils/logger.js";

export function handleDecisionsCommand(
  options: { all?: boolean; status?: string } = {},
  rootDir: string = process.cwd()
): void {
  const indexData = loadOrBuildIndex(rootDir);

  let decisions = indexData.documents.filter(
    (d) => d.type === "decision" || d.type === "archived_decision"
  );

  if (options.status) {
    decisions = decisions.filter((d) => d.status === options.status);
  } else if (!options.all) {
    // Default to active decisions only
    decisions = decisions.filter((d) => d.status === "active");
  }

  logger.title("Architectural Decision Records (ADRs)");

  if (decisions.length === 0) {
    logger.info("No architectural decision records found.");
    return;
  }

  for (const doc of decisions) {
    const statusBadge =
      doc.status === "active"
        ? logger.cyan("[ACTIVE]")
        : doc.status === "superseded"
        ? logger.yellow("[SUPERSEDED]")
        : logger.dim(`[${doc.status.toUpperCase()}]`);

    const driftBadge = doc.stale ? logger.warn(" [STALE CODE DRIFT]") : "";

    console.log(`${logger.bold(doc.title)} ${statusBadge}${driftBadge}`);
    console.log(`  File:   ${logger.dim(doc.path)}`);
    if (doc.tags.length > 0) {
      console.log(`  Tags:   ${logger.dim(doc.tags.join(", "))}`);
    }
    if (doc.linked_files.length > 0) {
      console.log(`  Linked: ${logger.dim(doc.linked_files.join(", "))}`);
    }
    console.log("");
  }
}
