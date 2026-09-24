import fs from "node:fs";
import path from "node:path";
import { loadOrBuildIndex } from "../core/indexer.js";
import { loadConfig } from "../core/config.js";
import { logger } from "../utils/logger.js";
import { TASKS_FILE_REL, CURRENT_STATE_FILE_REL } from "../utils/constants.js";

export function handleStatusCommand(options: { check?: boolean } = {}, rootDir: string = process.cwd()): void {
  const indexData = loadOrBuildIndex(rootDir);
  const config = loadConfig(rootDir);

  let activeDecisionsCount = 0;
  let supersededDecisionsCount = 0;
  const staleDocs: string[] = [];

  for (const doc of indexData.documents) {
    if (doc.type === "decision") {
      if (doc.status === "active") activeDecisionsCount++;
      if (doc.status === "superseded") supersededDecisionsCount++;
    } else if (doc.type === "archived_decision") {
      supersededDecisionsCount++;
    }

    if (doc.stale) {
      staleDocs.push(`${doc.title} (${doc.path})`);
    }
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
    if (focusMatch) currentFocus = focusMatch[1].trim();
  }

  const percent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const progressBar = renderProgressBar(percent);

  logger.title("Veeshree Project Memory Status");

  console.log(`${logger.bold("Active Focus:")}       ${logger.cyan(currentFocus)}`);
  console.log(`${logger.bold("Task Progress:")}      ${progressBar} ${percent}% (${completedTasks}/${totalTasks} tasks)`);
  console.log(`${logger.bold("Active Decisions:")}   ${activeDecisionsCount} active (${supersededDecisionsCount} superseded/archived)`);
  console.log(`${logger.bold("Extractor Model:")}    ${config.default_extractor.provider} (${config.default_extractor.model})`);
  console.log(`${logger.bold("Token Budget:")}       ${config.settings.max_context_tokens} max tokens`);

  console.log("");
  if (staleDocs.length === 0) {
    logger.success("Memory Integrity: All linked code hashes are in sync (0 stale drift).");
  } else {
    logger.warn(`Memory Integrity: ${staleDocs.length} record(s) flagged with stale code drift:`);
    for (const doc of staleDocs) {
      console.log(`  - ${logger.yellow(doc)}`);
    }
  }
  console.log("");

  if (options.check && staleDocs.length > 0) {
    logger.error("Drift check failed: Code has changed without corresponding memory updates.");
    process.exit(1);
  }
}

function renderProgressBar(percent: number, length: number = 16): string {
  const filledLength = Math.round((length * percent) / 100);
  const emptyLength = length - filledLength;
  const filled = "█".repeat(filledLength);
  const empty = "░".repeat(emptyLength);
  return `[${filled}${empty}]`;
}
