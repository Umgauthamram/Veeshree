// Version
export { VEESHREE_VERSION } from "./utils/constants.js";

// Core Types & Schemas
export * from "./types/index.js";
export * from "./schemas/index.js";

// Utilities
export { logger, type LogLevel } from "./utils/logger.js";
export { VeeError, type VeeErrorCode } from "./utils/errors.js";
export { sanitizeRelativePath, normalizePosix } from "./utils/paths.js";
export { calculateNormalizedFileHash } from "./core/drift/hasher.js";

// Core Subsystems
export { loadConfig, saveConfig, getGlobalConfigPath } from "./core/config.js";
export { buildContext, estimateTokens, truncateToTokens, explainContextBudget } from "./core/context/index.js";
export { checkWorkspaceDrift, type WorkspaceDriftReport } from "./core/drift/index.js";
export { buildIndex, loadOrBuildIndex } from "./core/indexer.js";
export { searchMemory } from "./core/search.js";
export { createProposal, acceptProposal, rejectProposal, listProposals, getProposal } from "./core/proposals/index.js";
export { reconcileExtractionSafe, type ReconcileResult } from "./core/reconcile/index.js";
export { redactContent, capDiffPayload, isDenylistedFile, filterDiffByDenylist } from "./core/redact/index.js";
export { installGitHooks, uninstallGitHooks, getHooksStatus } from "./core/hooks/index.js";
export { installAgentRules, uninstallAgentRules, updateAgentRules } from "./core/rules/index.js";
export { createMemorySnapshot, restoreSnapshot, listSnapshots } from "./core/snapshots/index.js";
export { exportMemoryToArchive, importMemoryFromArchive } from "./core/transfer/index.js";

// Providers & MCP
export * from "./providers/index.js";
export { startMcpServer } from "./mcp/server.js";
export { installMcpClientConfig, generateClientConfig } from "./mcp/client-config.js";
