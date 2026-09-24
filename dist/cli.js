import {
  generateContext,
  handleCaptureCommand,
  handleKeysCommand,
  handleModelsCommand,
  initializeVeeshree,
  logger,
  syncVeeshree
} from "./chunk-W4P7SBL7.js";

// src/cli.ts
import { Command } from "commander";
var nodeVersion = process.versions.node.split(".");
var majorVersion = parseInt(nodeVersion[0], 10);
if (majorVersion < 18) {
  logger.error(`Veeshree requires Node.js v18.0.0 or higher. Current version: ${process.version}`);
  process.exit(1);
}
var program = new Command();
program.name("vee").description("Veeshree: Local-first context persistence layer for multi-model AI software development").version("0.1.0");
program.command("init").description("Bootstrap Veeshree project memory, heuristic scanner, and Git hooks").option("-f, --force", "Overwrite existing memory scaffolds and hooks", false).action((options) => {
  try {
    initializeVeeshree(process.cwd(), { force: options.force });
  } catch (err) {
    logger.error(`Initialization failed: ${err?.message || err}`);
    process.exit(1);
  }
});
program.command("sync").description("Re-scan /docs/memory/, update /.vee/index.json, and calculate linked code SHA-256 hashes").action(() => {
  try {
    syncVeeshree(process.cwd());
  } catch (err) {
    logger.error(`Sync failed: ${err?.message || err}`);
    process.exit(1);
  }
});
program.command("context [request]").description("Generate token-budgeted system prompt context payload from active memory").option("-m, --max-tokens <tokens>", "Maximum total context tokens budget (default: 2000)").option("-t, --tasks", "Include project tasks list in context", false).option("-j, --json", "Output structured JSON metadata instead of raw prompt", false).option("-r, --raw", "Output pure prompt text without stderr notices", false).action((request, options) => {
  try {
    generateContext(request, options, process.cwd());
  } catch (err) {
    logger.error(`Context assembly failed: ${err?.message || err}`);
    process.exit(1);
  }
});
var keysCmd = program.command("keys").description("Manage AI provider API keys locally in .vee/config.json");
keysCmd.command("list").description("List configured AI model providers with masked keys").action(() => {
  handleKeysCommand("list", void 0, void 0, process.cwd());
});
keysCmd.command("set <provider> <key>").description("Store an API key for a provider (gemini, openai, anthropic)").action((provider, key) => {
  handleKeysCommand("set", provider, key, process.cwd());
});
keysCmd.command("remove <provider>").description("Remove stored API key for a provider").action((provider) => {
  handleKeysCommand("remove", provider, void 0, process.cwd());
});
program.command("models").description("Scan local engine ports (11434, 1234) and configured keys to display active LLM runtimes").action(async () => {
  try {
    await handleModelsCommand(process.cwd());
  } catch (err) {
    logger.error(`Models probe failed: ${err?.message || err}`);
    process.exit(1);
  }
});
program.command("capture").description("Extract structured decisions and memory updates from conversation logs or diffs").option("-f, --file <path>", "Path to conversation transcript, session log, or diff file").option("-p, --provider <provider>", "Extraction provider (gemini, openai, ollama)").option("-m, --model <model>", "Custom model name for extraction").action(async (options) => {
  try {
    await handleCaptureCommand(options, process.cwd());
  } catch (err) {
    logger.error(`Capture failed: ${err?.message || err}`);
    process.exit(1);
  }
});
program.parse(process.argv);
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
//# sourceMappingURL=cli.js.map