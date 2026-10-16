import {
  VeeError,
  generateContext,
  getDaemonStatus,
  handleAcceptCommand,
  handleCaptureCommand,
  handleCiCommand,
  handleCompletionCommand,
  handleConfigCommand,
  handleDecisionsCommand,
  handleDoctorCommand,
  handleExportCommand,
  handleGcCommand,
  handleHooksCommand,
  handleImportCommand,
  handleKeysCommand,
  handleMcpCommand,
  handleMigrateCommand,
  handleModelsCommand,
  handleModelsPullCommand,
  handleModelsUseCommand,
  handleProposalsCommand,
  handleRejectCommand,
  handleReviewCommand,
  handleRulesCommand,
  handleSearchCommand,
  handleStatusCommand,
  handleUndoCommand,
  initializeVeeshree,
  logger,
  startDaemon,
  startMemoryWatcher,
  stopDaemon,
  syncVeeshree
} from "./chunk-T2SZF4BH.js";

// src/cli.ts
import { Command } from "commander";

// src/commands/watch.ts
async function handleWatchCommand(options = {}, rootDir = process.cwd()) {
  if (options.subcommand === "status") {
    const status = getDaemonStatus(rootDir);
    if (status.running) {
      logger.success(`Watcher daemon is RUNNING (PID: ${status.pid}). Log: ${status.logPath}`);
    } else {
      logger.info("Watcher daemon is NOT running.");
    }
    return;
  }
  if (options.subcommand === "stop") {
    const result = stopDaemon(rootDir);
    if (result.stopped) {
      logger.success(`Stopped watcher daemon (PID: ${result.pid}).`);
    } else {
      logger.info("No active watcher daemon found to stop.");
    }
    return;
  }
  if (options.daemon) {
    const { pid, logPath } = startDaemon(rootDir, options);
    logger.success(`Watcher daemon spawned in background (PID: ${pid}).`);
    logger.info(`Output logging to: ${logPath}`);
    logger.info(`Check status anytime with 'vee watch status' or stop with 'vee watch stop'.`);
    return;
  }
  const debounceSeconds = options.debounce ? parseInt(options.debounce, 10) : void 0;
  await startMemoryWatcher(rootDir, {
    debounceSeconds,
    provider: options.provider,
    model: options.model,
    auto: options.auto
  });
}

