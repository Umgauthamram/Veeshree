import fs from "node:fs";
import path from "node:path";
import { estimateTokens, truncateToTokens } from "./estimator.js";
import { loadConfig } from "../config.js";
import { checkWorkspaceDrift } from "../drift/status.js";
import { buildIndex, createSearchEngine } from "../indexer.js";
import type { IndexDocument } from "../../types/index.js";
import {
  CURRENT_STATE_FILE_REL,
  CONSTRAINTS_FILE_REL,
  TASKS_FILE_REL,
  DEFAULT_MAX_CONTEXT_TOKENS,
  DEFAULT_CONSTRAINTS_CAP,
  DEFAULT_STATE_CAP,
  DEFAULT_DECISIONS_CAP,
  DEFAULT_TASKS_CAP,
} from "../../utils/constants.js";

export interface ContextBuildOptions {
  request?: string;
  maxTokens?: number;
  includeTasks?: boolean;
  format?: "markdown" | "json" | "xml";
}

export interface TierUsage {
  tier: string;
  tokens: number;
  cap: number;
  truncated: boolean;
  notes?: string;
}

export interface ContextBuildResult {
  content: string;
  totalTokens: number;
  maxTokens: number;
  tiers: TierUsage[];
  staleWarnings: string[];
  overflowNotice?: string;
  // Backward compatibility with 0.3.x
  prompt: string;
  totalEstimatedTokens: number;
  includedSections: {
    systemRules: number;
    constraints: number;
    currentState: number;
    tasks: number;
    decisionsCount: number;
    decisionsTokens: number;
  };
}

/**
 * Parses constraints into prioritized list (pinned first, then hard, then soft).
 */
function parsePrioritizedConstraints(
  rawMarkdown: string
): { rule: string; isPinned: boolean; isHard: boolean }[] {
  const lines = rawMarkdown.split("\n");
  const result: { rule: string; isPinned: boolean; isHard: boolean }[] = [];

  let currentSection = "hard";
  for (const line of lines) {
    const trimmed = line.trim();
    if (/##\s*Soft Guidelines/i.test(trimmed)) {
      currentSection = "soft";
      continue;
    } else if (/##\s*Hard Constraints/i.test(trimmed)) {
      currentSection = "hard";
      continue;
    }

    if (trimmed.startsWith("-")) {
      const isPinned = trimmed.includes("[pin]") || trimmed.includes("(pin)");
      const isHard = currentSection === "hard" || trimmed.toLowerCase().includes("**rule**");
      result.push({
        rule: trimmed,
        isPinned,
        isHard,
      });
    }
  }

  // Sort: pinned first (descending), then hard (descending)
  return result.sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    if (a.isHard && !b.isHard) return -1;
    if (!a.isHard && b.isHard) return 1;
    return 0;
  });
}

/**
 * Builds token-budgeted prompt context obeying per-tier caps and total ceiling.
 */
