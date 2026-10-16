import fs from "node:fs";
import path from "node:path";
import { parseDecisionFrontmatter } from "./memory/frontmatter.js";
import { writeAtomic } from "./memory/atomic.js";
import { buildIndex } from "./indexer.js";
import { loadConfig } from "./config.js";
import {
  CURRENT_STATE_FILE_REL,
  COMPLETED_TASKS_FILE_REL,
  TASKS_FILE_REL,
  DECISIONS_DIR_REL,
  ARCHIVE_DECISIONS_DIR_REL,
  ARCHIVE_DIR_REL,
  DEFAULT_GC_MAX_PROGRESS,
} from "../utils/constants.js";

export interface GCResult {
  archivedTasksCount: number;
  supersededDecisionsCount: number;
  relocatedDecisions: string[];
}

export interface GCOptions {
  dryRun?: boolean;
}

/**
 * Runs State Garbage Collection & Archival:
 * 1. Archives excess rolling progress items in current-state.md (>5 items) to archive/completed-tasks.md
 * 2. Archives completed tasks (- [x]) from tasks.md to archive/completed-tasks.md, keeping tasks.md clean
 * 3. Moves decisions with status: "superseded" from decisions/ to archive/decisions/
 * 4. Re-indexes memory so index.json reflects the clean state
 */
export function runGarbageCollection(rootDir: string = process.cwd(), options: GCOptions = {}): GCResult {
  const config = loadConfig(rootDir);
  const maxProgress = config.gc?.max_progress || DEFAULT_GC_MAX_PROGRESS;

  let archivedTasksCount = 0;
  let supersededDecisionsCount = 0;
  const relocatedDecisions: string[] = [];

  const archiveDir = path.join(rootDir, ARCHIVE_DIR_REL);
  const archiveDecisionsDir = path.join(rootDir, ARCHIVE_DECISIONS_DIR_REL);
  if (!options.dryRun) {
    if (!fs.existsSync(archiveDir)) fs.mkdirSync(archiveDir, { recursive: true });
    if (!fs.existsSync(archiveDecisionsDir)) fs.mkdirSync(archiveDecisionsDir, { recursive: true });
  }

  const completedTasksPath = path.join(rootDir, COMPLETED_TASKS_FILE_REL);
  const ensureArchiveHeader = () => {
    if (!options.dryRun && !fs.existsSync(completedTasksPath)) {
      writeAtomic(
        completedTasksPath,
        "# Completed & Archived Tasks\n\nHistorical record of finished milestones and completed tasks archived from active memory.\n"
      );
    }
  };

  // 1. Process Rolling Snapshot in current-state.md
  const currentStatePath = path.join(rootDir, CURRENT_STATE_FILE_REL);
  if (fs.existsSync(currentStatePath)) {
    const content = fs.readFileSync(currentStatePath, "utf-8");
    const progressRegex = /(## 3\. Recent Progress[^\n]*\n)([\s\S]*?)(## 4\.|$)/;
    const match = content.match(progressRegex);

    if (match) {
      const header = match[1] || "";
      const progressSection = (match[2] || "").trim();
      const trailing = match[3] || "";

      const lines = progressSection
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l.startsWith("-") || l.startsWith("*"));

      if (lines.length > maxProgress) {
        const keepItems = lines.slice(0, maxProgress);
        const excessItems = lines.slice(maxProgress);

        archivedTasksCount += excessItems.length;

        if (!options.dryRun) {
          ensureArchiveHeader();
          const timestamp = new Date().toISOString().split("T")[0];
          const archiveEntry = `\n### Archived Progress Snapshot (${timestamp})\n${excessItems.join("\n")}\n`;
          fs.appendFileSync(completedTasksPath, archiveEntry, "utf-8");

          const newProgressBlock = `${header}${keepItems.join("\n")}\n\n${trailing}`;
          const updatedContent = content.replace(progressRegex, newProgressBlock);
          writeAtomic(currentStatePath, updatedContent);
        }
      }
    }
  }

  // 2. Process Completed Tasks (- [x]) from tasks.md
  const tasksPath = path.join(rootDir, TASKS_FILE_REL);
  if (fs.existsSync(tasksPath)) {
    const tasksContent = fs.readFileSync(tasksPath, "utf-8");
    const lines = tasksContent.split("\n");
    const completedTasks: string[] = [];
    const remainingLines: string[] = [];

    for (const line of lines) {
      if (/^\s*-\s*\[[xX]\]/.test(line)) {
        completedTasks.push(line.trim());
      } else {
        remainingLines.push(line);
      }
    }

    if (completedTasks.length > 0) {
      archivedTasksCount += completedTasks.length;
      if (!options.dryRun) {
        ensureArchiveHeader();
        const timestamp = new Date().toISOString().split("T")[0];
        const archiveEntry = `\n### Completed Tasks (${timestamp})\n${completedTasks.join("\n")}\n`;
        fs.appendFileSync(completedTasksPath, archiveEntry, "utf-8");
        writeAtomic(tasksPath, remainingLines.join("\n"));
      }
    }
  }

  // 3. Relocate Superseded Decisions to archive/decisions/
  const decisionsDir = path.join(rootDir, DECISIONS_DIR_REL);
  if (fs.existsSync(decisionsDir)) {
    const files = fs.readdirSync(decisionsDir).filter((f) => f.endsWith(".md"));

    for (const file of files) {
      const filePath = path.join(decisionsDir, file);
      const raw = fs.readFileSync(filePath, "utf-8");
      try {
        const parsed = parseDecisionFrontmatter(raw);
        if (parsed.data && parsed.data.status === "superseded") {
          const targetPath = path.join(archiveDecisionsDir, file);
          if (!options.dryRun) {
            fs.renameSync(filePath, targetPath);
          }
          supersededDecisionsCount++;
          relocatedDecisions.push(file);
        }
      } catch {
        // ignore
      }
    }
  }

  if (!options.dryRun) {
    buildIndex(rootDir);
  }

  return {
    archivedTasksCount,
    supersededDecisionsCount,
    relocatedDecisions,
  };
}
