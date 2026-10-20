import {
  ARCHIVE_DECISIONS_DIR_REL,
  BACKUP_03X_DIR_REL,
  CONSTRAINTS_FILE_REL,
  CURRENT_STATE_FILE_REL,
  DECISIONS_DIR_REL,
  DEFAULT_CONSTRAINTS_CAP,
  INDEX_FILE_REL,
  KNOWN_AGENT_TARGETS,
  LOGS_DIR_REL,
  MEMORY_DIR_REL,
  SUPPORTED_KEY_PROVIDERS,
  TASKS_FILE_REL,
  VEESHREE_VERSION,
  VEE_DIR_REL,
  VeeError,
  WATCH_LOG_FILE_REL,
  WATCH_PID_FILE_REL,
  WATCH_STATE_FILE_REL,
  __dirname,
  acceptBaselines,
  acceptProposal,
  buildContext,
  buildIndex,
  calculateNormalizedFileHash,
  capDiffPayload,
  checkWorkspaceDrift,
  createMemorySnapshot,
  createProposal,
  estimateTokens,
  explainContextBudget,
  filterDiffByDenylist,
  findMarkdownFiles,
  getApiKey,
  getConfigProperty,
  getGlobalConfigPath,
  getGlobalCredentialsPath,
  getHooksStatus,
  getNextAdrNumber,
  getProjectConfigPath,
  getProposal,
  installAgentRules,
  installGitHooks,
  installMcpClientConfig,
  isDenylistedFile,
  listApiKeys,
  listProposals,
  listSnapshots,
  loadConfig,
  loadGlobalCredentials,
  loadOrBuildIndex,
  logger,
  normalizePosix,
  parseDecisionFrontmatter,
  redactContent,
  rejectProposal,
  removeApiKey,
  resolveEngine,
  resolveGitHooksDir,
  restoreSnapshot,
  runCommandInteractive,
  runCommandSafe,
  runGarbageCollection,
  sanitizeRelativePath,
  saveConfig,
  searchMemory,
  setApiKey,
  setConfigProperty,
  slugifyTitle,
  startMcpServer,
  stringifyMarkdownFrontmatter,
  uninstallAgentRules,
  uninstallGitHooks,
  updateAgentRules,
  validateModelName,
  writeAtomic
} from "./chunk-W5GCJGKU.js";

// src/cli.ts
import path14 from "path";
import { Command } from "commander";

// src/core/moderator.ts
import fs2 from "fs";
import path2 from "path";

