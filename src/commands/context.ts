import { assembleContext } from "../core/context.js";
import { logger } from "../utils/logger.js";

export interface ContextCommandOptions {
  maxTokens?: string;
  tasks?: boolean;
  json?: boolean;
  raw?: boolean;
}

export function generateContext(
  request?: string,
  options: ContextCommandOptions = {},
  rootDir: string = process.cwd()
): void {
  const maxTokens = options.maxTokens ? parseInt(options.maxTokens, 10) : undefined;
  const result = assembleContext(rootDir, {
    request,
    maxTokens,
    includeTasks: options.tasks,
  });

  if (options.json) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  if (options.raw) {
    // Print directly for agent prompt pipelines
    console.log(result.prompt);
    return;
  }

  // Standard output
  console.log(result.prompt);

  // If there are stale warnings, write to stderr for visibility without corrupting stdout
  if (result.staleWarnings.length > 0) {
    console.error("\n" + logger.dim(`[Veeshree Notice: ${result.staleWarnings.length} record(s) flagged as stale]`));
  }
}
