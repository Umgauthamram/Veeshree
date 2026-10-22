import pc from "picocolors";
import type { ContextBuildResult } from "./builder.js";

/**
 * Formats a clear terminal summary of tier budgeting and token allocations for vee context --explain
 */
export function explainContextBudget(result: ContextBuildResult): string {
  const lines: string[] = [];

  lines.push(pc.bold(pc.cyan("=== Veeshree Context Token Allocation Breakdown ===")));
  lines.push(
    `Total Tokens: ${pc.bold(String(result.totalTokens))} / ${result.maxTokens} cap (${Math.round((result.totalTokens / result.maxTokens) * 100)}% utilized)\n`
  );

  for (const tier of result.tiers) {
    const pct = Math.round((tier.tokens / result.maxTokens) * 100);
    const status = tier.truncated ? pc.yellow("[TRUNCATED]") : pc.green("[FIT]");
    lines.push(
      `${pc.bold(tier.tier.padEnd(16))} ${String(tier.tokens).padStart(4)} tokens (cap: ${tier.cap}) [${pct}% of total] ${status}`
    );
    if (tier.notes) {
      lines.push(`  ${pc.dim(tier.notes)}`);
    }
  }

  if (result.overflowNotice) {
    lines.push(`\n${pc.yellow(result.overflowNotice)}`);
  }

  if (result.staleWarnings.length > 0) {
    lines.push(`\n${pc.yellow("Active Stale Drift Warnings:")}`);
    for (const w of result.staleWarnings) {
      lines.push(`  ${pc.yellow("!")} ${w}`);
    }
  }

  return lines.join("\n");
}
