import path from "node:path";
import { Command } from "commander";
import { initializeVeeshree } from "./commands/init.js";
import { handleMigrateCommand } from "./commands/migrate.js";
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
import { handleReviewCommand } from "./commands/review.js";
import { handleAcceptCommand } from "./commands/accept.js";
import { handleRejectCommand } from "./commands/reject.js";
import { handleProposalsCommand } from "./commands/proposals.js";
import { handleUndoCommand } from "./commands/undo.js";
import { handleExportCommand } from "./commands/export.js";
import { handleImportCommand } from "./commands/import.js";
import { handleMcpCommand } from "./commands/mcp.js";
import { handleHooksCommand } from "./commands/hooks.js";
import { handleRulesCommand } from "./commands/rules.js";
import { handleCiCommand } from "./commands/ci.js";
import { handleConfigCommand } from "./commands/config.js";
import { handleCompletionCommand } from "./commands/completion.js";
import { logger } from "./utils/logger.js";
import { VeeError } from "./utils/errors.js";
import { VEESHREE_VERSION } from "./utils/constants.js";

// Check Node.js version >= 20 (Section 3: Node 20 or later)
const nodeVersion = process.versions.node.split(".");
const majorVersion = parseInt(nodeVersion[0] || "0", 10);
if (majorVersion < 20) {
  logger.error(`Veeshree ${VEESHREE_VERSION} requires Node.js v20.0.0 or higher. Current version: ${process.version}`);
  process.exit(1);
}

const program = new Command();

program
  .name("vee")
  .description("Veeshree: Local-first context persistence layer for multi-model AI software development")
  .version(VEESHREE_VERSION)
  .option("-q, --quiet", "Suppress non-essential console output")
  .option("--json", "Format supported output as structured JSON")
  .option("--no-color", "Disable terminal colors")
  .hook("preAction", (thisCommand, actionCommand) => {
    const opts = { ...thisCommand.opts(), ...actionCommand?.opts() };
    if (opts.quiet) logger.setQuiet(true);
    if (opts.json) logger.setJson(true);
  });

// 1. init
program
  .command("init")
  .description("Bootstrap Veeshree project memory, heuristic scanner, agent rules, and Git hooks")
  .option("-f, --force", "Overwrite existing memory scaffolds and hooks", false)
  .option("--dry-run", "Preview initialization steps without making filesystem changes", false)
  .option("--agents <list>", "Comma-separated list of target agent rules (claude, cursor, gemini, etc.)")
  .action((options) => {
    runSafe(() => initializeVeeshree(process.cwd(), options));
  });

// 2. migrate
program
  .command("migrate")
  .description("Upgrade a 0.3.x project to Veeshree 1.0.0 schema, frontmatter baselines, and numbered ADRs")
  .option("--dry-run", "Simulate migration plan without writing files", false)
  .action(async (options) => {
    await runSafeAsync(() => handleMigrateCommand(options, process.cwd()));
  });

// 3. sync
program
  .command("sync")
  .description("Re-scan memory, verify SHA-256 code hashes, or explicitly accept drifted baselines")
  .option("-a, --accept [target]", "Explicitly accept drifted baselines into ADR frontmatter (<id> or all)")
  .option("--all", "Accept all drifted baselines (can be combined with --accept)", false)
  .option("-j, --json", "Output drift report in structured JSON format", false)
  .option("-q, --quiet", "Quiet output mode", false)
  .option("--dry-run", "Simulate baseline acceptance without writing files", false)
  .action((options) => {
    runSafe(() => {
      let acceptTarget = options.accept;
      if (options.all) {
        acceptTarget = "all";
      } else if (acceptTarget === true || acceptTarget === "") {
        throw new VeeError(
          "Usage: vee sync --accept <id> or vee sync --accept all (or vee sync --accept --all)",
          "ERR_INVALID_ARGS"
        );
      }
      const result = syncVeeshree(process.cwd(), {
        accept: typeof acceptTarget === "string" ? acceptTarget : undefined,
        all: options.all,
        json: options.json,
        quiet: options.quiet,
        dryRun: options.dryRun,
      });
      if (result.exitCode !== 0) {
        process.exit(result.exitCode);
      }
    });
  });

// 4. watch
const watchCmd = program
  .command("watch")
  .description("Start ambient background watcher to observe code diffs and queue memory proposals")
  .option("-d, --debounce <seconds>", "Debounce settle window in seconds before extracting (default: 5)")
  .option("-p, --provider <provider>", "Specific model provider override")
  .option("-m, --model <model>", "Specific model name override")
  .option("--auto", "Automatically apply low-risk memory deltas", false)
  .option("--daemon", "Run watcher in the background as a detached daemon process", false)
  .action(async (options) => {
    await runSafeAsync(() => handleWatchCommand(options, process.cwd()));
  });

