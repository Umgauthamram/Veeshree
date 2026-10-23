import { logger } from "../utils/logger.js";
import { moderateAndBootstrap, type ModeratorReport } from "../core/moderator.js";
import { installGitHooks, resolveGitHooksDir } from "../core/hooks/manager.js";

export interface InitOptions {
  force?: boolean;
  dryRun?: boolean;
  agents?: string; // e.g. "claude,cursor"
}

export function initializeVeeshree(
  targetDir: string = process.cwd(),
  options: InitOptions = {}
): ModeratorReport {
  if (options.dryRun) {
    logger.info("[DRY-RUN] Simulating Veeshree project initialization...");
  } else {
    logger.title("Initializing Veeshree Context Memory Layer");
    logger.info("Analyzing project architecture and IDE environment...");
  }

  const selectedAgents = options.agents
    ? options.agents
        .split(",")
        .map((a) => a.trim().toLowerCase())
        .filter(Boolean)
    : undefined;

  const report = moderateAndBootstrap(targetDir, {
    force: options.force,
    selectedAgents,
    dryRun: options.dryRun,
  });

  if (options.dryRun) {
    logger.info(
      `[DRY-RUN] Would seed ${report.seededFiles.length} memory files: ${report.seededFiles.join(", ")}`
    );
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
    logger.info(
      `Injected IDE context instructions: ${logger.bold(report.installedRules.join(", "))}`
    );
  }

  if (report.gitIgnoreUpdated) {
    logger.success(
      "Protected local secrets: added /.vee/config.json and /.vee/index.json to .gitignore"
    );
  }

  // Offer/install git hooks if git repo exists
  try {
    const hooksDir = resolveGitHooksDir(targetDir);
    if (hooksDir) {
      const installedHooks = installGitHooks(targetDir);
      logger.success(`Installed Git hooks: ${installedHooks.join(", ")}`);
    }
  } catch (err: unknown) {
    logger.debug(
      `Failed to automatically install git hooks during init: ${err instanceof Error ? err.message : String(err)}`
    );
  }

  logger.log("");
  logger.success(
    "Veeshree initialized successfully! Version-controlled memory is active at /docs/memory/"
  );

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
