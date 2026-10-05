export interface CommandDoc {
  id: string;
  cmd: string;
  name: string;
  badge: string;
  summary: string;
  explanation: string;
  howUsed: string;
  flags: string;
  example: string;
  outputExample?: string;
  prev?: { title: string; href: string };
  next?: { title: string; href: string };
}

export const commandsData: CommandDoc[] = [
  {
    id: "init",
    cmd: "vee init",
    name: "Init",
    badge: "Scaffolding & IDE Rules",
    summary: "Scaffolds docs/memory/ and configures IDE rules without spending any LLM tokens.",
    explanation:
      "Analyzes your project structure, primary language, frameworks, database, and git history without spending any LLM tokens. Scaffolds the docs/memory/ directory with pre-populated templates (constraints.md, current-state.md, tasks.md, discoveries.md, rejected.md) and automatically injects IDE instructions (GEMINI.md, .agents/rules/veeshree.md, .cursorrules, CLAUDE.md) so any AI coding assistant immediately adheres to your repository memory.",
    howUsed:
      "In a new or existing repository, run 'vee init'. It scans the project, creates memory templates, and writes IDE rules so Antigravity, Claude, Cursor, and Copilot can immediately read and write memory without further setup.",
    flags: "-f, --force : Overwrite existing memory files and reset configuration.",
    example: "vee init\nvee init --force",
    outputExample: `Scanning repository...
Detected: TypeScript, Next.js, TailwindCSS, Node.js
Created docs/memory/constraints.md
Created docs/memory/current-state.md
Created docs/memory/tasks.md
Created docs/memory/discoveries.md
Created docs/memory/rejected.md
Created .agents/rules/veeshree.md
Created GEMINI.md
Created .cursorrules
Veeshree initialized successfully (0 tokens consumed).`,
    prev: { title: "Comparison Matrix", href: "/docs/saving-data/comparison-matrix" },
    next: { title: "vee watch", href: "/docs/commands/watch" },
  },
  {
    id: "watch",
    cmd: "vee watch",
    name: "Watch",
    badge: "Ambient Background Engine",
    summary: "Starts ambient background file watcher for automatic memory extraction.",
    explanation:
      "Starts an ambient background file watcher. Whenever you edit, add, or delete files, it waits for changes to settle (debounce window) and automatically runs memory extraction and file indexing. You never have to manually update memory or write status reports while in flow.",
    howUsed:
      "Leave 'vee watch' running in a secondary terminal tab or background daemon. While building features, you never have to touch the CLI. After each pause in typing, vee watch captures the diff and updates the tasks list automatically.",
    flags:
      "-d, --debounce <seconds> : Settle window in seconds (default: 5).\n-p, --provider <name> : Force specific model provider.",
    example: "vee watch\nvee watch --debounce 10",
    outputExample: `[vee watch] Ambient engine active. Monitoring ./src and ./app...
Debounce window: 5s
Extractor model: Local Ollama / Gemini 2.5 Flash
[10:14:02] Change detected in src/auth/session.ts
[10:14:07] Debounce settled. Extracting diff...
[10:14:09] Updated docs/memory/current-state.md (+1 task completed)`,
    prev: { title: "vee init", href: "/docs/commands/init" },
    next: { title: "vee status", href: "/docs/commands/status" },
  },
  {
    id: "status",
    cmd: "vee status",
    name: "Status",
    badge: "Health & Integrity Dashboard",
    summary: "Displays live terminal dashboard of milestones, decisions, models, and drift.",
    explanation:
      "Displays a live terminal dashboard of current project focus, task completion progress percentage, active architectural decisions, active model engine, and SHA-256 code drift alerts. Checks if source files linked to architectural decisions have been modified without an ADR update.",
    howUsed:
      "Run before committing code or starting a coding session to confirm milestone progress and verify that no linked source code files have unrecorded modifications.",
    flags: "-c, --check : Exits with a non-zero exit code if any decision is stale (ideal for CI/CD checks).",
    example: "vee status\nvee status --check",
    outputExample: `=== Veeshree Project Status ===
Project: veeshree (v0.2.1)
Current Focus: Production Documentation & Multi-Page Routing
Milestone Progress: [||||||||||||||||||||] 100% (6/6 tasks)
Active ADRs: 4 (0 drifted)
Active Extractor Model: Local / Ollama (llama3.2:3b)
Health: All SHA-256 hashes synchronized`,
    prev: { title: "vee watch", href: "/docs/commands/watch" },
    next: { title: "vee context", href: "/docs/commands/context" },
  },
  {
    id: "context",
    cmd: "vee context",
    name: "Context",
    badge: "Token-Budgeted Context Injection",
    summary: "Assembles strict token-budgeted prompt payload (~2,000 tokens max) for AI models.",
    explanation:
      "Assembles a strict token-budgeted prompt payload (~2,000 tokens max) prioritized by: System Context & Rules, Hard Constraints, Current Project Snapshot, and BM25 ranked Architectural Decision Records. Automatically prepends Stale Record Warnings if code drifted, guaranteeing the AI never hallucinates obsolete architectural patterns.",
    howUsed:
      "When asking an AI model to work on a feature, pipe or pass 'vee context \"feature description\"' into the prompt to provide full project context without blowing context windows.",
    flags:
      "-m, --max-tokens <n> : Maximum token budget (default: 2000).\n-t, --tasks : Include task lists.\n-r, --raw : Output raw text without decorative headers.\n-j, --json : Output structured JSON.",
    example: "vee context \"Implement authentication\"\nvee context --max-tokens 1500 --raw",
    outputExample: `<!-- VEESHREE CONTEXT INJECTION (Budget: 1,840 / 2,000 tokens) -->
# System Context & Hard Constraints
- Never commit .env or secrets to Git
- Keep bundle size under 150kb
- Use Poppins font across all documentation

# Current State Snapshot
- Milestone: User Authentication & Session Layer
- Active tasks: JWT refresh rotation in progress

# Relevant Architectural Decisions (BM25 Score: 0.94)
- docs/memory/decisions/session-token.md (SHA-256 Valid)`,
    prev: { title: "vee status", href: "/docs/commands/status" },
    next: { title: "vee sync", href: "/docs/commands/sync" },
  },
  {
    id: "sync",
    cmd: "vee sync",
    name: "Sync",
    badge: "SHA-256 Hash & Re-Indexing",
    summary: "Recalculates SHA-256 file hashes and rebuilds BM25 search index in milliseconds.",
    explanation:
      "Scans all Markdown documents in docs/memory/, recalculates current SHA-256 hashes of all linked source code files, and rebuilds the BM25 search index in .vee/index.json in milliseconds. Ensures that searches and drift checks are 100% up to date.",
    howUsed:
      "Run after manually editing markdown memory files, pulling changes from git, or switching git branches to refresh indexes instantly.",
    flags: "None",
    example: "vee sync",
    outputExample: `Synchronizing memory index...
Indexed 6 memory documents
Recalculated SHA-256 hashes for 14 linked source files
Rebuilt BM25 vocabulary (412 terms)
Index saved to .vee/index.json in 14ms`,
    prev: { title: "vee context", href: "/docs/commands/context" },
    next: { title: "vee capture", href: "/docs/commands/capture" },
  },
  {
    id: "capture",
    cmd: "vee capture",
    name: "Capture",
    badge: "Diff & Transcript Reconciliation",
    summary: "Extracts decisions and task progress from Git diffs or conversation transcripts.",
    explanation:
      "Takes a Git diff or conversation transcript, runs it through the extraction engine, parses architectural decisions, updates task statuses, and records milestones in docs/memory/current-state.md without manual typing.",
    howUsed:
      "After completing a manual coding session, pipe git diff into Veeshree: 'git diff | vee capture'. The engine recognizes newly added functions, creates decision records, and updates tasks.",
    flags:
      "-d, --diff : Automatically capture current git diff.\n-t, --transcript <text> : Pass raw conversation string.\n-f, --file <path> : Read transcript from file.",
    example: "vee capture --diff\ngit diff | vee capture",
    outputExample: `Analyzing git diff (3 files changed, +142 lines, -18 lines)...
Identified: Architectural Decision on JWT Refresh Mechanism
Created: docs/memory/decisions/jwt-rotation.md
Updated: docs/memory/tasks.md [x] Implement token refresh handler
Memory synchronized with code changes.`,
    prev: { title: "vee sync", href: "/docs/commands/sync" },
    next: { title: "vee models", href: "/docs/commands/models" },
  },
  {
    id: "models",
    cmd: "vee models",
    name: "Models",
    badge: "Model Runtime Discovery",
    summary: "Probes local Ollama / LM Studio ports and cloud APIs for active extraction engines.",
    explanation:
      "Probes local ports (Ollama on 11434, LM Studio on 1234) and checks configured cloud API keys (Gemini, OpenAI, Anthropic) to report all active and usable model engines. Dynamically chooses the fastest and most cost-effective model available.",
    howUsed:
      "Run 'vee models' to check if your local Ollama instance or cloud Gemini key is recognized and ready for background extractions.",
    flags: "None",
    example: "vee models",
    outputExample: `=== Detected Model Engines ===
Local Ollama (http://localhost:11434)  : ONLINE [qwen2.5-coder:7b, llama3.2:3b]
LM Studio (http://localhost:1234)      : OFFLINE
Gemini API Key                         : CONFIGURED (gemini-2.5-flash)
OpenAI API Key                         : NOT CONFIGURED
Anthropic API Key                      : NOT CONFIGURED
Active Extractor Strategy              : Local Ollama (fallback: Gemini)`,
    prev: { title: "vee capture", href: "/docs/commands/capture" },
    next: { title: "vee keys", href: "/docs/commands/keys" },
  },
  {
    id: "keys",
    cmd: "vee keys",
    name: "Keys",
    badge: "Local Credentials Management",
    summary: "Securely stores and masks API keys in .vee/config.json with zero cloud leaks.",
    explanation:
      "Securely manages API keys locally in .vee/config.json with masking so keys are never accidentally logged, displayed in plaintext, or committed to version control. Keys remain strictly on your local machine.",
    howUsed:
      "Set your API key with 'vee keys set gemini AIzaSy...' and verify with 'vee keys list'.",
    flags: "Subcommands: list, set <provider> <key>, remove <provider>",
    example: "vee keys list\nvee keys set gemini <your-key>\nvee keys remove gemini",
    outputExample: `Configured API Keys:
- gemini    : AIzaSy**************************** (Active)
- openai    : (Not set)
- anthropic : (Not set)
Stored locally in .vee/config.json (Git-ignored).`,
    prev: { title: "vee models", href: "/docs/commands/models" },
    next: { title: "vee search", href: "/docs/commands/search" },
  },
  {
    id: "search",
    cmd: "vee search",
    name: "Search",
    badge: "BM25 Full-Text Search",
    summary: "Performs BM25-ranked keyword and phrase search across all memory documents.",
    explanation:
      "Performs BM25-ranked keyword and phrase search across all memory files including decisions, tasks, constraints, and discoveries. Returns snippets, matching lines, and file references with relevance ranking scores.",
    howUsed:
      "When reviewing why a specific library or architecture was chosen, run 'vee search \"auth library\"' to instantly view the relevant decision record.",
    flags: "-a, --archived : Include historical archived documents in the search.",
    example: "vee search \"database\"\nvee search \"jwt\" --archived",
    outputExample: `Search results for "database" (Found 3 matches):
1. docs/memory/decisions/database.md (Score: 1.48)
   "...Chose SQLite with WAL mode for local zero-config persistence..."
2. docs/memory/constraints.md (Score: 0.89)
   "...Never perform unindexed full table scans on audit logs..."
3. docs/memory/discoveries.md (Score: 0.42)
   "...SQLite foreign key constraints must be PRAGMA enabled on connect..."`,
    prev: { title: "vee keys", href: "/docs/commands/keys" },
    next: { title: "vee decisions", href: "/docs/commands/decisions" },
  },
  {
    id: "decisions",
    cmd: "vee decisions",
    name: "Decisions",
    badge: "Architectural Decision Records",
    summary: "Lists all Architectural Decision Records (ADRs) with integrity status and tags.",
    explanation:
      "Lists all Architectural Decision Records (ADRs) with their title, status (active, superseded, proposed), creation date, tags, and linked source code files. Flags any decision where code modifications caused hash drift.",
    howUsed:
      "Run 'vee decisions' to view an index of all architectural decisions recorded in the repository.",
    flags: "-a, --all : Include archived and superseded decisions.\n-s, --status <status> : Filter by status.",
    example: "vee decisions\nvee decisions --all",
    outputExample: `=== Architectural Decision Records ===
[ACTIVE] 2026-03-12  ADR-001: Next.js App Router with React Server Components
  Tags: frontend, react, framework
  Linked: site/src/app/layout.tsx (SHA-256 match)

[ACTIVE] 2026-03-14  ADR-002: Zero-Token Scaffolding via AST and Heuristics
  Tags: cli, parser, heuristics
  Linked: src/core/scaffold.ts (SHA-256 match)

[ACTIVE] 2026-03-20  ADR-003: BM25 Term Weighting for Local Context Injection
  Tags: search, bm25, retrieval
  Linked: src/search/bm25.ts (SHA-256 match)`,
    prev: { title: "vee search", href: "/docs/commands/search" },
    next: { title: "vee gc", href: "/docs/commands/gc" },
  },
  {
    id: "gc",
    cmd: "vee gc",
    name: "GC",
    badge: "Garbage Collection & Pruning",
    summary: "Prunes completed tasks and superseded decisions to keep token context minimal.",
    explanation:
      "Keeps memory files compact to prevent token bloat. Moves completed tasks from current-state.md into docs/memory/archive/completed-tasks.md and archives superseded decisions into docs/memory/archive/decisions/.",
    howUsed:
      "After completing a milestone, run 'vee gc' to archive completed tasks, keeping prompt context lightweight and fast.",
    flags: "-d, --dry-run : Preview pruning actions without altering files.",
    example: "vee gc\nvee gc --dry-run",
    outputExample: `Running Veeshree Garbage Collection...
Archived 8 completed tasks -> docs/memory/archive/completed-tasks.md
Archived 1 superseded decision -> docs/memory/archive/decisions/auth-v1.md
Trimmed docs/memory/current-state.md from 1,280 tokens to 420 tokens.
Context window savings: 67% reduction.`,
    prev: { title: "vee decisions", href: "/docs/commands/decisions" },
    next: { title: "Architecture: Directory Layout", href: "/docs/architecture/directory-structure" },
  },
];
