import { searchMemory, type SearchResultItem } from "../core/search.js";
import { logger } from "../utils/logger.js";
import { VeeError } from "../utils/errors.js";

export function handleSearchCommand(
  query: string,
  options: { archived?: boolean; json?: boolean } = {},
  rootDir: string = process.cwd()
): SearchResultItem[] {
  if (options.json) logger.setJson(true);

  if (!query || !query.trim()) {
    throw new VeeError("Search query required. Usage: vee search \"<query>\"", "ERR_INVALID_ARGS");
  }

  const results = searchMemory(query, { includeArchived: options.archived }, rootDir);

  if (options.json) {
    console.log(JSON.stringify(results, null, 2));
    return results;
  }

  logger.title(`Search Results for: "${query}"`);

  if (results.length === 0) {
    logger.info("No matching memory documents found.");
    return [];
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

  return results;
}