// src/core/scanner.ts
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
function scanRepository(targetDir = process.cwd()) {
  const result = {
    name: path.basename(targetDir),
    projectType: "generic application",
    purpose: "",
    domainEntities: [],
    apiEndpoints: [],
    frameworks: [],
    languages: [],
    databases: [],
    infrastructure: [],
    recentCommits: [],
    activeBranch: "main",
    activeFeatureFocus: "Core Architecture & Feature Development"
  };
  detectProjectPurpose(targetDir, result);
  detectNodeStack(targetDir, result);
  detectPythonStack(targetDir, result);
  detectGoStack(targetDir, result);
  detectRustStack(targetDir, result);
  detectInfra(targetDir, result);
  detectDomainEntities(targetDir, result);
  detectApiEndpoints(targetDir, result);
  detectGitContext(targetDir, result);
  result.languages = Array.from(new Set(result.languages));
  result.frameworks = Array.from(new Set(result.frameworks));
  result.databases = Array.from(new Set(result.databases));
  result.infrastructure = Array.from(new Set(result.infrastructure));
  result.domainEntities = Array.from(new Set(result.domainEntities));
  result.apiEndpoints = Array.from(new Set(result.apiEndpoints));
  if (result.frameworks.length > 0 || result.languages.length > 0) {
    result.projectType = `${result.languages.join(", ")} application (${result.frameworks.join(", ")})`;
  }
  return result;
}
function detectProjectPurpose(targetDir, result) {
  const readmeFiles = ["README.md", "readme.md", "README.rst", "README.txt"];
  for (const r of readmeFiles) {
    const rPath = path.join(targetDir, r);
    if (fs.existsSync(rPath)) {
      try {
        const content = fs.readFileSync(rPath, "utf-8");
        const lines = content.split("\n");
        const paragraphs = [];
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          if (trimmed.startsWith("#") || trimmed.startsWith("[!") || trimmed.startsWith("<img") || trimmed.startsWith("[![")) continue;
          if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
            paragraphs.push(`Project Reference: ${trimmed}`);
            break;
          }
          paragraphs.push(trimmed);
          if (paragraphs.length >= 2) break;
        }
        if (paragraphs.length > 0) {
          result.purpose = paragraphs.join(" ");
        }
      } catch {
      }
      break;
    }
  }
  const pkgPath = path.join(targetDir, "package.json");
  if (!result.purpose && fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
      if (pkg.description) {
        result.purpose = pkg.description;
      }
    } catch {
    }
  }
  if (!result.purpose) {
    result.purpose = `${result.name} - Software engineering codebase`;
  }
}
function detectNodeStack(targetDir, result) {
  const pkgPath = path.join(targetDir, "package.json");
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
      result.name = pkg.name || result.name;
      result.languages.push("JavaScript / TypeScript");
      const deps = { ...pkg.dependencies || {}, ...pkg.devDependencies || {} };
      if (deps["next"]) result.frameworks.push("Next.js");
      if (deps["react"]) result.frameworks.push("React");
      if (deps["vue"]) result.frameworks.push("Vue");
      if (deps["svelte"]) result.frameworks.push("Svelte");
      if (deps["express"]) result.frameworks.push("Express");
      if (deps["fastify"]) result.frameworks.push("Fastify");
      if (deps["hono"]) result.frameworks.push("Hono");
      if (deps["commander"]) result.frameworks.push("Commander (CLI)");
      if (deps["prisma"] || deps["@prisma/client"]) result.databases.push("Prisma ORM");
      if (deps["drizzle-orm"]) result.databases.push("Drizzle ORM");
      if (deps["typeorm"]) result.databases.push("TypeORM");
      if (deps["pg"] || deps["postgres"]) result.databases.push("PostgreSQL");
      if (deps["mysql"] || deps["mysql2"]) result.databases.push("MySQL");
      if (deps["mongodb"] || deps["mongoose"]) result.databases.push("MongoDB");
      if (deps["redis"] || deps["ioredis"]) result.databases.push("Redis");
      if (deps["sqlite3"] || deps["better-sqlite3"]) result.databases.push("SQLite");
      if (deps["tailwindcss"]) result.infrastructure.push("Tailwind CSS");
      if (deps["docker"]) result.infrastructure.push("Docker");
    } catch {
    }
  }
}
function detectPythonStack(targetDir, result) {
  const reqPath = path.join(targetDir, "requirements.txt");
  const pyprojectPath = path.join(targetDir, "pyproject.toml");
  if (fs.existsSync(reqPath) || fs.existsSync(pyprojectPath)) {
    result.languages.push("Python");
    let content = "";
    if (fs.existsSync(reqPath)) content += fs.readFileSync(reqPath, "utf-8") + "\n";
    if (fs.existsSync(pyprojectPath)) content += fs.readFileSync(pyprojectPath, "utf-8") + "\n";
    if (/django/i.test(content)) result.frameworks.push("Django");
    if (/fastapi/i.test(content)) result.frameworks.push("FastAPI");
    if (/flask/i.test(content)) result.frameworks.push("Flask");
    if (/sqlalchemy/i.test(content)) result.databases.push("SQLAlchemy");
    if (/psycopg/i.test(content)) result.databases.push("PostgreSQL");
    if (/pymongo/i.test(content)) result.databases.push("MongoDB");
    if (/redis/i.test(content)) result.databases.push("Redis");
    if (/celery/i.test(content)) result.infrastructure.push("Celery Task Worker");
  }
}
function detectGoStack(targetDir, result) {
  const goModPath = path.join(targetDir, "go.mod");
  if (fs.existsSync(goModPath)) {
    result.languages.push("Go");
    try {
      const content = fs.readFileSync(goModPath, "utf-8");
      if (/gin-gonic\/gin/i.test(content)) result.frameworks.push("Gin");
      if (/gofiber\/fiber/i.test(content)) result.frameworks.push("Fiber");
      if (/gorm\.io\/gorm/i.test(content)) result.databases.push("GORM");
    } catch {
    }
  }
}
function detectRustStack(targetDir, result) {
  const cargoPath = path.join(targetDir, "Cargo.toml");
  if (fs.existsSync(cargoPath)) {
    result.languages.push("Rust");
    try {
      const content = fs.readFileSync(cargoPath, "utf-8");
      if (/actix-web/i.test(content)) result.frameworks.push("Actix-web");
      if (/axum/i.test(content)) result.frameworks.push("Axum");
      if (/tokio/i.test(content)) result.frameworks.push("Tokio");
      if (/diesel/i.test(content)) result.databases.push("Diesel ORM");
      if (/sqlx/i.test(content)) result.databases.push("SQLx");
    } catch {
    }
  }
}
function detectInfra(targetDir, result) {
  if (fs.existsSync(path.join(targetDir, "docker-compose.yml")) || fs.existsSync(path.join(targetDir, "docker-compose.yaml"))) {
    result.infrastructure.push("Docker Compose");
  }
  if (fs.existsSync(path.join(targetDir, "Dockerfile"))) {
    result.infrastructure.push("Dockerfile");
  }
  if (fs.existsSync(path.join(targetDir, ".env.example")) || fs.existsSync(path.join(targetDir, ".env"))) {
    result.infrastructure.push("Environment Variables Configured");
  }
}
function detectDomainEntities(targetDir, result) {
  const prismaFiles = [path.join(targetDir, "schema.prisma"), path.join(targetDir, "prisma", "schema.prisma")];
  for (const p of prismaFiles) {
    if (fs.existsSync(p)) {
      try {
        const content = fs.readFileSync(p, "utf-8");
        const modelMatches = content.match(/model\s+([A-Za-z0-9_]+)\s+\{/g);
        if (modelMatches) {
          for (const m of modelMatches) {
            const name = m.replace(/model\s+/, "").replace(/\s+\{/, "").trim();
            result.domainEntities.push(name);
          }
        }
      } catch {
      }
    }
  }
  const modelsPy = path.join(targetDir, "models.py");
  if (fs.existsSync(modelsPy)) {
    try {
      const content = fs.readFileSync(modelsPy, "utf-8");
      const classMatches = content.match(/class\s+([A-Za-z0-9_]+)\s*\(/g);
      if (classMatches) {
        for (const c of classMatches) {
          const name = c.replace(/class\s+/, "").replace(/\s*\(/, "").trim();
          if (name !== "Meta") result.domainEntities.push(name);
        }
      }
    } catch {
    }
  }
}
function detectApiEndpoints(targetDir, result) {
  const appApiDir = path.join(targetDir, "app", "api");
  if (fs.existsSync(appApiDir)) {
    scanRouteDirs(appApiDir, "/api", result.apiEndpoints);
  }
  const pagesApiDir = path.join(targetDir, "pages", "api");
  if (fs.existsSync(pagesApiDir)) {
    scanRouteDirs(pagesApiDir, "/api", result.apiEndpoints);
  }
}
function scanRouteDirs(dir, baseRoute, endpoints) {
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        scanRouteDirs(fullPath, `${baseRoute}/${entry.name}`, endpoints);
      } else if (entry.name.startsWith("route.") || entry.name.endsWith(".ts") || entry.name.endsWith(".js")) {
        endpoints.push(baseRoute);
      }
    }
  } catch {
  }
}
function detectGitContext(targetDir, result) {
  try {
    const branch = execSync("git rev-parse --abbrev-ref HEAD", {
      cwd: targetDir,
      stdio: ["pipe", "pipe", "ignore"],
      encoding: "utf-8"
    }).trim();
    if (branch) {
      result.activeBranch = branch;
      if (branch !== "main" && branch !== "master") {
        result.activeFeatureFocus = `Feature Branch: ${branch.replace(/^(feature\/|fix\/|feat\/)/, "")}`;
      }
    }
    const gitLog = execSync('git log -5 --pretty=format:"%s"', {
      cwd: targetDir,
      stdio: ["pipe", "pipe", "ignore"],
      encoding: "utf-8"
    });
    result.recentCommits = gitLog.split("\n").map((s) => s.trim()).filter(Boolean);
    if (!result.activeFeatureFocus && result.recentCommits.length > 0) {
      result.activeFeatureFocus = `Recent work: ${result.recentCommits[0]}`;
    }
  } catch {
    result.recentCommits = [];
  }
}

// src/core/templates.ts
function generateCurrentStateTemplate(info) {
  const stackSummary = [
    `- **Primary Purpose**: ${info.purpose}`,
    info.languages.length > 0 ? `- **Languages**: ${info.languages.join(", ")}` : "",
    info.frameworks.length > 0 ? `- **Frameworks / Libraries**: ${info.frameworks.join(", ")}` : "",
    info.databases.length > 0 ? `- **Databases / Data Layer**: ${info.databases.join(", ")}` : "",
    info.domainEntities.length > 0 ? `- **Core Domain Entities**: ${info.domainEntities.join(", ")}` : "",
    info.apiEndpoints.length > 0 ? `- **Detected API Endpoints**: ${info.apiEndpoints.slice(0, 8).join(", ")}` : "",
    info.infrastructure.length > 0 ? `- **Infrastructure & Tools**: ${info.infrastructure.join(", ")}` : ""
  ].filter(Boolean).join("\n");
  const commitSummary = info.recentCommits.length > 0 ? info.recentCommits.map((c) => `- ${c}`).join("\n") : "- Initial setup / repository initialization";
  const activeFocus = info.activeFeatureFocus || "Project Initialization & Core Architecture";
  return `# Current Project State

## 1. System Overview & Purpose
- **Project Name**: ${info.name}
- **Active Branch**: \`${info.activeBranch || "main"}\`
- **Detected Stack & Architecture**:
${stackSummary || "- Standard software project"}

## 2. Active Feature / Milestone
- **Current Focus**: ${activeFocus}
- **Status**: In Progress

## 3. Recent Progress (Rolling Snapshot - Max 5)
${commitSummary}

## 4. Next Immediate Steps
- [ ] Define initial architectural constraints in \`docs/memory/constraints.md\`
- [ ] Record key architectural decision records in \`docs/memory/decisions/\`
- [ ] Set active development goals in \`docs/memory/tasks.md\`
`;
}
function generateTasksTemplate() {
  return `# Project Tasks & Milestones

## Active Tasks
- [ ] Bootstrap foundational architecture & core dependencies
- [ ] Configure environment variables & local development setup
- [ ] Implement initial core features

## Backlog
- [ ] Set up testing suite and continuous integration
- [ ] Document production deployment & infrastructure guidelines
`;
}
function generateConstraintsTemplate() {
  return `# Architectural & Security Constraints

## Hard Constraints (Never Violate)
- **Zero Opaque Lock-in**: Project memory must reside in human-readable Markdown inside \`docs/memory/\`.
- **Token Budget Discipline**: Injected context payloads must strictly adhere to token allocations.
- **Pure JavaScript / Zero Native C++**: CLI dependencies must run across Node.js without native build toolchains.

## Soft Guidelines (Best Practices)
- Prefer explicit architectural decision records (ADRs) before implementing major refactors.
- Keep source code files linked to corresponding decision records in frontmatter (\`linked_files\`).
`;
}
function generateRejectedTemplate() {
  return `# Rejected Approaches & Trade-Offs

## Rejected Alternatives
*This file records explicitly evaluated and discarded architectural choices to prevent future AI agents from re-proposing rejected approaches.*

### Example Entry
- **Approach**: Heavy Native Vector Database (e.g. native C++ bindings for local vector store)
- **Reason Rejected**: Introduces platform-specific compilation errors and heavy installation dependencies on client machines. Chosen alternative: pure JS \`minisearch\` with zero native dependencies.
`;
}
function generateDiscoveriesTemplate() {
  return `# System Behaviors & Discoveries

## Key Technical Discoveries
*This file documents unexpected system behaviors, performance quirks, and technical findings uncovered during development.*

- **Repository Initialized**: Bootstrapped with Veeshree context persistence layer.
`;
}
function generateDecisionStubTemplate(title, category, detectedTech = "Standard") {
  return `---
title: "${title}"
status: "active"
date: "${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}"
tags: ["${category.toLowerCase()}", "architecture"]
linked_files: []
---

# ${title}

## Context & Problem Statement
Selection and architecture of ${category.toLowerCase()} for the project.

## Decision
[Pending AI Observation] Detected: ${detectedTech}.

## Rationale
Captured automatically during initial repository scan. Detailed trade-offs and alternatives to be recorded as development proceeds.

## Alternatives Considered
- Standard alternative evaluated during planning.

## Consequences & Linked Files
- Linked Source Files: None yet specified.
`;
}

// src/core/moderator.ts
function ensureGitIgnoreProtection(rootDir) {
  const gitignorePath = path2.join(rootDir, ".gitignore");
  const entries = ["/.vee/config.json", "/.vee/index.json"];
  if (!fs2.existsSync(gitignorePath)) {
    const content = `# Veeshree local config & search index (auto-generated)
/.vee/config.json
/.vee/index.json
.env
`;
    fs2.writeFileSync(gitignorePath, content, "utf-8");
    return true;
  }
  const existing = fs2.readFileSync(gitignorePath, "utf-8");
  const missing = entries.filter((e) => !existing.includes(e));
  if (missing.length > 0) {
    const toAppend = `
# Veeshree local config & search cache
` + missing.join("\n") + "\n";
    fs2.appendFileSync(gitignorePath, toAppend, "utf-8");
    return true;
  }
  return false;
}
function moderateAndBootstrap(rootDir = process.cwd(), options = {}) {
  const memoryDir = path2.join(rootDir, "docs", "memory");
  const decisionsDir = path2.join(memoryDir, "decisions");
  const archiveDir = path2.join(memoryDir, "archive");
  const archiveDecisionsDir = path2.join(archiveDir, "decisions");
  const veeDir = path2.join(rootDir, ".vee");
  if (!options.dryRun) {
    fs2.mkdirSync(memoryDir, { recursive: true });
    fs2.mkdirSync(decisionsDir, { recursive: true });
    fs2.mkdirSync(archiveDir, { recursive: true });
    fs2.mkdirSync(archiveDecisionsDir, { recursive: true });
    fs2.mkdirSync(veeDir, { recursive: true });
  }
  const scan = scanRepository(rootDir);
  const hasGit = scan.recentCommits.length > 0;
  const hasCode = scan.languages.length > 0 || scan.frameworks.length > 0;
  const isExistingProject = hasGit || hasCode;
  let projectAge = "fresh";
  if (scan.recentCommits.length >= 5) {
    projectAge = "mature";
  } else if (hasGit || hasCode) {
    projectAge = "active";
  }
  const seededFiles = [];
  if (!options.dryRun) {
    const config = loadConfig(rootDir);
    saveConfig(config, rootDir);
  }
  const stateFile = path2.join(memoryDir, "current-state.md");
  if (options.force || !fs2.existsSync(stateFile)) {
    if (!options.dryRun) fs2.writeFileSync(stateFile, generateCurrentStateTemplate(scan), "utf-8");
    seededFiles.push("docs/memory/current-state.md");
  }
  const tasksFile = path2.join(memoryDir, "tasks.md");
  if (options.force || !fs2.existsSync(tasksFile)) {
    if (!options.dryRun) fs2.writeFileSync(tasksFile, generateTasksTemplate(), "utf-8");
    seededFiles.push("docs/memory/tasks.md");
  }
  const constraintsFile = path2.join(memoryDir, "constraints.md");
  if (options.force || !fs2.existsSync(constraintsFile)) {
    if (!options.dryRun) fs2.writeFileSync(constraintsFile, generateConstraintsTemplate(), "utf-8");
    seededFiles.push("docs/memory/constraints.md");
  }
  const rejectedFile = path2.join(memoryDir, "rejected.md");
  if (options.force || !fs2.existsSync(rejectedFile)) {
    if (!options.dryRun) fs2.writeFileSync(rejectedFile, generateRejectedTemplate(), "utf-8");
    seededFiles.push("docs/memory/rejected.md");
  }
  const discoveriesFile = path2.join(memoryDir, "discoveries.md");
  if (options.force || !fs2.existsSync(discoveriesFile)) {
    if (!options.dryRun) fs2.writeFileSync(discoveriesFile, generateDiscoveriesTemplate(), "utf-8");
    seededFiles.push("docs/memory/discoveries.md");
  }
  if (scan.databases.length > 0) {
    const dbAdrPath = path2.join(decisionsDir, "database.md");
    if (options.force || !fs2.existsSync(dbAdrPath)) {
      if (!options.dryRun) {
        fs2.writeFileSync(
          dbAdrPath,
          generateDecisionStubTemplate("Database Architecture", "Database", scan.databases.join(", ")),
          "utf-8"
        );
      }
      seededFiles.push("docs/memory/decisions/database.md");
    }
  }
  if (scan.frameworks.length > 0) {
    const frameworkAdrPath = path2.join(decisionsDir, "framework.md");
    if (options.force || !fs2.existsSync(frameworkAdrPath)) {
      if (!options.dryRun) {
        fs2.writeFileSync(
          frameworkAdrPath,
          generateDecisionStubTemplate("Application Framework", "Framework", scan.frameworks.join(", ")),
          "utf-8"
        );
      }
      seededFiles.push("docs/memory/decisions/framework.md");
    }
  }
  let installedRules = [];
  if (!options.dryRun) {
    installedRules = installAgentRules(rootDir, options.selectedAgents);
  }
  let gitIgnoreUpdated = false;
  if (!options.dryRun) {
    gitIgnoreUpdated = ensureGitIgnoreProtection(rootDir);
    buildIndex(rootDir);
  }
  return {
    isExistingProject,
    projectAge,
    languages: scan.languages,
    frameworks: scan.frameworks,
    databases: scan.databases,
    installedRules,
    seededFiles,
    gitIgnoreUpdated
  };
}

// src/commands/init.ts
function initializeVeeshree(targetDir = process.cwd(), options = {}) {
  if (options.dryRun) {
    logger.info("[DRY-RUN] Simulating Veeshree project initialization...");
  } else {
    logger.title("Initializing Veeshree Context Memory Layer");
    logger.info("Analyzing project architecture and IDE environment...");
  }
  const selectedAgents = options.agents ? options.agents.split(",").map((a) => a.trim().toLowerCase()).filter(Boolean) : void 0;
  const report = moderateAndBootstrap(targetDir, {
    force: options.force,
    selectedAgents,
    dryRun: options.dryRun
  });
  if (options.dryRun) {
    logger.info(`[DRY-RUN] Would seed ${report.seededFiles.length} memory files: ${report.seededFiles.join(", ")}`);
    return report;
  }
  if (report.isExistingProject) {
    logger.info(`Detected ${logger.bold(report.projectAge)} project.`);
    if (report.languages.length > 0) {
      logger.info(`Languages: ${logger.bold(report.languages.join(", "))}`);
    }
    if (report.frameworks.length > 0) {
      logger.info(`Frameworks: ${logger.bold(report.frameworks.join(", "))}`);
    }
    if (report.databases.length > 0) {
      logger.info(`Databases / Data: ${logger.bold(report.databases.join(", "))}`);
    }
  } else {
    logger.info("Detected fresh project. Seeding clean baseline memory.");
  }
  for (const file of report.seededFiles) {
    logger.success(`Seeded ${file}`);
  }
  if (report.installedRules.length > 0) {
    logger.info(`Injected IDE context instructions: ${logger.bold(report.installedRules.join(", "))}`);
  }
  if (report.gitIgnoreUpdated) {
    logger.success("Protected local secrets: added /.vee/config.json and /.vee/index.json to .gitignore");
  }
  try {
    const hooksDir = resolveGitHooksDir(targetDir);
    if (hooksDir) {
      const installedHooks = installGitHooks(targetDir);
      logger.success(`Installed Git hooks: ${installedHooks.join(", ")}`);
    }
  } catch {
  }
  logger.log("");
  logger.success("Veeshree initialized successfully! Version-controlled memory is active at /docs/memory/");
  if (report.seededFiles.length > 0 && !options.dryRun) {
    logger.log("");
    logger.info("Initial Environment Diagnostics:");
    logger.success(`Memory Scaffold: ${report.seededFiles.length} files active in /docs/memory/`);
    if (report.installedRules.length > 0) {
      logger.success(`Detected Agent Environments: ${report.installedRules.join(", ")}`);
    }
  }
  logger.log("");
  logger.info(logger.bold("Next Step:"));
  logger.log(`  Start Ambient Memory Watcher:`);
  logger.log(`    ${logger.cyan("vee watch")}`);
  logger.log("");
  return report;
}

// src/commands/migrate.ts
import fs4 from "fs";
import path4 from "path";

// src/commands/doctor.ts
import fs3 from "fs";
import path3 from "path";
async function handleDoctorCommand(options = {}, rootDir = process.cwd()) {
  const isJson = options.json || logger.isJson();
  if (isJson) logger.setJson(true);
  if (!isJson) {
    logger.title("Veeshree System Diagnostics & Health Check");
  }
  const checks = [];
  let fixedCount = 0;
  const memoryDir = path3.join(rootDir, "docs", "memory");
  const coreFiles = [
    "current-state.md",
    "tasks.md",
    "constraints.md",
    "rejected.md",
    "discoveries.md"
  ];
  if (!fs3.existsSync(memoryDir)) {
    if (options.fix) {
      fs3.mkdirSync(path3.join(memoryDir, "decisions"), { recursive: true });
      fs3.mkdirSync(path3.join(memoryDir, "archive", "decisions"), { recursive: true });
      checks.push({
        category: "Memory Scaffold",
        name: "docs/memory/",
        status: "ok",
        message: "Repaired missing memory directory structure",
        fixed: true
      });
      fixedCount++;
    } else {
      checks.push({
        category: "Memory Scaffold",
        name: "docs/memory/",
        status: "fail",
        message: "Directory does not exist",
        remedy: "Run 'vee init' or 'vee doctor --fix' to scaffold memory layers."
      });
    }
  } else {
    const missing = coreFiles.filter((f) => !fs3.existsSync(path3.join(memoryDir, f)));
    if (missing.length === 0) {
      checks.push({
        category: "Memory Scaffold",
        name: "Core Memory Files",
        status: "ok",
        message: "All 5 core memory files present"
      });
    } else {
      if (options.fix) {
        for (const f of missing) {
          fs3.writeFileSync(path3.join(memoryDir, f), `# ${f.replace(".md", "").toUpperCase()}
`, "utf-8");
        }
        checks.push({
          category: "Memory Scaffold",
          name: "Core Memory Files",
          status: "ok",
          message: `Repaired missing files: ${missing.join(", ")}`,
          fixed: true
        });
        fixedCount++;
      } else {
        checks.push({
          category: "Memory Scaffold",
          name: "Core Memory Files",
          status: "warn",
          message: `Missing files: ${missing.join(", ")}`,
          remedy: "Run 'vee init --force' or 'vee doctor --fix' to re-seed missing memory files."
        });
      }
    }
  }
  const constraintsPath = path3.join(rootDir, CONSTRAINTS_FILE_REL);
  if (fs3.existsSync(constraintsPath)) {
    const rawConstraints = fs3.readFileSync(constraintsPath, "utf-8");
    const tokenCount = estimateTokens(rawConstraints);
    if (tokenCount > DEFAULT_CONSTRAINTS_CAP) {
      checks.push({
        category: "Context Budget",
        name: "Constraints Token Cap",
        status: "warn",
        message: `Constraints file uses ~${tokenCount} tokens (default cap is ${DEFAULT_CONSTRAINTS_CAP}). Overflow rules will be dropped unless marked [pin].`,
        remedy: "Run 'vee gc' or mark essential rules with '[pin]'."
      });
    } else {
      checks.push({
        category: "Context Budget",
        name: "Constraints Token Cap",
        status: "ok",
        message: `Constraints file uses ~${tokenCount} tokens (within ${DEFAULT_CONSTRAINTS_CAP} cap)`
      });
    }
  }
  const gitignorePath = path3.join(rootDir, ".gitignore");
  if (!fs3.existsSync(gitignorePath)) {
    if (options.fix) {
      ensureGitIgnoreProtection(rootDir);
      checks.push({
        category: "Git Security",
        name: ".gitignore",
        status: "ok",
        message: "Created protected .gitignore file",
        fixed: true
      });
      fixedCount++;
    } else {
      checks.push({
        category: "Git Security",
        name: ".gitignore",
        status: "warn",
        message: "No .gitignore found in repository root",
        remedy: "Run 'vee doctor --fix' to generate a protected .gitignore."
      });
    }
  } else {
    const gitignoreContent = fs3.readFileSync(gitignorePath, "utf-8");
    const hasConfigIgnored = gitignoreContent.includes(".vee/config.json") || gitignoreContent.includes(".vee/");
    if (hasConfigIgnored) {
      checks.push({
        category: "Git Security",
        name: ".vee/config.json in .gitignore",
        status: "ok",
        message: "Protected from Git tracking"
      });
    } else {
      if (options.fix) {
        ensureGitIgnoreProtection(rootDir);
        checks.push({
          category: "Git Security",
          name: ".vee/config.json in .gitignore",
          status: "ok",
          message: "Added .vee/config.json to .gitignore",
          fixed: true
        });
        fixedCount++;
      } else {
        checks.push({
          category: "Git Security",
          name: ".vee/config.json in .gitignore",
          status: "fail",
          message: "Not ignored! Risk of exposing local configurations to GitHub.",
          remedy: "Run 'vee doctor --fix' or add '/.vee/config.json' to .gitignore."
        });
      }
    }
  }
  try {
    const gitTracked = runCommandSafe("git", ["ls-files", ".vee/config.json"], { cwd: rootDir });
    if (gitTracked) {
      checks.push({
        category: "Git Security",
        name: "Git Tracking Status",
        status: "fail",
        message: ".vee/config.json is staged or committed in Git!",
        remedy: "Run 'git rm --cached .vee/config.json' to stop tracking."
      });
    } else {
      checks.push({
        category: "Git Security",
        name: "Git Tracking Status",
        status: "ok",
        message: ".vee/config.json is not tracked by Git"
      });
    }
  } catch {
  }
  const credsPath = getGlobalCredentialsPath();
  if (fs3.existsSync(credsPath)) {
    loadGlobalCredentials();
    checks.push({
      category: "Keystore Security",
      name: "Global Credentials Mode",
      status: "ok",
      message: "Credentials permissions verified (0600)"
    });
  }
  const hooksStatus = getHooksStatus(rootDir);
  if (hooksStatus.isGitRepo) {
    if (hooksStatus.installed) {
      checks.push({
        category: "Git Automation",
        name: "Git Hooks",
        status: "ok",
        message: "Veeshree hooks active (pre-commit, post-checkout, post-merge)"
      });
    } else {
      if (options.fix) {
        installGitHooks(rootDir);
        checks.push({
          category: "Git Automation",
          name: "Git Hooks",
          status: "ok",
          message: "Installed Veeshree Git hooks",
          fixed: true
        });
        fixedCount++;
      } else {
        checks.push({
          category: "Git Automation",
          name: "Git Hooks",
          status: "warn",
          message: "Git hooks not yet installed",
          remedy: "Run 'vee hooks install' or 'vee doctor --fix'."
        });
      }
    }
  }
  if (options.fix) {
    installAgentRules(rootDir);
    fixedCount++;
  }
  try {
    const engine = await resolveEngine(rootDir);
    checks.push({
      category: "AI Extraction Engine",
      name: "Active Engine",
      status: "ok",
      message: `${engine.provider} (${engine.model})`
    });
  } catch (err) {
    checks.push({
      category: "AI Extraction Engine",
      name: "Active Engine",
      status: "warn",
      message: "No active model engine connected (indexing-only mode)",
      remedy: "Set a key with 'vee keys set gemini <KEY>' or run local Ollama."
    });
  }
  const driftReport = checkWorkspaceDrift(rootDir);
  if (!driftReport.hasDrift) {
    checks.push({
      category: "Code Integrity",
      name: "Live Hash Drift",
      status: "ok",
      message: `${driftReport.totalRecords} records in sync with codebase`
    });
  } else {
    checks.push({
      category: "Code Integrity",
      name: "Live Hash Drift",
      status: "warn",
      message: `${driftReport.driftedRecordsCount} record(s) drifted from committed baselines`,
      remedy: "Run 'vee sync --accept --all' or 'vee capture' to reconcile."
    });
  }
  let hasFailures = false;
  let hasWarnings = false;
  for (const item of checks) {
    if (item.status === "warn") hasWarnings = true;
    if (item.status === "fail") hasFailures = true;
  }
  if (isJson) {
    console.log(
      JSON.stringify(
        {
          checks,
          hasFailures,
          hasWarnings,
          fixedCount
        },
        null,
        2
      )
    );
    return {
      checks,
      hasFailures,
      hasWarnings,
      fixedCount
    };
  }
  console.log("");
  for (const item of checks) {
    let icon = "";
    if (item.status === "ok") {
      icon = logger.green("[PASS]");
    } else if (item.status === "warn") {
      icon = logger.yellow("[WARN]");
    } else {
      icon = logger.red("[FAIL]");
    }
    console.log(`${icon} ${logger.bold(item.category.padEnd(20))} | ${item.name.padEnd(28)} : ${item.message}`);
    if (item.remedy && !item.fixed) {
      console.log(`       ${logger.cyan("-> Remedy: " + item.remedy)}`);
    }
  }
  console.log("\n" + "-".repeat(70));
  if (options.fix && fixedCount > 0) {
    logger.success(`Doctor successfully repaired ${fixedCount} issue(s)!`);
  }
  if (hasFailures) {
    logger.error("Veeshree Doctor detected critical issues that need attention.");
  } else if (hasWarnings) {
    logger.warn("Veeshree Doctor detected minor warnings. System is functional.");
  } else {
    logger.success("All checks passed! Veeshree is completely healthy, secure, and ready.");
  }
  return {
    checks,
    hasFailures,
    hasWarnings,
    fixedCount
  };
}

// src/commands/migrate.ts
function copyDirSync(src, dest) {
  if (!fs4.existsSync(src)) return;
  fs4.mkdirSync(dest, { recursive: true });
  const entries = fs4.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path4.join(src, entry.name);
    const destPath = path4.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else if (entry.isFile()) {
      fs4.copyFileSync(srcPath, destPath);
    }
  }
}
async function handleMigrateCommand(options = {}, rootDirArg) {
  const opts = typeof options === "string" ? {} : options;
  const rootDir = typeof options === "string" ? options : rootDirArg || process.cwd();
  logger.title("Migrating Project to Veeshree 1.0.0");
  const memoryDir = path4.join(rootDir, MEMORY_DIR_REL);
  if (!fs4.existsSync(memoryDir)) {
    throw new VeeError("docs/memory directory not found. Nothing to migrate.", "ERR_NOT_INITIALIZED");
  }
  if (opts.dryRun) {
    logger.info("[DRY-RUN] Simulating 0.3.x -> 1.0.0 migration plan:");
    logger.info("1. Would back up docs/memory/ to .vee/backup-0.3.x/");
    logger.info("2. Would transfer cached hashes from .vee/index.json into ADR frontmatter");
    logger.info("3. Would rename ADR files to NNNN-slug numbering");
    logger.info("4. Would add idempotent marker blocks to existing agent rule files");
    logger.info("5. Would upgrade config schema to version 1");
    logger.info("6. Would install Git hooks");
    logger.info("7. Would run doctor diagnostics");
    return { success: true, adrsUpdated: 0 };
  }
  const backupDir = path4.join(rootDir, BACKUP_03X_DIR_REL);
  if (fs4.existsSync(backupDir)) {
    fs4.rmSync(backupDir, { recursive: true, force: true });
  }
  copyDirSync(memoryDir, backupDir);
  logger.success(`1. Created safe backup of docs/memory/ at .vee/backup-0.3.x/`);
  const indexPath = path4.join(rootDir, INDEX_FILE_REL);
  let oldHashesMap = {};
  if (fs4.existsSync(indexPath)) {
    try {
      const oldIndex = JSON.parse(fs4.readFileSync(indexPath, "utf-8"));
      if (Array.isArray(oldIndex.documents)) {
        for (const doc of oldIndex.documents) {
          if (doc.linked_hashes) {
            oldHashesMap[doc.path] = doc.linked_hashes;
          }
        }
      }
    } catch {
    }
  }
  let adrsUpdated = 0;
  const decisionsDir = path4.join(rootDir, DECISIONS_DIR_REL);
  if (fs4.existsSync(decisionsDir)) {
    const files = fs4.readdirSync(decisionsDir).filter((f) => f.endsWith(".md"));
    for (const file of files) {
      const fullPath = path4.join(decisionsDir, file);
      const raw = fs4.readFileSync(fullPath, "utf-8");
      const { data, content } = parseDecisionFrontmatter(raw);
      const relDocPath = `docs/memory/decisions/${file}`;
      const cachedHashes = oldHashesMap[relDocPath] || {};
      const linked = Array.isArray(data.linked_files) ? data.linked_files : [];
      const newLinkedFiles = linked.map((item) => {
        const p = typeof item === "string" ? item : item.path;
        let sha256 = typeof item === "object" && item.sha256 ? item.sha256 : cachedHashes[p];
        if (!sha256) {
          try {
            const safeRel = sanitizeRelativePath(p);
            sha256 = calculateNormalizedFileHash(path4.join(rootDir, safeRel)) || void 0;
          } catch {
          }
        }
        return { path: p, sha256 };
      });
      data.linked_files = newLinkedFiles;
      data.generated_by = data.generated_by || "veeshree";
      adrsUpdated++;
      if (!/^\d{4}-/.test(file)) {
        const nextNum = getNextAdrNumber(rootDir);
        const base = path4.basename(file, ".md");
        const slug = slugifyTitle(base);
        const newFilename = `${nextNum}-${slug}.md`;
        const newFullPath = path4.join(decisionsDir, newFilename);
        data.id = data.id || base;
        writeAtomic(newFullPath, stringifyMarkdownFrontmatter(data, content));
        try {
          fs4.unlinkSync(fullPath);
        } catch {
        }
        logger.info(`   Renamed ADR: ${file} -> ${newFilename}`);
      } else {
        writeAtomic(fullPath, stringifyMarkdownFrontmatter(data, content));
      }
    }
  }
  logger.success("2 & 3. Embedded baseline hashes in ADR frontmatter & standardized filenames.");
  const updatedRules = installAgentRules(rootDir);
  logger.success(`4. Updated agent rule marker blocks: ${updatedRules.join(", ")}`);
  const config = loadConfig(rootDir);
  config.schema_version = 1;
  config.version = VEESHREE_VERSION;
  saveConfig(config, rootDir);
  logger.success("5. Upgraded .vee/config.json to schema_version 1.");
  try {
    const installedHooks = installGitHooks(rootDir);
    logger.success(`6. Installed Git hooks: ${installedHooks.join(", ")}`);
  } catch {
    logger.warn("6. Git hooks skipped (not a Git repository or hooks disabled).");
  }
  buildIndex(rootDir);
  logger.log("");
  logger.title("7. Running Diagnostic Health Check After Migration");
  await handleDoctorCommand({ fix: true }, rootDir);
  logger.log("");
  logger.success("Migration complete! Project upgraded to Veeshree 1.0.0.");
  return { success: true, adrsUpdated };
}

