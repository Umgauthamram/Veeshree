import {
  buildContext,
  explainContextBudget,
  type ContextBuildResult,
} from "../core/context/index.js";
import { logger } from "../utils/logger.js";

export interface ContextCommandOptions {
  maxTokens?: string | number;
  tasks?: boolean;
  json?: boolean;
  raw?: boolean;
  explain?: boolean;
  format?: "markdown" | "json" | "xml";
}

export function generateContext(
  request?: string,
  options: ContextCommandOptions = {},
  rootDir: string = process.cwd()
): ContextBuildResult {
  const isJson = options.json || logger.isJson();
  if (isJson) logger.setJson(true);

  const maxTokens = options.maxTokens ? parseInt(String(options.maxTokens), 10) : undefined;
  const format = isJson ? "json" : options.format || "markdown";

  const result = buildContext(rootDir, {
    request,
    maxTokens,
    includeTasks: options.tasks,
    format,
  });

  if (options.explain) {
    if (isJson) {
      logger.json(result);
    } else {
      logger.raw(explainContextBudget(result));
    }
    return result;
  }

  if (options.raw || isJson || options.format === "xml") {
    process.stdout.write(result.content + "\n");
    return result;
  }

  if (result.overflowNotice) {
    logger.warn(result.overflowNotice);
  }

  if (result.staleWarnings.length > 0) {
    logger.warn(
      `Stale Drift Detected: ${result.staleWarnings.length} decision(s) reference drifted code:`
    );
    for (const w of result.staleWarnings) {
      console.error(logger.dim(`  * ${w}`));
    }
  }

  process.stdout.write(result.content + "\n");
  return result;
}
