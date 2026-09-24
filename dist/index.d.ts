import { z } from 'zod';
import MiniSearch from 'minisearch';

declare const VeeshreeConfigSchema: z.ZodObject<{
    version: z.ZodDefault<z.ZodString>;
    default_extractor: z.ZodDefault<z.ZodObject<{
        provider: z.ZodDefault<z.ZodEnum<["openai", "anthropic", "gemini", "ollama"]>>;
        model: z.ZodDefault<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        provider: "openai" | "anthropic" | "gemini" | "ollama";
        model: string;
    }, {
        provider?: "openai" | "anthropic" | "gemini" | "ollama" | undefined;
        model?: string | undefined;
    }>>;
    keys: z.ZodDefault<z.ZodObject<{
        openai: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        anthropic: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        gemini: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        openai: string;
        anthropic: string;
        gemini: string;
    }, {
        openai?: string | undefined;
        anthropic?: string | undefined;
        gemini?: string | undefined;
    }>>;
    local_engine: z.ZodDefault<z.ZodObject<{
        enabled: z.ZodDefault<z.ZodBoolean>;
        port: z.ZodDefault<z.ZodNumber>;
        model: z.ZodDefault<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        model: string;
        enabled: boolean;
        port: number;
    }, {
        model?: string | undefined;
        enabled?: boolean | undefined;
        port?: number | undefined;
    }>>;
    settings: z.ZodDefault<z.ZodObject<{
        max_context_tokens: z.ZodDefault<z.ZodNumber>;
        auto_sync_on_commit: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        max_context_tokens: number;
        auto_sync_on_commit: boolean;
    }, {
        max_context_tokens?: number | undefined;
        auto_sync_on_commit?: boolean | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    keys: {
        openai: string;
        anthropic: string;
        gemini: string;
    };
    version: string;
    default_extractor: {
        provider: "openai" | "anthropic" | "gemini" | "ollama";
        model: string;
    };
    local_engine: {
        model: string;
        enabled: boolean;
        port: number;
    };
    settings: {
        max_context_tokens: number;
        auto_sync_on_commit: boolean;
    };
}, {
    keys?: {
        openai?: string | undefined;
        anthropic?: string | undefined;
        gemini?: string | undefined;
    } | undefined;
    version?: string | undefined;
    default_extractor?: {
        provider?: "openai" | "anthropic" | "gemini" | "ollama" | undefined;
        model?: string | undefined;
    } | undefined;
    local_engine?: {
        model?: string | undefined;
        enabled?: boolean | undefined;
        port?: number | undefined;
    } | undefined;
    settings?: {
        max_context_tokens?: number | undefined;
        auto_sync_on_commit?: boolean | undefined;
    } | undefined;
}>;
type VeeshreeConfig = z.infer<typeof VeeshreeConfigSchema>;
interface ScannedProjectInfo {
    name: string;
    projectType: string;
    frameworks: string[];
    languages: string[];
    databases: string[];
    infrastructure: string[];
    recentCommits: string[];
}
interface DecisionFrontmatter {
    id?: string;
    title?: string;
    status?: "active" | "superseded" | "proposed";
    date?: string;
    tags?: string[];
    linked_files?: string[];
}
interface IndexDocument {
    id: string;
    path: string;
    title: string;
    type: "decision" | "state" | "tasks" | "constraints" | "rejected" | "discoveries" | "archived_decision" | "other";
    status: "active" | "superseded" | "proposed";
    tags: string[];
    linked_files: string[];
    linked_hashes: Record<string, string>;
    stale: boolean;
    content: string;
    last_modified: string;
}
interface VeeshreeIndexData {
    last_updated: string;
    documents: IndexDocument[];
}
interface ContextAssembleOptions {
    request?: string;
    maxTokens?: number;
    includeTasks?: boolean;
}
interface ContextAssembleResult {
    prompt: string;
    totalEstimatedTokens: number;
    includedSections: {
        systemRules: number;
        constraints: number;
        currentState: number;
        tasks: number;
        decisionsCount: number;
        decisionsTokens: number;
    };
    staleWarnings: string[];
}
declare const ExtractionDeltaSchema: z.ZodObject<{
    decisions: z.ZodDefault<z.ZodArray<z.ZodObject<{
        title: z.ZodString;
        decision: z.ZodString;
        reason: z.ZodString;
        alternatives_considered: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
        linked_files: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
        status: z.ZodDefault<z.ZodEnum<["active", "superseded", "proposed"]>>;
        tags: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
    }, "strip", z.ZodTypeAny, {
        status: "active" | "superseded" | "proposed";
        decision: string;
        title: string;
        reason: string;
        alternatives_considered: string[];
        linked_files: string[];
        tags: string[];
    }, {
        decision: string;
        title: string;
        reason: string;
        status?: "active" | "superseded" | "proposed" | undefined;
        alternatives_considered?: string[] | undefined;
        linked_files?: string[] | undefined;
        tags?: string[] | undefined;
    }>, "many">>;
    current_state: z.ZodDefault<z.ZodObject<{
        current_feature: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        completed_in_session: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
        next_immediate_steps: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
    }, "strip", z.ZodTypeAny, {
        current_feature: string;
        completed_in_session: string[];
        next_immediate_steps: string[];
    }, {
        current_feature?: string | undefined;
        completed_in_session?: string[] | undefined;
        next_immediate_steps?: string[] | undefined;
    }>>;
    tasks: z.ZodDefault<z.ZodArray<z.ZodObject<{
        task_name: z.ZodString;
        action: z.ZodDefault<z.ZodEnum<["add", "complete", "remove"]>>;
    }, "strip", z.ZodTypeAny, {
        task_name: string;
        action: "remove" | "add" | "complete";
    }, {
        task_name: string;
        action?: "remove" | "add" | "complete" | undefined;
    }>, "many">>;
    constraints: z.ZodDefault<z.ZodArray<z.ZodObject<{
        rule: z.ZodString;
        type: z.ZodDefault<z.ZodEnum<["hard", "soft"]>>;
    }, "strip", z.ZodTypeAny, {
        type: "hard" | "soft";
        rule: string;
    }, {
        rule: string;
        type?: "hard" | "soft" | undefined;
    }>, "many">>;
    rejected_approaches: z.ZodDefault<z.ZodArray<z.ZodObject<{
        approach: z.ZodString;
        reason: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        reason: string;
        approach: string;
    }, {
        reason: string;
        approach: string;
    }>, "many">>;
    discoveries: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
}, "strip", z.ZodTypeAny, {
    decisions: {
        status: "active" | "superseded" | "proposed";
        decision: string;
        title: string;
        reason: string;
        alternatives_considered: string[];
        linked_files: string[];
        tags: string[];
    }[];
    tasks: {
        task_name: string;
        action: "remove" | "add" | "complete";
    }[];
    constraints: {
        type: "hard" | "soft";
        rule: string;
    }[];
    discoveries: string[];
    current_state: {
        current_feature: string;
        completed_in_session: string[];
        next_immediate_steps: string[];
    };
    rejected_approaches: {
        reason: string;
        approach: string;
    }[];
}, {
    decisions?: {
        decision: string;
        title: string;
        reason: string;
        status?: "active" | "superseded" | "proposed" | undefined;
        alternatives_considered?: string[] | undefined;
        linked_files?: string[] | undefined;
        tags?: string[] | undefined;
    }[] | undefined;
    tasks?: {
        task_name: string;
        action?: "remove" | "add" | "complete" | undefined;
    }[] | undefined;
    constraints?: {
        rule: string;
        type?: "hard" | "soft" | undefined;
    }[] | undefined;
    discoveries?: string[] | undefined;
    current_state?: {
        current_feature?: string | undefined;
        completed_in_session?: string[] | undefined;
        next_immediate_steps?: string[] | undefined;
    } | undefined;
    rejected_approaches?: {
        reason: string;
        approach: string;
    }[] | undefined;
}>;
type ExtractionDelta = z.infer<typeof ExtractionDeltaSchema>;
interface ModelRuntimeInfo {
    name: string;
    provider: "ollama" | "lmstudio" | "gemini" | "openai" | "anthropic";
    status: "available" | "unavailable" | "missing_key";
    endpoint?: string;
    models: string[];
    latencyMs?: number;
}

declare function getDefaultConfig(): VeeshreeConfig;
declare function loadConfig(targetDir?: string): VeeshreeConfig;
declare function saveConfig(config: VeeshreeConfig, targetDir?: string): void;

declare function scanRepository(targetDir?: string): ScannedProjectInfo;

declare function generateCurrentStateTemplate(info: ScannedProjectInfo): string;
declare function generateTasksTemplate(): string;
declare function generateConstraintsTemplate(): string;
declare function generateRejectedTemplate(): string;
declare function generateDiscoveriesTemplate(): string;
declare function generateDecisionStubTemplate(title: string, category: string, detectedTech?: string): string;

/**
 * Calculates SHA-256 hash of a file on disk
 */
declare function calculateFileHash(filePath: string): string | null;
/**
 * Recursively find all .md files in a directory
 */
declare function findMarkdownFiles(dir: string): string[];
/**
 * Parses a markdown memory file into an IndexDocument
 */
declare function parseMemoryFile(filePath: string, rootDir: string): IndexDocument;
/**
 * Builds and updates the index for the workspace
 */
declare function buildIndex(rootDir?: string): VeeshreeIndexData;
/**
 * Creates and initializes MiniSearch instance loaded with indexed documents
 */
declare function createSearchEngine(documents: IndexDocument[]): MiniSearch<IndexDocument>;
/**
 * Loads index from disk or rebuilds if missing
 */
declare function loadOrBuildIndex(rootDir?: string): VeeshreeIndexData;

/**
 * Approximate token count helper (~4 characters per token heuristic with safety margin)
 */
declare function estimateTokens(text: string): number;
/**
 * Truncate text to fit within a given token budget
 */
declare function truncateToTokens(text: string, maxTokens: number): string;
/**
 * Builds the pre-formatted system prompt payload strictly obeying the token budget
 */
declare function assembleContext(rootDir?: string, options?: ContextAssembleOptions): ContextAssembleResult;

type KeyProvider = "openai" | "anthropic" | "gemini";
declare function maskKey(key: string): string;
declare function setApiKey(provider: KeyProvider, key: string, rootDir?: string): void;
declare function removeApiKey(provider: KeyProvider, rootDir?: string): void;
declare function getApiKey(provider: KeyProvider, rootDir?: string): string | undefined;
declare function listApiKeys(rootDir?: string): Record<string, {
    configured: boolean;
    masked: string;
    source: string;
}>;

declare function detectAvailableModels(rootDir?: string): Promise<ModelRuntimeInfo[]>;

declare function extractMemoryFromContent(content: string, rootDir?: string, customProvider?: string, customModel?: string): Promise<ExtractionDelta>;

/**
 * Reconciles an extracted delta into the /docs/memory/ markdown files
 */
declare function reconcileExtraction(delta: ExtractionDelta, rootDir?: string): {
    newDecisions: string[];
    updatedFiles: string[];
};

interface GCResult {
    archivedTasksCount: number;
    supersededDecisionsCount: number;
    relocatedDecisions: string[];
}
/**
 * Runs State Garbage Collection:
 * 1. Caches rolling progress items in current-state.md to max 5 items, archiving excess to archive/completed-tasks.md
 * 2. Moves decisions with status: "superseded" to archive/decisions/
 * 3. Re-indexes memory so index.json reflects the clean state
 */
declare function runGarbageCollection(rootDir?: string): GCResult;

interface SearchResultItem {
    id: string;
    title: string;
    path: string;
    type: string;
    status: string;
    tags: string[];
    snippet: string;
    score: number;
}
declare function searchMemory(query: string, options?: {
    includeArchived?: boolean;
}, rootDir?: string): SearchResultItem[];

interface InitOptions {
    force?: boolean;
}
declare function initializeVeeshree(targetDir?: string, options?: InitOptions): void;

declare function syncVeeshree(rootDir?: string): void;

interface ContextCommandOptions {
    maxTokens?: string;
    tasks?: boolean;
    json?: boolean;
    raw?: boolean;
}
declare function generateContext(request?: string, options?: ContextCommandOptions, rootDir?: string): void;

declare function handleKeysCommand(action: string, provider?: string, key?: string, rootDir?: string): void;

declare function handleModelsCommand(rootDir?: string): Promise<void>;

interface CaptureOptions {
    file?: string;
    provider?: string;
    model?: string;
}
declare function handleCaptureCommand(options: CaptureOptions, rootDir?: string): Promise<void>;

declare function handleStatusCommand(options?: {
    check?: boolean;
}, rootDir?: string): void;

declare function handleSearchCommand(query: string, options?: {
    archived?: boolean;
    json?: boolean;
}, rootDir?: string): void;

declare function handleDecisionsCommand(options?: {
    all?: boolean;
    status?: string;
}, rootDir?: string): void;

declare function handleGcCommand(rootDir?: string): void;

declare const MEMORY_DIR_REL: string;
declare const DECISIONS_DIR_REL: string;
declare const ARCHIVE_DIR_REL: string;
declare const ARCHIVE_DECISIONS_DIR_REL: string;
declare const VEE_DIR_REL = ".vee";
declare const CONFIG_FILE_REL: string;
declare const INDEX_FILE_REL: string;
declare const CURRENT_STATE_FILE_REL: string;
declare const TASKS_FILE_REL: string;
declare const CONSTRAINTS_FILE_REL: string;
declare const REJECTED_FILE_REL: string;
declare const DISCOVERIES_FILE_REL: string;
declare const COMPLETED_TASKS_FILE_REL: string;

declare const logger: {
    info: (msg: string) => void;
    success: (msg: string) => void;
    warn: (msg: string) => void;
    error: (msg: string) => void;
    log: (msg: string) => void;
    title: (msg: string) => void;
    dim: (msg: string) => string;
    bold: (msg: string) => string;
    cyan: (msg: string) => string;
    yellow: (msg: string) => string;
    red: (msg: string) => string;
};

export { ARCHIVE_DECISIONS_DIR_REL, ARCHIVE_DIR_REL, COMPLETED_TASKS_FILE_REL, CONFIG_FILE_REL, CONSTRAINTS_FILE_REL, CURRENT_STATE_FILE_REL, type CaptureOptions, type ContextAssembleOptions, type ContextAssembleResult, type ContextCommandOptions, DECISIONS_DIR_REL, DISCOVERIES_FILE_REL, type DecisionFrontmatter, type ExtractionDelta, ExtractionDeltaSchema, type GCResult, INDEX_FILE_REL, type IndexDocument, type InitOptions, type KeyProvider, MEMORY_DIR_REL, type ModelRuntimeInfo, REJECTED_FILE_REL, type ScannedProjectInfo, type SearchResultItem, TASKS_FILE_REL, VEE_DIR_REL, type VeeshreeConfig, VeeshreeConfigSchema, type VeeshreeIndexData, assembleContext, buildIndex, calculateFileHash, createSearchEngine, detectAvailableModels, estimateTokens, extractMemoryFromContent, findMarkdownFiles, generateConstraintsTemplate, generateContext, generateCurrentStateTemplate, generateDecisionStubTemplate, generateDiscoveriesTemplate, generateRejectedTemplate, generateTasksTemplate, getApiKey, getDefaultConfig, handleCaptureCommand, handleDecisionsCommand, handleGcCommand, handleKeysCommand, handleModelsCommand, handleSearchCommand, handleStatusCommand, initializeVeeshree, listApiKeys, loadConfig, loadOrBuildIndex, logger, maskKey, parseMemoryFile, reconcileExtraction, removeApiKey, runGarbageCollection, saveConfig, scanRepository, searchMemory, setApiKey, syncVeeshree, truncateToTokens };