// src/commands/sync.ts
function syncVeeshree(rootDir = process.cwd(), options = {}) {
  const isJson = options.json || logger.isJson();
  if (options.quiet) logger.setQuiet(true);
  if (isJson) logger.setJson(true);
  let target = typeof options.accept === "string" ? options.accept : void 0;
  if (options.all) {
    target = "all";
  } else if (options.accept === true || target === "") {
    throw new VeeError(
      "Usage: vee sync --accept <id> or vee sync --accept all (or vee sync --accept --all)",
      "ERR_INVALID_ARGS"
    );
  }
  if (target) {
    if (options.dryRun) {
      const rep = checkWorkspaceDrift(rootDir);
      if (isJson) {
        console.log(JSON.stringify({ dryRun: true, target, report: rep, acceptedCount: 0 }, null, 2));
      } else {
        logger.info(`[DRY-RUN] Would accept baselines for: ${target}`);
      }
      return {
        report: rep,
        acceptedCount: 0,
        exitCode: 0
      };
    }
    if (!isJson) logger.title(`Accepting Drift Baselines: ${target}`);
    const result = acceptBaselines(target, rootDir);
    buildIndex(rootDir);
    const postReport = checkWorkspaceDrift(rootDir);
    if (isJson) {
      console.log(
        JSON.stringify(
          {
            target,
            updatedAdrs: result.updatedAdrs,
            acceptedCount: result.totalUpdatedFiles,
            report: postReport
          },
          null,
          2
        )
      );
    } else {
      logger.success(`Updated baseline hashes in ${result.updatedAdrs.length} ADR(s) across ${result.totalUpdatedFiles} linked file(s).`);
    }
    return {
      report: postReport,
      acceptedCount: result.totalUpdatedFiles,
      exitCode: 0
    };
  }
  if (!isJson) logger.title("Synchronizing Veeshree Memory & Code Hashes");
  const driftReport = checkWorkspaceDrift(rootDir);
  buildIndex(rootDir);
  if (isJson) {
    console.log(JSON.stringify(driftReport, null, 2));
    return {
      report: driftReport,
      exitCode: driftReport.hasDrift ? 1 : 0
    };
  }
  logger.info(`Inspected ${logger.bold(String(driftReport.totalRecords))} architectural decision records.`);
  if (!driftReport.hasDrift) {
    logger.success("All memory records are in sync with live codebase hashes.");
  } else {
    logger.warn(`Found ${driftReport.driftedRecordsCount} record(s) with code drift:`);
    for (const r of driftReport.records) {
      if (r.isDrifted) {
        for (const f of r.files) {
          if (f.status === "missing") {
            console.log(`  - ${logger.red("[MISSING]")} ${r.title}: ${f.path}`);
          } else if (f.status === "drifted") {
            console.log(`  - ${logger.yellow("[DRIFTED]")} ${r.title}: ${f.path}`);
          }
        }
      }
    }
    logger.info(`Run 'vee sync --accept all' or 'vee sync --accept <id>' to accept new baselines into ADR frontmatter.`);
  }
  return {
    report: driftReport,
    exitCode: driftReport.hasDrift ? 1 : 0
  };
}

// src/commands/context.ts
function generateContext(request, options = {}, rootDir = process.cwd()) {
  const isJson = options.json || logger.isJson();
  if (isJson) logger.setJson(true);
  const maxTokens = options.maxTokens ? parseInt(String(options.maxTokens), 10) : void 0;
  const format = isJson ? "json" : options.format || "markdown";
  const result = buildContext(rootDir, {
    request,
    maxTokens,
    includeTasks: options.tasks,
    format
  });
  if (options.explain) {
    if (isJson) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log(explainContextBudget(result));
    }
    return result;
  }
  if (options.raw || isJson || options.format === "xml") {
    process.stdout.write(result.content + "\n");
    return result;
  }
  if (result.overflowNotice) {
    logger.warn(result.overflowNotice);
  }
  if (result.staleWarnings.length > 0) {
    logger.warn(`Stale Drift Detected: ${result.staleWarnings.length} decision(s) reference drifted code:`);
    for (const w of result.staleWarnings) {
      console.error(logger.dim(`  * ${w}`));
    }
  }
  process.stdout.write(result.content + "\n");
  return result;
}

// src/commands/keys.ts
function handleKeysCommand(action, provider, key, options = {}, rootDir = process.cwd()) {
  const isJson = options.json || logger.isJson();
  if (isJson) logger.setJson(true);
  if (action === "list") {
    const keys = listApiKeys(rootDir);
    if (isJson) {
      console.log(JSON.stringify(keys, null, 2));
      return keys;
    }
    logger.title("Configured AI Provider API Keys");
    for (const [p, info] of Object.entries(keys)) {
      const statusStr = info.configured ? logger.cyan(`Configured via ${info.source}`) : logger.dim("Not Configured");
      const warningStr = info.insecureWarning ? ` ${logger.yellow(`[WARN: ${info.insecureWarning}]`)}` : "";
      console.log(`- ${logger.bold(p.toUpperCase().padEnd(10))}: ${info.masked} [${statusStr}]${warningStr}`);
    }
    console.log("");
    logger.info("Keys stored in your global keystore (~/.veeshree/credentials.json) apply to all projects without Git exposure.");
    return keys;
  }
  if (action === "set" || action === "update") {
    if (!provider || !key) {
      throw new VeeError(
        `Usage: vee keys ${action} <provider> <key> [--local]
Supported providers: ${SUPPORTED_KEY_PROVIDERS.join(", ")}`,
        "ERR_INVALID_ARGS"
      );
    }
    const p = provider.toLowerCase();
    if (!SUPPORTED_KEY_PROVIDERS.includes(p)) {
      throw new VeeError(
        `Invalid provider '${provider}'. Supported: ${SUPPORTED_KEY_PROVIDERS.join(", ")}`,
        "ERR_INVALID_ARGS"
      );
    }
    const isGlobal = !options.local;
    setApiKey(p, key, rootDir, isGlobal);
    if (isGlobal) {
      logger.success(`API key stored securely in global keystore (~/.veeshree/credentials.json) for provider: ${p}`);
    } else {
      logger.success(`API key stored locally in .vee/config.json for provider: ${p}`);
      logger.warn("Project-local key storage detected. Avoid committing .vee/config.json.");
    }
    return;
  }
  if (action === "remove") {
    if (!provider) {
      throw new VeeError("Usage: vee keys remove <provider> [--local|--global]", "ERR_INVALID_ARGS");
    }
    const p = provider.toLowerCase();
    const isGlobal = options.local ? false : options.global ? true : void 0;
    removeApiKey(p, rootDir, isGlobal);
    logger.success(`Removed API key for provider: ${p}`);
    return;
  }
  throw new VeeError(`Unknown keys action: '${action}'. Supported: list, set, update, remove.`, "ERR_INVALID_ARGS");
}

