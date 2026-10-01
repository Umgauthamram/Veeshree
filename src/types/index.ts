import { z } from "zod";

export const VeeshreeConfigSchema = z.object({
  version: z.string().default("0.1.0"),
  default_extractor: z
    .object({
      provider: z.enum(["openai", "anthropic", "gemini", "ollama"]).default("gemini"),
      model: z.string().default("gemini-2.5-flash"),
    })
    .default({
      provider: "gemini",
      model: "gemini-2.5-flash",
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
  purpose: string;
  domainEntities: string[];
  apiEndpoints: string[];
  frameworks: string[];
  languages: string[];
  databases: string[];
  infrastructure: string[];
  recentCommits: string[];
  activeBranch?: string;
  activeFeatureFocus?: string;
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

export const ExtractionDeltaSchema = z.object({
  decisions: z.array(
    z.object({
      title: z.string(),
      decision: z.string(),
      reason: z.string(),
      alternatives_considered: z.array(z.string()).optional().default([]),
      linked_files: z.array(z.string()).optional().default([]),
      status: z.enum(["active", "superseded", "proposed"]).default("active"),
      tags: z.array(z.string()).optional().default([]),
    })
  ).default([]),
  current_state: z.object({
    current_feature: z.string().optional().default(""),
    completed_in_session: z.array(z.string()).optional().default([]),
    next_immediate_steps: z.array(z.string()).optional().default([]),
  }).default({}),
  tasks: z.array(
    z.object({
      task_name: z.string(),
      action: z.enum(["add", "complete", "remove"]).default("add"),
    })
  ).default([]),
  constraints: z.array(
    z.object({
      rule: z.string(),
      type: z.enum(["hard", "soft"]).default("hard"),
    })
  ).default([]),
  rejected_approaches: z.array(
    z.object({
      approach: z.string(),
      reason: z.string(),
    })
  ).default([]),
  discoveries: z.array(z.string()).optional().default([]),
});

export type ExtractionDelta = z.infer<typeof ExtractionDeltaSchema>;

export interface ModelRuntimeInfo {
  name: string;
  provider: "ollama" | "lmstudio" | "gemini" | "openai" | "anthropic";
  status: "available" | "unavailable" | "missing_key";
  endpoint?: string;
  models: string[];
  latencyMs?: number;
}


