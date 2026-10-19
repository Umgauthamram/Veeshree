import type { ExtractionDelta } from "../../schemas/extraction.schema.js";
import type { ProposalRisk } from "../../schemas/proposal.schema.js";

const SUSPICIOUS_PATTERNS = [
  {
    name: "eval_execution",
    regex: /\beval\b/i,
  },
  {
    name: "command_substitution",
    regex: /\$\([^\)]+\)/i,
  },
  {
    name: "bash_execution",
    regex: /\b(?:bash|sh|zsh|powershell|pwsh|cmd)\s+-(?:c|command|\/c)\b/i,
  },
  {
    name: "remote_fetch",
    regex: /\b(?:curl|wget|fetch|Invoke-WebRequest|Invoke-RestMethod)\b/i,
  },
  {
    name: "shell_pipe",
    regex: /(?:curl|wget|fetch|powershell|bash|sh|cmd)\b[^\n|]*\|\s*(?:sh|bash|zsh|powershell|cmd)\b/i,
  },
  {
    name: "base64_shell",
    regex: /(?:base64\s+-(?:d|-decode)|atob|Buffer\.from\([^)]*base64)/i,
  },
  {
    name: "privilege_elevation",
    regex: /\b(?:sudo|chmod\s+\+?x|chmod\s+[0-7]{3,4}|chown)\b/i,
  },
  {
    name: "destructive_command",
    regex: /\b(?:rm\s+-[a-zA-Z]*r[a-zA-Z]*f|del\s+\/[a-zA-Z]*s|rmdir\s+\/[a-zA-Z]*s|format\s+[a-zA-Z]:)\b/i,
  },
  {
    name: "instruction_override",
    regex: /(?:ignore|disregard|forget|bypass|override|drop)\s+(?:all\s+)?(?:previous|prior|system|developer|safety|security)?\s*(?:instructions|rules|constraints|prompt|guidelines|guardrails)/i,
  },
  {
    name: "disable_security_checks",
    regex: /(?:disable\s+(?:verification|checks|security|auth|doctor|lint|lock|drift|rules|guardrails))/i,
  },
  {
    name: "url_link",
    regex: /https?:\/\/[^\s"'>]+/i,
  },
];

export interface RiskScoringOptions {
  allowlist?: string[];
}

/**
 * Scans an extraction delta for security risks and compliance with Proposal Queue rules:
 * - Any constraint is scored high risk
 * - Any ADR updating/superseding an existing ADR is scored high risk
 * - Any payload containing shell execution, command injection, instruction overrides or check disablement is scored high risk
 */
export function scoreProposalRisk(
  delta: ExtractionDelta,
  options: RiskScoringOptions = {}
): { risk: ProposalRisk; flags: string[] } {
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
  const allowlistSet = new Set((options.allowlist || []).map((w) => w.toLowerCase()));

  for (const { name, regex } of SUSPICIOUS_PATTERNS) {
    const match = regex.exec(allText);
    if (match) {
      const matchedWord = match[0].toLowerCase();
      if (!allowlistSet.has(matchedWord)) {
        flags.push(`suspicious_pattern:${name}`);
      }
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
