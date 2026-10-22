import { searchMemory, type SearchResultItem } from "../core/search.js";
import { logger } from "../utils/logger.js";
import { VeeError } from "../utils/errors.js";

export function handleSearchCommand(
  query: string,
  options: { archived?: boolean; json?: boolean } = {},
  rootDir: string = process.cwd()
): SearchResultItem[] {
  const isJson = Boolean(options.json || logger.isJson());
  if (isJson) logger.setJson(true);

  if (!query || !query.trim()) {
    throw new VeeError('Search query required. Usage: vee search "<query>"', "ERR_INVALID_ARGS");
  }

  const results = searchMemory(query, { includeArchived: options.archived }, rootDir);

  if (isJson) {
    logger.json(results);
    return results;
  }

  logger.title(`Search Results for: "${query}"`);

  if (results.length === 0) {
    logger.info("No matching memory documents found.");
    return [];
  }

  for (const item of results) {
    const statusTag =
      item.status === "active" ? logger.cyan(`[${item.status}]`) : logger.dim(`[${item.status}]`);
    logger.log(`${logger.bold(item.title)} ${statusTag} (Score: ${item.score})`);
    logger.log(`  Path: ${logger.dim(item.path)}`);
    if (item.tags.length > 0) {
      logger.log(`  Tags: ${logger.dim(item.tags.join(", "))}`);
    }
    logger.log(`  ${item.snippet}`);
    logger.log("");
  }

  return results;
}
