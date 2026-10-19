import {
  AnthropicExtractor,
  DecisionFrontmatterSchema,
  EXTRACTION_SYSTEM_PROMPT,
  ExtractionConstraintSchema,
  ExtractionCurrentStateSchema,
  ExtractionDecisionSchema,
  ExtractionDeltaSchema,
  ExtractionRejectedSchema,
  ExtractionTaskSchema,
  ExtractorProviderSchema,
  GeminiExtractor,
  LinkedFileEntrySchema,
  LmStudioExtractor,
  MEMORY_DIR_REL,
  OllamaExtractor,
  OpenAIExtractor,
  ProposalRiskSchema,
  ProposalSchema,
  ProposalSourceSchema,
  ProposalStatusSchema,
  VEESHREE_VERSION,
  VeeError,
  VeeshreeConfigSchema,
  acceptProposal,
  buildContext,
  buildIndex,
  calculateNormalizedFileHash,
  capDiffPayload,
  checkWorkspaceDrift,
  cleanJsonText,
  createMemorySnapshot,
  createProposal,
  estimateTokens,
  explainContextBudget,
  filterDiffByDenylist,
  findMarkdownFiles,
  generateClientConfig,
  getGlobalConfigPath,
  getHooksStatus,
  getProposal,
  installAgentRules,
  installGitHooks,
  installMcpClientConfig,
  isDenylistedFile,
  listProposals,
  listSnapshots,
  loadConfig,
  loadOrBuildIndex,
  logger,
  normalizePosix,
  reconcileExtractionSafe,
  redactContent,
  rejectProposal,
  resolveEngine,
  restoreSnapshot,
  sanitizeRelativePath,
  saveConfig,
  searchMemory,
  startMcpServer,
  truncateToTokens,
  uninstallAgentRules,
  uninstallGitHooks,
  updateAgentRules,
  validateExtractionJson,
  writeAtomic
} from "./chunk-PIJSJQYS.js";

// src/core/transfer/export-import.ts
import fs from "fs";
import path from "path";
function exportMemoryToArchive(rootDir = process.cwd(), format = "json") {
  const memoryDir = path.join(rootDir, MEMORY_DIR_REL);
  const files = findMarkdownFiles(memoryDir);
  const bundleFiles = files.map((f) => ({
    path: normalizePosix(path.relative(rootDir, f)),
    content: fs.readFileSync(f, "utf-8")
  }));
  return {
    manifest: {
      format: "veeshree-memory-export",
      version: VEESHREE_VERSION,
      exported_at: (/* @__PURE__ */ new Date()).toISOString()
    },
    files: bundleFiles
  };
}
function importMemoryFromArchive(rootDir = process.cwd(), bundle) {
  if (!bundle || !bundle.manifest || bundle.manifest.format !== "veeshree-memory-export") {
    throw new VeeError("Invalid memory export bundle: missing or invalid manifest format", "ERR_INVALID_ARGS");
  }
  try {
    createMemorySnapshot(rootDir, `Pre-import snapshot (bundle v${bundle.manifest.version || "1.0.0"})`);
  } catch {
  }
  const restoredFiles = [];
  for (const file of bundle.files || []) {
    const safeRel = sanitizeRelativePath(file.path);
    if (!safeRel.startsWith("docs/memory/")) {
      continue;
    }
    const fullPath = path.join(rootDir, safeRel);
    writeAtomic(fullPath, file.content);
    restoredFiles.push(safeRel);
  }
  buildIndex(rootDir);
  return { restoredFiles };
}
export {
  AnthropicExtractor,
  DecisionFrontmatterSchema,
  EXTRACTION_SYSTEM_PROMPT,
  ExtractionConstraintSchema,
  ExtractionCurrentStateSchema,
  ExtractionDecisionSchema,
  ExtractionDeltaSchema,
  ExtractionRejectedSchema,
  ExtractionTaskSchema,
  ExtractorProviderSchema,
  GeminiExtractor,
  LinkedFileEntrySchema,
  LmStudioExtractor,
  OllamaExtractor,
  OpenAIExtractor,
  ProposalRiskSchema,
  ProposalSchema,
  ProposalSourceSchema,
  ProposalStatusSchema,
  VEESHREE_VERSION,
  VeeError,
  VeeshreeConfigSchema,
  acceptProposal,
  buildContext,
  buildIndex,
  calculateNormalizedFileHash,
  capDiffPayload,
  checkWorkspaceDrift,
  cleanJsonText,
  createMemorySnapshot,
  createProposal,
  estimateTokens,
  explainContextBudget,
  exportMemoryToArchive,
  filterDiffByDenylist,
  generateClientConfig,
  getGlobalConfigPath,
  getHooksStatus,
  getProposal,
  importMemoryFromArchive,
  installAgentRules,
  installGitHooks,
  installMcpClientConfig,
  isDenylistedFile,
  listProposals,
  listSnapshots,
  loadConfig,
  loadOrBuildIndex,
  logger,
  normalizePosix,
  reconcileExtractionSafe,
  redactContent,
  rejectProposal,
  resolveEngine,
  restoreSnapshot,
  sanitizeRelativePath,
  saveConfig,
  searchMemory,
  startMcpServer,
  truncateToTokens,
  uninstallAgentRules,
  uninstallGitHooks,
  updateAgentRules,
  validateExtractionJson
};
//# sourceMappingURL=index.js.map