// src/core/models.ts
import http from "http";
async function probeHttpJson(url, timeoutMs = 800) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    try {
      const u = new URL(url);
      const req = http.request(
        {
          hostname: u.hostname,
          port: u.port,
          path: u.pathname + (u.search || ""),
          method: "GET",
          timeout: timeoutMs
        },
        (res) => {
          let data = "";
          res.on("data", (chunk) => data += chunk);
          res.on("end", () => {
            const latencyMs = Date.now() - startTime;
            if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
              try {
                resolve({ ok: true, data: JSON.parse(data), latencyMs });
              } catch {
                resolve({ ok: true, data, latencyMs });
              }
            } else {
              resolve({ ok: false, latencyMs });
            }
          });
        }
      );
      req.on("error", () => resolve({ ok: false }));
      req.on("timeout", () => {
        req.destroy();
        resolve({ ok: false });
      });
      req.end();
    } catch {
      resolve({ ok: false });
    }
  });
}
async function detectAvailableModels(rootDir = process.cwd()) {
  const runtimes = [];
  const ollamaProbe = await probeHttpJson("http://127.0.0.1:11434/api/tags");
  if (ollamaProbe.ok && ollamaProbe.data && Array.isArray(ollamaProbe.data.models)) {
    const modelNames = ollamaProbe.data.models.map((m) => m.name || m.model);
    runtimes.push({
      name: "Ollama (Local Engine)",
      provider: "ollama",
      status: "available",
      endpoint: "http://127.0.0.1:11434",
      models: modelNames.length > 0 ? modelNames : ["default"],
      latencyMs: ollamaProbe.latencyMs
    });
  } else {
    runtimes.push({
      name: "Ollama (Local Engine)",
      provider: "ollama",
      status: "unavailable",
      endpoint: "http://127.0.0.1:11434",
      models: []
    });
  }
  const lmStudioProbe = await probeHttpJson("http://127.0.0.1:1234/v1/models");
  if (lmStudioProbe.ok && lmStudioProbe.data && Array.isArray(lmStudioProbe.data.data)) {
    const modelNames = lmStudioProbe.data.data.map((m) => m.id);
    runtimes.push({
      name: "LM Studio (Local Engine)",
      provider: "lmstudio",
      status: "available",
      endpoint: "http://127.0.0.1:1234",
      models: modelNames.length > 0 ? modelNames : ["local-model"],
      latencyMs: lmStudioProbe.latencyMs
    });
  } else {
    runtimes.push({
      name: "LM Studio (Local Engine)",
      provider: "lmstudio",
      status: "unavailable",
      endpoint: "http://127.0.0.1:1234",
      models: []
    });
  }
  const geminiKey = getApiKey("gemini", rootDir);
  runtimes.push({
    name: "Google Gemini Cloud",
    provider: "gemini",
    status: geminiKey ? "available" : "missing_key",
    models: ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-pro"]
  });
  const groqKey = getApiKey("groq", rootDir);
  runtimes.push({
    name: "Groq Cloud LPU",
    provider: "groq",
    status: groqKey ? "available" : "missing_key",
    models: ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "mixtral-8x7b-32768"]
  });
  const nvidiaKey = getApiKey("nvidia", rootDir);
  runtimes.push({
    name: "NVIDIA NIM Cloud",
    provider: "nvidia",
    status: nvidiaKey ? "available" : "missing_key",
    models: ["meta/llama-3.1-70b-instruct", "meta/llama-3.1-8b-instruct"]
  });
  const openaiKey = getApiKey("openai", rootDir);
  runtimes.push({
    name: "OpenAI Cloud",
    provider: "openai",
    status: openaiKey ? "available" : "missing_key",
    models: ["gpt-4o-mini", "gpt-4o", "o3-mini", "o1-preview"]
  });
  return runtimes;
}

// src/commands/models.ts
async function handleModelsCommand(rootDir = process.cwd()) {
  logger.title("Veeshree Model Runtimes & Providers");
  logger.info("Probing local LLM engines and cloud credentials...\n");
  const runtimes = await detectAvailableModels(rootDir);
  for (const r of runtimes) {
    let statusBadge = "";
    if (r.status === "available") {
      const lat = r.latencyMs ? ` (${r.latencyMs}ms)` : "";
      statusBadge = logger.green(`READY${lat}`);
    } else if (r.status === "missing_key") {
      statusBadge = logger.dim("Missing API Key (run: vee keys set)");
    } else {
      statusBadge = logger.dim("Engine Offline");
    }
    console.log(`${logger.bold(r.name.padEnd(28))} [${statusBadge}]`);
    if (r.endpoint) {
      console.log(`  Endpoint: ${logger.dim(r.endpoint)}`);
    }
    if (r.models.length > 0) {
      console.log(`  Models:   ${logger.dim(r.models.slice(0, 4).join(", "))}`);
    }
    console.log("");
  }
}
function handleModelsUseCommand(provider, model, rootDir = process.cwd()) {
  const validProviders = ["gemini", "openai", "anthropic", "groq", "nvidia", "ollama", "lmstudio"];
  const p = provider.toLowerCase();
  if (!validProviders.includes(p)) {
    throw new VeeError(`Invalid provider '${provider}'. Supported: ${validProviders.join(", ")}`, "ERR_INVALID_ARGS");
  }
  const safeModel = validateModelName(model);
  const config = loadConfig(rootDir);
  if (!config.extractor) {
    config.extractor = { provider: p, model: safeModel };
  } else {
    config.extractor.provider = p;
    config.extractor.model = safeModel;
  }
  config.default_extractor = {
    provider: p,
    model: safeModel
  };
  saveConfig(config, rootDir);
  logger.success(`Default extraction model updated: ${logger.bold(p)} (${logger.bold(safeModel)})`);
  logger.info("Ambient watcher ('vee watch') and manual capture will now use this model.");
}
function handleModelsPullCommand(modelName) {
  if (!modelName || !modelName.trim()) {
    throw new VeeError("Usage: vee models pull <model> (e.g. vee models pull llama3.2)", "ERR_INVALID_ARGS");
  }
  const safeModel = validateModelName(modelName);
  logger.title(`Pulling Model via Ollama: ${safeModel}`);
  logger.info("Connecting to local Ollama runtime to download/update model weights...");
  runCommandInteractive("ollama", ["pull", safeModel]);
  logger.success(`Successfully pulled model '${safeModel}' into local Ollama runtime!`);
  logger.info(`To activate: run 'vee models use ollama ${safeModel}'`);
}

// src/commands/capture.ts
import fs5 from "fs";

// src/core/extractor.ts
async function extractMemoryFromContent(content, rootDir = process.cwd(), customProvider, customModel) {
  const resolved = await resolveEngine(rootDir, customProvider, customModel);
  return resolved.extractor.extract(content, resolved.model, {
    apiKey: resolved.apiKey,
    baseUrl: resolved.baseUrl
  });
}

// src/commands/capture.ts
async function handleCaptureCommand(options, rootDir = process.cwd()) {
  logger.title("Capturing Architectural Memory");
  let content = "";
  if (options.diff) {
    try {
      let rawDiff = "";
      try {
        rawDiff = runCommandSafe("git", ["diff", "HEAD"], { cwd: rootDir });
      } catch {
        rawDiff = runCommandSafe("git", ["diff"], { cwd: rootDir });
      }
      content = filterDiffByDenylist(rawDiff, rootDir);
    } catch (err) {
      throw new VeeError(`Failed to read git diff: ${err.message}`, "ERR_PROVIDER_FAILURE");
    }
  } else if (options.file) {
    if (isDenylistedFile(options.file, rootDir)) {
      throw new VeeError(`Cannot capture denylisted or ignored file: ${options.file}`, "ERR_SECURITY_VIOLATION");
    }
    if (!fs5.existsSync(options.file)) {
      throw new VeeError(`File not found: ${options.file}`, "ERR_FILE_NOT_FOUND");
    }
    content = fs5.readFileSync(options.file, "utf-8");
  } else {
    content = await readStdin();
  }
  if (!content.trim()) {
    throw new VeeError(
      "No content provided. Pass a file with --file, run with --diff, or pipe through standard input.",
      "ERR_INVALID_ARGS"
    );
  }
  const config = loadConfig(rootDir);
  const maxPayload = config.privacy?.max_payload_bytes || 24576;
  const redacted = redactContent(content);
  const capped = capDiffPayload(redacted, maxPayload);
  if (options.showPayload) {
    console.log(capped);
    return { payload: capped };
  }
  if (options.dryRun) {
    logger.info(`[DRY-RUN] Would send ${capped.length} bytes of redacted content to extraction engine.`);
    return { payload: capped };
  }
  logger.info("Extracting structural memory delta via background LLM...");
  const delta = await extractMemoryFromContent(capped, rootDir, options.provider, options.model);
  const proposal = createProposal("capture", delta, "cli_capture", rootDir);
  logger.success(`Extracted memory proposal: ${logger.bold(proposal.id)} [Risk: ${proposal.risk.toUpperCase()}]`);
  const hasDecisions = Array.isArray(delta.decisions) && delta.decisions.length > 0;
  const shouldAutoApply = (options.auto || config.proposals?.auto_apply_low_risk) && proposal.risk === "low" && !hasDecisions;
  if (shouldAutoApply) {
    const { reconcileResult } = await acceptProposal(proposal.id, "auto_capture", rootDir);
    logger.success(`[AUTO] Proposal accepted and applied (+${reconcileResult.newDecisions.length} decisions, ${reconcileResult.updatedFiles.length} files updated).`);
    return { proposal, autoApplied: true };
  }
  if (proposal.risk === "high") {
    logger.warn(`Proposal flagged as HIGH RISK (${proposal.flags.join(", ")}). Human review required.`);
    logger.info(`Run 'vee review' or 'vee accept ${proposal.id}' to inspect and apply.`);
  } else {
    logger.info(`Proposal queued for review. Run 'vee accept ${proposal.id}' to apply.`);
  }
  return { proposal, autoApplied: false };
}
async function readStdin() {
  return new Promise((resolve) => {
    let data = "";
    if (process.stdin.isTTY) {
      resolve("");
      return;
    }
    process.stdin.setEncoding("utf-8");
    process.stdin.on("data", (chunk) => data += chunk);
    process.stdin.on("end", () => resolve(data));
  });
}

// src/commands/status.ts
import fs6 from "fs";
import path5 from "path";
function handleStatusCommand(options = {}, rootDir = process.cwd()) {
  if (options.quiet) logger.setQuiet(true);
  if (options.json) logger.setJson(true);
  const config = loadConfig(rootDir);
  const driftReport = checkWorkspaceDrift(rootDir);
  let activeDecisionsCount = 0;
  let supersededDecisionsCount = 0;
  for (const r of driftReport.records) {
    if (r.status === "active") activeDecisionsCount++;
    if (r.status === "superseded") supersededDecisionsCount++;
  }
  let completedTasks = 0;
  let totalTasks = 0;
  const tasksPath = path5.join(rootDir, TASKS_FILE_REL);
  if (fs6.existsSync(tasksPath)) {
    const tasksContent = fs6.readFileSync(tasksPath, "utf-8");
    const completedMatches = tasksContent.match(/- \[x\]/gi);
    const pendingMatches = tasksContent.match(/- \[ \]/gi);
    completedTasks = completedMatches ? completedMatches.length : 0;
    const pendingTasks = pendingMatches ? pendingMatches.length : 0;
    totalTasks = completedTasks + pendingTasks;
  }
  let currentFocus = "General Development";
  const currentStatePath = path5.join(rootDir, CURRENT_STATE_FILE_REL);
  if (fs6.existsSync(currentStatePath)) {
    const stateContent = fs6.readFileSync(currentStatePath, "utf-8");
    const focusMatch = stateContent.match(/- \*\*Current Focus\*\*: (.+)/);
    if (focusMatch && focusMatch[1]) currentFocus = focusMatch[1].trim();
  }
  const pendingProposals = listProposals(rootDir, "pending");
  const percent = totalTasks > 0 ? Math.round(completedTasks / totalTasks * 100) : 0;
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
          drift: driftReport
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
      exitCode
    };
  }
  logger.title("Veeshree Project Memory Status");
  console.log(`${logger.bold("Active Focus:")}       ${logger.cyan(currentFocus)}`);
  console.log(`${logger.bold("Task Progress:")}      ${progressBar} ${percent}% (${completedTasks}/${totalTasks} tasks)`);
  console.log(`${logger.bold("Active Decisions:")}   ${activeDecisionsCount} active (${supersededDecisionsCount} superseded/archived)`);
  console.log(`${logger.bold("Extractor Model:")}    ${config.extractor?.provider || "gemini"} (${config.extractor?.model || "default"})`);
  console.log(`${logger.bold("Token Budget:")}       ${config.context?.max_tokens || 2e3} max tokens`);
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
    exitCode
  };
}
function renderProgressBar(percent, length = 16) {
  const filledLength = Math.round(length * percent / 100);
  const emptyLength = length - filledLength;
  const filled = "\u2588".repeat(filledLength);
  const empty = "\u2591".repeat(emptyLength);
  return `[${filled}${empty}]`;
}

// src/commands/search.ts
function handleSearchCommand(query, options = {}, rootDir = process.cwd()) {
  if (options.json) logger.setJson(true);
  if (!query || !query.trim()) {
    throw new VeeError('Search query required. Usage: vee search "<query>"', "ERR_INVALID_ARGS");
  }
  const results = searchMemory(query, { includeArchived: options.archived }, rootDir);
  if (options.json) {
    console.log(JSON.stringify(results, null, 2));
    return results;
  }
  logger.title(`Search Results for: "${query}"`);
  if (results.length === 0) {
    logger.info("No matching memory documents found.");
    return [];
  }
  for (const item of results) {
    const statusTag = item.status === "active" ? logger.cyan(`[${item.status}]`) : logger.dim(`[${item.status}]`);
    console.log(`${logger.bold(item.title)} ${statusTag} (Score: ${item.score})`);
    console.log(`  Path: ${logger.dim(item.path)}`);
    if (item.tags.length > 0) {
      console.log(`  Tags: ${logger.dim(item.tags.join(", "))}`);
    }
    console.log(`  ${item.snippet}`);
    console.log("");
  }
  return results;
}

