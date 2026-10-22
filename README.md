# Veeshree (`vee`)

<p align="center">
  <strong>Local-first, model-independent architectural context persistence layer for AI software engineering.</strong>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/veeshree"><img src="https://img.shields.io/npm/v/veeshree.svg?color=160f0c&label=npm%20package" alt="npm version" /></a>
  <a href="https://www.npmjs.com/package/veeshree"><img src="https://img.shields.io/npm/dm/veeshree.svg?color=160f0c" alt="npm downloads" /></a>
  <a href="#license"><img src="https://img.shields.io/badge/license-MIT-160f0c.svg" alt="License" /></a>
  <img src="https://img.shields.io/badge/node-%3E%3D20.0.0-160f0c.svg" alt="Node version" />
  <img src="https://img.shields.io/badge/coverage-93.75%25-brightgreen.svg" alt="Test Coverage" />
  <img src="https://img.shields.io/badge/native%20dependencies-0-160f0c.svg" alt="Zero native dependencies" />
  <img src="https://img.shields.io/badge/mcp-server%20ready-160f0c.svg" alt="MCP Server Ready" />
</p>

---

## 1. What Problem It Solves

Modern engineering workflows increasingly rely on AI coding assistants (Claude 3.7 Sonnet, OpenAI GPT-4o, Google Gemini 2.0, Cursor, Claude Code, and local Ollama models). However, standard AI engineering suffers from four foundational breakdowns:

1. **Context Amnesia & Session Compaction**: Chat histories are ephemeral. When sessions reset, context windows compact, or engineers switch between tools, architectural decisions (e.g., *"why we rejected library X"*, *"database query patterns"*, *"authentication rules"*) are permanently lost.
2. **Model Lock-In & Fragmented Agent Context**: AI context stored in proprietary platforms or opaque remote vector databases is locked away, preventing seamless handoffs between different models and IDEs.
3. **Silent Code Drift**: Teams make architectural decisions (ADRs) that document how code should behave, but as code changes, ADRs become obsolete without any automated mechanism to warn engineers or AI agents.
4. **Memory Poisoning & Prompt Injection**: Allowing AI agents or external imports to directly overwrite core project constraints creates critical security vulnerabilities where malicious instructions can compromise agent behavior.

### How Veeshree Solves This

**Veeshree** decouples architectural memory from temporary AI chat sessions and persists it as human-readable, version-controlled Markdown directly in `docs/memory/`.

```
┌─────────────────┐       ┌────────────────────────┐       ┌─────────────────┐
│  AI Model A     │       │    Veeshree Memory     │       │  AI Model B     │
│  (e.g., Claude) │ ────> │     (docs/memory/)     │ ────> │  (e.g., Gemini) │
└─────────────────┘       └────────────────────────┘       └─────────────────┘
  Generates code &           Persists decisions,             Reads active state &
  architectural rules        rationale, & constraints        continues seamlessly
```

- **Local-first and Git-Native**: Memory lives in your repository as standard Markdown (`docs/memory/decisions/`, `tasks.md`, `constraints.md`, `current-state.md`).
- **Cryptographic Code Drift Detection**: ADR frontmatter commits normalized SHA-256 hashes of linked source files (`linked_files: [{ path, sha256 }]`). CI and pre-commit hooks verify code integrity on fresh clones with zero dependence on local caches.
- **Safe-By-Default Proposal Queue**: Proposed memory updates are staged in `.vee/proposals/` and scored for risk. High-risk actions (modifying constraints, instruction overrides, or superseding ADRs) require explicit developer review before applying.
- **Model-Agnostic Context Protocol**: Built-in Model Context Protocol (MCP) server allows Claude Code, Cursor, VS Code, and Gemini to read token-budgeted context and stage proposals via standardized tools.

---

## 2. What Was Personally Implemented

Every subsystem across Veeshree 1.0.0 was engineered from the ground up with zero native dependencies:

