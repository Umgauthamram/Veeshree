/**
 * Pluggable token estimator with 10% safety margin heuristic.
 * ~3.8 characters per token * 1.10 safety factor.
 */
export function estimateTokens(text: string): number {
  if (!text) return 0;
  return Math.ceil((text.length / 3.8) * 1.1);
}

/**
 * Truncates text so its estimated token count fits within maxTokens.
 */
export function truncateToTokens(text: string, maxTokens: number): string {
  if (estimateTokens(text) <= maxTokens) return text;
  // Estimate character cutoff with safety
  const maxChars = Math.max(0, Math.floor((maxTokens / 1.1) * 3.8) - 40);
  return text.slice(0, maxChars) + "\n...[Truncated to preserve token budget]";
}