// src/commands/decisions.ts
import fs7 from "fs";
import path6 from "path";
function handleDecisionsCommand(options = {}, rootDir = process.cwd()) {
  const isJson = options.json || logger.isJson();
  if (isJson) logger.setJson(true);
  const sub = options.subcommand || "list";
  if (sub === "new") {
    if (!options.title) {
      throw new VeeError("Usage: vee decisions new <title>", "ERR_INVALID_ARGS");
    }
    const nextNum = getNextAdrNumber(rootDir);
    const slug = slugifyTitle(options.title);
    const filename = `${nextNum}-${slug}.md`;
    const fullPath = path6.join(rootDir, DECISIONS_DIR_REL, filename);
    const frontmatter = {
      id: `${nextNum}-${slug}`,
      title: options.title,
      status: "active",
      date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      tags: ["architecture"],
      linked_files: [],
      generated_by: "veeshree"
    };
    const body = `# ${options.title}

## Context & Problem Statement
Describe the context and problem statement here.

## Decision
Concrete decision and architectural approach.

## Rationale
Why this choice was selected.

## Alternatives Considered
- None explicitly recorded.

## Linked Files
- None specified.
`;
    writeAtomic(fullPath, stringifyMarkdownFrontmatter(frontmatter, body));
    buildIndex(rootDir);
    logger.success(`Created new ADR: docs/memory/decisions/${filename}`);
    return;
  }
  if (sub === "show") {
    if (!options.id) {
      throw new VeeError("Usage: vee decisions show <id>", "ERR_INVALID_ARGS");
    }
    const adr = findAdr(options.id, rootDir);
    if (!adr) {
      throw new VeeError(`ADR '${options.id}' not found.`, "ERR_FILE_NOT_FOUND");
    }
    logger.title(`ADR: ${adr.data.title || adr.id}`);
    console.log(`ID:           ${adr.id}`);
    console.log(`Status:       ${adr.data.status}`);
    console.log(`Date:         ${adr.data.date}`);
    console.log(`File:         ${adr.relPath}`);
    if (adr.data.supersedes) {
      console.log(`Supersedes:   ${logger.yellow(adr.data.supersedes)}`);
    }
    if (adr.data.superseded_by) {
      console.log(`Superseded By:${logger.yellow(adr.data.superseded_by)}`);
    }
    console.log("\n" + "-".repeat(60) + "\n");
    console.log(adr.content);
    return;
  }
  if (sub === "supersede") {
    if (!options.id || !options.title) {
      throw new VeeError("Usage: vee decisions supersede <old-id> <new-title>", "ERR_INVALID_ARGS");
    }
    const oldAdr = findAdr(options.id, rootDir);
    if (!oldAdr) {
      throw new VeeError(`Original ADR '${options.id}' not found.`, "ERR_FILE_NOT_FOUND");
    }
    const nextNum = getNextAdrNumber(rootDir);
    const slug = slugifyTitle(options.title);
    const newId = `${nextNum}-${slug}`;
    const newFilename = `${newId}.md`;
    const newFullPath = path6.join(rootDir, DECISIONS_DIR_REL, newFilename);
    oldAdr.data.status = "superseded";
    oldAdr.data.superseded_by = newId;
    writeAtomic(oldAdr.fullPath, stringifyMarkdownFrontmatter(oldAdr.data, oldAdr.content));
    const newFrontmatter = {
      id: newId,
      title: options.title,
      status: "active",
      date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      tags: oldAdr.data.tags || ["architecture"],
      linked_files: oldAdr.data.linked_files || [],
      supersedes: oldAdr.id,
      generated_by: "veeshree"
    };
    const newBody = `# ${options.title}

## Context & Problem Statement
Supersedes ADR [${oldAdr.id}] '${oldAdr.data.title}'.

## Decision
New architectural decision details.

## Rationale
Why the previous approach was superseded.

## Alternatives Considered
- Previous decision: [${oldAdr.id}]

## Linked Files
- Retained linked files from prior ADR.
`;
    writeAtomic(newFullPath, stringifyMarkdownFrontmatter(newFrontmatter, newBody));
    buildIndex(rootDir);
    logger.success(`Marked ADR '${oldAdr.id}' as SUPERSEDED by '${newId}'.`);
    logger.success(`Created replacement ADR: docs/memory/decisions/${newFilename}`);
    return;
  }
  if (sub === "link") {
    if (!options.id || !options.targetFile) {
      throw new VeeError("Usage: vee decisions link <id> <file-path>", "ERR_INVALID_ARGS");
    }
    const adr = findAdr(options.id, rootDir);
    if (!adr) {
      throw new VeeError(`ADR '${options.id}' not found.`, "ERR_FILE_NOT_FOUND");
    }
    const safeRel = sanitizeRelativePath(options.targetFile);
    const absPath = path6.join(rootDir, safeRel);
    const hash = calculateNormalizedFileHash(absPath);
    if (!Array.isArray(adr.data.linked_files)) {
      adr.data.linked_files = [];
    }
    const existingIdx = adr.data.linked_files.findIndex((item) => {
      const p = typeof item === "string" ? item : item.path;
      return p === safeRel;
    });
    const newEntry = { path: safeRel, sha256: hash || void 0 };
    if (existingIdx >= 0) {
      adr.data.linked_files[existingIdx] = newEntry;
    } else {
      adr.data.linked_files.push(newEntry);
    }
    writeAtomic(adr.fullPath, stringifyMarkdownFrontmatter(adr.data, adr.content));
    buildIndex(rootDir);
    logger.success(`Linked '${safeRel}' (${hash ? hash.slice(0, 12) + "..." : "missing"}) to ADR [${adr.id}].`);
    return;
  }
  const indexData = loadOrBuildIndex(rootDir);
  let decisions = indexData.documents.filter(
    (d) => d.type === "decision" || d.type === "archived_decision"
  );
  if (options.status) {
    decisions = decisions.filter((d) => d.status === options.status);
  } else if (!options.all) {
    decisions = decisions.filter((d) => d.status === "active");
  }
  if (isJson) {
    console.log(JSON.stringify(decisions, null, 2));
    return decisions;
  }
  logger.title("Architectural Decision Records (ADRs)");
  if (decisions.length === 0) {
    logger.info("No architectural decision records found.");
    return;
  }
  for (const doc of decisions) {
    const statusBadge = doc.status === "active" ? logger.cyan("[ACTIVE]") : doc.status === "superseded" ? logger.yellow("[SUPERSEDED]") : logger.dim(`[${doc.status.toUpperCase()}]`);
    const driftBadge = doc.stale ? logger.warn(" [STALE CODE DRIFT]") : "";
    console.log(`${logger.bold(doc.title)} ${statusBadge}${driftBadge}`);
    console.log(`  ID:     ${logger.bold(doc.id)}`);
    console.log(`  File:   ${logger.dim(doc.path)}`);
    if (doc.tags.length > 0) {
      console.log(`  Tags:   ${logger.dim(doc.tags.join(", "))}`);
    }
    if (doc.linked_files.length > 0) {
      console.log(`  Linked: ${logger.dim(doc.linked_files.join(", "))}`);
    }
    console.log("");
  }
}
function findAdr(identifier, rootDir) {
  const dirs = [
    path6.join(rootDir, DECISIONS_DIR_REL),
    path6.join(rootDir, ARCHIVE_DECISIONS_DIR_REL)
  ];
  for (const dir of dirs) {
    if (!fs7.existsSync(dir)) continue;
    const files = fs7.readdirSync(dir).filter((f) => f.endsWith(".md"));
    for (const f of files) {
      const fileId = path6.basename(f, ".md");
      const fullPath = path6.join(dir, f);
      const raw = fs7.readFileSync(fullPath, "utf-8");
      const { data, content } = parseDecisionFrontmatter(raw);
      if (data.id === identifier || fileId === identifier || fileId.endsWith(`-${identifier}`)) {
        return {
          id: data.id || fileId,
          fullPath,
          relPath: normalizePosix(path6.relative(rootDir, fullPath)),
          data,
          content
        };
      }
    }
  }
  return null;
}

// src/commands/gc.ts
function handleGcCommand(options = {}, rootDir = process.cwd()) {
  if (options.dryRun) {
    logger.info("[DRY-RUN] Simulating Garbage Collection & Archival...");
  } else {
    logger.title("Running Memory Garbage Collection & Archival");
  }
  const result = runGarbageCollection(rootDir, { dryRun: options.dryRun });
  if (result.archivedTasksCount > 0) {
    logger.success(`${options.dryRun ? "Would archive" : "Archived"} ${result.archivedTasksCount} old progress item(s) to docs/memory/archive/completed-tasks.md`);
  } else {
    logger.info("Progress buffer within limit. No task archiving needed.");
  }
  if (result.supersededDecisionsCount > 0) {
    logger.success(`${options.dryRun ? "Would relocate" : "Relocated"} ${result.supersededDecisionsCount} superseded decision(s) to docs/memory/archive/decisions/:`);
    for (const d of result.relocatedDecisions) {
      console.log(`  - ${logger.dim(d)}`);
    }
  } else {
    logger.info("No superseded decision records found.");
  }
  return result;
}

// src/core/watch/watcher.ts
import fs9 from "fs";
import path8 from "path";

// src/core/watch/diff-state.ts
import fs8 from "fs";
import path7 from "path";
import crypto from "crypto";
function splitDiffIntoHunks(diff) {
  if (!diff || !diff.trim()) return [];
  if (diff.includes("diff --git ")) {
    return diff.split(/(?=^diff --git )/m).map((h) => h.trim()).filter((h) => h.length > 0);
  }
  return diff.split(/(?=^--- )/m).map((h) => h.trim()).filter((h) => h.length > 0);
}
function filterOutProcessedHunks(diff, processedHashes = []) {
  const hashSet = processedHashes instanceof Set ? processedHashes : new Set(processedHashes);
  const hunks = splitDiffIntoHunks(diff);
  const newHunkTexts = [];
  const newHashes = [];
  for (const hunk of hunks) {
    const hash = crypto.createHash("sha256").update(hunk).digest("hex");
    if (!hashSet.has(hash)) {
      newHunkTexts.push(hunk);
      newHashes.push(hash);
    }
  }
  return {
    filteredDiff: newHunkTexts.join("\n\n"),
    newHashes
  };
}
function loadWatchState(rootDir = process.cwd()) {
  const statePath = path7.join(rootDir, WATCH_STATE_FILE_REL);
  if (!fs8.existsSync(statePath)) {
    return {
      lastDiffFingerprint: "",
      processedHunkHashes: [],
      callsThisHour: 0,
      hourWindowStart: Date.now()
    };
  }
  try {
    const raw = fs8.readFileSync(statePath, "utf-8");
    const parsed = JSON.parse(raw);
    return {
      lastDiffFingerprint: parsed.lastDiffFingerprint || "",
      processedHunkHashes: Array.isArray(parsed.processedHunkHashes) ? parsed.processedHunkHashes : [],
      callsThisHour: typeof parsed.callsThisHour === "number" ? parsed.callsThisHour : 0,
      hourWindowStart: typeof parsed.hourWindowStart === "number" ? parsed.hourWindowStart : Date.now(),
      lastProcessedAt: parsed.lastProcessedAt
    };
  } catch {
    return {
      lastDiffFingerprint: "",
      processedHunkHashes: [],
      callsThisHour: 0,
      hourWindowStart: Date.now()
    };
  }
}
function saveWatchState(state, rootDir = process.cwd()) {
  const veeDir = path7.join(rootDir, VEE_DIR_REL);
  if (!fs8.existsSync(veeDir)) {
    fs8.mkdirSync(veeDir, { recursive: true });
  }
  const statePath = path7.join(rootDir, WATCH_STATE_FILE_REL);
  writeAtomic(statePath, JSON.stringify(state, null, 2));
}
function computeDiffFingerprint(diff) {
  return crypto.createHash("sha256").update(diff.trim()).digest("hex");
}
function canMakeWatchCall(maxCallsPerHour, state) {
  const now = Date.now();
  const ONE_HOUR = 3600 * 1e3;
  if (now - state.hourWindowStart > ONE_HOUR) {
    state.callsThisHour = 0;
    state.hourWindowStart = now;
    return true;
  }
  return state.callsThisHour < maxCallsPerHour;
}

