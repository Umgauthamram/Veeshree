import { estimateTokens, truncateToTokens } from "./context/estimator.js";
import { buildContext, type ContextBuildOptions, type ContextBuildResult } from "./context/builder.js";
import type { ContextAssembleOptions, ContextAssembleResult } from "../types/index.js";

export { estimateTokens, truncateToTokens, buildContext };
export { explainContextBudget } from "./context/explain.js";

/**
 * Builds the pre-formatted system prompt payload strictly obeying the token budget
 * Backward-compatible function for Phase 2 tests and commands.
 */
export function assembleContext(
  rootDir: string = process.cwd(),
  options: ContextAssembleOptions = {}
): ContextAssembleResult {
  const result = buildContext(rootDir, {
    request: options.request,
    maxTokens: options.maxTokens,
    includeTasks: options.includeTasks,
  });

  return {
    prompt: result.prompt,
    totalEstimatedTokens: result.totalEstimatedTokens,
    includedSections: result.includedSections,
    staleWarnings: result.staleWarnings,
  };
}
