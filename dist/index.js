import {
  ARCHIVE_DECISIONS_DIR_REL,
  ARCHIVE_DIR_REL,
  AnthropicExtractor,
  BACKUP_03X_DIR_REL,
  COMPLETED_TASKS_FILE_REL,
  CONFIG_FILE_REL,
  CONSTRAINTS_FILE_REL,
  CURRENT_STATE_FILE_REL,
  DECISIONS_DIR_REL,
  DEFAULT_CONSTRAINTS_CAP,
  DEFAULT_DECISIONS_CAP,
  DEFAULT_GC_MAX_COMPLETED_TASKS,
  DEFAULT_GC_MAX_PROGRESS,
  DEFAULT_MAX_CONTEXT_TOKENS,
  DEFAULT_MAX_PAYLOAD_BYTES,
  DEFAULT_MODELS,
  DEFAULT_STATE_CAP,
  DEFAULT_TASKS_CAP,
  DISCOVERIES_FILE_REL,
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
  INDEX_FILE_REL,
  KNOWN_AGENT_TARGETS,
  LOCK_FILE_REL,
  LOCK_STALE_MS,
  LOGS_DIR_REL,
  LinkedFileEntrySchema,
  LmStudioExtractor,
  MCP_TOOLS,
  MEMORY_DIR_REL,
  OllamaExtractor,
  OpenAIExtractor,
  PROPOSALS_DIR_REL,
  ProposalRiskSchema,
  ProposalSchema,
  ProposalSourceSchema,
  ProposalStatusSchema,
  REJECTED_FILE_REL,
  RULE_END_MARKER,
  RULE_START_MARKER,
  SECRET_PATTERNS,
  SNAPSHOTS_DIR_REL,
  SUPPORTED_KEY_PROVIDERS,
  TASKS_FILE_REL,
  VEE_DIR_REL,
  VeeError,
  VeeshreeConfigSchema,
  WATCH_LOG_FILE_REL,
  WATCH_PID_FILE_REL,
  WATCH_STATE_FILE_REL,
  acceptBaselines,
  acceptProposal,
  acquireLock,
  assertCloudConsent,
  assessDeltaRisk,
  buildContext,
  buildIndex,
  calculateFileHash,
  calculateNormalizedFileHash,
  canMakeWatchCall,
  capDiffPayload,
  checkWorkspaceDrift,
  cleanJsonText,
  computeDiffFingerprint,
  createMemorySnapshot,
  createProposal,
  createSearchEngine,
  detectAvailableModels,
  estimateTokens,
  explainContextBudget,
  extractMemoryFromContent,
  findMarkdownFiles,
  generateClientConfig,
  generateConstraintsTemplate,
  generateContext,
  generateCurrentStateTemplate,
  generateDecisionStubTemplate,
  generateDiscoveriesTemplate,
  generateRejectedTemplate,
  generateTasksTemplate,
  generateVeeshreeAgentRuleBlock,
  getApiKey,
  getConfigProperty,
  getDaemonStatus,
  getDefaultConfig,
  getGlobalConfigPath,
  getGlobalCredentialsDir,
  getGlobalCredentialsPath,
  getHooksStatus,
  getNextAdrNumber,
  getProjectConfigPath,
  getProposal,
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
  handleMcpToolCall,
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
  injectAgentRuleBlock,
  installAgentRules,
  installGitHooks,
  installMcpClientConfig,
  isDenylistedFile,
  isValidModelName,
  listApiKeys,
  listProposals,
  listSnapshots,
  loadConfig,
  loadGlobalCredentials,
  loadOrBuildIndex,
  loadWatchState,
  logger,
  maskKey,
  normalizeContent,
  normalizePosix,
  normalizeTaskName,
  parseDecisionFrontmatter,
  parseIgnoreFile,
  parseMarkdownFrontmatter,
  parseMemoryFile,
  parseSections,
  reconcileExtractionSafe,
  redactContent,
  redactSecrets,
  rejectProposal,
  removeAgentRuleBlock,
  removeApiKey,
  resolveClientConfigPath,
  resolveEngine,
  resolveGitHooksDir,
  restoreMemorySnapshot,
  restoreSnapshot,
  runCommandInteractive,
  runCommandSafe,
  runGarbageCollection,
  safeLiteralReplace,
  sanitizeRelativePath,
  saveConfig,
  saveGlobalCredentials,
  saveProposal,
  saveWatchState,
  scanRepository,
  scoreProposalRisk,
  searchMemory,
  serializeSections,
  setApiKey,
  setConfigProperty,
  shouldProcessDiff,
  slugifyTitle,
  startDaemon,
  startMcpServer,
  startMemoryWatcher,
  stopDaemon,
  stringifyMarkdownFrontmatter,
  syncVeeshree,
  truncateToTokens,
  uninstallAgentRules,
  uninstallGitHooks,
  updateAgentRules,
  updateDiffFingerprint,
  updateSectionBody,
  validateExtractionJson,
  validateModelName,
  withLock,
  writeAtomic,
  writeWatchLog
} from "./chunk-T2SZF4BH.js";

