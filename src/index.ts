export * from "./types/index.js";
export * from "./utils/constants.js";
export * from "./utils/logger.js";
export * from "./utils/errors.js";
export * from "./utils/paths.js";
export * from "./utils/process.js";

// Core modules
export * from "./core/config.js";
export * from "./core/scanner.js";
export * from "./core/templates.js";
export * from "./core/indexer.js";
export * from "./core/context.js";
export * from "./core/auth.js";
export * from "./core/models.js";
export * from "./core/extractor.js";
export * from "./core/reconciler.js";
export * from "./core/gc.js";
export * from "./core/search.js";
export * from "./core/memory/index.js";
export * from "./core/drift/index.js";
export * from "./core/proposals/index.js";
export * from "./core/redact/index.js";
export * from "./core/hooks/index.js";
export * from "./core/rules/index.js";
export * from "./core/watch/index.js";
export * from "./core/snapshots/index.js";

// Providers & MCP
export * from "./providers/index.js";
export * from "./mcp/index.js";

// Commands
export * from "./commands/init.js";
export * from "./commands/migrate.js";
export * from "./commands/sync.js";
export * from "./commands/context.js";
export * from "./commands/keys.js";
export * from "./commands/models.js";
export * from "./commands/capture.js";
export * from "./commands/status.js";
export * from "./commands/search.js";
export * from "./commands/decisions.js";
export * from "./commands/gc.js";
export * from "./commands/doctor.js";
export * from "./commands/review.js";
export * from "./commands/accept.js";
export * from "./commands/reject.js";
export * from "./commands/proposals.js";
export * from "./commands/undo.js";
export * from "./commands/export.js";
export * from "./commands/import.js";
export * from "./commands/mcp.js";
export * from "./commands/hooks.js";
export * from "./commands/rules.js";
export * from "./commands/ci.js";
export * from "./commands/config.js";
export * from "./commands/completion.js";