// src/core/watch/watcher.ts
function writeWatchLog(rootDir, level, message) {
  try {
    const logsDir = path8.join(rootDir, LOGS_DIR_REL);
    if (!fs9.existsSync(logsDir)) {
      fs9.mkdirSync(logsDir, { recursive: true });
    }
    const logPath = path8.join(rootDir, WATCH_LOG_FILE_REL);
    const line = `[${(/* @__PURE__ */ new Date()).toISOString()}] [${level.toUpperCase()}] ${message}
`;
    fs9.appendFileSync(logPath, line, "utf-8");
  } catch {
  }
}
async function startMemoryWatcher(rootDir = process.cwd(), options = {}) {
  const config = loadConfig(rootDir);
  const debounceTimeMs = (options.debounceSeconds || config.watch?.debounce_seconds || 5) * 1e3;
  const maxCallsPerHour = config.watch?.max_calls_per_hour || 30;
  const isAuto = options.auto !== void 0 ? options.auto : config.watch?.auto || false;
  let debounceTimer = null;
  let pollingInterval = null;
  let isProcessing = false;
  let backoffAttempts = 0;
  let nextAllowedTime = 0;
  writeWatchLog(rootDir, "info", `Watcher started (debounce: ${debounceTimeMs / 1e3}s, auto: ${isAuto})`);
  logger.title("Veeshree Ambient Memory Watcher");
  logger.info(`Watching workspace for code modifications (settle debounce: ${debounceTimeMs / 1e3}s)...`);
  logger.info(`Auto-apply low risk deltas: ${isAuto ? logger.green("ENABLED") : logger.dim("DISABLED (proposals only)")}`);
  logger.info("Press Ctrl+C to stop.\n");
  async function processCodeModifications() {
    if (isProcessing) return;
    if (Date.now() < nextAllowedTime) {
      writeWatchLog(rootDir, "debug", "Backoff active. Skipping extraction cycle.");
      return;
    }
    isProcessing = true;
    try {
      const state = loadWatchState(rootDir);
      let diff = "";
      try {
        let rawTracked = "";
        try {
          rawTracked = runCommandSafe("git", ["diff", "HEAD"], { cwd: rootDir });
        } catch {
          rawTracked = runCommandSafe("git", ["diff"], { cwd: rootDir });
        }
        diff = filterDiffByDenylist(rawTracked, rootDir);
      } catch (err) {
        writeWatchLog(rootDir, "debug", `git diff error: ${err?.message || err}`);
      }
      try {
        const untrackedOutput = runCommandSafe("git", ["ls-files", "--others", "--exclude-standard"], { cwd: rootDir });
        const untrackedFiles = untrackedOutput.split("\n").map((f) => f.trim()).filter(Boolean);
        for (const file of untrackedFiles.slice(0, 5)) {
          const filePath = path8.join(rootDir, file);
          if (!isDenylistedFile(filePath, rootDir) && fs9.existsSync(filePath)) {
            try {
              const fileContent = fs9.readFileSync(filePath, "utf-8");
              diff += `
--- /dev/null
+++ b/${file}
@@ -0,0 +1,50 @@
${fileContent.slice(0, 3e3)}
`;
            } catch {
            }
          }
        }
      } catch {
      }
      if (!diff || diff.trim().length < 20) {
        return;
      }
      const fingerprint = computeDiffFingerprint(diff);
      if (fingerprint === state.lastDiffFingerprint) {
        writeWatchLog(rootDir, "debug", `Diff fingerprint unchanged (${fingerprint}). Skipping extraction.`);
        return;
      }
      if (!canMakeWatchCall(maxCallsPerHour, state)) {
        writeWatchLog(rootDir, "warn", `Hourly API ceiling reached (${maxCallsPerHour} calls/hr). Skipping.`);
        logger.warn(`[WATCH] Hourly API limit reached (${maxCallsPerHour} calls/hr). Skipping extraction.`);
        return;
      }
      const { filteredDiff: newHunksDiff, newHashes } = filterOutProcessedHunks(diff, state.processedHunkHashes);
      const diffToSend = newHunksDiff.trim() ? newHunksDiff : diff;
      const maxPayload = config.privacy?.max_payload_bytes || 24576;
      const redactedDiff = redactContent(diffToSend);
      const cappedDiff = capDiffPayload(redactedDiff, maxPayload);
      writeWatchLog(rootDir, "info", `Extracting memory for changed code (${diffToSend.split("\n").length} lines)...`);
      logger.info(`[WATCH] Detected code changes (${diffToSend.split("\n").length} diff lines). Extracting memory...`);
      const delta = await extractMemoryFromContent(cappedDiff, rootDir, options.provider, options.model);
      state.callsThisHour++;
      state.lastDiffFingerprint = fingerprint;
      state.processedHunkHashes = Array.from(/* @__PURE__ */ new Set([...state.processedHunkHashes || [], ...newHashes]));
      state.lastProcessedAt = (/* @__PURE__ */ new Date()).toISOString();
      saveWatchState(state, rootDir);
      const proposal = createProposal("watch", delta, "watch_daemon", rootDir);
      writeWatchLog(rootDir, "info", `Created proposal ${proposal.id} (risk: ${proposal.risk})`);
      const hasDecisions = Array.isArray(delta.decisions) && delta.decisions.length > 0;
      if (isAuto && proposal.risk === "low" && !hasDecisions) {
        const { reconcileResult } = await acceptProposal(proposal.id, "watch_auto", rootDir);
        const total = reconcileResult.newDecisions.length + reconcileResult.updatedFiles.length;
        logger.success(`[WATCH] Auto-applied low-risk proposal ${proposal.id} (+${reconcileResult.newDecisions.length} decisions, ${reconcileResult.updatedFiles.length} files updated).`);
        writeWatchLog(rootDir, "info", `Auto-applied proposal ${proposal.id} (${total} updates)`);
      } else {
        if (proposal.risk === "high") {
          logger.warn(`[WATCH] Generated HIGH-RISK proposal ${logger.bold(proposal.id)}. Requires human review: run 'vee review'`);
        } else {
          logger.info(`[WATCH] Generated pending proposal ${logger.bold(proposal.id)}. Review with 'vee review' or 'vee accept ${proposal.id}'`);
        }
      }
      backoffAttempts = 0;
      nextAllowedTime = 0;
    } catch (err) {
      backoffAttempts++;
      const backoffSec = Math.min(60, Math.pow(2, backoffAttempts));
      nextAllowedTime = Date.now() + backoffSec * 1e3;
      writeWatchLog(rootDir, "error", `Watch extraction failure: ${err?.message || err} (backing off ${backoffSec}s)`);
      logger.warn(`[WATCH] Extraction failed: ${err?.message || err} (retrying in ${backoffSec}s)`);
    } finally {
      isProcessing = false;
    }
  }
  let watcher = null;
  try {
    watcher = fs9.watch(
      rootDir,
      { recursive: true },
      (_eventType, filename) => {
        if (!filename) return;
        const normalized = filename.replace(/\\/g, "/");
        const segments = normalized.split("/");
        const ignoredDirs = /* @__PURE__ */ new Set([".git", "node_modules", "dist", ".next", ".vee"]);
        if (segments.some((s) => ignoredDirs.has(s)) || normalized.startsWith("docs/memory")) {
          return;
        }
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          processCodeModifications();
        }, debounceTimeMs);
      }
    );
    watcher.on("error", (err) => {
      writeWatchLog(rootDir, "error", `fs.watch error event: ${err?.message || err}. Falling back to polling.`);
      if (!pollingInterval) {
        pollingInterval = setInterval(() => {
          processCodeModifications();
        }, 3e3);
      }
    });
  } catch (watchErr) {
    writeWatchLog(rootDir, "error", `Recursive fs.watch failed, falling back to polling: ${watchErr.message}`);
    pollingInterval = setInterval(() => {
      processCodeModifications();
    }, 2e3);
    return {
      stop: () => {
        if (pollingInterval) clearInterval(pollingInterval);
      }
    };
  }
  return {
    stop: () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      if (pollingInterval) clearInterval(pollingInterval);
      if (watcher) watcher.close();
      writeWatchLog(rootDir, "info", "Watcher stopped.");
    }
  };
}

// src/core/watch/daemon.ts
import fs10 from "fs";
import path9 from "path";
import { spawn } from "child_process";
function isProcessAlive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}
function getDaemonStatus(rootDir = process.cwd()) {
  const pidPath = path9.join(rootDir, WATCH_PID_FILE_REL);
  const logPath = path9.join(rootDir, WATCH_LOG_FILE_REL);
  if (!fs10.existsSync(pidPath)) {
    return { running: false, logPath };
  }
  try {
    const pidStr = fs10.readFileSync(pidPath, "utf-8").trim();
    const pid = parseInt(pidStr, 10);
    if (!isNaN(pid) && isProcessAlive(pid)) {
      return { running: true, pid, logPath };
    }
  } catch {
  }
  try {
    fs10.unlinkSync(pidPath);
  } catch {
  }
  return { running: false, logPath };
}
function resolveCliEntrypoint(rootDir = process.cwd()) {
  if (process.argv[1]) {
    const candidate = path9.resolve(process.argv[1]);
    if (fs10.existsSync(candidate) && fs10.statSync(candidate).isFile()) {
      return candidate;
    }
  }
  const candidates = [
    path9.resolve(rootDir, "dist", "cli.js"),
    path9.resolve(rootDir, "bin", "vee.js"),
    path9.resolve(__dirname, "cli.js"),
    path9.resolve(__dirname, "../cli.js"),
    path9.resolve(__dirname, "../../dist/cli.js")
  ];
  for (const c of candidates) {
    if (fs10.existsSync(c) && fs10.statSync(c).isFile()) {
      return c;
    }
  }
  return path9.resolve(rootDir, "bin", "vee.js");
}
async function startDaemon(rootDir = process.cwd(), options = {}) {
  const status = getDaemonStatus(rootDir);
  if (status.running && status.pid) {
    throw new VeeError(`Watcher daemon is already running (PID: ${status.pid}).`, "ERR_INVALID_ARGS");
  }
  const veeDir = path9.join(rootDir, VEE_DIR_REL);
  if (!fs10.existsSync(veeDir)) {
    fs10.mkdirSync(veeDir, { recursive: true });
  }
  const cliScript = resolveCliEntrypoint(rootDir);
  const args = [cliScript, "watch"];
  if (options.debounce) args.push("--debounce", options.debounce);
  if (options.provider) args.push("--provider", options.provider);
  if (options.model) args.push("--model", options.model);
  if (options.auto) args.push("--auto");
  const logPath = path9.join(rootDir, WATCH_LOG_FILE_REL);
  const logDir = path9.dirname(logPath);
  if (!fs10.existsSync(logDir)) {
    fs10.mkdirSync(logDir, { recursive: true });
  }
  const outFd = fs10.openSync(logPath, "a");
  const errFd = fs10.openSync(logPath, "a");
  const child = spawn(process.execPath, args, {
    cwd: rootDir,
    detached: true,
    stdio: ["ignore", outFd, errFd],
    windowsHide: true
  });
  child.unref();
  const pid = child.pid;
  if (!pid) {
    throw new VeeError("Failed to spawn background watcher daemon process.", "ERR_PROVIDER_FAILURE");
  }
  const pidPath = path9.join(rootDir, WATCH_PID_FILE_REL);
  fs10.writeFileSync(pidPath, String(pid), "utf-8");
  await new Promise((r) => setTimeout(r, 1e3));
  let alive = false;
  try {
    process.kill(pid, 0);
    alive = true;
  } catch {
    alive = false;
  }
  if (!alive) {
    try {
      fs10.unlinkSync(pidPath);
    } catch {
    }
    let logTail = "";
    if (fs10.existsSync(logPath)) {
      const logs = fs10.readFileSync(logPath, "utf-8").trim();
      logTail = logs.split("\n").slice(-10).join("\n");
    }
    throw new VeeError(
      `Watcher daemon failed to start (process exited immediately).${logTail ? `
Logs:
${logTail}` : ""}`,
      "ERR_PROVIDER_FAILURE"
    );
  }
  return { pid, logPath };
}
function stopDaemon(rootDir = process.cwd()) {
  const status = getDaemonStatus(rootDir);
  if (!status.running || !status.pid) {
    return { stopped: false };
  }
  const pid = status.pid;
  try {
    if (process.platform === "win32") {
      spawn("taskkill", ["/pid", String(pid), "/f", "/t"]);
    } else {
      process.kill(pid, "SIGTERM");
    }
  } catch {
  }
  const pidPath = path9.join(rootDir, WATCH_PID_FILE_REL);
  if (fs10.existsSync(pidPath)) {
    try {
      fs10.unlinkSync(pidPath);
    } catch {
    }
  }
  return { stopped: true, pid };
}

// src/commands/watch.ts
async function handleWatchCommand(options = {}, rootDir = process.cwd()) {
  const isJson = options.json || logger.isJson();
  if (isJson) logger.setJson(true);
  if (options.subcommand === "status") {
    const status = getDaemonStatus(rootDir);
    if (isJson) {
      console.log(JSON.stringify(status, null, 2));
      return status;
    }
    if (status.running) {
      logger.success(`Watcher daemon is RUNNING (PID: ${status.pid}). Log: ${status.logPath}`);
    } else {
      logger.info("Watcher daemon is NOT running.");
    }
    return status;
  }
  if (options.subcommand === "stop") {
    const result = stopDaemon(rootDir);
    if (isJson) {
      console.log(JSON.stringify(result, null, 2));
      return result;
    }
    if (result.stopped) {
      logger.success(`Stopped watcher daemon (PID: ${result.pid}).`);
    } else {
      logger.info("No active watcher daemon found to stop.");
    }
    return result;
  }
  if (options.daemon) {
    const { pid, logPath } = await startDaemon(rootDir, options);
    logger.success(`Watcher daemon spawned in background (PID: ${pid}).`);
    logger.info(`Output logging to: ${logPath}`);
    logger.info(`Check status anytime with 'vee watch status' or stop with 'vee watch stop'.`);
    return;
  }
  const debounceSeconds = options.debounce ? parseInt(options.debounce, 10) : void 0;
  await startMemoryWatcher(rootDir, {
    debounceSeconds,
    provider: options.provider,
    model: options.model,
    auto: options.auto
  });
}

// src/commands/review.ts
function handleReviewCommand(rootDir = process.cwd()) {
  logger.title("Veeshree Proposal Review Queue");
  const pending = listProposals(rootDir, "pending");
  if (pending.length === 0) {
    logger.success("No proposals pending review. Memory is up to date.");
    return [];
  }
  logger.info(`Found ${logger.bold(String(pending.length))} pending proposal(s) awaiting review:
`);
  for (const p of pending) {
    const riskBadge = p.risk === "high" ? logger.red("[HIGH RISK]") : logger.green("[LOW RISK]");
    console.log(`${logger.bold(p.id)} ${riskBadge} (${logger.dim(p.source)} at ${p.created_at})`);
    if (p.flags.length > 0) {
      console.log(`  Flags: ${logger.yellow(p.flags.join(", "))}`);
    }
    if (p.delta.decisions.length > 0) {
      console.log(`  Decisions (+${p.delta.decisions.length}):`);
      for (const d of p.delta.decisions) {
        console.log(`    - ${logger.bold(d.title)}: ${d.decision}`);
      }
    }
    if (p.delta.constraints.length > 0) {
      console.log(`  Constraints (+${p.delta.constraints.length}):`);
      for (const c of p.delta.constraints) {
        console.log(`    - [${c.type.toUpperCase()}] ${c.rule}`);
      }
    }
    if (p.delta.tasks.length > 0) {
      console.log(`  Tasks (+${p.delta.tasks.length}):`);
      for (const t of p.delta.tasks) {
        console.log(`    - [${t.action.toUpperCase()}] ${t.task_name}`);
      }
    }
    if (p.delta.current_state?.current_feature) {
      console.log(`  Current Focus -> ${p.delta.current_state.current_feature}`);
    }
    console.log(`
  ${logger.dim(`-> To accept: vee accept ${p.id}`)}`);
    console.log(`  ${logger.dim(`-> To reject: vee reject ${p.id}`)}
`);
  }
  logger.info("Run 'vee accept --all-low' to accept all low-risk proposals at once.");
  return pending;
}

// src/commands/accept.ts
async function handleAcceptCommand(targetId, options = {}, rootDir = process.cwd()) {
  const isAllLow = options.allLow || targetId === "--all-low";
  if (isAllLow) {
    const pending = listProposals(rootDir, "pending");
    const lowRisk = pending.filter((p) => p.risk === "low");
    if (lowRisk.length === 0) {
      logger.info("No low-risk pending proposals found to accept.");
      return [];
    }
    if (options.dryRun) {
      logger.info(`[DRY-RUN] Would accept ${lowRisk.length} low-risk proposal(s): ${lowRisk.map((p) => p.id).join(", ")}`);
      return lowRisk.map((p) => p.id);
    }
    logger.title(`Accepting All Low-Risk Proposals (${lowRisk.length})`);
    const acceptedIds = [];
    for (const p of lowRisk) {
      const { reconcileResult: reconcileResult2 } = await acceptProposal(p.id, "human_all_low", rootDir);
      acceptedIds.push(p.id);
      logger.success(`Accepted ${p.id} (+${reconcileResult2.newDecisions.length} decisions, ${reconcileResult2.updatedFiles.length} files updated).`);
    }
    logger.success(`Successfully applied ${acceptedIds.length} low-risk proposal(s).`);
    return acceptedIds;
  }
  if (!targetId) {
    throw new VeeError("Usage: vee accept <id|--all-low>", "ERR_INVALID_ARGS");
  }
  const proposal = getProposal(targetId, rootDir);
  if (!proposal) {
    throw new VeeError(`Proposal '${targetId}' not found.`, "ERR_PROPOSAL_NOT_FOUND");
  }
  if (options.dryRun) {
    logger.info(`[DRY-RUN] Would accept proposal ${targetId} (${proposal.risk} risk)`);
    return [targetId];
  }
  logger.title(`Accepting Proposal: ${targetId}`);
  const { reconcileResult } = await acceptProposal(targetId, "human", rootDir);
  logger.success(`Proposal accepted and applied to memory.`);
  if (reconcileResult.newDecisions.length > 0) {
    logger.info(`New decisions created: ${reconcileResult.newDecisions.join(", ")}`);
  }
  logger.info(`Files updated: ${reconcileResult.updatedFiles.join(", ")}`);
  return [targetId];
}