// src/core/context.ts
function assembleContext(rootDir = process.cwd(), options = {}) {
  const result = buildContext(rootDir, {
    request: options.request,
    maxTokens: options.maxTokens,
    includeTasks: options.includeTasks
  });
  return {
    prompt: result.prompt,
    totalEstimatedTokens: result.totalEstimatedTokens,
    includedSections: result.includedSections,
    staleWarnings: result.staleWarnings
  };
}

// src/core/reconciler.ts
import fs from "fs";
import path from "path";
function reconcileExtraction(delta, rootDir = process.cwd(), options = {}) {
  const updatedFiles = [];
  const newDecisions = [];
  if (Array.isArray(delta.decisions) && delta.decisions.length > 0) {
    const decisionsDir = path.join(rootDir, DECISIONS_DIR_REL);
    if (!fs.existsSync(decisionsDir)) {
      fs.mkdirSync(decisionsDir, { recursive: true });
    }
    for (const dec of delta.decisions) {
      const nextNum = getNextAdrNumber(rootDir);
      const slug = slugifyTitle(dec.title || "decision");
      const filename = `${nextNum}-${slug}.md`;
      const filePath = path.join(decisionsDir, filename);
      const linkedEntries = (dec.linked_files || []).map((rel) => {
        try {
          const safeRel = sanitizeRelativePath(rel);
          const hash = calculateNormalizedFileHash(path.join(rootDir, safeRel));
          return { path: safeRel, sha256: hash || void 0 };
        } catch {
          return { path: rel, sha256: void 0 };
        }
      });
      const frontmatterData = {
        id: `${nextNum}-${slug}`,
        title: dec.title,
        status: dec.status || "active",
        date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
        tags: dec.tags && dec.tags.length > 0 ? dec.tags : ["architecture"],
        linked_files: linkedEntries,
        generated_by: "veeshree"
      };
      if (dec.supersedes) {
        frontmatterData.supersedes = dec.supersedes;
      }
      const alternatives = dec.alternatives_considered && dec.alternatives_considered.length > 0 ? dec.alternatives_considered.map((a) => `- ${a}`).join("\n") : "- None explicitly recorded.";
      const linkedFilesBlock = linkedEntries.length > 0 ? linkedEntries.map((f) => `- \`${f.path}\``).join("\n") : "- None specified.";
      const bodyMarkdown = `# ${dec.title}

## Context & Problem Statement
${dec.reason || "Architectural decision recorded from AI coding session."}

## Decision
${dec.decision}

## Rationale
${dec.reason}

## Alternatives Considered
${alternatives}

## Linked Files
${linkedFilesBlock}
`;
      const fullContent = stringifyMarkdownFrontmatter(frontmatterData, bodyMarkdown);
      if (dec.status === "superseded") {
        const archiveDecisionsDir = path.join(rootDir, ARCHIVE_DECISIONS_DIR_REL);
        if (!fs.existsSync(archiveDecisionsDir)) {
          fs.mkdirSync(archiveDecisionsDir, { recursive: true });
        }
        const archiveFilePath = path.join(archiveDecisionsDir, filename);
        writeAtomic(archiveFilePath, fullContent);
        newDecisions.push(`docs/memory/archive/decisions/${filename}`);
        updatedFiles.push(`docs/memory/archive/decisions/${filename}`);
      } else {
        writeAtomic(filePath, fullContent);
        newDecisions.push(`docs/memory/decisions/${filename}`);
        updatedFiles.push(`docs/memory/decisions/${filename}`);
      }
    }
  }
  if (delta.current_state) {
    const currentStatePath = path.join(rootDir, CURRENT_STATE_FILE_REL);
    if (fs.existsSync(currentStatePath)) {
      let content = fs.readFileSync(currentStatePath, "utf-8");
      if (delta.current_state.current_feature) {
        content = safeLiteralReplace(
          content,
          /(- \*\*Current Focus\*\*: ).+/m,
          `- **Current Focus**: ${delta.current_state.current_feature}`
        );
      }
      if (delta.current_state.completed_in_session && delta.current_state.completed_in_session.length > 0) {
        const newProgress = delta.current_state.completed_in_session.map((c) => `- ${c}`).join("\n");
        content = updateSectionBody(
          content,
          (hText) => /Recent Progress/i.test(hText),
          (body) => {
            const existingLines = body.split("\n").filter((l) => l.trim().length > 0);
            return `${newProgress}
${existingLines.join("\n")}`.trim();
          }
        );
      }
      if (delta.current_state.next_immediate_steps && delta.current_state.next_immediate_steps.length > 0) {
        const nextStepsList = delta.current_state.next_immediate_steps.map((s) => `- [ ] ${s}`).join("\n");
        content = updateSectionBody(
          content,
          (hText) => /Next Immediate Steps/i.test(hText),
          () => nextStepsList
        );
      }
      writeAtomic(currentStatePath, content);
      updatedFiles.push(CURRENT_STATE_FILE_REL);
    }
  }
  if (Array.isArray(delta.tasks) && delta.tasks.length > 0) {
    const tasksPath = path.join(rootDir, TASKS_FILE_REL);
    if (fs.existsSync(tasksPath)) {
      let tasksContent = fs.readFileSync(tasksPath, "utf-8");
      for (const t of delta.tasks) {
        const targetNorm = normalizeTaskName(t.task_name);
        if (t.action === "remove") {
          const lines = tasksContent.split("\n");
          const filtered = lines.filter((line) => {
            if (line.trim().startsWith("- [") && normalizeTaskName(line) === targetNorm) {
              return false;
            }
            return true;
          });
          tasksContent = filtered.join("\n");
        } else if (t.action === "complete") {
          const lines = tasksContent.split("\n");
          let found = false;
          const updatedLines = lines.map((line) => {
            if (line.trim().startsWith("- [") && normalizeTaskName(line) === targetNorm) {
              found = true;
              return `- [x] ${t.task_name}`;
            }
            return line;
          });
          if (!found) {
            tasksContent = updateSectionBody(
              tasksContent,
              (hText) => /Active Tasks/i.test(hText),
              (body) => `${body.trim()}
- [x] ${t.task_name}`.trim()
            );
          } else {
            tasksContent = updatedLines.join("\n");
          }
        } else if (t.action === "add") {
          const lines = tasksContent.split("\n");
          const exists = lines.some(
            (line) => line.trim().startsWith("- [") && normalizeTaskName(line) === targetNorm
          );
          if (!exists) {
            tasksContent = updateSectionBody(
              tasksContent,
              (hText) => /Active Tasks/i.test(hText),
              (body) => `${body.trim()}
- [ ] ${t.task_name}`.trim()
            );
          }
        }
      }
      writeAtomic(tasksPath, tasksContent);
      updatedFiles.push(TASKS_FILE_REL);
    }
  }
  if (Array.isArray(delta.constraints) && delta.constraints.length > 0) {
    const constraintsPath = path.join(rootDir, CONSTRAINTS_FILE_REL);
    if (fs.existsSync(constraintsPath)) {
      let constraintsContent = fs.readFileSync(constraintsPath, "utf-8");
      for (const c of delta.constraints) {
        const sourceMeta = c.source ? ` (source: ${c.source})` : "";
        const acceptedMeta = c.accepted_by || options.acceptedBy ? ` [accepted_by: ${c.accepted_by || options.acceptedBy}]` : "";
        const formatted = `- **${c.type === "hard" ? "Rule" : "Guideline"}**: ${c.rule}${sourceMeta}${acceptedMeta}`;
        const ruleLower = c.rule.trim().toLowerCase();
        const alreadyExists = constraintsContent.toLowerCase().includes(ruleLower);
        if (!alreadyExists) {
          const targetSection = c.type === "hard" ? /Hard Constraints/i : /Soft Guidelines/i;
          constraintsContent = updateSectionBody(
            constraintsContent,
            (hText) => targetSection.test(hText),
            (body) => `${body.trim()}
${formatted}`.trim()
          );
        }
      }
      writeAtomic(constraintsPath, constraintsContent);
      updatedFiles.push(CONSTRAINTS_FILE_REL);
    }
  }
  if (Array.isArray(delta.rejected_approaches) && delta.rejected_approaches.length > 0) {
    const rejectedPath = path.join(rootDir, REJECTED_FILE_REL);
    if (fs.existsSync(rejectedPath)) {
      let rejectedContent = fs.readFileSync(rejectedPath, "utf-8");
      for (const r of delta.rejected_approaches) {
        const approachNorm = r.approach.trim().toLowerCase();
        if (!rejectedContent.toLowerCase().includes(approachNorm)) {
          const block = `
### ${r.approach}
- **Reason Rejected**: ${r.reason}
`;
          rejectedContent = rejectedContent.trim() + "\n" + block;
        }
      }
      writeAtomic(rejectedPath, rejectedContent);
      updatedFiles.push(REJECTED_FILE_REL);
    }
  }
  if (Array.isArray(delta.discoveries) && delta.discoveries.length > 0) {
    const discoveriesPath = path.join(rootDir, DISCOVERIES_FILE_REL);
    if (fs.existsSync(discoveriesPath)) {
      let discoveriesContent = fs.readFileSync(discoveriesPath, "utf-8");
      for (const d of delta.discoveries) {
        const discNorm = d.trim().toLowerCase();
        if (!discoveriesContent.toLowerCase().includes(discNorm)) {
          discoveriesContent = discoveriesContent.trim() + `
- ${d}
`;
        }
      }
      writeAtomic(discoveriesPath, discoveriesContent);
      updatedFiles.push(DISCOVERIES_FILE_REL);
    }
  }
  buildIndex(rootDir);
  return {
    newDecisions,
    updatedFiles: Array.from(new Set(updatedFiles))
  };
}

