import path from "node:path";
import { createRequire } from "node:module";

declare const __VERSION__: string | undefined;

function getResolvedVersion(): string {
  if (typeof __VERSION__ !== "undefined") {
    return __VERSION__;
  }
  try {
    const require = createRequire(import.meta.url);
    return require("../../package.json").version || "1.0.0";
  } catch {
    try {
      const require = createRequire(import.meta.url);
      return require("../package.json").version || "1.0.0";
    } catch {
      return "1.0.0";
    }
  }
}

export const VEESHREE_VERSION: string = getResolvedVersion();

export const MEMORY_DIR_REL = path.join("docs", "memory");
export const DECISIONS_DIR_REL = path.join("docs", "memory", "decisions");
export const ARCHIVE_DIR_REL = path.join("docs", "memory", "archive");
export const ARCHIVE_DECISIONS_DIR_REL = path.join("docs", "memory", "archive", "decisions");

export const VEE_DIR_REL = ".vee";
export const CONFIG_FILE_REL = path.join(".vee", "config.json");
export const INDEX_FILE_REL = path.join(".vee", "index.json");
export const PROPOSALS_DIR_REL = path.join(".vee", "proposals");
export const SNAPSHOTS_DIR_REL = path.join(".vee", "snapshots");
export const LOGS_DIR_REL = path.join(".vee", "logs");
export const WATCH_LOG_FILE_REL = path.join(".vee", "logs", "watch.log");
export const WATCH_PID_FILE_REL = path.join(".vee", "watch.pid");
export const WATCH_STATE_FILE_REL = path.join(".vee", "watch-state.json");
export const LOCK_FILE_REL = path.join(".vee", "lock");
export const BACKUP_03X_DIR_REL = path.join(".vee", "backup-0.3.x");

export const CURRENT_STATE_FILE_REL = path.join("docs", "memory", "current-state.md");
export const TASKS_FILE_REL = path.join("docs", "memory", "tasks.md");
export const CONSTRAINTS_FILE_REL = path.join("docs", "memory", "constraints.md");
export const REJECTED_FILE_REL = path.join("docs", "memory", "rejected.md");
export const DISCOVERIES_FILE_REL = path.join("docs", "memory", "discoveries.md");
export const COMPLETED_TASKS_FILE_REL = path.join("docs", "memory", "archive", "completed-tasks.md");

import { getDefaultModels } from "../providers/models.js";

export const DEFAULT_MODELS = getDefaultModels();

export const DEFAULT_MAX_PAYLOAD_BYTES = 24576;
export const DEFAULT_MAX_CONTEXT_TOKENS = 2000;
export const DEFAULT_CONSTRAINTS_CAP = 400;
export const DEFAULT_STATE_CAP = 450;
export const DEFAULT_DECISIONS_CAP = 800;
export const DEFAULT_TASKS_CAP = 250;
export const DEFAULT_GC_MAX_PROGRESS = 5;
export const DEFAULT_GC_MAX_COMPLETED_TASKS = 20;
export const LOCK_STALE_MS = 60000; // 60 seconds