### 1. Model Context Protocol (MCP) Stdio Server & Client Integrations
- Implemented a compliant MCP stdio server (`src/mcp/server.ts`) exposing 8 tools (`get_context`, `search_memory`, `get_decision`, `list_decisions`, `check_drift`, `propose_decision`, `propose_constraint`, `update_task`) and 3 memory resources.
- Added automatic client configuration installers (`src/mcp/client-config.ts`) supporting **Cursor**, **Claude Desktop**, **Claude Code** (project-level `.mcp.json`), **VS Code**, and **Gemini CLI** with automatic `.bak` backups.
- Bound all tool parameters with strict Zod schemas and validation guards preventing path traversal (`../`) and malformed IDs.

### 2. Cryptographic Code Drift Engine
- Designed the committed-baseline architecture (`src/core/drift/baselines.ts`, `src/core/drift/hasher.ts`).
- Implemented cross-platform SHA-256 hash calculation with CRLF/LF line ending normalization and UTF-8 BOM stripping to guarantee identical hashes across Windows, Linux, and macOS.
- Built `vee sync` and `vee status --check` (exit code `1` on drift, `0` when synchronized), preventing stale memory from entering CI pipelines.

### 3. Safe-by-Default Proposal & Staging Queue
- Developed the proposal lifecycle engine (`src/core/proposals/queue.ts`) staging memory mutations as individual JSON records under `.vee/proposals/`.
- Built heuristic risk analysis (`src/core/proposals/risk.ts`) that flags destructive commands (`rm -rf`, `curl | bash`), sensitive constraint alterations, and duplicate ADR title conflicts as `high` risk.
- Added auto-apply logic for low-risk proposals and full CLI inspection commands (`vee review`, `vee accept`, `vee reject`, `vee proposals`).

### 4. Automated Secret Redaction & Sensitive Path Denylist
- Built pattern-matching secret redactor (`src/core/redact/patterns.ts`) stripping API keys (Anthropic, OpenAI, Stripe, Google), JWT tokens, private keys, database connection strings (`postgres://`, `mongodb://`), and passwords before git diffs leave the machine.
- Engineered denylist filter (`src/core/redact/denylist.ts`) excluding sensitive paths (`.env*`, `*.pem`, `*.key`, `id_rsa*`, lockfiles, binary files, and `.veeignore` entries).

### 5. Multi-Tier Token Budgeting Engine
- Designed a priority-budgeted context builder (`src/core/context/builder.ts`) enforcing a strict token ceiling (default 2,000 tokens) with overflow warnings.
- Structured tiered allocation: Tier 1 (System directives ~150 tokens, unskippable), Tier 2 (Hard constraints ~400 tokens with `[pin]` preservation), Tier 3 (Current project state ~450 tokens), Tier 4 (Active tasks ~200 tokens), Tier 5 (BM25 searched decisions ~800 tokens).
- Added `vee context --explain` to inspect live token consumption.

### 6. Atomic State Management & Snapshot Rollback Engine
- Implemented file locking (`src/core/memory/lock.ts`) and temp-file-and-rename atomic writes (`src/core/memory/atomic.ts`) to prevent concurrent process race conditions.
- Engineered snapshot backup engine (`src/core/snapshots/snapshot-manager.ts`) saving pre-mutation state to `.vee/snapshots/`, enabling multi-step rollback via `vee undo`.

### 7. Multi-Provider AI Extraction Layer
- Engineered modular extractors (`src/providers/`) with unified interfaces for **Anthropic Claude**, **Google Gemini**, **OpenAI** (with custom base URLs for vLLM/LocalAI), **Groq LPU Cloud**, **NVIDIA NIM**, and local offline **Ollama** / **LM Studio**.
- Built secure credential storage in `~/.veeshree/credentials.json` with file mode permissions `0600` and masked CLI viewing.

### 8. Robust Cross-Platform CLI & Daemon
- Implemented ambient background watcher (`src/core/watch/daemon.ts`) with detached background execution, PID lifecycle management, and win32/POSIX cross-platform process termination.
- Standardized strict deterministic `--json` output stream separation (machine JSON strictly on `stdout`, logs/diagnostics strictly on `stderr`).

---

## 3. How to Run a Minimal Working Example

### Step 1: Install & Initialize
In any Git repository, run:

