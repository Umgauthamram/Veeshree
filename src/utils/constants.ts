import path from "node:path";

export const MEMORY_DIR_REL = path.join("docs", "memory");
export const DECISIONS_DIR_REL = path.join("docs", "memory", "decisions");
export const ARCHIVE_DIR_REL = path.join("docs", "memory", "archive");
export const ARCHIVE_DECISIONS_DIR_REL = path.join("docs", "memory", "archive", "decisions");

export const VEE_DIR_REL = ".vee";
export const CONFIG_FILE_REL = path.join(".vee", "config.json");
export const INDEX_FILE_REL = path.join(".vee", "index.json");

export const CURRENT_STATE_FILE_REL = path.join("docs", "memory", "current-state.md");
export const TASKS_FILE_REL = path.join("docs", "memory", "tasks.md");
export const CONSTRAINTS_FILE_REL = path.join("docs", "memory", "constraints.md");
export const REJECTED_FILE_REL = path.join("docs", "memory", "rejected.md");
export const DISCOVERIES_FILE_REL = path.join("docs", "memory", "discoveries.md");
export const COMPLETED_TASKS_FILE_REL = path.join("docs", "memory", "archive", "completed-tasks.md");
