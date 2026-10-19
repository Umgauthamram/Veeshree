1. Executive Summary & Strategic Rationale
Veeshree (vee) is a local-first, model-independent context persistence layer designed to solve state loss, architectural regression, and context degradation in multi-model AI software development. Modern software engineering teams frequently switch between different AI models (e.g., Claude 3.5 Sonnet, GPT-4o, Gemini 1.5 Pro, and local Ollama models) across various platforms (Cursor, VS Code, Claude Code, CLI). However, AI chat histories do not provide structured memory. When a developer switches models or starts a new session, the AI lacks awareness of prior architectural decisions, trade-offs evaluated, rejected implementations, and active constraints.
Veeshree decouples project memory from specific LLMs and chat sessions. By extracting structural outcomes—such as decisions, constraints, tasks, and rationale—and storing them as version-controlled Markdown inside the codebase (/docs/memory/), Veeshree treats AI models as interchangeable temporary workers while making project knowledge persistent and deterministic.
 ┌─────────────────┐       ┌────────────────────────┐       ┌─────────────────┐
  │  AI Model A     │       │    Veeshree Memory     │       │  AI Model B     │
  │  (e.g., Claude) │ ────> │       (/docs/memory)       │ ────> │  (e.g., GPT-4o) │
  └─────────────────┘       └────────────────────────┘       └─────────────────┘
    Generates code &           Persists decisions,             Reads active state &
    architectural rules        rationale, & constraints        continues seamlessly

2. The Multi-Model Engineering Problem
2.1 Context Window Degradation & Financial Waste
As AI coding sessions grow past 50,000+ tokens, processing entire chat logs increases token costs and latency while degrading model reasoning accuracy. Pushing full conversation histories through LLMs introduces noise, leading to forgotten constraints and hallucinations.
2.2 Silent Architectural Overwrites
If Model A decides to use PostgreSQL over MongoDB to handle transactional integrity, the rationale for that choice lives only inside Model A's ephemeral conversation history. When a user switches to Model B, Model B sees only the code. Lacking the decision history, Model B may propose switching to MongoDB, undoing previous work and creating architectural regressions.
2.3 Vendor Lock-In & Session Fragmentation
AI assistants isolate context within proprietary silos (e.g., Cursor chat logs vs. Claude Code CLI sessions). Switching tools requires developers to manually re-explain project constraints, leading to friction and lost productivity.
3. Core Technical Architecture & Design Principles
┌─────────────────────────────────────────────────────────────────────────┐
│                           DEVELOPER ENVIRONMENT                         │
│             (Cursor / Claude Code / VS Code / Terminal)                 │
└─────────────────────────────────────────────────────────────────────────┘
                                     │
                             Invokes CLI (`vee`)
                                     │
┌────────────────────────────────────▼────────────────────────────────────┐
│                           VEESHREE ENGINE (`vee`)                       │
│                                                                         │
│  ┌─────────────────────────┐  ┌─────────────────────┐  ┌─────────────┐  │
│  │ Context Builder Engine  │  │ Background Extractor│  │ Sync Engine │  │
│  └─────────────────────────┘  └─────────────────────┘  └─────────────┘  │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                        Reads & Writes Local System
                                     │
┌────────────────────────────────────▼────────────────────────────────────┐
│                         LOCAL REPOSITORY FILES                          │
│                                                                         │
│  /docs/memory/                     /.vee/                               │
│  ├── decisions/                    ├── config.json                      │
│  ├── current-state.md              └── index.json                       │
│  ├── tasks.md                                                           │
│  └── constraints.md                                                     │
└─────────────────────────────────────────────────────────────────────────┘

