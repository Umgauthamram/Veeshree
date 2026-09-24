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
    version: string;
    keys: {
        openai: string;
        anthropic: string;
        gemini: string;
    };
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
    version?: string | undefined;
    keys?: {
        openai?: string | undefined;
        anthropic?: string | undefined;
        gemini?: string | undefined;
    } | undefined;
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
};

export { ARCHIVE_DECISIONS_DIR_REL, ARCHIVE_DIR_REL, COMPLETED_TASKS_FILE_REL, CONFIG_FILE_REL, CONSTRAINTS_FILE_REL, CURRENT_STATE_FILE_REL, type ContextAssembleOptions, type ContextAssembleResult, type ContextCommandOptions, DECISIONS_DIR_REL, DISCOVERIES_FILE_REL, type DecisionFrontmatter, INDEX_FILE_REL, type IndexDocument, type InitOptions, MEMORY_DIR_REL, REJECTED_FILE_REL, type ScannedProjectInfo, TASKS_FILE_REL, VEE_DIR_REL, type VeeshreeConfig, VeeshreeConfigSchema, type VeeshreeIndexData, assembleContext, buildIndex, calculateFileHash, createSearchEngine, estimateTokens, findMarkdownFiles, generateConstraintsTemplate, generateContext, generateCurrentStateTemplate, generateDecisionStubTemplate, generateDiscoveriesTemplate, generateRejectedTemplate, generateTasksTemplate, getDefaultConfig, initializeVeeshree, loadConfig, loadOrBuildIndex, logger, parseMemoryFile, saveConfig, scanRepository, syncVeeshree, truncateToTokens };
