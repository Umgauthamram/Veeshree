import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import type { ScannedProjectInfo } from "../types/index.js";
import { isEnoent } from "../utils/errors.js";
import { logger } from "../utils/logger.js";

/**
 * Enhanced Local Heuristic Scanner
 * Automatically detects:
 * 1. Project Purpose / Idea from README and package descriptions
 * 2. Domain Entities from Prisma schemas, Python models, or TypeScript interfaces
 * 3. API Endpoints from Next.js, Express, FastAPI, Flask routes
 * 4. Active feature focus from Git branch name and recent commit history
 * 5. Languages, Frameworks, Databases, and Infrastructure
 */
export function scanRepository(targetDir: string = process.cwd()): ScannedProjectInfo {
  const result: ScannedProjectInfo = {
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
    activeFeatureFocus: "Core Architecture & Feature Development",
  };

  // 1. Detect Project Purpose from README or Manifests
  detectProjectPurpose(targetDir, result);

  // 2. Detect Tech Stack & Dependencies
  detectNodeStack(targetDir, result);
  detectPythonStack(targetDir, result);
  detectGoStack(targetDir, result);
  detectRustStack(targetDir, result);
  detectInfra(targetDir, result);

  // 3. Detect Domain Entities (Prisma, Django, SQLAlchemy, Types)
  detectDomainEntities(targetDir, result);

  // 4. Detect API Routes & Endpoints
  detectApiEndpoints(targetDir, result);

  // 5. Detect Active Branch & Recent Commits
  detectGitContext(targetDir, result);

  // Deduplicate
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

function detectProjectPurpose(targetDir: string, result: ScannedProjectInfo): void {
  // Check README.md
  const readmeFiles = ["README.md", "readme.md", "README.rst", "README.txt"];
  for (const r of readmeFiles) {
    const rPath = path.join(targetDir, r);
    if (fs.existsSync(rPath)) {
      try {
        const content = fs.readFileSync(rPath, "utf-8");
        // Look for the first 1-2 descriptive paragraphs (skipping headers/badges)
        const lines = content.split("\n");
        const paragraphs: string[] = [];
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          if (
            trimmed.startsWith("#") ||
            trimmed.startsWith("[!") ||
            trimmed.startsWith("<img") ||
            trimmed.startsWith("[![")
          )
            continue;
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
      } catch (err: unknown) {
        if (!isEnoent(err)) {
          logger.debug(
            `Scanner failed to read ${r}: ${err instanceof Error ? err.message : String(err)}`
          );
        }
      }
      break;
    }
  }

  // Check package.json description fallback
  const pkgPath = path.join(targetDir, "package.json");
  if (!result.purpose && fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
      if (pkg.description) {
        result.purpose = pkg.description;
      }
    } catch (err: unknown) {
      if (!isEnoent(err)) {
        logger.debug(
          `Scanner failed to read/parse package.json: ${err instanceof Error ? err.message : String(err)}`
        );
      }
    }
  }

  if (!result.purpose) {
    result.purpose = `${result.name} - Software engineering codebase`;
  }
}

function detectNodeStack(targetDir: string, result: ScannedProjectInfo): void {
  const pkgPath = path.join(targetDir, "package.json");
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
      result.name = pkg.name || result.name;
      result.languages.push("JavaScript / TypeScript");

      const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };

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
    } catch (err: unknown) {
      if (!isEnoent(err)) {
        logger.debug(
          `Scanner failed to parse dependencies in package.json: ${err instanceof Error ? err.message : String(err)}`
        );
      }
    }
  }
}

function detectPythonStack(targetDir: string, result: ScannedProjectInfo): void {
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

function detectGoStack(targetDir: string, result: ScannedProjectInfo): void {
  const goModPath = path.join(targetDir, "go.mod");
  if (fs.existsSync(goModPath)) {
    result.languages.push("Go");
    try {
      const content = fs.readFileSync(goModPath, "utf-8");
      if (/gin-gonic\/gin/i.test(content)) result.frameworks.push("Gin");
      if (/gofiber\/fiber/i.test(content)) result.frameworks.push("Fiber");
      if (/gorm\.io\/gorm/i.test(content)) result.databases.push("GORM");
    } catch (err: unknown) {
      if (!isEnoent(err)) {
        logger.debug(
          `Scanner failed to read go.mod: ${err instanceof Error ? err.message : String(err)}`
        );
      }
    }
  }
}

function detectRustStack(targetDir: string, result: ScannedProjectInfo): void {
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
    } catch (err: unknown) {
      if (!isEnoent(err)) {
        logger.debug(
          `Scanner failed to read Cargo.toml: ${err instanceof Error ? err.message : String(err)}`
        );
      }
    }
  }
}