3.1 Principle 1: Human-Readable Markdown over Opaque Databases
Why: Project memory must be verifiable by human developers. Storing decisions in standard Markdown (/docs/memory/) allows developers to review, edit, and track AI-generated memory using standard Git tools.
Benefit: Eliminates database lock-in, allows zero-overhead manual edits, and integrates into standard Pull Request code reviews.
3.2 Principle 2: Capturing "Why" (Rationale-First Memory)
Why: Code shows what was implemented; memory must capture why it was implemented. Storing explicitly evaluated alternatives and rejection reasons prevents future AI agents from repeating discarded approaches.
Benefit: Reduces architectural flip-flopping and hallucinated refactoring proposals.
3.3 Principle 3: Asynchronous Non-Blocking Extraction
Why: Forcing developers to manually approve memory updates breaks workflow momentum.
Benefit: A background engine extracts structural memory from recent conversation deltas without interrupting the primary coding session. Git acts as the safety layer: if an extraction is inaccurate, the developer can discard the file change in Git.
3.4 Principle 4: Zero-Dependency Embedded Indexing (V1 Scope)
Why: Requiring users to configure external databases (like SQLite or vector stores) introduces environment-specific binary compilation issues and installation friction.
Benefit: V1 utilizes a pure JavaScript in-memory indexing engine (minisearch) serialized locally to /.vee/index.json. It runs across Node.js environments with zero native C++ compilation dependencies.
4. Repository & File Structure Layout
Plaintext
my-project/
├── docs/
│   └── memory/                      <-- Version-controlled human-readable memory
│       ├── decisions/               <-- Architectural Decision Records (ADRs)
│       │   ├── database.md
│       │   └── caching.md
│       ├── current-state.md         <-- Active feature & milestone snapshot
│       ├── tasks.md                 <-- Pending and completed task lists
│       ├── constraints.md           <-- Locked architectural & security rules
│       ├── discoveries.md           <-- System behaviors & technical findings
│       ├── rejected.md              <-- Discarded alternatives & trade-offs
│       └── archive/                 <-- Pruned historical records
│           ├── completed-tasks.md
│           └── decisions/
├── .vee/                            <-- Local system state & index cache
│   ├── config.json                  <-- System preferences & API key storage
│   └── index.json                   <-- Fast keyword search index & file SHA-256 hashes
├── .git/
│   └── hooks/                       <-- Automated Git synchronization
│       ├── pre-commit               <-- Code-to-memory drift validator
│       └── post-checkout            <-- Branch re-indexing trigger

5. Technical Data Schemas
5.1 System Configuration Schema (/.vee/config.json)
Stores configuration settings and API keys locally on the developer's machine:
JSON
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "VeeshreeConfig",
  "type": "object",
  "properties": {
    "version": { "type": "string" },
    "default_extractor": {
      "type": "object",
      "properties": {
        "provider": { "type": "string", "enum": ["openai", "anthropic", "gemini", "ollama"] },
        "model": { "type": "string" }
      },
      "required": ["provider", "model"]
    },
    "keys": {
      "type": "object",
      "properties": {
        "openai": { "type": "string" },
        "anthropic": { "type": "string" },
        "gemini": { "type": "string" }
      }
    },
    "local_engine": {
      "type": "object",
      "properties": {
        "enabled": { "type": "boolean" },
        "port": { "type": "integer" },
        "model": { "type": "string" }
      }
    },
    "settings": {
      "type": "object",
      "properties": {
        "max_context_tokens": { "type": "integer", "default": 2000 },
        "auto_sync_on_commit": { "type": "boolean", "default": true }
      }
    }
  },
  "required": ["version", "default_extractor", "keys", "settings"]
}

5.2 Local Search & Hash Index Schema (/.vee/index.json)
Tracks metadata, tag indexes, and SHA-256 hashes of linked source files to detect code-to-memory drift:
JSON
{
  "last_updated": "2026-09-23T10:30:00Z",
  "documents": [
    {
      "id": "dec-caching-01",
      "path": "docs/memory/decisions/caching.md",
      "title": "Caching Strategy",
      "type": "decision",
      "status": "active",
      "tags": ["redis", "cache", "rate-limiting"],
      "linked_files": ["src/middleware/rateLimiter.ts", "src/lib/redis.ts"],
      "linked_hashes": {
        "src/middleware/rateLimiter.ts": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        "src/lib/redis.ts": "f2ca1bb6c7e907d06dafe4687e579fce76b37e4e93b7605022da52e6ccc26fd2"
      },
      "stale": false
    }
  ]
}