```bash
# Install globally or run via npx
npx veeshree init
```

This scaffolds `docs/memory/`, protects `.vee/` in `.gitignore`, and installs Git hooks (`pre-commit`, `post-checkout`, `post-merge`).

### Step 2: Record an Architectural Decision (ADR)
Create an architectural decision linked to your source code:

```bash
# Create a sample source file
mkdir -p src && echo "export const cache = new Map();" > src/cache.ts

# Record an ADR linking the source file
npx veeshree decisions new "In-Memory Caching Strategy" \
  --decision "Use Map-based in-memory caching for low latency" \
  --reason "Simple, zero-dependency, and adequate for current load" \
  --status active \
  --link src/cache.ts
```

Veeshree calculates the SHA-256 hash of `src/cache.ts` and commits it into `docs/memory/decisions/0001-in-memory-caching-strategy.md`.

### Step 3: Verify Drift Detection
Modify `src/cache.ts` to simulate code changes:

```bash
echo "export const cache = new RedisClient();" > src/cache.ts

# Check status - exits with code 1 due to code drift
npx veeshree status --check
```

Output:
```
[WARN] Memory Integrity: 1 record(s) flagged with stale code drift:
  - In-Memory Caching Strategy (docs/memory/decisions/0001-in-memory-caching-strategy.md)
    * src/cache.ts: expected a1b2c3d4..., found e5f6g7h8...
```

### Step 4: Synchronize & Accept Baselines
Once the architectural change is approved, update the baseline hashes:

```bash
npx veeshree sync --accept all
npx veeshree status --check
# Output: [OK] Memory Integrity: All linked code hashes are in sync (0 stale drift).
```

### Step 5: Connect AI Assistants via MCP
Install Veeshree's MCP server into your AI coding tool:

```bash
# For Claude Code:
npx veeshree mcp install --client claude-code

# For Cursor:
npx veeshree mcp install --client cursor
```

Your AI assistant can now read context (`get_context`), search memory (`search_memory`), and stage architectural proposals (`propose_decision`).

---

## 4. Which Tests Were Run & What They Verified

The repository is validated by **246 tests across 26 test suites** with strict Vitest thresholds enforced in CI:

| Metric | Target Threshold | Achieved Metric | Status |
|---|---|---|---|
| **Lines** | `>= 85.00%` | **93.75%** | PASSED (+8.75%) |
| **Functions** | `>= 80.00%` | **94.13%** | PASSED (+14.13%) |
| **Statements** | `>= 80.00%` | **92.38%** | PASSED (+12.38%) |
| **Branches** | `>= 80.00%` | **80.15%** | PASSED (+0.15%) |

### Key Test Suites & Verification Scope

1. **CLI End-to-End Integration Tests (`tests/cli-e2e.test.ts`)**
   - **Scenario 1 (MCP Handshake):** Runs `bin/vee.js mcp install`, spawns the MCP server via Node child process, and verifies the full JSON-RPC `initialize` handshake over stdio.
   - **Scenario 2 (Background Daemon):** Starts `vee watch --daemon`, checks process liveness with `vee status`, and terminates it cleanly via `vee stop` on both POSIX and Windows.
   - **Scenario 3 (`--json` Stream Purity):** Validates that all 11 commands supporting `--json` emit exactly one parseable JSON document on `stdout` with diagnostic logs routed exclusively to `stderr`.
   - **Scenario 4 (Redaction & Denylist):** Runs `vee capture --diff --show-payload` against a mock repo containing `.env`, `.pem`, lockfiles, and database connection strings, verifying all secrets are masked and denylisted files are excluded.
   - **Scenario 5 (Drift Exit Codes):** Asserts that `vee status --check` returns exit code `1` when code drifts and exit code `0` after running `vee sync --accept all`.
   - **Scenario 6 (Git Hook Resiliency):** Verifies that generated `.git/hooks/pre-commit` exits cleanly (`exit 0`) if the binary is missing, but enforces drift checking when `vee` is present.
   - **Scenario 7 (Memory Poisoning Protection):** Attempts to import a malicious bundle containing prompt injections and constraint overrides; verifies that `docs/memory/constraints.md` remains untouched and the change is quarantined in `.vee/proposals/` with risk level `HIGH`.

