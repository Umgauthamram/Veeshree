import fs from "node:fs";
import path from "node:path";
import { logger } from "../utils/logger.js";
import { scanRepository } from "../core/scanner.js";
import { saveConfig, loadConfig } from "../core/config.js";
import {
  generateCurrentStateTemplate,
  generateTasksTemplate,
  generateConstraintsTemplate,
  generateRejectedTemplate,
  generateDiscoveriesTemplate,
  generateDecisionStubTemplate,
} from "../core/templates.js";
import {
  MEMORY_DIR_REL,
  DECISIONS_DIR_REL,
  ARCHIVE_DIR_REL,
  ARCHIVE_DECISIONS_DIR_REL,
  VEE_DIR_REL,
  CONFIG_FILE_REL,
  CURRENT_STATE_FILE_REL,
  TASKS_FILE_REL,
  CONSTRAINTS_FILE_REL,
  REJECTED_FILE_REL,
  DISCOVERIES_FILE_REL,
} from "../utils/constants.js";

export interface InitOptions {
  force?: boolean;
}

export function initializeVeeshree(targetDir: string = process.cwd(), options: InitOptions = {}) {
  logger.title("Initializing Veeshree Context Memory Layer");

  const veeDir = path.join(targetDir, VEE_DIR_REL);
  const memoryDir = path.join(targetDir, MEMORY_DIR_REL);
  const decisionsDir = path.join(targetDir, DECISIONS_DIR_REL);
  const archiveDir = path.join(targetDir, ARCHIVE_DIR_REL);
  const archiveDecisionsDir = path.join(targetDir, ARCHIVE_DECISIONS_DIR_REL);

  // 1. Create directory structure
  logger.info("Creating directory hierarchies...");
  const dirsToCreate = [veeDir, memoryDir, decisionsDir, archiveDir, archiveDecisionsDir];
  for (const dir of dirsToCreate) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  // 2. Scan repository heuristics
  logger.info("Running zero-token heuristic scanner...");
  const scanned = scanRepository(targetDir);
  if (scanned.languages.length > 0) {
    logger.info(`Detected languages: ${logger.bold(scanned.languages.join(", "))}`);
  }
  if (scanned.frameworks.length > 0) {
    logger.info(`Detected frameworks: ${logger.bold(scanned.frameworks.join(", "))}`);
  }
  if (scanned.databases.length > 0) {
    logger.info(`Detected databases/ORMs: ${logger.bold(scanned.databases.join(", "))}`);
  }
  if (scanned.infrastructure.length > 0) {
    logger.info(`Detected infrastructure: ${logger.bold(scanned.infrastructure.join(", "))}`);
  }

  // 3. Write / Merge .vee/config.json
  const configPath = path.join(targetDir, CONFIG_FILE_REL);
  if (!fs.existsSync(configPath) || options.force) {
    const config = loadConfig(targetDir);
    saveConfig(config, targetDir);
    logger.success(`Generated config at ${CONFIG_FILE_REL}`);
  } else {
    logger.info(`Config already exists at ${CONFIG_FILE_REL}`);
  }

  // 4. Seed memory markdown files
  const filesToCreate = [
    {
      relPath: CURRENT_STATE_FILE_REL,
      content: generateCurrentStateTemplate(scanned),
      name: "current-state.md",
    },
    {
      relPath: TASKS_FILE_REL,
      content: generateTasksTemplate(),
      name: "tasks.md",
    },
    {
      relPath: CONSTRAINTS_FILE_REL,
      content: generateConstraintsTemplate(),
      name: "constraints.md",
    },
    {
      relPath: REJECTED_FILE_REL,
      content: generateRejectedTemplate(),
      name: "rejected.md",
    },
    {
      relPath: DISCOVERIES_FILE_REL,
      content: generateDiscoveriesTemplate(),
      name: "discoveries.md",
    },
  ];

  for (const file of filesToCreate) {
    const fullPath = path.join(targetDir, file.relPath);
    if (!fs.existsSync(fullPath) || options.force) {
      fs.writeFileSync(fullPath, file.content, "utf-8");
      logger.success(`Seeded ${file.relPath}`);
    } else {
      logger.info(`Skipped existing ${file.relPath}`);
    }
  }

  // 5. Seed initial decision stubs if none exist
  const dbDecisionPath = path.join(decisionsDir, "database.md");
  if (!fs.existsSync(dbDecisionPath) || options.force) {
    const dbTech = scanned.databases.length > 0 ? scanned.databases.join(", ") : "Standard Data Layer";
    fs.writeFileSync(
      dbDecisionPath,
      generateDecisionStubTemplate("Database & Storage Architecture", "database", dbTech),
      "utf-8"
    );
    logger.success(`Seeded decision stub at docs/memory/decisions/database.md`);
  }

  // 6. Setup Git Hooks if git repository exists
  const gitHooksDir = path.join(targetDir, ".git", "hooks");
  if (fs.existsSync(gitHooksDir)) {
    try {
      const preCommitHook = path.join(gitHooksDir, "pre-commit");
      const postCheckoutHook = path.join(gitHooksDir, "post-checkout");

      const hookContent = (cmd: string) =>
        `#!/bin/sh\n# Veeshree automated hook\nif command -v npx >/dev/null 2>&1; then\n  npx vee ${cmd} || true\nfi\n`;

      if (!fs.existsSync(preCommitHook) || options.force) {
        fs.writeFileSync(preCommitHook, hookContent("sync"), { mode: 0o755 });
        logger.success("Installed Git pre-commit hook");
      }
      if (!fs.existsSync(postCheckoutHook) || options.force) {
        fs.writeFileSync(postCheckoutHook, hookContent("sync"), { mode: 0o755 });
        logger.success("Installed Git post-checkout hook");
      }
    } catch {
      logger.warn("Could not install git hooks automatically.");
    }
  }

  logger.log("");
  logger.success("Veeshree initialized successfully! Version-controlled memory is active at /docs/memory/");
}
