import { z } from "zod";

export const VeeshreeConfigSchema = z.object({
  version: z.string().default("0.1.0"),
  default_extractor: z
    .object({
      provider: z.enum(["openai", "anthropic", "gemini", "ollama"]).default("gemini"),
      model: z.string().default("gemini-1.5-flash"),
    })
    .default({
      provider: "gemini",
      model: "gemini-1.5-flash",
    }),
  keys: z
    .object({
      openai: z.string().optional().default(""),
      anthropic: z.string().optional().default(""),
      gemini: z.string().optional().default(""),
    })
    .default({}),
  local_engine: z
    .object({
      enabled: z.boolean().default(false),
      port: z.number().default(11434),
      model: z.string().default("llama3"),
    })
    .default({
      enabled: false,
      port: 11434,
      model: "llama3",
    }),
  settings: z
    .object({
      max_context_tokens: z.number().default(2000),
      auto_sync_on_commit: z.boolean().default(true),
    })
    .default({
      max_context_tokens: 2000,
      auto_sync_on_commit: true,
    }),
});

export type VeeshreeConfig = z.infer<typeof VeeshreeConfigSchema>;

export interface ScannedProjectInfo {
  name: string;
  projectType: string;
  frameworks: string[];
  languages: string[];
  databases: string[];
  infrastructure: string[];
  recentCommits: string[];
}

export interface DecisionFrontmatter {
  id?: string;
  title?: string;
  status?: "active" | "superseded" | "proposed";
  date?: string;
  tags?: string[];
  linked_files?: string[];
}

export interface IndexDocument {
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

export interface VeeshreeIndexData {
  last_updated: string;
  documents: IndexDocument[];
}

export interface ContextAssembleOptions {
  request?: string;
  maxTokens?: number;
  includeTasks?: boolean;
}

export interface ContextAssembleResult {
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