2. **Model Context Protocol Tests (`tests/mcp-server-inprocess.test.ts`, `tests/mcp-tools-coverage.test.ts`)**
   - Verifies all 8 MCP tools and 3 memory resources.
   - Validates that path traversal attacks (`get_decision("../../../etc/passwd")`) and oversized payloads are rejected by Zod schemas.
   - Validates client configuration generators for Cursor, Claude Code, Claude Desktop, and Gemini.

3. **Drift & Cryptographic Baseline Tests (`tests/phase2.test.ts`, `tests/bugs.test.ts`)**
   - Verifies drift detection on fresh clones lacking local `index.json`.
   - Tests CRLF vs LF hash normalization across operating systems.
   - Verifies graceful handling of out-of-tree relative paths without crashing.

4. **Redaction & Security Boundary Tests (`tests/process-and-redact.test.ts`, `tests/security.test.ts`)**
   - Verifies redaction for 12+ API key patterns, private RSA keys, JWT tokens, and URI auth strings.
   - Verifies that pre-redacted tokens (`[REDACTED:...]`) do not produce double-redaction artifacts.
   - Verifies that local credentials stored via `vee keys set` are set to `0600` permissions.

5. **AI Extraction & Provider Tests (`tests/phase3.test.ts`, `tests/providers-coverage.test.ts`)**
   - Tests extraction parsers for Anthropic Claude, Google Gemini, OpenAI, Groq, NVIDIA, Ollama, and LM Studio.
   - Tests fallback error handling for network timeouts, bad API keys, and invalid model identifiers.

---

## Complete CLI Command Reference

| Command | Category | Description | Token Cost |
|---|---|---|---|
| `vee init` | Setup | Scans repo stack, scaffolds `docs/memory/`, installs hooks, updates agent rules | 0 Tokens |
| `vee migrate` | Upgrade | Upgrades 0.3.x projects to 1.0.0, embeds baseline hashes, renames ADRs | 0 Tokens |
| `vee doctor` | Diagnostics | System health check (memory scaffold, .gitignore, active model, drift) | 0 Tokens |
| `vee watch [--daemon]` | Ambient | File watcher that captures diffs into proposal queue (supports background daemon) | Low (~1-2k per diff) |
| `vee review` | Review | Interactive review queue for inspection of pending memory deltas | 0 Tokens |
| `vee accept <id>` | Review | Applies accepted proposal delta into `docs/memory/` with snapshot | 0 Tokens |
| `vee reject <id>` | Review | Dismisses a proposal from the queue | 0 Tokens |
| `vee proposals` | Review | Lists all pending or reviewed proposals (`--json` supported) | 0 Tokens |
| `vee status [--check]` | Status | Overview of milestones, tasks, drift, and proposals (exit 1 on drift with `--check`) | 0 Tokens |
| `vee context [query]` | Context | Assembles token-budgeted prompt context (`--format json\|xml\|markdown`) | 0 Tokens |
| `vee sync [--accept <id> \| --accept all]` | Drift | Verifies drift against ADR frontmatter (`--accept all` updates baselines) | 0 Tokens |
| `vee undo [steps]` | Recovery | Restores `docs/memory/` to a previous state from pre-apply snapshots | 0 Tokens |
| `vee export` | Portability | Exports full memory layer to JSON or Markdown bundle | 0 Tokens |
| `vee import <file>` | Portability | Imports and verifies memory bundle into `docs/memory/` | 0 Tokens |
| `vee mcp [--root <dir>]` | MCP | Runs the Model Context Protocol stdio server (accepts optional repository `--root`) | 0 Tokens |
| `vee mcp install` | MCP | Configures MCP server in Cursor, Claude Desktop, Claude Code, VS Code, or Gemini | 0 Tokens |
| `vee hooks` | Automation | Manages Git hooks (`install`, `uninstall`, `status`) | 0 Tokens |
| `vee rules` | Automation | Manages agent rule marker blocks (`update`, `uninstall`, `status`) | 0 Tokens |
| `vee ci init` | CI/CD | Generates GitHub Action workflow (`.github/workflows/veeshree.yml`) | 0 Tokens |
| `vee decisions` | ADRs | Lists, creates, shows, links, or supersedes architectural decision records | 0 Tokens |
| `vee keys` | Security | Manages API keys in global keystore (`list`, `set`, `remove`) | 0 Tokens |
| `vee models` | Discovery | Probes local runtimes and configures extractor models (`use`, `pull`) | 0 Tokens |
| `vee config` | Config | Gets or sets configuration properties (`list`, `get`, `set`) | 0 Tokens |
| `vee gc` | Maintenance | Prunes completed tasks and archives progress snapshots | 0 Tokens |