// src/commands/reject.ts
function handleRejectCommand(id, rootDir = process.cwd()) {
  if (!id) {
    throw new VeeError("Usage: vee reject <id>", "ERR_INVALID_ARGS");
  }
  const res = rejectProposal(id, "human", rootDir);
  logger.success(`Rejected proposal: ${res.proposal.id}`);
}

// src/commands/proposals.ts
function handleProposalsCommand(options = {}, rootDir = process.cwd()) {
  const isJson = options.json || logger.isJson();
  if (isJson) logger.setJson(true);
  const statusFilter = options.status || void 0;
  const list = listProposals(rootDir, statusFilter);
  if (isJson) {
    console.log(JSON.stringify(list, null, 2));
    return list;
  }
  logger.title("Veeshree Proposals");
  if (list.length === 0) {
    logger.info("No proposals found.");
    return [];
  }
  for (const p of list) {
    const statusBadge = p.status === "accepted" ? logger.green("[ACCEPTED]") : p.status === "rejected" ? logger.dim("[REJECTED]") : logger.cyan("[PENDING]");
    const riskBadge = p.risk === "high" ? logger.red("[HIGH RISK]") : logger.green("[LOW RISK]");
    console.log(`${logger.bold(p.id)} ${statusBadge} ${riskBadge} (${p.source} at ${p.created_at})`);
    if (p.flags.length > 0) {
      console.log(`  Flags: ${logger.yellow(p.flags.join(", "))}`);
    }
  }
  return list;
}

// src/commands/undo.ts
function handleUndoCommand(stepStr, rootDir = process.cwd()) {
  const step = stepStr ? parseInt(stepStr, 10) : 1;
  const snapshots = listSnapshots(rootDir);
  if (snapshots.length === 0) {
    logger.info("No snapshots found in .vee/snapshots/. Nothing to undo.");
    return;
  }
  logger.title(`Undoing Last Memory Modification (Step ${step})`);
  const result = restoreSnapshot(step, rootDir);
  buildIndex(rootDir);
  logger.success(`Restored memory from snapshot ${logger.bold(result.restoredId)} (${result.timestamp}).`);
}

// src/commands/export.ts
import fs11 from "fs";
import path10 from "path";
function handleExportCommand(options = {}, rootDir = process.cwd()) {
  const memoryDir = path10.join(rootDir, MEMORY_DIR_REL);
  if (!fs11.existsSync(memoryDir)) {
    logger.error("No docs/memory directory found to export.");
    return;
  }
  const files = findMarkdownFiles(memoryDir);
  const bundle = {};
  for (const f of files) {
    const rel = normalizePosix(path10.relative(rootDir, f));
    bundle[rel] = fs11.readFileSync(f, "utf-8");
  }
  const format = options.format || "json";
  if (format === "json") {
    process.stdout.write(JSON.stringify(bundle, null, 2) + "\n");
  } else {
    const parts = [];
    for (const [relPath, content] of Object.entries(bundle)) {
      parts.push(`<!-- FILE: ${relPath} -->
${content}
<!-- END FILE -->`);
    }
    process.stdout.write(parts.join("\n\n") + "\n");
  }
}

// src/commands/import.ts
import fs12 from "fs";
import path11 from "path";
function handleImportCommand(filePath, options = {}, rootDir = process.cwd()) {
  if (!filePath || !fs12.existsSync(filePath)) {
    throw new VeeError(`Import file not found: ${filePath}`, "ERR_FILE_NOT_FOUND");
  }
  try {
    createMemorySnapshot(rootDir, `Pre-import snapshot from ${path11.basename(filePath)}`);
  } catch {
  }
  const raw = fs12.readFileSync(filePath, "utf-8");
  let bundle = {};
  if (raw.trim().startsWith("{")) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed.manifest) {
        if (parsed.manifest.format !== "veeshree-memory-export") {
          throw new VeeError("Invalid bundle manifest format. Expected 'veeshree-memory-export'.", "ERR_INVALID_ARGS");
        }
      }
      if (parsed.files && Array.isArray(parsed.files)) {
        for (const f of parsed.files) {
          if (f.path && typeof f.content === "string") {
            bundle[f.path] = f.content;
          }
        }
      } else {
        bundle = parsed;
      }
    } catch (err) {
      if (err instanceof VeeError) throw err;
      throw new VeeError(`Failed to parse JSON bundle: ${err.message}`, "ERR_INVALID_ARGS");
    }
  } else {
    const regex = /<!-- FILE: ([\s\S]+?) -->\n([\s\S]*?)<!-- END FILE -->/g;
    let match;
    while ((match = regex.exec(raw)) !== null) {
      const relPath = match[1]?.trim();
      const content = match[2] || "";
      if (relPath) {
        bundle[relPath] = content;
      }
    }
  }
  const keys = Object.keys(bundle);
  if (keys.length === 0) {
    throw new VeeError("No valid memory documents detected in import bundle.", "ERR_INVALID_ARGS");
  }
  logger.title(`Importing Memory Bundle (${keys.length} files)`);
  if (options.yes) {
    for (const [relPath, content] of Object.entries(bundle)) {
      const safeRel = sanitizeRelativePath(relPath);
      if (!safeRel.startsWith("docs/memory/")) {
        logger.warn(`Skipping untrusted destination path outside docs/memory: ${safeRel}`);
        continue;
      }
      const fullPath = path11.join(rootDir, safeRel);
      writeAtomic(fullPath, content);
    }
    buildIndex(rootDir);
    logger.success(`Successfully imported ${keys.length} memory file(s).`);
    return { importedFiles: keys.length };
  }
  const delta = {
    decisions: [],
    current_state: {
      current_feature: `Imported from ${path11.basename(filePath)}`,
      completed_in_session: [],
      next_immediate_steps: []
    },
    tasks: [],
    constraints: [],
    rejected_approaches: [],
    discoveries: []
  };
  for (const [relPath, content] of Object.entries(bundle)) {
    const safeRel = sanitizeRelativePath(relPath);
    if (!safeRel.startsWith("docs/memory/")) continue;
    if (safeRel.includes("/decisions/")) {
      const { data, content: body } = parseDecisionFrontmatter(content);
      delta.decisions.push({
        title: data.title || path11.basename(safeRel, ".md"),
        decision: body.slice(0, 500).trim(),
        reason: "Imported from external memory bundle",
        alternatives_considered: data.alternatives_considered || [],
        linked_files: (data.linked_files || []).map((f) => typeof f === "string" ? f : f.path),
        tags: data.tags || ["import"],
        status: data.status || "active"
      });
    } else if (safeRel.endsWith("constraints.md")) {
      const lines = content.split("\n").filter((l) => l.trim().startsWith("-"));
      for (const line of lines) {
        const rule = line.replace(/^-\s*/, "").trim();
        if (rule) {
          delta.constraints.push({ rule, type: "hard", source: "import" });
        }
      }
    }
  }
  const proposal = createProposal("manual", delta, "import", rootDir);
  logger.info(`Import staged in review queue as proposal: ${logger.bold(proposal.id)} [Risk: ${proposal.risk.toUpperCase()}]`);
  logger.info(`Run 'vee accept ${proposal.id}' to inspect and apply, or re-run with --yes to import directly.`);
  return { proposal, importedFiles: keys.length };
}

// src/commands/mcp.ts
import path12 from "path";
async function handleMcpCommand(action, options = {}, rootDir = process.cwd()) {
  const effectiveRoot = options.root ? path12.resolve(options.root) : rootDir;
  if (action === "install") {
    if (!options.client) {
      throw new VeeError("Usage: vee mcp install --client <claude|claude-code|cursor|vscode|gemini>", "ERR_INVALID_ARGS");
    }
    const client = options.client.toLowerCase();
    const { configPath, backupPath } = installMcpClientConfig(client, effectiveRoot, {
      noInstall: options.noInstall,
      root: options.root
    });
    if (backupPath) {
      logger.info(`Created backup of existing config at: ${backupPath}`);
    }
    logger.success(`Configured Veeshree MCP server in ${client} settings: ${configPath}`);
    return;
  }
  await startMcpServer(effectiveRoot);
}

// src/commands/hooks.ts
function handleHooksCommand(action = "status", rootDir = process.cwd(), options = {}) {
  const isJson = options.json || logger.isJson();
  if (isJson) logger.setJson(true);
  if (action === "install") {
    const installed = installGitHooks(rootDir);
    if (isJson) {
      console.log(JSON.stringify({ action: "install", installed }, null, 2));
      return installed;
    }
    logger.success(`Installed Veeshree Git hooks: ${installed.join(", ")}`);
    return installed;
  }
  if (action === "uninstall") {
    const removed = uninstallGitHooks(rootDir);
    if (isJson) {
      console.log(JSON.stringify({ action: "uninstall", removed }, null, 2));
      return removed;
    }
    if (removed.length > 0) {
      logger.success(`Uninstalled Veeshree Git hooks: ${removed.join(", ")}`);
    } else {
      logger.info("No Veeshree Git hooks were found to remove.");
    }
    return removed;
  }
  if (action === "status") {
    const status = getHooksStatus(rootDir);
    if (isJson) {
      console.log(JSON.stringify(status, null, 2));
      return status;
    }
    logger.title("Veeshree Git Hooks Status");
    if (!status.isGitRepo) {
      logger.warn("Not a Git repository.");
      return status;
    }
    console.log(`Hooks Directory:  ${logger.dim(status.hooksDir)}`);
    console.log(`pre-commit:       ${status.preCommitInstalled ? logger.green("[INSTALLED]") : logger.dim("[NOT INSTALLED]")}`);
    console.log(`post-checkout:    ${status.postCheckoutInstalled ? logger.green("[INSTALLED]") : logger.dim("[NOT INSTALLED]")}`);
    console.log(`post-merge:       ${status.postMergeInstalled ? logger.green("[INSTALLED]") : logger.dim("[NOT INSTALLED]")}`);
    return status;
  }
  throw new VeeError(`Unknown hooks action '${action}'. Supported: install, uninstall, status`, "ERR_INVALID_ARGS");
}

// src/commands/rules.ts
function handleRulesCommand(action = "list", options = {}, rootDir = process.cwd()) {
  const selectedAgents = options.agents ? options.agents.split(",").map((a) => a.trim().toLowerCase()).filter(Boolean) : void 0;
  if (action === "update" || action === "list") {
    if (action === "list") {
      logger.title("Veeshree Agent Rule Targets");
      for (const t of KNOWN_AGENT_TARGETS) {
        console.log(`- ${logger.bold(t.name.padEnd(12))}: ${t.relPath}`);
      }
      return;
    }
    const updated = updateAgentRules(rootDir);
    logger.success(`Updated Veeshree marker blocks in: ${updated.join(", ")}`);
    return;
  }
  if (action === "uninstall") {
    const removed = uninstallAgentRules(rootDir, selectedAgents);
    if (removed.length > 0) {
      logger.success(`Removed Veeshree marker blocks from: ${removed.join(", ")}`);
    } else {
      logger.info("No Veeshree marker blocks were found.");
    }
    return;
  }
  throw new VeeError(`Unknown rules action '${action}'. Supported: list, update, uninstall`, "ERR_INVALID_ARGS");
}

// src/commands/ci.ts
import path13 from "path";
var GITHUB_WORKFLOW_TEMPLATE = `name: Veeshree Memory Integrity & Drift Check

on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]

jobs:
  drift-check:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Verify Architectural Drift
        run: npx --yes veeshree status --check --json
`;
function handleCiCommand(action = "init", rootDir = process.cwd()) {
  const workflowPath = path13.join(rootDir, ".github", "workflows", "veeshree.yml");
  writeAtomic(workflowPath, GITHUB_WORKFLOW_TEMPLATE);
  logger.success(`Created GitHub Actions CI workflow: .github/workflows/veeshree.yml`);
}

// src/commands/config.ts
function handleConfigCommand(action = "list", key, value, options = {}, rootDir = process.cwd()) {
  const isJson = options.json || logger.isJson();
  if (isJson) logger.setJson(true);
  if (action === "path") {
    const p = options.global ? getGlobalConfigPath() : getProjectConfigPath(rootDir);
    console.log(p);
    return;
  }
  if (action === "list") {
    const config = loadConfig(rootDir);
    if (!isJson) {
      logger.title("Veeshree Configuration (Merged)");
    }
    console.log(JSON.stringify(config, null, 2));
    return;
  }
  if (action === "get") {
    if (!key) {
      throw new VeeError("Usage: vee config get <key> (e.g. vee config get privacy.allow_cloud)", "ERR_INVALID_ARGS");
    }
    const config = loadConfig(rootDir);
    const val = getConfigProperty(config, key);
    if (val === void 0) {
      logger.info(`(not set)`);
    } else {
      console.log(typeof val === "object" ? JSON.stringify(val, null, 2) : String(val));
    }
    return;
  }
  if (action === "set") {
    if (!key || value === void 0) {
      throw new VeeError("Usage: vee config set <key> <value>", "ERR_INVALID_ARGS");
    }
    const config = loadConfig(rootDir);
    let parsedVal = value;
    if (value === "true") parsedVal = true;
    else if (value === "false") parsedVal = false;
    else if (!isNaN(Number(value)) && value.trim() !== "") parsedVal = Number(value);
    setConfigProperty(config, key, parsedVal);
    saveConfig(config, rootDir, options.global);
    logger.success(`Set ${key} = ${parsedVal} (${options.global ? "global" : "project local"})`);
    return;
  }
  throw new VeeError(`Unknown config action '${action}'. Supported: get, set, list, path`, "ERR_INVALID_ARGS");
}

// src/commands/completion.ts
function handleCompletionCommand(shell = "bash") {
  const commands = [
    "init",
    "migrate",
    "watch",
    "capture",
    "review",
    "accept",
    "reject",
    "proposals",
    "context",
    "search",
    "decisions",
    "sync",
    "status",
    "gc",
    "undo",
    "export",
    "import",
    "mcp",
    "hooks",
    "rules",
    "ci",
    "keys",
    "models",
    "config",
    "doctor",
    "completion"
  ];
  if (shell === "powershell") {
    console.log(`Register-ArgumentCompleter -Native -CommandName vee,veeshree -ScriptBlock {
  param($wordToComplete, $commandAst, $cursorPosition)
  $commands = @(${commands.map((c) => `"${c}"`).join(",")})
  $commands | Where-Object { $_ -like "$wordToComplete*" } | ForEach-Object {
    [System.Management.Automation.CompletionResult]::new($_, $_, 'ParameterValue', $_)
  }
}`);
    return;
  }
  if (shell === "zsh") {
    console.log(`#compdef vee veeshree
_vee() {
  local -a commands
  commands=(${commands.join(" ")})
  _describe 'command' commands
}
compdef _vee vee veeshree`);
    return;
  }
  if (shell === "fish") {
    console.log(`complete -c vee -f -a "${commands.join(" ")}"
complete -c veeshree -f -a "${commands.join(" ")}"`);
    return;
  }
  console.log(`_vee_completions() {
  local cur="\${COMP_WORDS[COMP_CWORD]}"
  local commands="${commands.join(" ")}"
  COMPREPLY=($(compgen -W "\${commands}" -- "\${cur}"))
}
complete -F _vee_completions vee
complete -F _vee_completions veeshree`);
}