// src/cli.ts
var nodeVersion = process.versions.node.split(".");
var majorVersion = parseInt(nodeVersion[0] || "0", 10);
if (majorVersion < 20) {
  logger.error(`Veeshree 1.0.0 requires Node.js v20.0.0 or higher. Current version: ${process.version}`);
  process.exit(1);
}
var program = new Command();
program.name("vee").description("Veeshree: Local-first context persistence layer for multi-model AI software development").version("1.0.0").option("-q, --quiet", "Suppress non-essential console output").option("--json", "Format supported output as structured JSON").option("--no-color", "Disable terminal colors").hook("preAction", (thisCommand) => {
  const opts = thisCommand.opts();
  if (opts.quiet) logger.setQuiet(true);
  if (opts.json) logger.setJson(true);
});
program.command("init").description("Bootstrap Veeshree project memory, heuristic scanner, agent rules, and Git hooks").option("-f, --force", "Overwrite existing memory scaffolds and hooks", false).option("--dry-run", "Preview initialization steps without making filesystem changes", false).option("--agents <list>", "Comma-separated list of target agent rules (claude, cursor, gemini, etc.)").action((options) => {
  runSafe(() => initializeVeeshree(process.cwd(), options));
});
program.command("migrate").description("Upgrade a 0.3.x project to Veeshree 1.0.0 schema, frontmatter baselines, and numbered ADRs").option("--dry-run", "Simulate migration plan without writing files", false).action(async (options) => {
  await runSafeAsync(() => handleMigrateCommand(options, process.cwd()));
});
program.command("sync").description("Re-scan memory, verify SHA-256 code hashes, or explicitly accept drifted baselines").option("-a, --accept [target]", "Explicitly accept drifted baselines into ADR frontmatter (id or --all)").option("-j, --json", "Output drift report in structured JSON format", false).option("-q, --quiet", "Quiet output mode", false).option("--dry-run", "Simulate baseline acceptance without writing files", false).action((options) => {
  runSafe(() => {
    const result = syncVeeshree(process.cwd(), {
      accept: options.accept,
      json: options.json,
      quiet: options.quiet,
      dryRun: options.dryRun
    });
    if (result.exitCode !== 0) {
      process.exit(result.exitCode);
    }
  });
});
var watchCmd = program.command("watch").description("Start ambient background watcher to observe code diffs and queue memory proposals").option("-d, --debounce <seconds>", "Debounce settle window in seconds before extracting (default: 5)").option("-p, --provider <provider>", "Specific model provider override").option("-m, --model <model>", "Specific model name override").option("--auto", "Automatically apply low-risk memory deltas", false).option("--daemon", "Run watcher in the background as a detached daemon process", false).action(async (options) => {
  await runSafeAsync(() => handleWatchCommand(options, process.cwd()));
});
watchCmd.command("status").description("Check if background watcher daemon is currently running").action(async () => {
  await runSafeAsync(() => handleWatchCommand({ subcommand: "status" }, process.cwd()));
});
watchCmd.command("stop").description("Stop background watcher daemon").action(async () => {
  await runSafeAsync(() => handleWatchCommand({ subcommand: "stop" }, process.cwd()));
});
program.command("capture").description("Extract structured decisions and memory updates from conversation logs or diffs into proposal queue").option("-f, --file <path>", "Path to conversation transcript, session log, or diff file").option("--diff", "Capture git diff directly from working tree", false).option("-p, --provider <provider>", "Extraction provider").option("-m, --model <model>", "Custom model name for extraction").option("--auto", "Automatically apply low-risk memory proposal", false).option("--dry-run", "Preview extraction payload without calling model", false).option("--show-payload", "Print exact redacted payload that would be sent to LLM", false).action(async (options) => {
  await runSafeAsync(() => handleCaptureCommand(options, process.cwd()));
});
program.command("review").description("Interactive list of pending memory proposals with diffs and risk scores").action(() => {
  runSafe(() => handleReviewCommand(process.cwd()));
});
program.command("accept [id]").description("Accept a pending proposal and apply its delta to memory").option("--all-low", "Accept all pending low-risk proposals at once", false).option("--dry-run", "Simulate acceptance without modifying files", false).action(async (id, options) => {
  await runSafeAsync(() => handleAcceptCommand(id, options, process.cwd()));
});
program.command("reject <id>").description("Reject a pending memory proposal").action((id) => {
  runSafe(() => handleRejectCommand(id, process.cwd()));
});
program.command("proposals").description("List memory update proposals in queue").option("-j, --json", "Output proposals as structured JSON", false).option("-s, --status <status>", "Filter by status: pending, accepted, rejected").action((options) => {
  runSafe(() => handleProposalsCommand(options, process.cwd()));
});
program.command("context [request]").description("Generate token-budgeted system prompt context payload from active memory").option("-m, --max-tokens <tokens>", "Maximum total context tokens budget").option("-t, --tasks", "Include project tasks list in context", false).option("-j, --json", "Output structured JSON metadata", false).option("-r, --raw", "Output pure prompt text without stderr notices", false).option("--explain", "Show breakdown of token usage per tier and budget caps", false).option("--format <format>", "Output format: markdown, json, or xml", "markdown").action((request, options) => {
  runSafe(() => generateContext(request, options, process.cwd()));
});
var decisionsCmd = program.command("decisions").description("List and manage Architectural Decision Records (ADRs)").option("-a, --all", "Include superseded and proposed decisions", false).option("-s, --status <status>", "Filter by status (active, superseded, proposed)").action((options) => {
  runSafe(() => handleDecisionsCommand({ ...options, subcommand: "list" }, process.cwd()));
});
decisionsCmd.command("new <title>").description("Create a new numbered ADR scaffold").action((title) => {
  runSafe(() => handleDecisionsCommand({ subcommand: "new", title }, process.cwd()));
});
decisionsCmd.command("show <id>").description("Display full ADR with supersede chain").action((id) => {
  runSafe(() => handleDecisionsCommand({ subcommand: "show", id }, process.cwd()));
});
decisionsCmd.command("supersede <old-id> <new-title>").description("Mark an ADR superseded and generate a replacement ADR").action((oldId, newTitle) => {
  runSafe(() => handleDecisionsCommand({ subcommand: "supersede", id: oldId, title: newTitle }, process.cwd()));
});
decisionsCmd.command("link <id> <file-path>").description("Link a source code file to an ADR and record its baseline hash").action((id, filePath) => {
  runSafe(() => handleDecisionsCommand({ subcommand: "link", id, targetFile: filePath }, process.cwd()));
});
program.command("status").description("Display memory health dashboard, task progress, and live drift alerts").option("-c, --check", "Exit with error code 1 if stale drift is detected (for CI / pre-commit)", false).option("-j, --json", "Output status dashboard as JSON", false).option("-q, --quiet", "Quiet output mode", false).action((options) => {
  runSafe(() => {
    const result = handleStatusCommand(options, process.cwd());
    if (result.exitCode !== 0) {
      process.exit(result.exitCode);
    }
  });
});
program.command("search <query>").description("Search indexed memory and decisions for keywords").option("-a, --archived", "Include archived and superseded records", false).option("-j, --json", "Output results as structured JSON", false).action((query, options) => {
  runSafe(() => handleSearchCommand(query, options, process.cwd()));
});
program.command("gc").description("Prune old progress into archive/ and move superseded decisions into archive/decisions/").option("--dry-run", "Simulate archival without modifying files", false).action((options) => {
  runSafe(() => handleGcCommand(options, process.cwd()));
});
program.command("undo [step]").description("Restore memory from pre-apply backup snapshots (default: 1 step back)").action((step) => {
  runSafe(() => handleUndoCommand(step, process.cwd()));
});
program.command("export").description("Export docs/memory as a bundled JSON or Markdown file").option("--format <format>", "Export format: json or md", "json").action((options) => {
  runSafe(() => handleExportCommand(options, process.cwd()));
});
program.command("import <file>").description("Import memory bundle into docs/memory").action((file) => {
  runSafe(() => handleImportCommand(file, process.cwd()));
});
var mcpCmd = program.command("mcp").description("Start Model Context Protocol (MCP) stdio server").action(async () => {
  await runSafeAsync(() => handleMcpCommand(void 0, {}, process.cwd()));
});
mcpCmd.command("install").description("Install Veeshree MCP server into client configuration (claude, cursor, vscode, gemini)").requiredOption("--client <client>", "Client type: claude, cursor, vscode, gemini").action(async (options) => {
  await runSafeAsync(() => handleMcpCommand("install", options, process.cwd()));
});
var hooksCmd = program.command("hooks").description("Manage Git hooks (pre-commit drift checks, post-checkout sync)");
hooksCmd.command("install").description("Install Git hooks in repository").action(() => {
  runSafe(() => handleHooksCommand("install", process.cwd()));
});
hooksCmd.command("uninstall").description("Remove Veeshree Git hooks").action(() => {
  runSafe(() => handleHooksCommand("uninstall", process.cwd()));
});
hooksCmd.command("status").description("Inspect current Git hooks status").action(() => {
  runSafe(() => handleHooksCommand("status", process.cwd()));
});
var rulesCmd = program.command("rules").description("Manage AI agent instruction rule files (.cursorrules, CLAUDE.md, GEMINI.md)");
rulesCmd.command("list").description("List known agent rule targets").action(() => {
  runSafe(() => handleRulesCommand("list", {}, process.cwd()));
});
rulesCmd.command("update").description("Refresh Veeshree marker blocks in all agent rule files").option("--agents <list>", "Specific agents to update").action((options) => {
  runSafe(() => handleRulesCommand("update", options, process.cwd()));
});
rulesCmd.command("uninstall").description("Remove Veeshree marker blocks from agent rule files").option("--agents <list>", "Specific agents to remove blocks from").action((options) => {
  runSafe(() => handleRulesCommand("uninstall", options, process.cwd()));
});
var ciCmd = program.command("ci").description("Continuous Integration setup and configuration");
ciCmd.command("init").description("Generate GitHub Actions workflow file for automated drift checking").action(() => {
  runSafe(() => handleCiCommand("init", process.cwd()));
});
var keysCmd = program.command("keys").description("Manage AI provider API keys securely in machine keystore (~/.veeshree/credentials.json)");
keysCmd.command("list").description("List configured AI model providers with masked keys and sources").action(() => {
  runSafe(() => handleKeysCommand("list", void 0, void 0, {}, process.cwd()));
});
keysCmd.command("set <provider> <key>").description("Store an API key for a provider (gemini, openai, anthropic, groq, nvidia)").option("-l, --local", "Store in project .vee/config.json instead of global keystore", false).action((provider, key, options) => {
  runSafe(() => handleKeysCommand("set", provider, key, options, process.cwd()));
});
keysCmd.command("update <provider> <key>").description("Update an existing API key for a provider").option("-l, --local", "Update in project .vee/config.json instead of global keystore", false).action((provider, key, options) => {
  runSafe(() => handleKeysCommand("update", provider, key, options, process.cwd()));
});
keysCmd.command("remove <provider>").description("Remove stored API key for a provider").option("-l, --local", "Remove from local .vee/config.json only", false).option("-g, --global", "Remove from global keystore only", false).action((provider, options) => {
  runSafe(() => handleKeysCommand("remove", provider, void 0, options, process.cwd()));
});
var modelsCmd = program.command("models").description("Scan local engine ports (11434, 1234), active LLM runtimes, and configure model versions").action(async () => {
  await runSafeAsync(() => handleModelsCommand(process.cwd()));
});
modelsCmd.command("use <provider> <model>").description("Set default extractor model version (e.g. 'vee models use gemini gemini-2.0-flash')").action((provider, model) => {
  runSafe(() => handleModelsUseCommand(provider, model, process.cwd()));
});
modelsCmd.command("pull <model>").description("Pull / update a local model via Ollama (e.g. 'vee models pull llama3.2')").action((model) => {
  runSafe(() => handleModelsPullCommand(model));
});
var configCmd = program.command("config").description("Manage Veeshree configuration settings");
configCmd.command("list").description("Display merged configuration settings").action(() => {
  runSafe(() => handleConfigCommand("list", void 0, void 0, {}, process.cwd()));
});
configCmd.command("get <key>").description("Get configuration setting value by dot-notation (e.g. 'vee config get privacy.allow_cloud')").action((key) => {
  runSafe(() => handleConfigCommand("get", key, void 0, {}, process.cwd()));
});
configCmd.command("set <key> <value>").description("Set configuration setting value by dot-notation (e.g. 'vee config set privacy.allow_cloud true')").option("-g, --global", "Save to global config (~/.veeshree/config.json)", false).action((key, value, options) => {
  runSafe(() => handleConfigCommand("set", key, value, options, process.cwd()));
});
configCmd.command("path").description("Display path to configuration file").option("-g, --global", "Show path to global config", false).action((options) => {
  runSafe(() => handleConfigCommand("path", void 0, void 0, options, process.cwd()));
});
program.command("doctor").description("Run comprehensive repository health, security, and AI engine connectivity diagnostics").option("--fix", "Automatically repair permissions, missing directories, gitignore, and rules", false).action(async (options) => {
  await runSafeAsync(async () => {
    const result = await handleDoctorCommand(options, process.cwd());
    if (result.hasFailures) {
      process.exit(1);
    }
  });
});
program.command("completion [shell]").description("Generate shell autocompletion script (bash, zsh, fish, powershell)").action((shell) => {
  runSafe(() => handleCompletionCommand(shell));
});
function runSafe(fn) {
  try {
    fn();
  } catch (err) {
    handleCliError(err);
  }
}
async function runSafeAsync(fn) {
  try {
    await fn();
  } catch (err) {
    handleCliError(err);
  }
}
function handleCliError(err) {
  if (err instanceof VeeError) {
    logger.error(err.message);
    process.exit(err.exitCode);
  }
  const message = err instanceof Error ? err.message : String(err);
  logger.error(message);
  process.exit(2);
}
program.parse(process.argv);
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
//# sourceMappingURL=cli.js.map