import fs from "node:fs";
import path from "node:path";
import type {
  IndexDocument,
  ContextAssembleOptions,
  ContextAssembleResult,
} from "../types/index.js";
import { loadOrBuildIndex, buildIndex, createSearchEngine } from "./indexer.js";
import { loadConfig } from "./config.js";
import {
  CURRENT_STATE_FILE_REL,
  CONSTRAINTS_FILE_REL,
  TASKS_FILE_REL,
} from "../utils/constants.js";

/**
 * Approximate token count helper (~4 characters per token heuristic with safety margin)
 */
export function estimateTokens(text: string): number {
  if (!text) return 0;
  return Math.ceil(text.length / 3.8);
}

/**
 * Truncate text to fit within a given token budget
 */
export function truncateToTokens(text: string, maxTokens: number): string {
  if (estimateTokens(text) <= maxTokens) return text;
  const maxChars = Math.floor(maxTokens * 3.8);
  return text.slice(0, maxChars) + "\n\n...[Truncated to preserve token budget]";
}

/**
 * Builds the pre-formatted system prompt payload strictly obeying the token budget
 */
export function assembleContext(
  rootDir: string = process.cwd(),
  options: ContextAssembleOptions = {}
): ContextAssembleResult {
  const config = loadConfig(rootDir);
  const maxTokens = options.maxTokens || config.settings?.max_context_tokens || 2000;
  let request = options.request || "";

  // Auto-detect intent if request was omitted by inspecting current-state.md or git
  if (!request.trim()) {
    const currentStatePath = path.join(rootDir, CURRENT_STATE_FILE_REL);
    if (fs.existsSync(currentStatePath)) {
      const stateContent = fs.readFileSync(currentStatePath, "utf-8");
      const focusMatch = stateContent.match(/- \*\*Current Focus\*\*: (.+)/);
      if (focusMatch) {
        request = focusMatch[1].trim();
      }
    }
  }

  let remainingTokens = maxTokens;
  const staleWarnings: string[] = [];


  // Section 1: System Rules & Preamble (~300 tokens budget) - NEVER TRUNCATED
  const systemRulesText = `## VEESHREE PERSISTENCE LAYER: SYSTEM CONTEXT & RULES
You are operating within a project utilizing Veeshree for model-independent memory persistence.
1. All architectural decisions, constraints, and current milestones are persistent across AI sessions.
2. You must respect all Hard Constraints listed below. Do not propose architectures that contradict recorded decisions.
3. If an Architectural Decision Record is flagged as STALE (code changed), verify current implementations before assuming validity.
4. Keep all responses aligned with active project state.`;

  const systemRulesTokens = estimateTokens(systemRulesText);
  remainingTokens -= systemRulesTokens;

  // Section 2: Hard & Soft Constraints (~200 tokens budget) - CRITICAL, NEVER TRUNCATED
  let constraintsText = "";
  const constraintsPath = path.join(rootDir, CONSTRAINTS_FILE_REL);
  if (fs.existsSync(constraintsPath)) {
    constraintsText = fs.readFileSync(constraintsPath, "utf-8").trim();
  }
  const constraintsTokens = estimateTokens(constraintsText);
  remainingTokens -= constraintsTokens;

  // Section 3: Current Project State (~400 tokens budget) - HIGH PRIORITY
  let currentStateText = "";
  const currentStatePath = path.join(rootDir, CURRENT_STATE_FILE_REL);
  if (fs.existsSync(currentStatePath)) {
    currentStateText = fs.readFileSync(currentStatePath, "utf-8").trim();
  }
  // Cap current state to max 450 tokens if unusually large
  if (estimateTokens(currentStateText) > 450) {
    currentStateText = truncateToTokens(currentStateText, 450);
  }
  const currentStateTokens = estimateTokens(currentStateText);
  remainingTokens -= currentStateTokens;

  // Section 4: Tasks (Optional or Compact)
  let tasksText = "";
  let tasksTokens = 0;
  if (options.includeTasks) {
    const tasksPath = path.join(rootDir, TASKS_FILE_REL);
    if (fs.existsSync(tasksPath)) {
      tasksText = truncateToTokens(fs.readFileSync(tasksPath, "utf-8").trim(), 250);
      tasksTokens = estimateTokens(tasksText);
      remainingTokens -= tasksTokens;
    }
  }

  // Section 5: Dynamic Decision Retrieval via BM25 Search (Remaining Tokens Budget ~1,000 - 1,200)
  const indexData = buildIndex(rootDir);
  // Filter active decisions only (excluding archive)
  const activeDecisions = indexData.documents.filter(
    (d) => d.type === "decision" && d.status === "active"
  );

  let matchedDecisions: IndexDocument[] = [];
  if (request.trim().length > 0 && activeDecisions.length > 0) {
    const searchEngine = createSearchEngine(activeDecisions);
    const searchResults = searchEngine.search(request);
    matchedDecisions = searchResults.map((r) => {
      return activeDecisions.find((d) => d.id === r.id)!;
    }).filter(Boolean);
  }

  // If no specific matches or no query provided, include recent active decisions
  if (matchedDecisions.length === 0) {
    matchedDecisions = activeDecisions;
  }

  const selectedDecisionBlocks: string[] = [];
  let decisionsTokens = 0;

  for (const doc of matchedDecisions) {
    let warningBlock = "";
    if (doc.stale) {
      const warning = `[WARNING: Linked source files (${doc.linked_files.join(", ")}) have changed since this decision was recorded. Verify implementation.]`;
      warningBlock = `\n> ⚠️ **STALE RECORD NOTICE**: ${warning}\n`;
      staleWarnings.push(`${doc.title} (${doc.path})`);
    }

    const docBlock = `### Decision: ${doc.title} (${doc.path})${warningBlock}\n${doc.content}`;
    const docTokens = estimateTokens(docBlock);

    if (remainingTokens - docTokens >= 50) {
      selectedDecisionBlocks.push(docBlock);
      decisionsTokens += docTokens;
      remainingTokens -= docTokens;
    } else if (remainingTokens > 100) {
      // Partial truncation for the last candidate
      const truncatedDoc = truncateToTokens(docBlock, remainingTokens - 20);
      selectedDecisionBlocks.push(truncatedDoc);
      const addedTokens = estimateTokens(truncatedDoc);
      decisionsTokens += addedTokens;
      remainingTokens -= addedTokens;
      break;
    } else {
      break;
    }
  }

  // Assemble full prompt
  const sections: string[] = [
    systemRulesText,
    constraintsText ? `## ACTIVE ARCHITECTURAL CONSTRAINTS\n${constraintsText.replace(/^#\s+[^\n]*\n+/m, "")}` : "",
    currentStateText ? `## ACTIVE PROJECT STATE SNAPSHOT\n${currentStateText.replace(/^#\s+[^\n]*\n+/m, "")}` : "",
    tasksText ? `## CURRENT TASKS\n${tasksText.replace(/^#\s+[^\n]*\n+/m, "")}` : "",
    selectedDecisionBlocks.length > 0
      ? `## RELEVANT ARCHITECTURAL DECISION RECORDS (ADRs)\n${selectedDecisionBlocks.join("\n\n---\n\n")}`
      : "",
  ].filter(Boolean);


  const finalPrompt = sections.join("\n\n==================================================\n\n");
  const totalEstimatedTokens = estimateTokens(finalPrompt);

  return {
    prompt: finalPrompt,
    totalEstimatedTokens,
    includedSections: {
      systemRules: systemRulesTokens,
      constraints: constraintsTokens,
      currentState: currentStateTokens,
      tasks: tasksTokens,
      decisionsCount: selectedDecisionBlocks.length,
      decisionsTokens,
    },
    staleWarnings,
  };
}