// src/core/redact/index.ts
var redactSensitiveText = redactContent;
var isDenyListedPath = isDenylistedFile;
export {
  ARCHIVE_DECISIONS_DIR_REL,
  ARCHIVE_DIR_REL,
  AnthropicExtractor,
  BACKUP_03X_DIR_REL,
  COMPLETED_TASKS_FILE_REL,
  CONFIG_FILE_REL,
  CONSTRAINTS_FILE_REL,
  CURRENT_STATE_FILE_REL,
  DECISIONS_DIR_REL,
  DEFAULT_CONSTRAINTS_CAP,
  DEFAULT_DECISIONS_CAP,
  DEFAULT_GC_MAX_COMPLETED_TASKS,
  DEFAULT_GC_MAX_PROGRESS,
  DEFAULT_MAX_CONTEXT_TOKENS,
  DEFAULT_MAX_PAYLOAD_BYTES,
  DEFAULT_MODELS,
  DEFAULT_STATE_CAP,
  DEFAULT_TASKS_CAP,
  DISCOVERIES_FILE_REL,
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
  INDEX_FILE_REL,
  KNOWN_AGENT_TARGETS,
  LOCK_FILE_REL,
  LOCK_STALE_MS,
  LOGS_DIR_REL,
  LinkedFileEntrySchema,
  LmStudioExtractor,
  MCP_TOOLS,
  MEMORY_DIR_REL,
  OllamaExtractor,
  OpenAIExtractor,
  PROPOSALS_DIR_REL,
  ProposalRiskSchema,
  ProposalSchema,
  ProposalSourceSchema,
  ProposalStatusSchema,
  REJECTED_FILE_REL,
  RULE_END_MARKER,
  RULE_START_MARKER,
  SECRET_PATTERNS,
  SNAPSHOTS_DIR_REL,
  SUPPORTED_KEY_PROVIDERS,
  TASKS_FILE_REL,
  VEE_DIR_REL,
  VeeError,
  VeeshreeConfigSchema,
  WATCH_LOG_FILE_REL,
  WATCH_PID_FILE_REL,
  WATCH_STATE_FILE_REL,
  acceptBaselines,
  acceptProposal,
  acquireLock,
  assembleContext,
  assertCloudConsent,
  assessDeltaRisk,
  buildContext,
  buildIndex,
  calculateFileHash,
  calculateNormalizedFileHash,
  canMakeWatchCall,
  capDiffPayload,
  checkWorkspaceDrift,
  cleanJsonText,
  computeDiffFingerprint,
  createMemorySnapshot,
  createProposal,
  createSearchEngine,
  detectAvailableModels,
  estimateTokens,
  explainContextBudget,
  extractMemoryFromContent,
  findMarkdownFiles,
  generateClientConfig,
  generateConstraintsTemplate,
  generateContext,
  generateCurrentStateTemplate,
  generateDecisionStubTemplate,
  generateDiscoveriesTemplate,
  generateRejectedTemplate,
  generateTasksTemplate,
  generateVeeshreeAgentRuleBlock,
  getApiKey,
  getConfigProperty,
  getDaemonStatus,
  getDefaultConfig,
  getGlobalConfigPath,
  getGlobalCredentialsDir,
  getGlobalCredentialsPath,
  getHooksStatus,
  getNextAdrNumber,
  getProjectConfigPath,
  getProposal,
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
  handleMcpToolCall,
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
  injectAgentRuleBlock,
  installAgentRules,
  installGitHooks,
  installMcpClientConfig,
  isDenyListedPath,
  isDenylistedFile,
  isValidModelName,
  listApiKeys,
  listProposals,
  listSnapshots,
  loadConfig,
  loadGlobalCredentials,
  loadOrBuildIndex,
  loadWatchState,
  logger,
  maskKey,
  normalizeContent,
  normalizePosix,
  normalizeTaskName,
  parseDecisionFrontmatter,
  parseIgnoreFile,
  parseMarkdownFrontmatter,
  parseMemoryFile,
  parseSections,
  reconcileExtraction,
  reconcileExtractionSafe,
  redactContent,
  redactSecrets,
  redactSensitiveText,
  rejectProposal,
  removeAgentRuleBlock,
  removeApiKey,
  resolveClientConfigPath,
  resolveEngine,
  resolveGitHooksDir,
  restoreMemorySnapshot,
  restoreSnapshot,
  runCommandInteractive,
  runCommandSafe,
  runGarbageCollection,
  safeLiteralReplace,
  sanitizeRelativePath,
  saveConfig,
  saveGlobalCredentials,
  saveProposal,
  saveWatchState,
  scanRepository,
  scoreProposalRisk,
  searchMemory,
  serializeSections,
  setApiKey,
  setConfigProperty,
  shouldProcessDiff,
  slugifyTitle,
  startDaemon,
  startMcpServer,
  startMemoryWatcher,
  stopDaemon,
  stringifyMarkdownFrontmatter,
  syncVeeshree,
  truncateToTokens,
  uninstallAgentRules,
  uninstallGitHooks,
  updateAgentRules,
  updateDiffFingerprint,
  updateSectionBody,
  validateExtractionJson,
  validateModelName,
  withLock,
  writeAtomic,
  writeWatchLog
};
//# sourceMappingURL=index.js.map