5.3 Asynchronous Extraction Schema (LLM JSON Output)
Enforces structured extraction format when background processes evaluate conversation deltas:
JSON
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "ExtractionDelta",
  "type": "object",
  "properties": {
    "decisions": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "title": { "type": "string" },
          "decision": { "type": "string" },
          "reason": { "type": "string" },
          "alternatives_considered": { "type": "array", "items": { "type": "string" } },
          "linked_files": { "type": "array", "items": { "type": "string" } },
          "status": { "type": "string", "enum": ["active", "superseded", "proposed"] }
        },
        "required": ["title", "decision", "reason", "status"]
      }
    },
    "current_state": {
      "type": "object",
      "properties": {
        "current_feature": { "type": "string" },
        "completed_in_session": { "type": "array", "items": { "type": "string" } },
        "next_immediate_steps": { "type": "array", "items": { "type": "string" } }
      }
    },
    "tasks": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "task_name": { "type": "string" },
          "action": { "type": "string", "enum": ["add", "complete", "remove"] }
        },
        "required": ["task_name", "action"]
      }
    },
    "constraints": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "rule": { "type": "string" },
          "type": { "type": "string", "enum": ["hard", "soft"] }
        },
        "required": ["rule", "type"]
      }
    },
    "rejected_approaches": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "approach": { "type": "string" },
          "reason": { "type": "string" }
        },
        "required": ["approach", "reason"]
      }
    }
  },
  "required": ["decisions", "current_state", "tasks", "constraints", "rejected_approaches"]
}

6. Comprehensive CLI Command Specification (vee)
Command
Category
Functional Purpose
Token Impact
vee init
Lifecycle
Bootstraps project structure, executes local heuristic scanner, builds initial current-state.md, and installs Git hooks[cite: 1].
0 Tokens
vee keys set <provider> <key>
Auth
Stores encrypted API keys locally inside /.vee/config.json.
0 Tokens
vee keys list
Auth
Displays configured model provider keys with masked values.
0 Tokens
vee keys remove <provider>
Auth
Deletes a stored provider API key from local config.
0 Tokens
vee models
Inspection
Scans local engine ports (11434, 1234), environment variables, and configured keys to display active LLM runtimes.
0 Tokens
vee context "<request>"
Core Engine
Generates a pre-formatted ~2,000 token system prompt payload containing active constraints, state, and relevant decisions[cite: 1].
0 Tokens
vee capture --file <path>
Core Engine
Sends conversation logs/diffs to background extractor LLMs to update repository Markdown files[cite: 1].
Low (~2k-3k)
vee sync
Maintenance
Re-scans /docs/memory/, updates /.vee/index.json, and recalculates linked_files code hashes.
0 Tokens
vee status
Inspection
Displays a terminal dashboard showing active task progress, decision counts, and stale hash alerts[cite: 1].
0 Tokens
vee search "<query>"
Inspection
Searches index.json to return decision records and rationale without manually reading files[cite: 1].
0 Tokens
vee decisions
Inspection
Lists all active architectural decision records (ADRs) with status (active/superseded) and linked source paths[cite: 1].
0 Tokens
vee gc
Maintenance
Prunes old progress and shifts superseded decisions into /docs/memory/archive/.
0 Tokens

7. Deep-Dive Execution Lifecycles
7.1 Zero-Token Cold Start Architecture (vee init)
When initialized on an existing repository, Veeshree avoids sending large codebases to an LLM:
Plaintext
[Developer Invocates vee init]
             │
             ├──> 1. Directory Bootstrap
             │      └── Create /docs/memory/ & /.vee/ folder hierarchies
             │
             ├──> 2. Local Heuristic Scanner (Zero LLM Tokens Spent)
             │      ├── Parse package.json / requirements.txt -> Detects App Stack
             │      ├── Parse docker-compose.yml / schema.prisma -> Detects Database/Infra
             │      └── Read last 5 Git commits -> Extracts active feature context
             │
             ├──> 3. File Seed Execution
             │      ├── Generate /docs/memory/current-state.md with detected stack
             │      └── Seed decision stubs flagged as [Pending AI Observation]
             │
             └──> 4. Automated Git Hook Setup
                    └── Write .git/hooks/pre-commit and .git/hooks/post-checkout scripts

7.2 Context Assembly & Token Budget Pipeline (vee context "<request>")
When preparing prompt injections for an AI agent, Veeshree applies a strict token allocation budget:
Plaintext
 Prompt Token Budget: ~2,000 Tokens Max
  ├── System Context & Rules Rules   : ~300 Tokens  [CRITICAL - NEVER TRUNCATED]
  ├── Active Constraints             : ~200 Tokens  [CRITICAL - NEVER TRUNCATED]
  ├── Current Project State          : ~400 Tokens  [HIGH PRIORITY]
  └── Top Matching Decisions (Top K) : ~1,100 Tokens [DYNAMICALLY ALLOCATED]

