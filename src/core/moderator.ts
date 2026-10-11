import fs from "node:fs";
import path from "node:path";
import { scanRepository } from "./scanner.js";
import {
  generateCurrentStateTemplate,
  generateTasksTemplate,
  generateConstraintsTemplate,
  generateRejectedTemplate,
  generateDiscoveriesTemplate,
  generateDecisionStubTemplate,
} from "./templates.js";
import { installIdeRules } from "./ide.js";
import { saveConfig, loadConfig } from "./config.js";
import { buildIndex } from "./indexer.js";

export interface ModeratorReport {
  isExistingProject: boolean;
  projectAge: "fresh" | "active" | "mature";
  languages: string[];
  frameworks: string[];
  databases: string[];
  installedRules: string[];
  seededFiles: string[];
  gitIgnoreUpdated?: boolean;
}

export function ensureGitIgnoreProtection(rootDir: string): boolean {
  const gitignorePath = path.join(rootDir, ".gitignore");
  const entries = ["/.vee/config.json", "/.vee/index.json"];

  if (!fs.existsSync(gitignorePath)) {
    const content = `# Veeshree local config & search index (auto-generated)\n/.vee/config.json\n/.vee/index.json\n.env\n`;
    fs.writeFileSync(gitignorePath, content, "utf-8");
    return true;
  }

  const existing = fs.readFileSync(gitignorePath, "utf-8");
  const missing = entries.filter((e) => !existing.includes(e));
  if (missing.length > 0) {
    const toAppend = `\n# Veeshree local config & search cache\n` + missing.join("\n") + "\n";
    fs.appendFileSync(gitignorePath, toAppend, "utf-8");
    return true;
  }
  return false;
}

export function moderateAndBootstrap(
  rootDir: string = process.cwd(),
  options: { force?: boolean } = {}
): ModeratorReport {
  const memoryDir = path.join(rootDir, "docs", "memory");
  const decisionsDir = path.join(memoryDir, "decisions");
  const archiveDir = path.join(memoryDir, "archive");
  const archiveDecisionsDir = path.join(archiveDir, "decisions");
  const veeDir = path.join(rootDir, ".vee");

  fs.mkdirSync(memoryDir, { recursive: true });
  fs.mkdirSync(decisionsDir, { recursive: true });
  fs.mkdirSync(archiveDir, { recursive: true });
  fs.mkdirSync(archiveDecisionsDir, { recursive: true });
  fs.mkdirSync(veeDir, { recursive: true });

  // 1. Scan the repository deeply
  const scan = scanRepository(rootDir);

  // 2. Assess project maturity / age
  const hasGit = scan.recentCommits.length > 0;
  const hasCode = scan.languages.length > 0 || scan.frameworks.length > 0;
  const isExistingProject = hasGit || hasCode;

  let projectAge: "fresh" | "active" | "mature" = "fresh";
  if (scan.recentCommits.length >= 5) {
    projectAge = "mature";
  } else if (hasGit || hasCode) {
    projectAge = "active";
  }

  const seededFiles: string[] = [];

  // 3. Seed Config
  const config = loadConfig(rootDir);
  saveConfig(config, rootDir);

  // 4. Seed Memory Files
  const stateFile = path.join(memoryDir, "current-state.md");
  if (options.force || !fs.existsSync(stateFile)) {
    fs.writeFileSync(stateFile, generateCurrentStateTemplate(scan), "utf-8");
    seededFiles.push("docs/memory/current-state.md");
  }

  const tasksFile = path.join(memoryDir, "tasks.md");
  if (options.force || !fs.existsSync(tasksFile)) {
    fs.writeFileSync(tasksFile, generateTasksTemplate(), "utf-8");
    seededFiles.push("docs/memory/tasks.md");
  }

  const constraintsFile = path.join(memoryDir, "constraints.md");
  if (options.force || !fs.existsSync(constraintsFile)) {
    fs.writeFileSync(constraintsFile, generateConstraintsTemplate(), "utf-8");
    seededFiles.push("docs/memory/constraints.md");
  }

  const rejectedFile = path.join(memoryDir, "rejected.md");
  if (options.force || !fs.existsSync(rejectedFile)) {
    fs.writeFileSync(rejectedFile, generateRejectedTemplate(), "utf-8");
    seededFiles.push("docs/memory/rejected.md");
  }

  const discoveriesFile = path.join(memoryDir, "discoveries.md");
  if (options.force || !fs.existsSync(discoveriesFile)) {
    fs.writeFileSync(discoveriesFile, generateDiscoveriesTemplate(), "utf-8");
    seededFiles.push("docs/memory/discoveries.md");
  }

  // 5. Seed Initial ADR Stubs if frameworks/databases detected
  if (scan.databases.length > 0) {
    const dbAdrPath = path.join(decisionsDir, "database.md");
    if (options.force || !fs.existsSync(dbAdrPath)) {
      fs.writeFileSync(
        dbAdrPath,
        generateDecisionStubTemplate("Database Architecture", "Database", scan.databases.join(", ")),
        "utf-8"
      );
      seededFiles.push("docs/memory/decisions/database.md");
    }
  }

  if (scan.frameworks.length > 0) {
    const frameworkAdrPath = path.join(decisionsDir, "framework.md");
    if (options.force || !fs.existsSync(frameworkAdrPath)) {
      fs.writeFileSync(
        frameworkAdrPath,
        generateDecisionStubTemplate("Application Framework", "Framework", scan.frameworks.join(", ")),
        "utf-8"
      );
      seededFiles.push("docs/memory/decisions/framework.md");
    }
  }

  // 6. Automatically inject IDE Rules (Zero-Human setup for Cursor, Claude, Antigravity, Copilot)
  const installedRules = installIdeRules(rootDir);

  // 7. Protect local config & index from Git exposure
  const gitIgnoreUpdated = ensureGitIgnoreProtection(rootDir);

  // 8. Initial Sync & Hash Calculation
  buildIndex(rootDir);

  return {
    isExistingProject,
    projectAge,
    languages: scan.languages,
    frameworks: scan.frameworks,
    databases: scan.databases,
    installedRules,
    seededFiles,
    gitIgnoreUpdated,
  };
}