watchCmd
  .command("status")
  .description("Check if background watcher daemon is currently running")
  .option("-j, --json", "Output daemon status as JSON", false)
  .action(async (options) => {
    await runSafeAsync(() => handleWatchCommand({ subcommand: "status", ...options }, process.cwd()));
  });

watchCmd
  .command("stop")
  .description("Stop background watcher daemon")
  .action(async () => {
    await runSafeAsync(() => handleWatchCommand({ subcommand: "stop" }, process.cwd()));
  });

// 5. capture
program
  .command("capture")
  .description("Extract structured decisions and memory updates from conversation logs or diffs into proposal queue")
  .option("-f, --file <path>", "Path to conversation transcript, session log, or diff file")
  .option("--diff", "Capture git diff directly from working tree", false)
  .option("-p, --provider <provider>", "Extraction provider")
  .option("-m, --model <model>", "Custom model name for extraction")
  .option("--auto", "Automatically apply low-risk memory proposal", false)
  .option("--dry-run", "Preview extraction payload without calling model", false)
  .option("--show-payload", "Print exact redacted payload that would be sent to LLM", false)
  .action(async (options) => {
    await runSafeAsync(() => handleCaptureCommand(options, process.cwd()));
  });

// 6. Review & Proposals
program
  .command("review")
  .description("Interactive list of pending memory proposals with diffs and risk scores")
  .action(() => {
    runSafe(() => handleReviewCommand(process.cwd()));
  });

program
  .command("accept [id]")
  .description("Accept a pending proposal and apply its delta to memory")
  .option("--all-low", "Accept all pending low-risk proposals at once", false)
  .option("--dry-run", "Simulate acceptance without modifying files", false)
  .action(async (id, options) => {
    await runSafeAsync(() => handleAcceptCommand(id, options, process.cwd()));
  });

program
  .command("reject <id>")
  .description("Reject a pending memory proposal")
  .action((id) => {
    runSafe(() => handleRejectCommand(id, process.cwd()));
  });

program
  .command("proposals")
  .description("List memory update proposals in queue")
  .option("-j, --json", "Output proposals as structured JSON", false)
  .option("-s, --status <status>", "Filter by status: pending, accepted, rejected")
  .action((options) => {
    runSafe(() => handleProposalsCommand(options, process.cwd()));
  });

// 7. context
program
  .command("context [request]")
  .description("Generate token-budgeted system prompt context payload from active memory")
  .option("-m, --max-tokens <tokens>", "Maximum total context tokens budget")
  .option("-t, --tasks", "Include project tasks list in context", false)
  .option("-j, --json", "Output structured JSON metadata", false)
  .option("-r, --raw", "Output pure prompt text without stderr notices", false)
  .option("--explain", "Show breakdown of token usage per tier and budget caps", false)
  .option("--format <format>", "Output format: markdown, json, or xml", "markdown")
  .action((request, options) => {
    runSafe(() => generateContext(request, options, process.cwd()));
  });

// 8. decisions
const decisionsCmd = program
  .command("decisions")
  .description("List and manage Architectural Decision Records (ADRs)")
  .option("-a, --all", "Include superseded and proposed decisions", false)
  .option("-s, --status <status>", "Filter by status (active, superseded, proposed)")
  .option("-j, --json", "Output decisions as JSON", false)
  .action((options) => {
    runSafe(() => handleDecisionsCommand({ ...options, subcommand: "list" }, process.cwd()));
  });

decisionsCmd
  .command("new <title>")
  .description("Create a new numbered ADR scaffold")
  .action((title) => {
    runSafe(() => handleDecisionsCommand({ subcommand: "new", title }, process.cwd()));
  });

decisionsCmd
  .command("show <id>")
  .description("Display full ADR with supersede chain")
  .action((id) => {
    runSafe(() => handleDecisionsCommand({ subcommand: "show", id }, process.cwd()));
  });

decisionsCmd
  .command("supersede <old-id> <new-title>")
  .description("Mark an ADR superseded and generate a replacement ADR")
  .action((oldId, newTitle) => {
    runSafe(() => handleDecisionsCommand({ subcommand: "supersede", id: oldId, title: newTitle }, process.cwd()));
  });

decisionsCmd
  .command("link <id> <file-path>")
  .description("Link a source code file to an ADR and record its baseline hash")
  .action((id, filePath) => {
    runSafe(() => handleDecisionsCommand({ subcommand: "link", id, targetFile: filePath }, process.cwd()));
  });

