export interface ArchitectureTopic {
  id: string;
  slug: string;
  title: string;
  badge: string;
  summary: string;
  content: string;
  diagramOrCode: string;
  howItWorks: string[];
  prev?: { title: string; href: string };
  next?: { title: string; href: string };
}

export const architectureTopics: ArchitectureTopic[] = [
  {
    id: "shared-memory",
    slug: "shared-memory",
    title: "Shared Memory Layer",
    badge: "Cross-Agent Shared State",
    summary:
      "A unified shared memory layer that synchronizes architectural decisions, constraints, and tasks across Cursor, Claude Code, Copilot, and Gemini with zero context silos.",
    content:
      "Modern software engineering teams do not rely on a single AI model or IDE. Developers move fluidly between Cursor for feature prototyping, Claude Code for complex terminal refactoring, Gemini CLI for architectural review, and GitHub Copilot for fast tab completions. Without a shared memory layer, each of these tools operates in total blindness. When a chat window compacts or closes, architectural context vanishes. If Cursor decides to adopt BullMQ for queue processing, Claude Code has no knowledge of that decision and might suggest Kafka an hour later. Veeshree acts as the universal shared memory substrate for AI coding agents. By establishing a Git-native shared memory layer in docs/memory/, every AI model—regardless of vendor or IDE—reads from and writes to the exact same persistent context. This eliminates repetitive prompt engineering, prevents architectural contradictions, and provides true multi-agent synergy.",
    diagramOrCode: `[ Cursor IDE ]      [ Claude Code ]      [ Gemini / Antigravity ]      [ Copilot ]
       \\                   |                     |                    /
        \\                  |                     |                   /
         ▼                 ▼                     ▼                  ▼
   ┌─────────────────────────────────────────────────────────────────────┐
   │                VEESHREE SHARED MEMORY LAYER                         │
   │                      (/docs/memory/)                                │
   ├─────────────────────────────────────────────────────────────────────┤
   │  • decisions/       : Architectural decisions & trade-offs (ADRs)   │
   │  • current-state.md : Active milestone focus & progress buffer      │
   │  • tasks.md         : Living checklist & dependency roadmap         │
   │  • constraints.md   : Constitutional safety rules (hard & soft)     │
   │  • discoveries.md   : Empirical behaviors & codebase patterns       │
   │  • rejected.md      : Discarded technologies & known dead-ends      │
   │  • archive/         : Completed milestones & superseded records     │
   └─────────────────────────────────────────────────────────────────────┘
                                   ▲
                                   │ SHA-256 Hash Guard
                                   ▼
                    [ Your Project Source Code ]`,
    howItWorks: [
      "Unified Ground Truth: Every coding assistant references the same Markdown files in docs/memory/ instead of isolated chat context.",
      "Cross-Agent Synchronization: When one agent records an architectural choice, all other agents immediately see it in subsequent prompts via vee context or native IDE rule files.",
      "Token-Budgeted Retrieval: Memory is dynamically ranked using BM25 and injected into agent prompts within an uncompromising ~2,000 token envelope.",
      "Cryptographic Drift Detection: Linked source files are verified against SHA-256 hashes to guarantee shared memory never diverges from live code.",
      "Zero Vendor Lock-In: 100% Git-native Markdown. No external vector databases, no binary formats, and zero proprietary cloud dependencies.",
    ],
    prev: { title: "vee gc", href: "/docs/commands/gc" },
    next: { title: "Directory Structure", href: "/docs/architecture/directory-structure" },
  },
  {
    id: "directory-structure",
    slug: "directory-structure",
    title: "Directory Structure",
    badge: "Transparent Markdown Storage",
    summary:
      "Zero opaque databases or vendor lock-in. Project memory is stored as human-readable, version-controlled Markdown directly inside your Git repository.",
    content:
      "Veeshree intentionally rejects proprietary cloud databases, binary vector formats, and opaque state blobs. Instead, all architectural memory lives directly in docs/memory/ inside the repository root. Every engineering decision, hard constraint, and task status is a regular Markdown file. This ensures your memory is preserved across any IDE, visible in standard git diffs, and reviewable in pull requests by humans and automated bots alike.",
    diagramOrCode: `your-codebase/
├── docs/
│   └── memory/                      <-- Version-controlled human-readable memory
│       ├── decisions/               <-- Active Architectural Decision Records (ADRs)
│       │   ├── database.md
│       │   └── framework.md
│       ├── current-state.md         <-- Active feature & rolling milestone snapshot (max 5)
│       ├── tasks.md                 <-- Pending and completed task lists
│       ├── constraints.md           <-- Locked architectural & security rules (Never violate)
│       ├── discoveries.md           <-- System behaviors & technical findings
│       ├── rejected.md              <-- Discarded alternatives & trade-offs
│       └── archive/                 <-- Pruned historical records
│           ├── completed-tasks.md
│           └── decisions/
├── .vee/                            <-- Local search cache & config (Git ignored)
│   ├── config.json                  <-- Preferences & local API key storage
│   └── index.json                   <-- Fast search index & SHA-256 code hashes
└── .agents/rules/veeshree.md        <-- Native IDE assistant instruction file`,
    howItWorks: [
      "Every ADR in docs/memory/decisions/ includes YAML frontmatter with date, status, tags, and linked files.",
      "docs/memory/constraints.md acts as an unbreakable constitutional boundary for all AI agents.",
      "The .vee/ directory is strictly local and added to .gitignore, storing fast BM25 tokens and hashed file cache.",
      "Historical decisions and archived tasks are safely preserved in docs/memory/archive/ without cluttering active agent context.",
    ],
    prev: { title: "Shared Memory Layer", href: "/docs/architecture/shared-memory" },
    next: { title: "Token Budget Engine", href: "/docs/architecture/token-budget" },
  },
  {
    id: "token-budget",
    slug: "token-budget",
    title: "Token Budget Engine",
    badge: "Bounded Prompt Injection",
    summary:
      "Strict ~2,000 token cap that guarantees critical constraints are never truncated while dynamically allocating remaining space to BM25 ranked records.",
    content:
      "Large context windows encourage sloppy prompting, causing models to suffer from attention dilution and needle-in-a-haystack hallucinations. Veeshree enforces an uncompromising ~2,000 token maximum ceiling when assembling context for any coding agent. By categorizing memory into strict priority tiers, critical safety constraints and project rules are always preserved at 100% fidelity.",
    diagramOrCode: `Priority Tier Allocation (~2,000 Token Cap):
----------------------------------------------------------------------
Tier 1: System Context & IDE Directives       ~300 tokens  [CRITICAL]
Tier 2: Hard Architectural Constraints        ~200 tokens  [CRITICAL]
Tier 3: Current Project State & Milestones    ~400 tokens  [HIGH]
Tier 4: Top BM25 Ranked Decision Records      ~1,100 tokens [DYNAMIC]
----------------------------------------------------------------------
Total Context Payload:                       <= 2,000 tokens`,
    howItWorks: [
      "Tier 1 (System Context): Injects instructions instructing the AI on how to format memory and inspect current state.",
      "Tier 2 (Constraints): Injects locked architectural boundaries (e.g. 'Never commit secrets', 'Use Poppins font') which cannot be truncated under any condition.",
      "Tier 3 (Current State): Injects the current milestone, active blockers, and in-flight tasks.",
      "Tier 4 (Dynamic BM25 ADRs): Allocates the remaining budget strictly to decision records scoring highest against the current task prompt.",
    ],
    prev: { title: "Directory Structure", href: "/docs/architecture/directory-structure" },
    next: { title: "SHA-256 Drift Guard", href: "/docs/architecture/drift-guard" },
  },
  {
    id: "drift-guard",
    slug: "drift-guard",
    title: "SHA-256 Drift Guard",
    badge: "Code Integrity Sentinel",
    summary:
      "Monitors exact cryptographic hashes of source code files linked to architectural decisions, instantly alerting if source code changes out-of-band.",
    content:
      "Architectural decisions are only valuable if they reflect reality. Over weeks of active development, code is refactored, dependencies change, and architectural records silently become outdated. Veeshree solves this with SHA-256 Code Drift Guard: each ADR tracks the exact checksums of the files it governs. When a file is altered without updating the corresponding decision record, Veeshree marks the record as DRIFTED and alerts both the developer and the AI.",
    diagramOrCode: `! DRIFT DETECTED: docs/memory/decisions/auth.md
Linked file 'src/auth/jwt.ts' hash mismatch:
  Recorded SHA-256 : a8f32c91b58...
  Current SHA-256  : e7b10492c81...
Warning: The implementation has diverged from documented architectural design.
To reconcile: run 'vee capture --diff' or 'vee sync'`,
    howItWorks: [
      "When an ADR is written, Veeshree records the SHA-256 checksum of each linked source file in frontmatter.",
      "Every execution of 'vee status', 'vee watch', or 'vee sync' validates the live source hashes against the recorded hashes.",
      "If a hash mismatch occurs, 'vee context' prepends an urgent warning flag into the prompt so the AI does not rely on outdated architecture.",
      "Reconciliation is a single command: 'vee capture --diff' updates the record or 'vee sync' resets the baseline.",
    ],
    prev: { title: "Token Budget Engine", href: "/docs/architecture/token-budget" },
    next: { title: "Back to Home ✱", href: "/" },
  },
];
