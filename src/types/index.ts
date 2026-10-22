export * from "../schemas/index.js";

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

export interface IndexDocument {
  id: string;
  path: string;
  title: string;
  type:
    | "decision"
    | "state"
    | "tasks"
    | "constraints"
    | "rejected"
    | "discoveries"
    | "archived_decision"
    | "other";
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

export interface ModelRuntimeInfo {
  name: string;
  provider: "ollama" | "lmstudio" | "gemini" | "openai" | "anthropic" | "groq" | "nvidia";
  status: "available" | "unavailable" | "missing_key";
  endpoint?: string;
  models: string[];
  latencyMs?: number;
}