// 9. status
program
  .command("status")
  .description("Display memory health dashboard, task progress, and live drift alerts")
  .option("-c, --check", "Exit with error code 1 if stale drift is detected (for CI / pre-commit)", false)
  .option("-j, --json", "Output status dashboard as JSON", false)
  .option("-q, --quiet", "Quiet output mode", false)
  .action((options) => {
    runSafe(() => {
      const result = handleStatusCommand(options, process.cwd());
      if (result.exitCode !== 0) {
        process.exit(result.exitCode);
      }
    });
  });

// 10. search
program
  .command("search <query>")
  .description("Search indexed memory and decisions for keywords")
  .option("-a, --archived", "Include archived and superseded records", false)
  .option("-j, --json", "Output results as structured JSON", false)
  .action((query, options) => {
    runSafe(() => handleSearchCommand(query, options, process.cwd()));
  });

// 11. gc
program
  .command("gc")
  .description("Prune old progress into archive/ and move superseded decisions into archive/decisions/")
  .option("--dry-run", "Simulate archival without modifying files", false)
  .action((options) => {
    runSafe(() => handleGcCommand(options, process.cwd()));
  });

// 12. undo
program
  .command("undo [step]")
  .description("Restore memory from pre-apply backup snapshots (default: 1 step back)")
  .action((step) => {
    runSafe(() => handleUndoCommand(step, process.cwd()));
  });

// 13. export / import
program
  .command("export")
  .description("Export docs/memory as a bundled JSON or Markdown file")
  .option("--format <format>", "Export format: json or md", "json")
  .action((options) => {
    runSafe(() => handleExportCommand(options, process.cwd()));
  });

program
  .command("import <file>")
  .description("Import memory bundle into docs/memory")
  .option("-y, --yes", "Apply import directly without creating review proposals", false)
  .action((file, options) => {
    runSafe(() => handleImportCommand(file, options, process.cwd()));
  });

// 14. mcp
const mcpCmd = program
  .command("mcp")
  .description("Start Model Context Protocol (MCP) stdio server")
  .option("--root <dir>", "Project or workspace root directory")
  .action(async (options) => {
    const rootDir = options.root ? path.resolve(options.root) : process.cwd();
    await runSafeAsync(() => handleMcpCommand(undefined, options, rootDir));
  });

mcpCmd
  .command("install")
  .description("Install Veeshree MCP server into client configuration (claude, claude-code, cursor, vscode, gemini)")
  .requiredOption("--client <client>", "Client type: claude, claude-code, cursor, vscode, gemini")
  .option("--root <dir>", "Project or workspace root directory")
  .option("--no-install", "Use local binary instead of npx")
  .action(async (options) => {
    const noInstall = options.install === false || options.noInstall === true;
    await runSafeAsync(() => handleMcpCommand("install", { ...options, noInstall }, process.cwd()));
  });

// 15. hooks
const hooksCmd = program
  .command("hooks")
  .description("Manage Git hooks (pre-commit drift checks, post-checkout sync)");

hooksCmd
  .command("install")
  .description("Install Git hooks in repository")
  .action(() => {
    runSafe(() => handleHooksCommand("install", process.cwd()));
  });

hooksCmd
  .command("uninstall")
  .description("Remove Veeshree Git hooks")
  .action(() => {
    runSafe(() => handleHooksCommand("uninstall", process.cwd()));
  });

hooksCmd
  .command("status")
  .description("Inspect current Git hooks status")
  .option("-j, --json", "Output hooks status as JSON", false)
  .action((options) => {
    runSafe(() => handleHooksCommand("status", process.cwd(), options));
  });

// 16. rules
const rulesCmd = program
  .command("rules")
  .description("Manage AI agent instruction rule files (.cursorrules, CLAUDE.md, GEMINI.md)");

rulesCmd
  .command("list")
  .description("List known agent rule targets")
  .action(() => {
    runSafe(() => handleRulesCommand("list", {}, process.cwd()));
  });

rulesCmd
  .command("update")
  .description("Refresh Veeshree marker blocks in all agent rule files")
  .option("--agents <list>", "Specific agents to update")
  .action((options) => {
    runSafe(() => handleRulesCommand("update", options, process.cwd()));
  });

rulesCmd
  .command("uninstall")
  .description("Remove Veeshree marker blocks from agent rule files")
  .option("--agents <list>", "Specific agents to remove blocks from")
  .action((options) => {
    runSafe(() => handleRulesCommand("uninstall", options, process.cwd()));
  });

// 17. ci
const ciCmd = program
  .command("ci")
  .description("Continuous Integration setup and configuration");

