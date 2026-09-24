import { searchMemory } from "../core/search.js";
import { logger } from "../utils/logger.js";

export function handleSearchCommand(
  query: string,
  options: { archived?: boolean; json?: boolean } = {},
  rootDir: string = process.cwd()
): void {
  if (!query || !query.trim()) {
    logger.error("Search query required. Usage: vee search \"<query>\"");
    process.exit(1);
  }

  const results = searchMemory(query, { includeArchived: options.archived }, rootDir);

  if (options.json) {
    console.log(JSON.stringify(results, null, 2));
    return;
  }

  logger.title(`Search Results for: "${query}"`);

  if (results.length === 0) {
    logger.info("No matching memory documents found.");
    return;
  }

  for (const item of results) {
    const statusTag = item.status === "active" ? logger.cyan(`[${item.status}]`) : logger.dim(`[${item.status}]`);
    console.log(`${logger.bold(item.title)} ${statusTag} (Score: ${item.score})`);
    console.log(`  Path: ${logger.dim(item.path)}`);
    if (item.tags.length > 0) {
      console.log(`  Tags: ${logger.dim(item.tags.join(", "))}`);
    }
    console.log(`  ${item.snippet}`);
    console.log("");
  }
}