// src/cli.ts
var nodeVersion = process.versions.node.split(".");
var majorVersion = parseInt(nodeVersion[0] || "0", 10);
if (majorVersion < 20) {
  logger.error(`Veeshree ${VEESHREE_VERSION} requires Node.js v20.0.0 or higher. Current version: ${process.version}`);
  process.exit(1);
}
var program = new Command();
program.name("vee").description("Veeshree: Local-first context persistence layer for multi-model AI software development").version(VEESHREE_VERSION).option("-q, --quiet", "Suppress non-essential console output").option("--json", "Format supported output as structured JSON").option("--no-color", "Disable terminal colors").hook("preAction", (thisCommand, actionCommand) => {
  const opts = { ...thisCommand.opts(), ...actionCommand?.opts() };
  if (opts.quiet) logger.setQuiet(true);
  if (opts.json) logger.setJson(true);
});
program.command("init").description("Bootstrap Veeshree project memory, heuristic scanner, agent rules, and Git hooks").option("-f, --force", "Overwrite existing memory scaffolds and hooks", false).option("--dry-run", "Preview initialization steps without making filesystem changes", false).option("--agents <list>", "Comma-separated list of target agent rules (claude, cursor, gemini, etc.)").action((options) => {
  runSafe(() => initializeVeeshree(process.cwd(), options));
});
program.command("migrate").description("Upgrade a 0.3.x project to Veeshree 1.0.0 schema, frontmatter baselines, and numbered ADRs").option("--dry-run", "Simulate migration plan without writing files", false).action(async (options) => {
  await runSafeAsync(() => handleMigrateCommand(options, process.cwd()));
});
program.command("sync").description("Re-scan memory, verify SHA-256 code hashes, or explicitly accept drifted baselines").option("-a, --accept [target]", "Explicitly accept drifted baselines into ADR frontmatter (<id> or all)").option("--all", "Accept all drifted baselines (can be combined with --accept)", false).option("-j, --json", "Output drift report in structured JSON format", false).option("-q, --quiet", "Quiet output mode", false).option("--dry-run", "Simulate baseline acceptance without writing files", false).action((options) => {
  runSafe(() => {
    let acceptTarget = options.accept;
    if (options.all) {
      acceptTarget = "all";
    } else if (acceptTarget === true || acceptTarget === "") {
      throw new VeeError(
        "Usage: vee sync --accept <id> or vee sync --accept all (or vee sync --accept --all)",
        "ERR_INVALID_ARGS"
      );
    }
    const result = syncVeeshree(process.cwd(), {
      accept: typeof acceptTarget === "string" ? acceptTarget : void 0,
      all: options.all,
      json: options.json,
      quiet: options.quiet,
      dryRun: options.dryRun
    });
    if (result.exitCode !== 0) {
      process.exit(result.exitCode);
    }
  });
});
var watchCmd = program.command("watch").description("Start ambient background watcher to observe code diffs and queue memory proposals").option("-d, --debounce <seconds>", "Debounce settle window in seconds before extracting (default: 5)").option("-p, --provider <provider>", "Specific model provider override").option("-m, --model <model>", "Specific model name override").option("--auto", "Automatically apply low-risk memory deltas", false).option("--daemon", "Run watcher in the background as a detached daemon process", false).action(async (options) => {
  await runSafeAsync(() => handleWatchCommand(options, process.cwd()));
});
watchCmd.command("status").description("Check if background watcher daemon is currently running").option("-j, --json", "Output daemon status as JSON", false).action(async (options) => {
  await runSafeAsync(() => handleWatchCommand({ subcommand: "status", ...options }, process.cwd()));
});
watchCmd.command("stop").description("Stop background watcher daemon").action(async () => {
  await runSafeAsync(() => handleWatchCommand({ subcommand: "stop" }, process.cwd()));
});
program.command("capture").description("Extract structured decisions and memory updates from conversation logs or diffs into proposal queue").option("-f, --file <path>", "Path to conversation transcript, session log, or diff file").option("--diff", "Capture git diff directly from working tree", false).option("-p, --provider <provider>", "Extraction provider").option("-m, --model <model>", "Custom model name for extraction").option("--auto", "Automatically apply low-risk memory proposal", false).option("--dry-run", "Preview extraction payload without calling model", false).option("--show-payload", "Print exact redacted payload that would be sent to LLM", false).action(async (options) => {
  await runSafeAsync(() => handleCaptureCommand(options, process.cwd()));
});
program.command("review").description("Interactive list of pending memory proposals with diffs and risk scores").action(() => {
  runSafe(() => handleReviewCommand(process.cwd()));
});
program.command("accept [id]").description("Accept a pending proposal and apply its delta to memory").option("--all-low", "Accept all pending low-risk proposals at once", false).option("--dry-run", "Simulate acceptance without modifying files", false).action(async (id, options) => {
  await runSafeAsync(() => handleAcceptCommand(id, options, process.cwd()));
});
program.command("reject <id>").description("Reject a pending memory proposal").action((id) => {
  runSafe(() => handleRejectCommand(id, process.cwd()));
});
program.command("proposals").description("List memory update proposals in queue").option("-j, --json", "Output proposals as structured JSON", false).option("-s, --status <status>", "Filter by status: pending, accepted, rejected").action((options) => {
  runSafe(() => handleProposalsCommand(options, process.cwd()));
});
program.command("context [request]").description("Generate token-budgeted system prompt context payload from active memory").option("-m, --max-tokens <tokens>", "Maximum total context tokens budget").option("-t, --tasks", "Include project tasks list in context", false).option("-j, --json", "Output structured JSON metadata", false).option("-r, --raw", "Output pure prompt text without stderr notices", false).option("--explain", "Show breakdown of token usage per tier and budget caps", false).option("--format <format>", "Output format: markdown, json, or xml", "markdown").action((request, options) => {
  runSafe(() => generateContext(request, options, process.cwd()));
});
var decisionsCmd = program.command("decisions").description("List and manage Architectural Decision Records (ADRs)").option("-a, --all", "Include superseded and proposed decisions", false).option("-s, --status <status>", "Filter by status (active, superseded, proposed)").option("-j, --json", "Output decisions as JSON", false).action((options) => {
  runSafe(() => handleDecisionsCommand({ ...options, subcommand: "list" }, process.cwd()));
});
decisionsCmd.command("new <title>").description("Create a new numbered ADR scaffold").action((title) => {
  runSafe(() => handleDecisionsCommand({ subcommand: "new", title }, process.cwd()));
});
decisionsCmd.command("show <id>").description("Display full ADR with supersede chain").action((id) => {
  runSafe(() => handleDecisionsCommand({ subcommand: "show", id }, process.cwd()));
});
decisionsCmd.command("supersede <old-id> <new-title>").description("Mark an ADR superseded and generate a replacement ADR").action((oldId, newTitle) => {
  runSafe(() => handleDecisionsCommand({ subcommand: "supersede", id: oldId, title: newTitle }, process.cwd()));
});
decisionsCmd.command("link <id> <file-path>").description("Link a source code file to an ADR and record its baseline hash").action((id, filePath) => {
  runSafe(() => handleDecisionsCommand({ subcommand: "link", id, targetFile: filePath }, process.cwd()));
});
program.command("status").description("Display memory health dashboard, task progress, and live drift alerts").option("-c, --check", "Exit with error code 1 if stale drift is detected (for CI / pre-commit)", false).option("-j, --json", "Output status dashboard as JSON", false).option("-q, --quiet", "Quiet output mode", false).action((options) => {
  runSafe(() => {
    const result = handleStatusCommand(options, process.cwd());
    if (result.exitCode !== 0) {
      process.exit(result.exitCode);
    }
  });
});
program.command("search <query>").description("Search indexed memory and decisions for keywords").option("-a, --archived", "Include archived and superseded records", false).option("-j, --json", "Output results as structured JSON", false).action((query, options) => {
  runSafe(() => handleSearchCommand(query, options, process.cwd()));
});
program.command("gc").description("Prune old progress into archive/ and move superseded decisions into archive/decisions/").option("--dry-run", "Simulate archival without modifying files", false).action((options) => {
  runSafe(() => handleGcCommand(options, process.cwd()));
});
program.command("undo [step]").description("Restore memory from pre-apply backup snapshots (default: 1 step back)").action((step) => {
  runSafe(() => handleUndoCommand(step, process.cwd()));
});
program.command("export").description("Export docs/memory as a bundled JSON or Markdown file").option("--format <format>", "Export format: json or md", "json").action((options) => {
  runSafe(() => handleExportCommand(options, process.cwd()));
});
program.command("import <file>").description("Import memory bundle into docs/memory").option("-y, --yes", "Apply import directly without creating review proposals", false).action((file, options) => {
  runSafe(() => handleImportCommand(file, options, process.cwd()));
});
var mcpCmd = program.command("mcp").description("Start Model Context Protocol (MCP) stdio server").option("--root <dir>", "Project or workspace root directory").action(async (options) => {
  const rootDir = options.root ? path14.resolve(options.root) : process.cwd();
  await runSafeAsync(() => handleMcpCommand(void 0, options, rootDir));
});
mcpCmd.command("install").description("Install Veeshree MCP server into client configuration (claude, claude-code, cursor, vscode, gemini)").requiredOption("--client <client>", "Client type: claude, claude-code, cursor, vscode, gemini").option("--root <dir>", "Project or workspace root directory").option("--no-install", "Use local binary instead of npx").action(async (options) => {
  const noInstall = options.install === false || options.noInstall === true;
  await runSafeAsync(() => handleMcpCommand("install", { ...options, noInstall }, process.cwd()));
});
var hooksCmd = program.command("hooks").description("Manage Git hooks (pre-commit drift checks, post-checkout sync)");
hooksCmd.command("install").description("Install Git hooks in repository").action(() => {
  runSafe(() => handleHooksCommand("install", process.cwd()));
});
hooksCmd.command("uninstall").description("Remove Veeshree Git hooks").action(() => {
  runSafe(() => handleHooksCommand("uninstall", process.cwd()));
});
hooksCmd.command("status").description("Inspect current Git hooks status").option("-j, --json", "Output hooks status as JSON", false).action((options) => {
  runSafe(() => handleHooksCommand("status", process.cwd(), options));
});
var rulesCmd = program.command("rules").description("Manage AI agent instruction rule files (.cursorrules, CLAUDE.md, GEMINI.md)");
rulesCmd.command("list").description("List known agent rule targets").action(() => {
  runSafe(() => handleRulesCommand("list", {}, process.cwd()));
});
rulesCmd.command("update").description("Refresh Veeshree marker blocks in all agent rule files").option("--agents <list>", "Specific agents to update").action((options) => {
  runSafe(() => handleRulesCommand("update", options, process.cwd()));
});
rulesCmd.command("uninstall").description("Remove Veeshree marker blocks from agent rule files").option("--agents <list>", "Specific agents to remove blocks from").action((options) => {
  runSafe(() => handleRulesCommand("uninstall", options, process.cwd()));
});
var ciCmd = program.command("ci").description("Continuous Integration setup and configuration");
ciCmd.command("init").description("Generate GitHub Actions workflow file for automated drift checking").action(() => {
  runSafe(() => handleCiCommand("init", process.cwd()));
});
var keysCmd = program.command("keys").description("Manage AI provider API keys securely in machine keystore (~/.veeshree/credentials.json)");
keysCmd.command("list").description("List configured AI model providers with masked keys and sources").option("-j, --json", "Output configured keys as JSON", false).action((options) => {
  runSafe(() => handleKeysCommand("list", void 0, void 0, options, process.cwd()));
});
keysCmd.command("set <provider> <key>").description("Store an API key for a provider (gemini, openai, anthropic, groq, nvidia)").option("-l, --local", "Store in project .vee/config.json instead of global keystore", false).action((provider, key, options) => {
  runSafe(() => handleKeysCommand("set", provider, key, options, process.cwd()));
});
keysCmd.command("update <provider> <key>").description("Update an existing API key for a provider").option("-l, --local", "Update in project .vee/config.json instead of global keystore", false).action((provider, key, options) => {
  runSafe(() => handleKeysCommand("update", provider, key, options, process.cwd()));
});
keysCmd.command("remove <provider>").description("Remove stored API key for a provider").option("-l, --local", "Remove from local .vee/config.json only", false).option("-g, --global", "Remove from global keystore only", false).action((provider, options) => {
  runSafe(() => handleKeysCommand("remove", provider, void 0, options, process.cwd()));
});
var modelsCmd = program.command("models").description("Scan local engine ports (11434, 1234), active LLM runtimes, and configure model versions").action(async () => {
  await runSafeAsync(() => handleModelsCommand(process.cwd()));
});
modelsCmd.command("use <provider> <model>").description("Set default extractor model version (e.g. 'vee models use gemini gemini-2.0-flash')").action((provider, model) => {
  runSafe(() => handleModelsUseCommand(provider, model, process.cwd()));
});
modelsCmd.command("pull <model>").description("Pull / update a local model via Ollama (e.g. 'vee models pull llama3.2')").action((model) => {
  runSafe(() => handleModelsPullCommand(model));
});
var configCmd = program.command("config").description("Manage Veeshree configuration settings");
configCmd.command("list").description("Display merged configuration settings").option("-j, --json", "Output merged config as JSON", false).action((options) => {
  runSafe(() => handleConfigCommand("list", void 0, void 0, options, process.cwd()));
});
configCmd.command("get <key>").description("Get configuration setting value by dot-notation (e.g. 'vee config get privacy.allow_cloud')").action((key) => {
  runSafe(() => handleConfigCommand("get", key, void 0, {}, process.cwd()));
});
configCmd.command("set <key> <value>").description("Set configuration setting value by dot-notation (e.g. 'vee config set privacy.allow_cloud true')").option("-g, --global", "Save to global config (~/.veeshree/config.json)", false).action((key, value, options) => {
  runSafe(() => handleConfigCommand("set", key, value, options, process.cwd()));
});
configCmd.command("path").description("Display path to configuration file").option("-g, --global", "Show path to global config", false).action((options) => {
  runSafe(() => handleConfigCommand("path", void 0, void 0, options, process.cwd()));
});
program.command("doctor").description("Run comprehensive repository health, security, and AI engine connectivity diagnostics").option("--fix", "Automatically repair permissions, missing directories, gitignore, and rules", false).option("-j, --json", "Output diagnostics as JSON", false).action(async (options) => {
  await runSafeAsync(async () => {
    const result = await handleDoctorCommand(options, process.cwd());
    if (result.hasFailures) {
      process.exit(1);
    }
  });
});
program.command("completion [shell]").description("Generate shell autocompletion script (bash, zsh, fish, powershell)").action((shell) => {
  runSafe(() => handleCompletionCommand(shell));
});
function runSafe(fn) {
  try {
    fn();
  } catch (err) {
    handleCliError(err);
  }
}
async function runSafeAsync(fn) {
  try {
    await fn();
  } catch (err) {
    handleCliError(err);
  }
}
function handleCliError(err) {
  if (err instanceof VeeError) {
    logger.error(err.message);
    process.exit(err.exitCode);
  }
  const message = err instanceof Error ? err.message : String(err);
  logger.error(message);
  process.exit(2);
}
program.parse(process.argv);
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
//# sourceMappingURL=cli.js.map