ciCmd
  .command("init")
  .description("Generate GitHub Actions workflow file for automated drift checking")
  .action(() => {
    runSafe(() => handleCiCommand("init", process.cwd()));
  });

// 18. keys
const keysCmd = program
  .command("keys")
  .description("Manage AI provider API keys securely in machine keystore (~/.veeshree/credentials.json)");

keysCmd
  .command("list")
  .description("List configured AI model providers with masked keys and sources")
  .option("-j, --json", "Output configured keys as JSON", false)
  .action((options) => {
    runSafe(() => handleKeysCommand("list", undefined, undefined, options, process.cwd()));
  });

keysCmd
  .command("set <provider> <key>")
  .description("Store an API key for a provider (gemini, openai, anthropic, groq, nvidia)")
  .option("-l, --local", "Store in project .vee/config.json instead of global keystore", false)
  .action((provider, key, options) => {
    runSafe(() => handleKeysCommand("set", provider, key, options, process.cwd()));
  });

keysCmd
  .command("update <provider> <key>")
  .description("Update an existing API key for a provider")
  .option("-l, --local", "Update in project .vee/config.json instead of global keystore", false)
  .action((provider, key, options) => {
    runSafe(() => handleKeysCommand("update", provider, key, options, process.cwd()));
  });

keysCmd
  .command("remove <provider>")
  .description("Remove stored API key for a provider")
  .option("-l, --local", "Remove from local .vee/config.json only", false)
  .option("-g, --global", "Remove from global keystore only", false)
  .action((provider, options) => {
    runSafe(() => handleKeysCommand("remove", provider, undefined, options, process.cwd()));
  });

// 19. models
const modelsCmd = program
  .command("models")
  .description("Scan local engine ports (11434, 1234), active LLM runtimes, and configure model versions")
  .action(async () => {
    await runSafeAsync(() => handleModelsCommand(process.cwd()));
  });

modelsCmd
  .command("use <provider> <model>")
  .description("Set default extractor model version (e.g. 'vee models use gemini gemini-2.0-flash')")
  .action((provider, model) => {
    runSafe(() => handleModelsUseCommand(provider, model, process.cwd()));
  });

modelsCmd
  .command("pull <model>")
  .description("Pull / update a local model via Ollama (e.g. 'vee models pull llama3.2')")
  .action((model) => {
    runSafe(() => handleModelsPullCommand(model));
  });

// 20. config
const configCmd = program
  .command("config")
  .description("Manage Veeshree configuration settings");

configCmd
  .command("list")
  .description("Display merged configuration settings")
  .option("-j, --json", "Output merged config as JSON", false)
  .action((options) => {
    runSafe(() => handleConfigCommand("list", undefined, undefined, options, process.cwd()));
  });

configCmd
  .command("get <key>")
  .description("Get configuration setting value by dot-notation (e.g. 'vee config get privacy.allow_cloud')")
  .action((key) => {
    runSafe(() => handleConfigCommand("get", key, undefined, {}, process.cwd()));
  });

configCmd
  .command("set <key> <value>")
  .description("Set configuration setting value by dot-notation (e.g. 'vee config set privacy.allow_cloud true')")
  .option("-g, --global", "Save to global config (~/.veeshree/config.json)", false)
  .action((key, value, options) => {
    runSafe(() => handleConfigCommand("set", key, value, options, process.cwd()));
  });

configCmd
  .command("path")
  .description("Display path to configuration file")
  .option("-g, --global", "Show path to global config", false)
  .action((options) => {
    runSafe(() => handleConfigCommand("path", undefined, undefined, options, process.cwd()));
  });

// 21. doctor
program
  .command("doctor")
  .description("Run comprehensive repository health, security, and AI engine connectivity diagnostics")
  .option("--fix", "Automatically repair permissions, missing directories, gitignore, and rules", false)
  .option("-j, --json", "Output diagnostics as JSON", false)
  .action(async (options) => {
    await runSafeAsync(async () => {
      const result = await handleDoctorCommand(options, process.cwd());
      if (result.hasFailures) {
        process.exit(1);
      }
    });
  });

// 22. completion
program
  .command("completion [shell]")
  .description("Generate shell autocompletion script (bash, zsh, fish, powershell)")
  .action((shell) => {
    runSafe(() => handleCompletionCommand(shell));
  });

// Centralized error handling wrappers
function runSafe(fn: () => any): void {
  try {
    fn();
  } catch (err: unknown) {
    handleCliError(err);
  }
}

async function runSafeAsync(fn: () => Promise<any>): Promise<void> {
  try {
    await fn();
  } catch (err: unknown) {
    handleCliError(err);
  }
}

function handleCliError(err: unknown): void {
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
