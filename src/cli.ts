import { Command } from "commander";
import { initializeVeeshree } from "./commands/init.js";
import { syncVeeshree } from "./commands/sync.js";
import { generateContext } from "./commands/context.js";
import { handleKeysCommand } from "./commands/keys.js";
import { handleModelsCommand, handleModelsUseCommand, handleModelsPullCommand } from "./commands/models.js";
import { handleCaptureCommand } from "./commands/capture.js";
import { handleStatusCommand } from "./commands/status.js";
import { handleSearchCommand } from "./commands/search.js";
import { handleDecisionsCommand } from "./commands/decisions.js";
import { handleGcCommand } from "./commands/gc.js";
import { handleWatchCommand } from "./commands/watch.js";
import { handleDoctorCommand } from "./commands/doctor.js";
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
  .version("0.3.0");

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
  .command("watch")
  .description("Start ambient background watcher to auto-capture code diffs into memory with zero commands")
  .option("-d, --debounce <seconds>", "Debounce settle window in seconds before extracting (default: 5)")
  .option("-p, --provider <provider>", "Specific model provider override (gemini, openai, anthropic, ollama, lmstudio)")
  .option("-m, --model <model>", "Specific model name override")
  .action((options) => {
    handleWatchCommand(options);
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

// Keys management
// Keys management
const keysCmd = program
  .command("keys")
  .description("Manage AI provider API keys securely in machine keystore (~/.veeshree/credentials.json)");

keysCmd
  .command("list")
  .description("List configured AI model providers with masked keys and sources")
  .action(() => {
    handleKeysCommand("list", undefined, undefined, {}, process.cwd());
  });

keysCmd
  .command("set <provider> <key>")
  .description("Store an API key for a provider (gemini, openai, anthropic). Saved in global keystore by default.")
  .option("-l, --local", "Store in project .vee/config.json instead of global keystore", false)
  .action((provider, key, options) => {
    handleKeysCommand("set", provider, key, options, process.cwd());
  });

keysCmd
  .command("update <provider> <key>")
  .description("Update an existing API key for a provider")
  .option("-l, --local", "Update in project .vee/config.json instead of global keystore", false)
  .action((provider, key, options) => {
    handleKeysCommand("update", provider, key, options, process.cwd());
  });

keysCmd
  .command("remove <provider>")
  .description("Remove stored API key for a provider")
  .option("-l, --local", "Remove from local .vee/config.json only", false)
  .option("-g, --global", "Remove from global keystore only", false)
  .action((provider, options) => {
    handleKeysCommand("remove", provider, undefined, options, process.cwd());
  });

// Models management
const modelsCmd = program
  .command("models")
  .description("Scan local engine ports (11434, 1234), active LLM runtimes, and configure model versions")
  .action(async () => {
    try {
      await handleModelsCommand(process.cwd());
    } catch (err: any) {
      logger.error(`Models probe failed: ${err?.message || err}`);
      process.exit(1);
    }
  });

modelsCmd
  .command("use <provider> <model>")
  .description("Set default extractor model version (e.g. 'vee models use gemini gemini-2.0-flash')")
  .action((provider, model) => {
    try {
      handleModelsUseCommand(provider, model, process.cwd());
    } catch (err: any) {
      logger.error(`Failed to update default model: ${err?.message || err}`);
      process.exit(1);
    }
  });

modelsCmd
  .command("pull <model>")
  .description("Pull / update a local model via Ollama (e.g. 'vee models pull llama3.2')")
  .action((model) => {
    handleModelsPullCommand(model);
  });

// Doctor Diagnostics
program
  .command("doctor")
  .description("Run comprehensive repository health, security, and AI engine connectivity diagnostics")
  .action(async () => {
    try {
      await handleDoctorCommand(process.cwd());
    } catch (err: any) {
      logger.error(`Diagnostics failed: ${err?.message || err}`);
      process.exit(1);
    }
  });

// Capture engine
program
  .command("capture")
  .description("Extract structured decisions and memory updates from conversation logs or diffs")
  .option("-f, --file <path>", "Path to conversation transcript, session log, or diff file")
  .option("-p, --provider <provider>", "Extraction provider (gemini, openai, ollama)")
  .option("-m, --model <model>", "Custom model name for extraction")
  .action(async (options) => {
    try {
      await handleCaptureCommand(options, process.cwd());
    } catch (err: any) {
      logger.error(`Capture failed: ${err?.message || err}`);
      process.exit(1);
    }
  });

// Status Dashboard
program
  .command("status")
  .description("Display terminal memory health dashboard, task progress, and stale drift alerts")
  .option("-c, --check", "Exit with error code 1 if stale drift is detected (for CI / pre-commit)", false)
  .action((options) => {
    try {
      handleStatusCommand(options, process.cwd());
    } catch (err: any) {
      logger.error(`Status check failed: ${err?.message || err}`);
      process.exit(1);
    }
  });

// Search Interface
program
  .command("search <query>")
  .description("Search indexed memory and decisions for keywords")
  .option("-a, --archived", "Include archived and superseded records", false)
  .option("-j, --json", "Output results as structured JSON", false)
  .action((query, options) => {
    try {
      handleSearchCommand(query, options, process.cwd());
    } catch (err: any) {
      logger.error(`Search failed: ${err?.message || err}`);
      process.exit(1);
    }
  });

// Decisions Catalog
program
  .command("decisions")
  .description("List architectural decision records (ADRs) with status and linked code files")
  .option("-a, --all", "Include superseded and proposed decisions", false)
  .option("-s, --status <status>", "Filter by status (active, superseded, proposed)")
  .action((options) => {
    try {
      handleDecisionsCommand(options, process.cwd());
    } catch (err: any) {
      logger.error(`Decisions listing failed: ${err?.message || err}`);
      process.exit(1);
    }
  });

// Garbage Collection & Archive
program
  .command("gc")
  .description("Prune old progress into archive/ and move superseded decisions into archive/decisions/")
  .action(() => {
    try {
      handleGcCommand(process.cwd());
    } catch (err: any) {
      logger.error(`GC failed: ${err?.message || err}`);
      process.exit(1);
    }
  });

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}