Plaintext
[User or Agent executes: vee context "Implement Redis Rate Limiter"]
             │
             ├──> 1. Load Hard Rules from /docs/memory/constraints.md
             │
             ├──> 2. Load Snapshot from /docs/memory/current-state.md
             │
             ├──> 3. Perform Fast BM25 Search on /.vee/index.json
             │      └── Query terms: "Redis", "Rate Limiter" -> Matches caching.md
             │
             ├──> 4. Check Stale Hash Warnings for linked source files
             │      └── Appends "Notice: Code in src/lib/redis.ts has changed" if out of sync
             │
             └──> 5. Output Combined Text Stream to stdout

8. Git Lifecycle Integration & Hash Integrity
Software development relies on branching, merging, and refactoring. Veeshree uses Git hooks to keep memory synchronized with code:
Plaintext
                         ┌───────────────────────────┐
                          │   Git Event Triggered     │
                          └─────────────┬─────────────┘
                                        │
             ┌──────────────────────────┴──────────────────────────┐
             │                                                     │
             ▼                                                     ▼
   [post-checkout Hook]                                  [pre-commit Hook]
   Runs `vee sync` locally                               Calculates SHA-256 hashes
   Re-indexes `/.vee/index.json`                         for all `linked_files`
   Prevents cross-branch state pollution                 Flags stale decision records

post-checkout Hook (Branch Awareness): When switching branches (git checkout feature/auth), this hook runs vee sync. It re-scans /docs/memory/ and updates index.json in under 10ms, ensuring Model B does not inherit context from an unmerged feature branch.
pre-commit Hook (Drift Prevention): Before code changes are committed, this hook reads linked_files across all active decisions and computes current SHA-256 code hashes. If a source file was edited without updating its associated decision file, the decision is flagged as stale: true. Subsequent prompt injections then alert the AI to re-verify that decision's assumptions.
9. State Garbage Collection & Memory Archiving
Unstructured memory accumulation leads to context bloat over long development cycles. Veeshree prevents context bloat through structured archiving:
Rolling Snapshot (current-state.md): Maintained as a active working snapshot capped at 5 completed progress milestones. When a 6th item is marked complete, the oldest item is appended to /docs/memory/archive/completed-tasks.md.
Superseded Decisions: When an architectural choice is replaced, its status field is updated to status: superseded. The CLI moves the file to /docs/memory/archive/decisions/. The indexer ignores the archive/ folder during standard prompt assembly, keeping active prompts concise while preserving historical rationale for explicit searches (vee search --archived).
10. Comparative Feature Analysis
Metric / Capability
Raw Chat Histories
Vector Memory (e.g., Mem0)
Veeshree (vee)
Model Independence
❌ Tied to provider chat session
⚠️ API key dependent
✓ 100% Model Agnostic
[cite: 1]
Human Verifiability
❌ Obscured in transcript logs
❌ Stored in opaque vector DBs
✓ Git-Native Markdown Files
[cite: 1]
Architectural Rationale
⚠️ Lost in long conversations
❌ Focuses on unstructured facts
✓ Structured ADR Records & Rejections
[cite: 1]
Code Drift Detection
❌ None
❌ None
✓ SHA-256 Hash Matching on Linked Code
Token Budget Control
❌ Expensive (50k+ tokens)
⚠️ Variable vector retrieval
✓ Capped Token Budget (~2k max)
Environment Dependencies
None
Requires Python / Vector DBs
✓ Pure JS (Zero Native C++ Compilation)

11. Strategic Roadmap: V2 Expansion Scope
The V1 specification focuses on core local CLI functionality. The architecture reserves two specific capabilities for the V2 release:
Model Context Protocol (MCP) Server Integration: Native MCP bindings will allow IDE tools (Cursor, Claude Code, Windsurf) to access vee memory directly via standardized protocol methods (read_memory, record_decision) without shell execution hooks.
SQLite Embedded Vector Retrieval (sqlite-vec): Optional semantic vector search will complement keyword matching, allowing natural language queries (e.g., "Why did we stop using MongoDB?") to match relevant ADR files even if exact keywords differ.