export function buildContext(
  rootDir: string = process.cwd(),
  options: ContextBuildOptions = {}
): ContextBuildResult {
  const config = loadConfig(rootDir);

  const totalCap =
    options.maxTokens ||
    config.context?.max_tokens ||
    config.settings?.max_context_tokens ||
    DEFAULT_MAX_CONTEXT_TOKENS;

  const constraintsCap = config.context?.constraints_cap || DEFAULT_CONSTRAINTS_CAP;
  const stateCap = config.context?.state_cap || DEFAULT_STATE_CAP;
  const decisionsCap = config.context?.decisions_cap || DEFAULT_DECISIONS_CAP;
  const tasksCap = DEFAULT_TASKS_CAP;

  const tiers: TierUsage[] = [];
  const staleWarnings: string[] = [];
  let overflowNotice: string | undefined;

  // 1. System Preamble (~150 tokens)
  const systemRulesText = `## VEESHREE PERSISTENCE LAYER: SYSTEM CONTEXT & RULES
You are operating within a project utilizing Veeshree for model-independent memory persistence.
1. All architectural decisions, constraints, and current milestones are persistent across AI sessions.
2. You must respect all Hard Constraints listed below. Do not propose architectures that contradict recorded decisions.
3. If an Architectural Decision Record is flagged as STALE (code changed), verify current implementations before assuming validity.
4. Keep all responses aligned with active project state.`;

  const systemRulesTokens = estimateTokens(systemRulesText);
  tiers.push({
    tier: "System Rules",
    tokens: systemRulesTokens,
    cap: 200,
    truncated: false,
  });

  // 2. Constraints Tier (strictly capped at constraintsCap)
  let constraintsText = "";
  const constraintsPath = path.join(rootDir, CONSTRAINTS_FILE_REL);
  let constraintsTokens = 0;
  let constraintsTruncated = false;

  if (fs.existsSync(constraintsPath)) {
    const rawConstraints = fs.readFileSync(constraintsPath, "utf-8").trim();
    const prioritized = parsePrioritizedConstraints(rawConstraints);

    const keptRules: string[] = [];
    let currentTokens = estimateTokens("## Constraints\n");

    for (const ruleObj of prioritized) {
      const lineTokens = estimateTokens(ruleObj.rule + "\n");
      if (currentTokens + lineTokens > constraintsCap && !ruleObj.isPinned) {
        constraintsTruncated = true;
        continue;
      }
      keptRules.push(ruleObj.rule);
      currentTokens += lineTokens;
    }

    if (constraintsTruncated) {
      overflowNotice = `[NOTICE] Constraints tier exceeded ${constraintsCap} token budget. ${prioritized.length - keptRules.length} lower-priority rule(s) dropped.`;
    }

    constraintsText = `## ACTIVE ARCHITECTURAL CONSTRAINTS\n${keptRules.join("\n")}`;
    constraintsTokens = estimateTokens(constraintsText);
  }

  tiers.push({
    tier: "Constraints",
    tokens: constraintsTokens,
    cap: constraintsCap,
    truncated: constraintsTruncated,
    notes: overflowNotice,
  });

  // 3. Current Project State Tier (strictly capped at stateCap)
  let currentStateText = "";
  let currentStateTokens = 0;
  let stateTruncated = false;
  const currentStatePath = path.join(rootDir, CURRENT_STATE_FILE_REL);

  if (fs.existsSync(currentStatePath)) {
    let rawState = fs.readFileSync(currentStatePath, "utf-8").trim();
    if (estimateTokens(rawState) > stateCap) {
      rawState = truncateToTokens(rawState, stateCap);
      stateTruncated = true;
    }
    if (!rawState.includes("ACTIVE PROJECT STATE SNAPSHOT")) {
      currentStateText = `## ACTIVE PROJECT STATE SNAPSHOT\n${rawState}`;
    } else {
      currentStateText = rawState;
    }
    currentStateTokens = estimateTokens(currentStateText);
  }

  tiers.push({
    tier: "Current State",
    tokens: currentStateTokens,
    cap: stateCap,
    truncated: stateTruncated,
  });

  // 4. Tasks Tier (Optional)
  let tasksText = "";
  let tasksTokens = 0;
  if (options.includeTasks) {
    const tasksPath = path.join(rootDir, TASKS_FILE_REL);
    if (fs.existsSync(tasksPath)) {
      tasksText = truncateToTokens(fs.readFileSync(tasksPath, "utf-8").trim(), tasksCap);
      tasksTokens = estimateTokens(tasksText);
    }
  }

  if (options.includeTasks) {
    tiers.push({
      tier: "Tasks",
      tokens: tasksTokens,
      cap: tasksCap,
      truncated: false,
    });
  }

  // Check live drift warnings for ADRs
  const driftReport = checkWorkspaceDrift(rootDir);
  for (const r of driftReport.records) {
    if (r.isDrifted) {
      const driftedFiles = r.files.filter((f) => f.status !== "ok").map((f) => f.path);
      staleWarnings.push(
        `STALE ADR [${r.id}]: '${r.title}' (drifted files: ${driftedFiles.join(", ")})`
      );
    }
  }

  // 5. Relevant Decisions Tier (budgeted with remaining space up to decisionsCap)
  const usedSoFar = systemRulesTokens + constraintsTokens + currentStateTokens + tasksTokens;
  const decisionsBudget = Math.min(decisionsCap, Math.max(200, totalCap - usedSoFar));

  const indexData = buildIndex(rootDir);
  let activeDecisions = indexData.documents.filter(
    (d) => d.type === "decision" && d.status === "active"
  );

  const query = options.request;
  if (query && query.trim() && activeDecisions.length > 0) {
    try {
      const searchEngine = createSearchEngine(activeDecisions);
      const searchResults = searchEngine.search(query);
      if (searchResults.length > 0) {
        const scoredIds = new Set(searchResults.map((r) => r.id));
        const matched = searchResults
          .map((r) => activeDecisions.find((d) => d.id === r.id))
          .filter((d): d is IndexDocument => Boolean(d));
        const unmatched = activeDecisions.filter((d) => !scoredIds.has(d.id));
        activeDecisions = [...matched, ...unmatched];
      }
    } catch {
      // If search fails, fallback to natural order
    }
  }

  let decisionsText = "";
  let decisionsTokens = 0;
  let decisionsCount = 0;

  if (activeDecisions.length > 0) {
    const keptDecisions: string[] = [];
    let currentDecisionsTokens = 0;

    for (const dec of activeDecisions) {
      const isStale = driftReport.records.some((r) => r.id === dec.id && r.isDrifted);
      const stalePrefix = isStale
        ? "> [!WARNING] STALE RECORD NOTICE: Code has drifted from this decision!\n\n"
        : "";
      const decBlock = `### ${dec.title}\n${stalePrefix}${dec.content}`;
      const blockTokens = estimateTokens(decBlock + "\n\n");

      if (currentDecisionsTokens + blockTokens > decisionsBudget && keptDecisions.length > 0) {
        break;
      }

      keptDecisions.push(decBlock);
      currentDecisionsTokens += blockTokens;
      decisionsCount++;
    }

    if (keptDecisions.length > 0) {
      decisionsText = `## Active Architectural Decisions\n\n${keptDecisions.join("\n\n")}`;
      decisionsTokens = estimateTokens(decisionsText);
    }
  }

  tiers.push({
    tier: "Decisions",
    tokens: decisionsTokens,
    cap: decisionsBudget,
    truncated: decisionsCount < activeDecisions.length,
  });

  // Assemble components
  const sections = [systemRulesText, constraintsText, currentStateText];
  if (tasksText) sections.push(tasksText);
  if (decisionsText) sections.push(decisionsText);

  let rawAssembled = sections.filter(Boolean).join("\n\n");

  // Final trim pass: guarantee rawAssembled <= totalCap
  if (estimateTokens(rawAssembled) > totalCap) {
    rawAssembled = truncateToTokens(rawAssembled, totalCap);
  }

  const finalTotalTokens = estimateTokens(rawAssembled);

  // Format selection
  let formattedOutput = rawAssembled;
  const requestedFormat = options.format || "markdown";

  if (requestedFormat === "json") {
    formattedOutput = JSON.stringify(
      {
        total_tokens: finalTotalTokens,
        budget_limit: totalCap,
        tiers,
        stale_warnings: staleWarnings,
        content: rawAssembled,
      },
      null,
      2
    );
  } else if (requestedFormat === "xml") {
    formattedOutput = `<veeshree_context tokens="${finalTotalTokens}" max="${totalCap}">
  <system_rules>${escapeXml(systemRulesText)}</system_rules>
  <constraints>${escapeXml(constraintsText)}</constraints>
  <current_state>${escapeXml(currentStateText)}</current_state>
  ${tasksText ? `<tasks>${escapeXml(tasksText)}</tasks>` : ""}
  ${decisionsText ? `<decisions>${escapeXml(decisionsText)}</decisions>` : ""}
</veeshree_context>`;
  }

  return {
    content: formattedOutput,
    totalTokens: finalTotalTokens,
    maxTokens: totalCap,
    tiers,
    staleWarnings,
    overflowNotice,
    // Backward compat fields
    prompt: formattedOutput,
    totalEstimatedTokens: finalTotalTokens,
    includedSections: {
      systemRules: systemRulesTokens,
      constraints: constraintsTokens,
      currentState: currentStateTokens,
      tasks: tasksTokens,
      decisionsCount,
      decisionsTokens,
    },
  };
}

function escapeXml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
