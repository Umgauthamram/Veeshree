import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import type { ScannedProjectInfo } from "../types/index.js";

export function scanRepository(targetDir: string = process.cwd()): ScannedProjectInfo {
  const result: ScannedProjectInfo = {
    name: path.basename(targetDir),
    projectType: "generic",
    frameworks: [],
    languages: [],
    databases: [],
    infrastructure: [],
    recentCommits: [],
  };

  // 1. Check Node.js / package.json
  const pkgPath = path.join(targetDir, "package.json");
  if (fs.existsSync(pkgPath)) {
    try {
      const pkgContent = fs.readFileSync(pkgPath, "utf-8");
      const pkg = JSON.parse(pkgContent);
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
    } catch {
      // ignore parse error
    }
  }

  // 2. Check Python / requirements.txt or pyproject.toml
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

  // 3. Check Go / go.mod
  const goModPath = path.join(targetDir, "go.mod");
  if (fs.existsSync(goModPath)) {
    result.languages.push("Go");
    try {
      const content = fs.readFileSync(goModPath, "utf-8");
      if (/gin-gonic\/gin/i.test(content)) result.frameworks.push("Gin");
      if (/gofiber\/fiber/i.test(content)) result.frameworks.push("Fiber");
      if (/gorm\.io\/gorm/i.test(content)) result.databases.push("GORM");
    } catch {
      // ignore
    }
  }

  // 4. Check Rust / Cargo.toml
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
      // ignore
    }
  }

  // 5. Check Infrastructure files
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

  // Deduplicate
  result.languages = Array.from(new Set(result.languages));
  result.frameworks = Array.from(new Set(result.frameworks));
  result.databases = Array.from(new Set(result.databases));
  result.infrastructure = Array.from(new Set(result.infrastructure));

  // Determine high level project type
  if (result.frameworks.length > 0 || result.languages.length > 0) {
    result.projectType = `${result.languages.join(", ")} application`;
  }

  // 6. Read last 5 Git commits
  try {
    const gitLog = execSync('git log -5 --pretty=format:"%s"', {
      cwd: targetDir,
      stdio: ["pipe", "pipe", "ignore"],
      encoding: "utf-8",
    });
    result.recentCommits = gitLog
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
  } catch {
    // Git not initialized or no commits yet
    result.recentCommits = [];
  }

  return result;
}
