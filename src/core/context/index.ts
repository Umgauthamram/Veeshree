export * from "./estimator.js";
export * from "./builder.js";
export * from "./explain.js";

import { buildContext } from "./builder.js";

export function assembleContext(
  rootDir: string = process.cwd(),
  options: { request?: string; maxTokens?: number; includeTasks?: boolean } = {}
) {
  const result = buildContext(rootDir, options);
  return {
    prompt: result.prompt,
    totalEstimatedTokens: result.totalEstimatedTokens,
    includedSections: result.includedSections,
    staleWarnings: result.staleWarnings,
  };
}