function detectInfra(targetDir: string, result: ScannedProjectInfo): void {
  if (
    fs.existsSync(path.join(targetDir, "docker-compose.yml")) ||
    fs.existsSync(path.join(targetDir, "docker-compose.yaml"))
  ) {
    result.infrastructure.push("Docker Compose");
  }
  if (fs.existsSync(path.join(targetDir, "Dockerfile"))) {
    result.infrastructure.push("Dockerfile");
  }
  if (
    fs.existsSync(path.join(targetDir, ".env.example")) ||
    fs.existsSync(path.join(targetDir, ".env"))
  ) {
    result.infrastructure.push("Environment Variables Configured");
  }
}

function detectDomainEntities(targetDir: string, result: ScannedProjectInfo): void {
  // Prisma schema
  const prismaFiles = [
    path.join(targetDir, "schema.prisma"),
    path.join(targetDir, "prisma", "schema.prisma"),
  ];
  for (const p of prismaFiles) {
    if (fs.existsSync(p)) {
      try {
        const content = fs.readFileSync(p, "utf-8");
        const modelMatches = content.match(/model\s+([A-Za-z0-9_]+)\s+\{/g);
        if (modelMatches) {
          for (const m of modelMatches) {
            const name = m
              .replace(/model\s+/, "")
              .replace(/\s+\{/, "")
              .trim();
            result.domainEntities.push(name);
          }
        }
      } catch (err: unknown) {
        if (!isEnoent(err)) {
          logger.debug(
            `Scanner failed to read prisma schema: ${err instanceof Error ? err.message : String(err)}`
          );
        }
      }
    }
  }

  // Django / SQLAlchemy models (e.g. models.py)
  const modelsPy = path.join(targetDir, "models.py");
  if (fs.existsSync(modelsPy)) {
    try {
      const content = fs.readFileSync(modelsPy, "utf-8");
      const classMatches = content.match(/class\s+([A-Za-z0-9_]+)\s*\(/g);
      if (classMatches) {
        for (const c of classMatches) {
          const name = c
            .replace(/class\s+/, "")
            .replace(/\s*\(/, "")
            .trim();
          if (name !== "Meta") result.domainEntities.push(name);
        }
      }
    } catch (err: unknown) {
      if (!isEnoent(err)) {
        logger.debug(
          `Scanner failed to read models.py: ${err instanceof Error ? err.message : String(err)}`
        );
      }
    }
  }
}

function detectApiEndpoints(targetDir: string, result: ScannedProjectInfo): void {
  // Next.js App router (app/api/**)
  const appApiDir = path.join(targetDir, "app", "api");
  if (fs.existsSync(appApiDir)) {
    scanRouteDirs(appApiDir, "/api", result.apiEndpoints);
  }

  // Next.js Pages router (pages/api/**)
  const pagesApiDir = path.join(targetDir, "pages", "api");
  if (fs.existsSync(pagesApiDir)) {
    scanRouteDirs(pagesApiDir, "/api", result.apiEndpoints);
  }
}

function scanRouteDirs(dir: string, baseRoute: string, endpoints: string[]): void {
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        scanRouteDirs(fullPath, `${baseRoute}/${entry.name}`, endpoints);
      } else if (
        entry.name.startsWith("route.") ||
        entry.name.endsWith(".ts") ||
        entry.name.endsWith(".js")
      ) {
        endpoints.push(baseRoute);
      }
    }
  } catch (err: unknown) {
    if (!isEnoent(err)) {
      logger.debug(
        `Scanner failed to read route directory ${dir}: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }
}

function detectGitContext(targetDir: string, result: ScannedProjectInfo): void {
  try {
    // Active branch
    const branch = execSync("git rev-parse --abbrev-ref HEAD", {
      cwd: targetDir,
      stdio: ["pipe", "pipe", "ignore"],
      encoding: "utf-8",
    }).trim();
    if (branch) {
      result.activeBranch = branch;
      if (branch !== "main" && branch !== "master") {
        result.activeFeatureFocus = `Feature Branch: ${branch.replace(/^(feature\/|fix\/|feat\/)/, "")}`;
      }
    }

    // Last 5 commits
    const gitLog = execSync('git log -5 --pretty=format:"%s"', {
      cwd: targetDir,
      stdio: ["pipe", "pipe", "ignore"],
      encoding: "utf-8",
    });
    result.recentCommits = gitLog
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    if (!result.activeFeatureFocus && result.recentCommits.length > 0) {
      result.activeFeatureFocus = `Recent work: ${result.recentCommits[0]}`;
    }
  } catch (err: unknown) {
    logger.debug(
      `Scanner git context detection skipped (not a git repo): ${err instanceof Error ? err.message : String(err)}`
    );
    result.recentCommits = [];
  }
}
