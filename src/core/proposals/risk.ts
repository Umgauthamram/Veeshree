import type { ExtractionDelta } from "../../schemas/extraction.schema.js";
import type { ProposalRisk } from "../../schemas/proposal.schema.js";

const SUSPICIOUS_PATTERNS = [
  {
    name: "shell_pipe",
    regex: /(?:curl|wget|fetch|powershell|bash|sh|cmd)\b[^\n|]*\|\s*(?:sh|bash|zsh|powershell|cmd)\b/i,
  },
  {
    name: "instruction_override",
    regex: /(?:ignore\s+(?:all\s+)?previous\s+instructions|system\s+prompt\s+override|jailbreak|disregard\s+(?:prior|above|instructions))/i,
  },
  {
    name: "disable_security_checks",
    regex: /(?:disable\s+(?:verification|checks|security|auth|doctor|lint|lock|drift|rules|guardrails))/i,
  },
  {
    name: "suspicious_url",
    regex: /https?:\/\/(?:[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}|bit\.ly|t\.co|tinyurl|raw\.githubusercontent\.com\/[^\s]+(?:\.sh|\.bash|\.exe|\.ps1))/i,
  },
];

/**
 * Scans an extraction delta for security risks and compliance with Proposal Queue rules:
 * - Any constraint is scored high risk
 * - Any ADR updating/superseding an existing ADR is scored high risk
 * - Any payload containing shell execution, command injection, instruction overrides or check disablement is scored high risk
 */
export function scoreProposalRisk(delta: ExtractionDelta): { risk: ProposalRisk; flags: string[] } {
  const flags: string[] = [];

  // 1. Any constraint is automatically high risk (SEC-1)
  if (Array.isArray(delta.constraints) && delta.constraints.length > 0) {
    flags.push("contains_constraint");
  }

  // 2. Any ADR that updates or supersedes another is high risk
  if (Array.isArray(delta.decisions)) {
    for (const dec of delta.decisions) {
      if (dec.supersedes || dec.status === "superseded") {
        flags.push(`supersedes_decision:${dec.supersedes || dec.title}`);
      }
    }
  }

  // 3. Scan all strings in delta for injection and override attempts
  const allText = extractAllText(delta);
  for (const { name, regex } of SUSPICIOUS_PATTERNS) {
    if (regex.test(allText)) {
      flags.push(`suspicious_pattern:${name}`);
    }
  }

  const risk: ProposalRisk = flags.length > 0 ? "high" : "low";
  return { risk, flags };
}

export function assessDeltaRisk(delta: ExtractionDelta): { isHighRisk: boolean; reasons: string[] } {
  const { risk, flags } = scoreProposalRisk(delta);
  return { isHighRisk: risk === "high", reasons: flags };
}

function extractAllText(delta: ExtractionDelta): string {
  const chunks: string[] = [];

  if (delta.decisions) {
    for (const d of delta.decisions) {
      chunks.push(d.title, d.decision, d.reason);
      if (d.alternatives_considered) chunks.push(...d.alternatives_considered);
    }
  }

  if (delta.constraints) {
    for (const c of delta.constraints) {
      chunks.push(c.rule);
    }
  }

  if (delta.tasks) {
    for (const t of delta.tasks) {
      chunks.push(t.task_name);
    }
  }

  if (delta.current_state) {
    if (delta.current_state.current_feature) chunks.push(delta.current_state.current_feature);
    if (delta.current_state.completed_in_session) chunks.push(...delta.current_state.completed_in_session);
    if (delta.current_state.next_immediate_steps) chunks.push(...delta.current_state.next_immediate_steps);
  }

  if (delta.rejected_approaches) {
    for (const r of delta.rejected_approaches) {
      chunks.push(r.approach, r.reason);
    }
  }

  if (delta.discoveries) {
    chunks.push(...delta.discoveries);
  }

  return chunks.join("\n");
}
