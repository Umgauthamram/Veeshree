import fs from "node:fs";
import path from "node:path";
import { loadConfig } from "../core/config.js";
import { checkWorkspaceDrift, type WorkspaceDriftReport } from "../core/drift/status.js";
import { listProposals } from "../core/proposals/queue.js";
import { logger } from "../utils/logger.js";
import { TASKS_FILE_REL, CURRENT_STATE_FILE_REL } from "../utils/constants.js";

export interface StatusOptions {
  check?: boolean;
  json?: boolean;
  quiet?: boolean;
}

export interface StatusResult {
  currentFocus: string;
  completedTasks: number;
  totalTasks: number;
  activeDecisionsCount: number;
  supersededDecisionsCount: number;
  driftReport: WorkspaceDriftReport;
  pendingProposalsCount: number;
  exitCode: number;
}

export function handleStatusCommand(
  options: StatusOptions = {},
  rootDir: string = process.cwd()
): StatusResult {
  if (options.quiet) logger.setQuiet(true);
  if (options.json) logger.setJson(true);

  const config = loadConfig(rootDir);
  // Re-hash live files (Fix BUG-2: never read a stale cache in status --check!)
  const driftReport = checkWorkspaceDrift(rootDir);

  let activeDecisionsCount = 0;
  let supersededDecisionsCount = 0;
  for (const r of driftReport.records) {
    if (r.status === "active") activeDecisionsCount++;
    if (r.status === "superseded") supersededDecisionsCount++;
  }

  // Parse task progress
  let completedTasks = 0;
  let totalTasks = 0;
  const tasksPath = path.join(rootDir, TASKS_FILE_REL);
  if (fs.existsSync(tasksPath)) {
    const tasksContent = fs.readFileSync(tasksPath, "utf-8");
    const completedMatches = tasksContent.match(/- \[x\]/gi);
    const pendingMatches = tasksContent.match(/- \[ \]/gi);
    completedTasks = completedMatches ? completedMatches.length : 0;
    const pendingTasks = pendingMatches ? pendingMatches.length : 0;
    totalTasks = completedTasks + pendingTasks;
  }

  // Extract current feature focus
  let currentFocus = "General Development";
  const currentStatePath = path.join(rootDir, CURRENT_STATE_FILE_REL);
  if (fs.existsSync(currentStatePath)) {
    const stateContent = fs.readFileSync(currentStatePath, "utf-8");
    const focusMatch = stateContent.match(/- \*\*Current Focus\*\*: (.+)/);
    if (focusMatch && focusMatch[1]) currentFocus = focusMatch[1].trim();
  }

  const pendingProposals = listProposals(rootDir, "pending");

  const percent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const progressBar = renderProgressBar(percent);

  const exitCode = options.check && driftReport.hasDrift ? 1 : 0;

  if (options.json) {
    console.log(
      JSON.stringify(
        {
          currentFocus,
          tasks: { completed: completedTasks, total: totalTasks, percent },
          decisions: { active: activeDecisionsCount, superseded: supersededDecisionsCount },
          pendingProposals: pendingProposals.length,
          drift: driftReport,
        },
        null,
        2
      )
    );
    return {
      currentFocus,
      completedTasks,
      totalTasks,
      activeDecisionsCount,
      supersededDecisionsCount,
      driftReport,
      pendingProposalsCount: pendingProposals.length,
      exitCode,
    };
  }

  logger.title("Veeshree Project Memory Status");

  console.log(`${logger.bold("Active Focus:")}       ${logger.cyan(currentFocus)}`);
  console.log(`${logger.bold("Task Progress:")}      ${progressBar} ${percent}% (${completedTasks}/${totalTasks} tasks)`);
  console.log(`${logger.bold("Active Decisions:")}   ${activeDecisionsCount} active (${supersededDecisionsCount} superseded/archived)`);
  console.log(`${logger.bold("Extractor Model:")}    ${config.extractor?.provider || "gemini"} (${config.extractor?.model || "default"})`);
  console.log(`${logger.bold("Token Budget:")}       ${config.context?.max_tokens || 2000} max tokens`);

  console.log("");
  if (!driftReport.hasDrift) {
    logger.success("Memory Integrity: All linked code hashes are in sync (0 stale drift).");
  } else {
    logger.warn(`Memory Integrity: ${driftReport.driftedRecordsCount} record(s) flagged with stale code drift:`);
    for (const r of driftReport.records) {
      if (r.isDrifted) {
        console.log(`  - ${logger.yellow(`${r.title} (${r.path})`)}`);
      }
    }
  }

  // Pending proposals reminder (Section 3.4)
  if (pendingProposals.length > 0) {
    console.log("");
    logger.info(`Review Queue: ${logger.bold(String(pendingProposals.length))} proposal(s) pending approval. Run 'vee review' or 'vee accept <id>'.`);
  }

  console.log("");

  return {
    currentFocus,
    completedTasks,
    totalTasks,
    activeDecisionsCount,
    supersededDecisionsCount,
    driftReport,
    pendingProposalsCount: pendingProposals.length,
    exitCode,
  };
}

function renderProgressBar(percent: number, length: number = 16): string {
  const filledLength = Math.round((length * percent) / 100);
  const emptyLength = length - filledLength;
  const filled = "█".repeat(filledLength);
  const empty = "░".repeat(emptyLength);
  return `[${filled}${empty}]`;
}
