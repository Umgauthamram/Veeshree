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
    summary: "Scaffolds docs/memory/, protects .gitignore, and configures IDE rules without spending any LLM tokens.",
    explanation:
      "Analyzes your project structure, primary language, frameworks, database, and git history without spending any LLM tokens. Scaffolds the docs/memory/ directory with pre-populated templates (constraints.md, current-state.md, tasks.md, discoveries.md, rejected.md), automatically injects IDE instructions (GEMINI.md, .agents/rules/veeshree.md, .cursorrules, CLAUDE.md), and protects local config in .gitignore so your secrets are never tracked by Git.",
    howUsed:
      "In a new or existing repository, run 'vee init'. It scans the project, creates memory templates, protects your .gitignore, and writes IDE rules so Antigravity, Claude, Cursor, and Copilot can immediately read and write memory without further setup.",
    flags: "-f, --force : Overwrite existing memory files and reset configuration.",
    example: "vee init\nvee init --force",
    outputExample: `=== Initializing Veeshree Context Memory Layer ===
[INFO] Analyzing project architecture and IDE environment...
[INFO] Detected active project.
[INFO] Languages: TypeScript
[INFO] Frameworks: Next.js, TailwindCSS
[OK] Seeded docs/memory/current-state.md
[OK] Seeded docs/memory/tasks.md
[OK] Seeded docs/memory/constraints.md
[OK] Seeded docs/memory/rejected.md
[OK] Seeded docs/memory/discoveries.md
[INFO] Injected IDE context instructions: .cursorrules, CLAUDE.md, GEMINI.md, .agents/rules/veeshree.md
[OK] Protected local secrets: added /.vee/config.json and /.vee/index.json to .gitignore

[OK] Veeshree initialized successfully! Version-controlled memory is active at /docs/memory/

Next Steps:
  1. Configure Background AI Extractor:
     vee keys set gemini <YOUR_API_KEY>
     (Stored in ~/.veeshree/credentials.json — never exposed to GitHub/Git)
  2. Start Ambient Memory Watcher:
     vee watch
  3. Run Diagnostics Anytime:
     vee doctor`,
    prev: { title: "Comparison Matrix", href: "/docs/saving-data/comparison-matrix" },
    next: { title: "vee doctor", href: "/docs/commands/doctor" },
  },
  {
    id: "doctor",
    cmd: "vee doctor",
    name: "Doctor",
    badge: "System & Security Diagnostics",
    summary: "Runs comprehensive diagnostics on memory scaffolding, Git secret protection, and AI engine connectivity.",
    explanation:
      "Validates end-to-end repository readiness. Inspects docs/memory/ for core templates, verifies that .vee/config.json is protected in .gitignore and NOT tracked in Git history, tests connection to active AI extraction engines (Ollama, LM Studio, Gemini, OpenAI, Claude), and detects stale SHA-256 hash drift across linked source files.",
    howUsed:
      "Run 'vee doctor' anytime you set up a new repository, add an API key, or before committing to verify that your memory layer is intact and no local secrets are staged for Git.",
    flags: "None",
    example: "vee doctor",
    outputExample: `=== Veeshree System Diagnostics & Health Check ===

[PASS] Memory Scaffold      | docs/memory/                 : All 5 core memory files present
[PASS] Git Security         | .vee/config.json in .gitignore : Protected from Git tracking
[PASS] Git Security         | Git Tracking Status          : .vee/config.json is not tracked by Git
[PASS] AI Extraction Engine | Active Engine                : gemini (gemini-2.0-flash) via keystore (~/.veeshree/credentials.json)
[PASS] Search & Code Hashes | Code Integrity               : 6 memory records in sync with codebase

----------------------------------------------------------------------
[OK] All checks passed! Veeshree is completely healthy, secure, and ready.`,
    prev: { title: "vee init", href: "/docs/commands/init" },
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
      "-d, --debounce <seconds> : Settle window in seconds (default: 5).\n-p, --provider <name> : Force specific model provider (gemini, groq, nvidia, openai, ollama, lmstudio).\n-m, --model <name> : Specific model name override (e.g. gemini-2.0-flash).",
    example: "vee watch\nvee watch --debounce 10\nvee watch --provider gemini --model gemini-2.0-flash",
    outputExample: `=== Veeshree Ambient Memory Watcher ===
[INFO] Active Extraction Engine: gemini (gemini-2.0-flash) via keystore (~/.veeshree/credentials.json)
[INFO] Watching workspace for code modifications (settle debounce: 5s)...
[INFO] Press Ctrl+C to stop.

[AMBIENT] Detected settled code changes (48 diff lines). Extracting memory...
[AMBIENT] Auto-updated memory: +1 new decisions, 2 updated files.`,
    prev: { title: "vee doctor", href: "/docs/commands/doctor" },
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
Project: veeshree (v0.3.1)
Current Focus: Production Documentation & Multi-Page Routing
Milestone Progress: [||||||||||||||||||||] 100% (6/6 tasks)
Active ADRs: 4 (0 drifted)
Active Extractor Model: gemini (gemini-2.0-flash) via keystore
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
    flags:
      "-a, --accept [id] : Accept code drift for specific ADR or 'all' to update baselines\n--all : Accept all drift across workspace\n--quiet : Silence non-error output",
    example: "vee sync\nvee sync --accept all\nvee sync --accept 0001-database",
    outputExample: `=== Synchronizing Veeshree Memory & Code Hashes ===
[INFO] Indexed 6 memory documents.
[OK] All memory records are in sync with codebase hashes.
[OK] Saved updated index to .vee/index.json`,
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
      "-f, --file <path> : Path to diff or transcript file.\n-p, --provider <name> : Extraction provider (gemini, groq, nvidia, openai, ollama, lmstudio).\n-m, --model <name> : Custom model name.",
    example: "git diff HEAD | vee capture\nvee capture --file ./session.log",
    outputExample: `=== Capturing & Extracting Architectural Memory ===
[INFO] Extracting structural memory delta via background LLM...
[OK] Structured extraction completed successfully.
[INFO] Reconciling changes with /docs/memory/ files...
[OK] Created new ADR: Database Architecture
[INFO] Updated memory files: docs/memory/current-state.md, docs/memory/tasks.md
[OK] Veeshree memory synchronized with codebase!`,
    prev: { title: "vee sync", href: "/docs/commands/sync" },
    next: { title: "vee models", href: "/docs/commands/models" },
  },
  {
    id: "models",
    cmd: "vee models",
    name: "Models",
    badge: "Model Discovery & Version Control",
    summary: "Probes local and cloud LLM engines, switches extractor models, and pulls local weights via Ollama.",
    explanation:
      "Probes local ports (Ollama on 11434, LM Studio on 1234) and cloud API keys (Gemini, Groq, NVIDIA, OpenAI) to report available LLM runtimes. Supports switching the active extraction model with 'vee models use <provider> <model>' and pulling new weights with 'vee models pull <model>'.",
    howUsed:
      "Use 'vee models' to view active LLM runtimes. Switch models anytime with 'vee models use gemini gemini-2.0-flash' or download local weights with 'vee models pull llama3.2'.",
    flags:
      "Subcommands:\nmodels : List active runtimes and latency.\nmodels use <provider> <model> : Set active extractor model version.\nmodels pull <model> : Pull local model weights via Ollama.",
    example: "vee models\nvee models use gemini gemini-2.0-flash\nvee models pull llama3.2",
    outputExample: `=== Veeshree Model Runtimes & Providers ===
[INFO] Probing local LLM engines and cloud credentials...

Ollama (Local Engine)        [READY (14ms)]
  Endpoint: http://127.0.0.1:11434
  Models:   llama3.2, qwen2.5-coder

LM Studio (Local Engine)     [Engine Offline]

Google Gemini Cloud          [READY]
  Models:   gemini-2.0-flash, gemini-1.5-flash, gemini-1.5-pro

Groq Cloud LPU               [Missing API Key (run: vee keys set)]
NVIDIA NIM Cloud             [Missing API Key (run: vee keys set)]
OpenAI Cloud                 [Missing API Key (run: vee keys set)]`,
    prev: { title: "vee capture", href: "/docs/commands/capture" },
    next: { title: "vee keys", href: "/docs/commands/keys" },
  },
  {
    id: "keys",
    cmd: "vee keys",
    name: "Keys",
    badge: "Global Keystore & Security",
    summary: "Securely stores API keys in machine keystore (~/.veeshree/credentials.json) with zero Git leakage.",
    explanation:
      "Manages AI provider API credentials. By default, keys are stored in your machine's user directory (~/.veeshree/credentials.json) rather than inside project repositories. This guarantees that your keys are never accidentally committed to GitHub or exposed to team members. Also supports project-level overrides with --local and reads from local .env files.",
    howUsed:
      "Set your key once with 'vee keys set gemini AIzaSy...' and verify with 'vee keys list'. Update anytime with 'vee keys update gemini <NEW_KEY>'.",
    flags:
      "Subcommands:\nkeys list : List configured providers and credential sources with masking.\nkeys set <provider> <key> [--local] : Store key in global keystore (or local project).\nkeys update <provider> <key> [--local] : Update existing key.\nkeys remove <provider> [--local|--global] : Remove key.",
    example: "vee keys set gemini <your-key>\nvee keys update gemini <new-key>\nvee keys list\nvee keys remove gemini",
    outputExample: `=== Configured AI Provider API Keys ===

- GEMINI    : AIza...3456 [Configured via global keystore (~/.veeshree/credentials.json)]
- GROQ      : (not set)   [Not Configured]
- NVIDIA    : (not set)   [Not Configured]
- OPENAI    : (not set)   [Not Configured]

[INFO] Keys stored in your global keystore (~/.veeshree/credentials.json) apply to all projects without Git exposure.`,
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
    flags: "-a, --archived : Include historical archived documents in the search.\n-j, --json : Output structured JSON.",
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
    flags: "None",
    example: "vee gc",
    outputExample: `Running Veeshree Garbage Collection...
Archived 8 completed tasks -> docs/memory/archive/completed-tasks.md
Archived 1 superseded decision -> docs/memory/archive/decisions/auth-v1.md
Trimmed docs/memory/current-state.md from 1,280 tokens to 420 tokens.
Context window savings: 67% reduction.`,
    prev: { title: "vee decisions", href: "/docs/commands/decisions" },
    next: { title: "Architecture: Directory Layout", href: "/docs/architecture/directory-structure" },
  },
];
