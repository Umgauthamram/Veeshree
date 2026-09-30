import { logger } from "../utils/logger.js";
import { moderateAndBootstrap } from "../core/moderator.js";

export interface InitOptions {
  force?: boolean;
}

export function initializeVeeshree(targetDir: string = process.cwd(), options: InitOptions = {}) {
  logger.title("Initializing Veeshree Context Memory Layer");

  logger.info("Analyzing project architecture and IDE environment...");
  const report = moderateAndBootstrap(targetDir, options);

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

  logger.log("");
  logger.success("Veeshree initialized successfully! Version-controlled memory is active at /docs/memory/");
}

