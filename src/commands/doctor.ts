import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { logger } from "../utils/logger.js";
import { resolveActiveEngine } from "../core/engine-resolver.js";
import { loadOrBuildIndex } from "../core/indexer.js";
import { listApiKeys } from "../core/auth.js";
import type { IndexDocument } from "../types/index.js";

export interface DoctorCheckItem {
  category: string;
  name: string;
  status: "ok" | "warn" | "fail";
  message: string;
  remedy?: string;
}

export async function handleDoctorCommand(rootDir: string = process.cwd()): Promise<void> {
  logger.title("Veeshree System Diagnostics & Health Check");

  const checks: DoctorCheckItem[] = [];

  // 1. Check Memory Scaffolding
  const memoryDir = path.join(rootDir, "docs", "memory");
  const coreFiles = [
    "current-state.md",
    "tasks.md",
    "constraints.md",
    "rejected.md",
    "discoveries.md",
  ];

  if (!fs.existsSync(memoryDir)) {
    checks.push({
      category: "Memory Scaffold",
      name: "docs/memory/",
      status: "fail",
      message: "Directory does not exist",
      remedy: "Run 'vee init' to scaffold memory layers.",
    });
  } else {
    const missing = coreFiles.filter((f) => !fs.existsSync(path.join(memoryDir, f)));
    if (missing.length === 0) {
      checks.push({
        category: "Memory Scaffold",
        name: "Core Memory Files",
        status: "ok",
        message: "All 5 core memory files present",
      });
    } else {
      checks.push({
        category: "Memory Scaffold",
        name: "Core Memory Files",
        status: "warn",
        message: `Missing files: ${missing.join(", ")}`,
        remedy: "Run 'vee init --force' to re-seed missing memory files.",
      });
    }
  }

  // 2. Check Git Security & Key Exposure
  const gitignorePath = path.join(rootDir, ".gitignore");
  if (!fs.existsSync(gitignorePath)) {
    checks.push({
      category: "Git Security",
      name: ".gitignore",
      status: "warn",
      message: "No .gitignore found in repository root",
      remedy: "Run 'vee init' to generate a protected .gitignore.",
    });
  } else {
    const gitignoreContent = fs.readFileSync(gitignorePath, "utf-8");
    const hasConfigIgnored = gitignoreContent.includes(".vee/config.json") || gitignoreContent.includes(".vee/");
    if (hasConfigIgnored) {
      checks.push({
        category: "Git Security",
        name: ".vee/config.json in .gitignore",
        status: "ok",
        message: "Protected from Git tracking",
      });
    } else {
      checks.push({
        category: "Git Security",
        name: ".vee/config.json in .gitignore",
        status: "fail",
        message: "Not ignored! Risk of exposing local configurations to GitHub.",
        remedy: "Add '/.vee/config.json' to your .gitignore immediately.",
      });
    }
  }

  // Check if .vee/config.json is currently tracked by git
  try {
    const gitTracked = execSync("git ls-files .vee/config.json", {
      cwd: rootDir,
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "ignore"],
    }).trim();

    if (gitTracked) {
      checks.push({
        category: "Git Security",
        name: "Git Tracking Status",
        status: "fail",
        message: ".vee/config.json is staged or committed in Git!",
        remedy: "Run 'git rm --cached .vee/config.json' to stop tracking without deleting local file.",
      });
    } else {
      checks.push({
        category: "Git Security",
        name: "Git Tracking Status",
        status: "ok",
        message: ".vee/config.json is not tracked by Git",
      });
    }
  } catch {
    // Not a git repo, ignore git command error
  }

  // 3. Check AI Extractor Connectivity
  const keys = listApiKeys(rootDir);
  const anyKeyConfigured = Object.values(keys).some((k) => k.configured);

  try {
    const engine = await resolveActiveEngine(rootDir);
    checks.push({
      category: "AI Extraction Engine",
      name: "Active Engine",
      status: "ok",
      message: `${engine.provider} (${engine.model}) via ${engine.source}`,
    });
  } catch (err: any) {
    checks.push({
      category: "AI Extraction Engine",
      name: "Active Engine",
      status: "warn",
      message: "No active model engine connected (indexing-only mode)",
      remedy: "Set a key with 'vee keys set gemini <KEY>' (saved in ~/.veeshree/credentials.json) or start Ollama.",
    });
  }

  // 4. Check Index & Hash Drift
  const indexFile = path.join(rootDir, ".vee", "index.json");
  if (!fs.existsSync(indexFile)) {
    checks.push({
      category: "Search & Code Hashes",
      name: "Index Cache",
      status: "warn",
      message: "No search index (.vee/index.json) found",
      remedy: "Run 'vee sync' to build initial code hashes and search index.",
    });
  } else {
    try {
      const indexData = loadOrBuildIndex(rootDir);
      const staleDocs = indexData.documents.filter((d: IndexDocument) => d.stale);
      if (staleDocs.length === 0) {
        checks.push({
          category: "Search & Code Hashes",
          name: "Code Integrity",
          status: "ok",
          message: `${indexData.documents.length} memory records in sync with codebase`,
        });
      } else {
        checks.push({
          category: "Search & Code Hashes",
          name: "Code Drift",
          status: "warn",
          message: `${staleDocs.length} record(s) have drifted from linked code SHA-256 hashes`,
          remedy: "Run 'vee sync' or 'vee capture' to reconcile architectural decisions with changed code.",
        });
      }
    } catch {
      checks.push({
        category: "Search & Code Hashes",
        name: "Index Cache",
        status: "warn",
        message: "Could not read .vee/index.json",
        remedy: "Run 'vee sync' to rebuild search index.",
      });
    }
  }

  // Render Diagnostics Report
  console.log("");
  let hasFailures = false;
  let hasWarnings = false;

  for (const item of checks) {
    let icon = "";
    if (item.status === "ok") {
      icon = logger.green("[PASS]");
    } else if (item.status === "warn") {
      icon = logger.yellow("[WARN]");
      hasWarnings = true;
    } else {
      icon = logger.red("[FAIL]");
      hasFailures = true;
    }

    console.log(`${icon} ${logger.bold(item.category.padEnd(20))} | ${item.name.padEnd(28)} : ${item.message}`);
    if (item.remedy) {
      console.log(`       ${logger.cyan("-> Remedy: " + item.remedy)}`);
    }
  }

  console.log("\n" + "-".repeat(70));
  if (hasFailures) {
    logger.error("Veeshree Doctor detected critical issues that need attention.");
  } else if (hasWarnings) {
    logger.warn("Veeshree Doctor detected minor warnings. System is functional.");
  } else {
    logger.success("All checks passed! Veeshree is completely healthy, secure, and ready.");
  }
}
