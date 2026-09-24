import { Command } from "commander";
import { initializeVeeshree } from "./commands/init.js";
import { syncVeeshree } from "./commands/sync.js";
import { generateContext } from "./commands/context.js";
import { logger } from "./utils/logger.js";

// Check Node.js version >= 18
const nodeVersion = process.versions.node.split(".");
const majorVersion = parseInt(nodeVersion[0], 10);
if (majorVersion < 18) {
  logger.error(`Veeshree requires Node.js v18.0.0 or higher. Current version: ${process.version}`);
  process.exit(1);
}

const program = new Command();

program
  .name("vee")
  .description("Veeshree: Local-first context persistence layer for multi-model AI software development")
  .version("0.1.0");

program
  .command("init")
  .description("Bootstrap Veeshree project memory, heuristic scanner, and Git hooks")
  .option("-f, --force", "Overwrite existing memory scaffolds and hooks", false)
  .action((options) => {
    try {
      initializeVeeshree(process.cwd(), { force: options.force });
    } catch (err: any) {
      logger.error(`Initialization failed: ${err?.message || err}`);
      process.exit(1);
    }
  });

program
  .command("sync")
  .description("Re-scan /docs/memory/, update /.vee/index.json, and calculate linked code SHA-256 hashes")
  .action(() => {
    try {
      syncVeeshree(process.cwd());
    } catch (err: any) {
      logger.error(`Sync failed: ${err?.message || err}`);
      process.exit(1);
    }
  });

program
  .command("context [request]")
  .description("Generate token-budgeted system prompt context payload from active memory")
  .option("-m, --max-tokens <tokens>", "Maximum total context tokens budget (default: 2000)")
  .option("-t, --tasks", "Include project tasks list in context", false)
  .option("-j, --json", "Output structured JSON metadata instead of raw prompt", false)
  .option("-r, --raw", "Output pure prompt text without stderr notices", false)
  .action((request, options) => {
    try {
      generateContext(request, options, process.cwd());
    } catch (err: any) {
      logger.error(`Context assembly failed: ${err?.message || err}`);
      process.exit(1);
    }
  });

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}

