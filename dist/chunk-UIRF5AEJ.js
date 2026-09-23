// src/utils/logger.ts
import pc from "picocolors";
var logger = {
  info: (msg) => console.log(pc.cyan("\u2139 ") + msg),
  success: (msg) => console.log(pc.green("\u2714 ") + pc.bold(msg)),
  warn: (msg) => console.log(pc.yellow("\u26A0 ") + msg),
  error: (msg) => console.error(pc.red("\u2716 ") + pc.bold(msg)),
  log: (msg) => console.log(msg),
  title: (msg) => console.log("\n" + pc.bold(pc.magenta(`=== ${msg} ===`)) + "\n"),
  dim: (msg) => pc.dim(msg),
  bold: (msg) => pc.bold(msg),
  cyan: (msg) => pc.cyan(msg)
};

// src/core/scanner.ts
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
function scanRepository(targetDir = process.cwd()) {
  const result = {
    name: path.basename(targetDir),
    projectType: "generic",
    frameworks: [],
    languages: [],
    databases: [],
    infrastructure: [],
    recentCommits: []
  };
  const pkgPath = path.join(targetDir, "package.json");
  if (fs.existsSync(pkgPath)) {
    try {
      const pkgContent = fs.readFileSync(pkgPath, "utf-8");
      const pkg = JSON.parse(pkgContent);
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
  }
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
  if (fs.existsSync(path.join(targetDir, "docker-compose.yml")) || fs.existsSync(path.join(targetDir, "docker-compose.yaml"))) {
    result.infrastructure.push("Docker Compose");
  }
  if (fs.existsSync(path.join(targetDir, "Dockerfile"))) {
    result.infrastructure.push("Dockerfile");
  }
  if (fs.existsSync(path.join(targetDir, "schema.prisma")) || fs.existsSync(path.join(targetDir, "prisma", "schema.prisma"))) {
    if (!result.databases.includes("Prisma ORM")) {
      result.databases.push("Prisma ORM");
    }
  }
  if (fs.existsSync(path.join(targetDir, ".env.example")) || fs.existsSync(path.join(targetDir, ".env"))) {
    result.infrastructure.push("Environment Variables Configured");
  }
  result.languages = Array.from(new Set(result.languages));
  result.frameworks = Array.from(new Set(result.frameworks));
  result.databases = Array.from(new Set(result.databases));
  result.infrastructure = Array.from(new Set(result.infrastructure));
  if (result.frameworks.length > 0 || result.languages.length > 0) {
    result.projectType = `${result.languages.join(", ")} application`;
  }
  try {
    const gitLog = execSync('git log -5 --pretty=format:"%s"', {
      cwd: targetDir,
      stdio: ["pipe", "pipe", "ignore"],
      encoding: "utf-8"
    });
    result.recentCommits = gitLog.split("\n").map((s) => s.trim()).filter(Boolean);
  } catch {
    result.recentCommits = [];
  }
  return result;
}

// src/types/index.ts
import { z } from "zod";
var VeeshreeConfigSchema = z.object({
  version: z.string().default("0.1.0"),
  default_extractor: z.object({
    provider: z.enum(["openai", "anthropic", "gemini", "ollama"]).default("gemini"),
    model: z.string().default("gemini-1.5-flash")
  }).default({
    provider: "gemini",
    model: "gemini-1.5-flash"
  }),
  keys: z.object({
    openai: z.string().optional().default(""),
    anthropic: z.string().optional().default(""),
    gemini: z.string().optional().default("")
  }).default({}),
  local_engine: z.object({
    enabled: z.boolean().default(false),
    port: z.number().default(11434),
    model: z.string().default("llama3")
  }).default({
    enabled: false,
    port: 11434,
    model: "llama3"
  }),
  settings: z.object({
    max_context_tokens: z.number().default(2e3),
    auto_sync_on_commit: z.boolean().default(true)
  }).default({
    max_context_tokens: 2e3,
    auto_sync_on_commit: true
  })
});

// src/utils/constants.ts
import path2 from "path";
var MEMORY_DIR_REL = path2.join("docs", "memory");
var DECISIONS_DIR_REL = path2.join("docs", "memory", "decisions");
var ARCHIVE_DIR_REL = path2.join("docs", "memory", "archive");
var ARCHIVE_DECISIONS_DIR_REL = path2.join("docs", "memory", "archive", "decisions");
var VEE_DIR_REL = ".vee";
var CONFIG_FILE_REL = path2.join(".vee", "config.json");
var INDEX_FILE_REL = path2.join(".vee", "index.json");
var CURRENT_STATE_FILE_REL = path2.join("docs", "memory", "current-state.md");
var TASKS_FILE_REL = path2.join("docs", "memory", "tasks.md");
var CONSTRAINTS_FILE_REL = path2.join("docs", "memory", "constraints.md");
var REJECTED_FILE_REL = path2.join("docs", "memory", "rejected.md");
var DISCOVERIES_FILE_REL = path2.join("docs", "memory", "discoveries.md");
var COMPLETED_TASKS_FILE_REL = path2.join("docs", "memory", "archive", "completed-tasks.md");

// src/core/config.ts
import fs2 from "fs";
import path3 from "path";
function getDefaultConfig() {
  return VeeshreeConfigSchema.parse({});
}
function loadConfig(targetDir = process.cwd()) {
  const configPath = path3.join(targetDir, CONFIG_FILE_REL);
  if (!fs2.existsSync(configPath)) {
    return getDefaultConfig();
  }
  try {
    const raw = fs2.readFileSync(configPath, "utf-8");
    const json = JSON.parse(raw);
    return VeeshreeConfigSchema.parse(json);
  } catch {
    return getDefaultConfig();
  }
}
function saveConfig(config, targetDir = process.cwd()) {
  const veeDir = path3.join(targetDir, VEE_DIR_REL);
  if (!fs2.existsSync(veeDir)) {
    fs2.mkdirSync(veeDir, { recursive: true });
  }
  const configPath = path3.join(targetDir, CONFIG_FILE_REL);
  fs2.writeFileSync(configPath, JSON.stringify(config, null, 2), "utf-8");
}

// src/core/templates.ts
function generateCurrentStateTemplate(info) {
  const stackSummary = [
    info.languages.length > 0 ? `- **Languages**: ${info.languages.join(", ")}` : "",
    info.frameworks.length > 0 ? `- **Frameworks / Libraries**: ${info.frameworks.join(", ")}` : "",
    info.databases.length > 0 ? `- **Databases / Data Layer**: ${info.databases.join(", ")}` : "",
    info.infrastructure.length > 0 ? `- **Infrastructure & Tools**: ${info.infrastructure.join(", ")}` : ""
  ].filter(Boolean).join("\n");
  const commitSummary = info.recentCommits.length > 0 ? info.recentCommits.map((c) => `- ${c}`).join("\n") : "- Initial setup / repository initialization";
  return `# Current Project State

## 1. System Overview
- **Project Name**: ${info.name}
- **Detected Stack**:
${stackSummary || "- Standard software project"}

## 2. Active Feature / Milestone
- **Current Focus**: Project Initialization & Core Architecture
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

// src/commands/init.ts
import fs3 from "fs";
import path4 from "path";
function initializeVeeshree(targetDir = process.cwd(), options = {}) {
  logger.title("Initializing Veeshree Context Memory Layer");
  const veeDir = path4.join(targetDir, VEE_DIR_REL);
  const memoryDir = path4.join(targetDir, MEMORY_DIR_REL);
  const decisionsDir = path4.join(targetDir, DECISIONS_DIR_REL);
  const archiveDir = path4.join(targetDir, ARCHIVE_DIR_REL);
  const archiveDecisionsDir = path4.join(targetDir, ARCHIVE_DECISIONS_DIR_REL);
  logger.info("Creating directory hierarchies...");
  const dirsToCreate = [veeDir, memoryDir, decisionsDir, archiveDir, archiveDecisionsDir];
  for (const dir of dirsToCreate) {
    if (!fs3.existsSync(dir)) {
      fs3.mkdirSync(dir, { recursive: true });
    }
  }
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
  const configPath = path4.join(targetDir, CONFIG_FILE_REL);
  if (!fs3.existsSync(configPath) || options.force) {
    const config = loadConfig(targetDir);
    saveConfig(config, targetDir);
    logger.success(`Generated config at ${CONFIG_FILE_REL}`);
  } else {
    logger.info(`Config already exists at ${CONFIG_FILE_REL}`);
  }
  const filesToCreate = [
    {
      relPath: CURRENT_STATE_FILE_REL,
      content: generateCurrentStateTemplate(scanned),
      name: "current-state.md"
    },
    {
      relPath: TASKS_FILE_REL,
      content: generateTasksTemplate(),
      name: "tasks.md"
    },
    {
      relPath: CONSTRAINTS_FILE_REL,
      content: generateConstraintsTemplate(),
      name: "constraints.md"
    },
    {
      relPath: REJECTED_FILE_REL,
      content: generateRejectedTemplate(),
      name: "rejected.md"
    },
    {
      relPath: DISCOVERIES_FILE_REL,
      content: generateDiscoveriesTemplate(),
      name: "discoveries.md"
    }
  ];
  for (const file of filesToCreate) {
    const fullPath = path4.join(targetDir, file.relPath);
    if (!fs3.existsSync(fullPath) || options.force) {
      fs3.writeFileSync(fullPath, file.content, "utf-8");
      logger.success(`Seeded ${file.relPath}`);
    } else {
      logger.info(`Skipped existing ${file.relPath}`);
    }
  }
  const dbDecisionPath = path4.join(decisionsDir, "database.md");
  if (!fs3.existsSync(dbDecisionPath) || options.force) {
    const dbTech = scanned.databases.length > 0 ? scanned.databases.join(", ") : "Standard Data Layer";
    fs3.writeFileSync(
      dbDecisionPath,
      generateDecisionStubTemplate("Database & Storage Architecture", "database", dbTech),
      "utf-8"
    );
    logger.success(`Seeded decision stub at docs/memory/decisions/database.md`);
  }
  const gitHooksDir = path4.join(targetDir, ".git", "hooks");
  if (fs3.existsSync(gitHooksDir)) {
    try {
      const preCommitHook = path4.join(gitHooksDir, "pre-commit");
      const postCheckoutHook = path4.join(gitHooksDir, "post-checkout");
      const hookContent = (cmd) => `#!/bin/sh
# Veeshree automated hook
if command -v npx >/dev/null 2>&1; then
  npx vee ${cmd} || true
fi
`;
      if (!fs3.existsSync(preCommitHook) || options.force) {
        fs3.writeFileSync(preCommitHook, hookContent("sync"), { mode: 493 });
        logger.success("Installed Git pre-commit hook");
      }
      if (!fs3.existsSync(postCheckoutHook) || options.force) {
        fs3.writeFileSync(postCheckoutHook, hookContent("sync"), { mode: 493 });
        logger.success("Installed Git post-checkout hook");
      }
    } catch {
      logger.warn("Could not install git hooks automatically.");
    }
  }
  logger.log("");
  logger.success("Veeshree initialized successfully! Version-controlled memory is active at /docs/memory/");
}

export {
  logger,
  scanRepository,
  VeeshreeConfigSchema,
  MEMORY_DIR_REL,
  DECISIONS_DIR_REL,
  ARCHIVE_DIR_REL,
  ARCHIVE_DECISIONS_DIR_REL,
  VEE_DIR_REL,
  CONFIG_FILE_REL,
  INDEX_FILE_REL,
  CURRENT_STATE_FILE_REL,
  TASKS_FILE_REL,
  CONSTRAINTS_FILE_REL,
  REJECTED_FILE_REL,
  DISCOVERIES_FILE_REL,
  COMPLETED_TASKS_FILE_REL,
  getDefaultConfig,
  loadConfig,
  saveConfig,
  generateCurrentStateTemplate,
  generateTasksTemplate,
  generateConstraintsTemplate,
  generateRejectedTemplate,
  generateDiscoveriesTemplate,
  generateDecisionStubTemplate,
  initializeVeeshree
};
//# sourceMappingURL=chunk-UIRF5AEJ.js.map