import fs from "node:fs";
import path from "node:path";
import { logger } from "../utils/logger.js";
import { resolveEngine } from "../providers/resolver.js";
import { checkWorkspaceDrift } from "../core/drift/status.js";
import { listApiKeys, getGlobalCredentialsPath, loadGlobalCredentials } from "../core/auth.js";
import { runCommandSafe } from "../utils/process.js";
import { ensureGitIgnoreProtection } from "../core/moderator.js";
import { installGitHooks, getHooksStatus } from "../core/hooks/manager.js";
import { installAgentRules } from "../core/rules/manager.js";
import { estimateTokens } from "../core/context/estimator.js";
import { CONSTRAINTS_FILE_REL, DEFAULT_CONSTRAINTS_CAP } from "../utils/constants.js";

export interface DoctorCheckItem {
  category: string;
  name: string;
  status: "ok" | "warn" | "fail";
  message: string;
  remedy?: string;
  fixed?: boolean;
}

export interface DoctorResult {
  checks: DoctorCheckItem[];
  hasFailures: boolean;
  hasWarnings: boolean;
  fixedCount: number;
}

export async function handleDoctorCommand(
  options: { fix?: boolean; json?: boolean } = {},
  rootDir: string = process.cwd()
): Promise<DoctorResult> {
  const isJson = options.json || logger.isJson();
  if (isJson) logger.setJson(true);

  if (!isJson) {
    logger.title("Veeshree System Diagnostics & Health Check");
  }

  const checks: DoctorCheckItem[] = [];
  let fixedCount = 0;

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
    if (options.fix) {
      fs.mkdirSync(path.join(memoryDir, "decisions"), { recursive: true });
      fs.mkdirSync(path.join(memoryDir, "archive", "decisions"), { recursive: true });
      checks.push({
        category: "Memory Scaffold",
        name: "docs/memory/",
        status: "ok",
        message: "Repaired missing memory directory structure",
        fixed: true,
      });
      fixedCount++;
    } else {
      checks.push({
        category: "Memory Scaffold",
        name: "docs/memory/",
        status: "fail",
        message: "Directory does not exist",
        remedy: "Run 'vee init' or 'vee doctor --fix' to scaffold memory layers.",
      });
    }
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
      if (options.fix) {
        for (const f of missing) {
          fs.writeFileSync(path.join(memoryDir, f), `# ${f.replace(".md", "").toUpperCase()}\n`, "utf-8");
        }
        checks.push({
          category: "Memory Scaffold",
          name: "Core Memory Files",
          status: "ok",
          message: `Repaired missing files: ${missing.join(", ")}`,
          fixed: true,
        });
        fixedCount++;
      } else {
        checks.push({
          category: "Memory Scaffold",
          name: "Core Memory Files",
          status: "warn",
          message: `Missing files: ${missing.join(", ")}`,
          remedy: "Run 'vee init --force' or 'vee doctor --fix' to re-seed missing memory files.",
        });
      }
    }
  }

  // 2. Check Constraints Token Cap Overflow (BUG-7)
  const constraintsPath = path.join(rootDir, CONSTRAINTS_FILE_REL);
  if (fs.existsSync(constraintsPath)) {
    const rawConstraints = fs.readFileSync(constraintsPath, "utf-8");
    const tokenCount = estimateTokens(rawConstraints);
    if (tokenCount > DEFAULT_CONSTRAINTS_CAP) {
      checks.push({
        category: "Context Budget",
        name: "Constraints Token Cap",
        status: "warn",
        message: `Constraints file uses ~${tokenCount} tokens (default cap is ${DEFAULT_CONSTRAINTS_CAP}). Overflow rules will be dropped unless marked [pin].`,
        remedy: "Run 'vee gc' or mark essential rules with '[pin]'.",
      });
    } else {
      checks.push({
        category: "Context Budget",
        name: "Constraints Token Cap",
        status: "ok",
        message: `Constraints file uses ~${tokenCount} tokens (within ${DEFAULT_CONSTRAINTS_CAP} cap)`,
      });
    }
  }

  // 3. Check Git Security & Key Protection
  const gitignorePath = path.join(rootDir, ".gitignore");
  if (!fs.existsSync(gitignorePath)) {
    if (options.fix) {
      ensureGitIgnoreProtection(rootDir);
      checks.push({
        category: "Git Security",
        name: ".gitignore",
        status: "ok",
        message: "Created protected .gitignore file",
        fixed: true,
      });
      fixedCount++;
    } else {
      checks.push({
        category: "Git Security",
        name: ".gitignore",
        status: "warn",
        message: "No .gitignore found in repository root",
        remedy: "Run 'vee doctor --fix' to generate a protected .gitignore.",
      });
    }
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
      if (options.fix) {
        ensureGitIgnoreProtection(rootDir);
        checks.push({
          category: "Git Security",
          name: ".vee/config.json in .gitignore",
          status: "ok",
          message: "Added .vee/config.json to .gitignore",
          fixed: true,
        });
        fixedCount++;
      } else {
        checks.push({
          category: "Git Security",
          name: ".vee/config.json in .gitignore",
          status: "fail",
          message: "Not ignored! Risk of exposing local configurations to GitHub.",
          remedy: "Run 'vee doctor --fix' or add '/.vee/config.json' to .gitignore.",
        });
      }
    }
  }

  // Check if .vee/config.json is currently staged or committed (using safe runCommandSafe)
  try {
    const gitTracked = runCommandSafe("git", ["ls-files", ".vee/config.json"], { cwd: rootDir });
    if (gitTracked) {
      checks.push({
        category: "Git Security",
        name: "Git Tracking Status",
        status: "fail",
        message: ".vee/config.json is staged or committed in Git!",
        remedy: "Run 'git rm --cached .vee/config.json' to stop tracking.",
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
    // not a git repo
  }

  // 4. Check Credentials Permissions (SEC-3)
  const credsPath = getGlobalCredentialsPath();
  if (fs.existsSync(credsPath)) {
    loadGlobalCredentials(); // repairs permissions automatically
    checks.push({
      category: "Keystore Security",
      name: "Global Credentials Mode",
      status: "ok",
      message: "Credentials permissions verified (0600)",
    });
  }

  // 5. Check Git Hooks
  const hooksStatus = getHooksStatus(rootDir);
  if (hooksStatus.isGitRepo) {
    if (hooksStatus.installed) {
      checks.push({
        category: "Git Automation",
        name: "Git Hooks",
        status: "ok",
        message: "Veeshree hooks active (pre-commit, post-checkout, post-merge)",
      });
    } else {
      if (options.fix) {
        installGitHooks(rootDir);
        checks.push({
          category: "Git Automation",
          name: "Git Hooks",
          status: "ok",
          message: "Installed Veeshree Git hooks",
          fixed: true,
        });
        fixedCount++;
      } else {
        checks.push({
          category: "Git Automation",
          name: "Git Hooks",
          status: "warn",
          message: "Git hooks not yet installed",
          remedy: "Run 'vee hooks install' or 'vee doctor --fix'.",
        });
      }
    }
  }

  // 6. Check Agent Rules
  if (options.fix) {
    installAgentRules(rootDir);
    fixedCount++;
  }

  // 7. Check AI Engine Connectivity
  try {
    const engine = await resolveEngine(rootDir);
    checks.push({
      category: "AI Extraction Engine",
      name: "Active Engine",
      status: "ok",
      message: `${engine.provider} (${engine.model})`,
    });
  } catch (err: any) {
    checks.push({
      category: "AI Extraction Engine",
      name: "Active Engine",
      status: "warn",
      message: "No active model engine connected (indexing-only mode)",
      remedy: "Set a key with 'vee keys set gemini <KEY>' or run local Ollama.",
    });
  }

  // 8. Check Code Drift
  const driftReport = checkWorkspaceDrift(rootDir);
  if (!driftReport.hasDrift) {
    checks.push({
      category: "Code Integrity",
      name: "Live Hash Drift",
      status: "ok",
      message: `${driftReport.totalRecords} records in sync with codebase`,
    });
  } else {
    checks.push({
      category: "Code Integrity",
      name: "Live Hash Drift",
      status: "warn",
      message: `${driftReport.driftedRecordsCount} record(s) drifted from committed baselines`,
      remedy: "Run 'vee sync --accept --all' or 'vee capture' to reconcile.",
    });
  }

  // Print summary
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
          fixedCount,
        },
        null,
        2
      )
    );
    return {
      checks,
      hasFailures,
      hasWarnings,
      fixedCount,
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
    fixedCount,
  };
}