---

## Model Context Protocol (MCP) Tools

When connected via MCP (`vee mcp`), AI assistants have access to 8 dedicated tools and 3 resources:

| MCP Tool | Purpose | Permissions |
|---|---|---|
| `get_context(task, max_tokens)` | Token-budgeted context with live stale warnings | Read-only |
| `search_memory(query)` | BM25 search across ADRs, tasks, constraints | Read-only |
| `get_decision(id)` | Retrieves full ADR with supersede history | Read-only |
| `list_decisions(status)` | Catalogs active, proposed, or superseded ADRs | Read-only |
| `check_drift(id)` | Real-time code drift verification | Read-only |
| `propose_decision(...)` | Staged proposal for a new ADR | Proposal queue |
| `propose_constraint(rule, type)` | Staged proposal for an architectural constraint | High-risk proposal |
| `update_task(name, action)` | Staged proposal to add, complete, or remove tasks | Proposal queue |

**Resources exposed:**
- `memory://constraints` (Hard architectural constraints)
- `memory://state` (Current milestone and rolling progress)
- `memory://decisions/{id}` (Specific decision records)

---

## Token Budget Pipeline

When injecting context into an AI model, Veeshree guarantees total output never exceeds `context.max_tokens` (default 2,000):

```
Priority Tier Allocation (~2,000 Token Cap):
----------------------------------------------------------------------
Tier 1: System Context & Rules Directives     ~150 tokens   [CRITICAL - NEVER TRUNCATED]
Tier 2: Hard Architectural Constraints        ~400 tokens   [PRIORITIZED, [pin] PRESERVED]
Tier 3: Current Project State & Milestones    ~450 tokens   [HIGH PRIORITY]
Tier 4: Active Roadmap Tasks (Optional)       ~200 tokens   [HIGH PRIORITY]
Tier 5: Relevant Decisions (BM25 Search)      ~800 tokens   [BUDGETED WITH REMAINING SPACE]
----------------------------------------------------------------------
Total Context Output:                        <= 2,000 tokens
```

---

## Architecture Comparison

| Capability | Raw Chat Logs | Vector Memory (Mem0, etc.) | Veeshree 1.0.0 (`vee`) |
|---|---|---|---|
| **Model Independence** | Tied to specific chat session | Requires remote cloud API | Yes (100% Model Agnostic) |
| **Human Verifiability** | Hidden in proprietary UI | Opaque binary vector embeddings | Yes (Git-Native Markdown Files) |
| **Architectural Rationale** | Lost during context compaction | Unstructured fact snippets | Yes (Structured ADRs & Rejected Alternatives) |
| **Code Drift Detection** | None | None | Yes (Committed SHA-256 Frontmatter Baselines) |
| **Safety & Review Queue** | None | Auto-writes without consent | Yes (Safe by default review queue) |
| **Token Budget Discipline**| Bloated (50k+ tokens) | Variable retrieval window | Yes (Strict per-tier token budgets) |
| **Data Privacy & Redaction**| Unredacted | Sent to cloud API | Yes (Automated local secret redaction & denylist) |
| **MCP Integration** | Variable | Custom | Official MCP SDK stdio server |
| **Installation Friction** | N/A | Requires Python, C++ builds, or DBs | Pure JavaScript / Zero Native Dependencies |

---

## License

MIT © 2026 Veeshree