# Veeshree (`vee`)

<p align="center">
  <strong>Local-first, model-independent architectural context persistence layer for AI software engineering.</strong>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/veeshree"><img src="https://img.shields.io/npm/v/veeshree.svg?color=160f0c&label=npm%20package" alt="npm version" /></a>
  <a href="https://www.npmjs.com/package/veeshree"><img src="https://img.shields.io/npm/dm/veeshree.svg?color=160f0c" alt="npm downloads" /></a>
  <a href="#license"><img src="https://img.shields.io/badge/license-MIT-160f0c.svg" alt="License" /></a>
  <img src="https://img.shields.io/badge/node-%3E%3D20.0.0-160f0c.svg" alt="Node version" />
  <img src="https://img.shields.io/badge/native%20dependencies-0-160f0c.svg" alt="Zero native dependencies" />
  <img src="https://img.shields.io/badge/mcp-server%20ready-160f0c.svg" alt="MCP Server Ready" />
</p>

---

## Overview

**Veeshree** decouples architectural decisions, hard constraints, and task progress from temporary AI chat sessions and persists them as human-readable, version-controlled Markdown directly in `docs/memory/`.

Modern software teams switch between AI models (Claude 3.7 Sonnet, Gemini 2.0 Flash, GPT-4o, and local Ollama instances) and platforms (Google Antigravity, Cursor, Claude Code, GitHub Copilot). However, chat histories are ephemeral: once token limits compact or a new session starts, critical knowledge—such as why a library was rejected or which security boundaries must never be crossed—is forgotten.

Veeshree treats AI models as interchangeable temporary workers while making project knowledge persistent, verifiable, and deterministic.

```
┌─────────────────┐       ┌────────────────────────┐       ┌─────────────────┐
│  AI Model A     │       │    Veeshree Memory     │       │  AI Model B     │
│  (e.g., Claude) │ ────> │     (docs/memory/)     │ ────> │  (e.g., Gemini) │
└─────────────────┘       └────────────────────────┘       └─────────────────┘
  Generates code &           Persists decisions,             Reads active state &
  architectural rules        rationale, & constraints        continues seamlessly
```

---

## Key Highlights

- **100% Model Agnostic**: Native extractors for Anthropic Claude, Google Gemini, OpenAI (with custom `base_url`), Groq, NVIDIA, and local offline Ollama / LM Studio.
- **Safe by Default**: Extraction review queue is enabled out of the box. High-risk rules (constraints, instruction overrides, superseding ADRs) require human review before applying.
- **Official MCP Server (`vee mcp`)**: Full Model Context Protocol stdio server with tools (`get_context`, `search_memory`, `get_decision`, `list_decisions`, `check_drift`, `propose_decision`, `propose_constraint`, `update_task`) and client installers for Claude, Cursor, VS Code, and Gemini.
- **Cryptographic Code Drift Guard**: Baselines are committed directly into ADR frontmatter (`linked_files: [{ path, sha256 }]`). A fresh clone in CI reliably detects drift from committed source files without depending on gitignored caches.
- **Automated Git Hooks & Agent Rules**: Idempotent marker blocks for `pre-commit`, `post-checkout`, and `post-merge` hooks, plus automated rule generation for Cursor (`.cursorrules`), Claude (`CLAUDE.md`), Gemini (`GEMINI.md`), Antigravity, `AGENTS.md`, and GitHub Copilot.
- **Automatic Secret Redaction & Denylist**: Pattern-matched redaction for API keys, private keys, JWTs, and sensitive files (`.env*`, `.pem`, `.key`, `id_rsa*`, lockfiles, binaries) before diffs leave the machine.
- **Strict Multi-Tier Token Budgeting**: Enforces strict per-tier token allocations (constraints default to 400 tokens with `[pin]` preservation, current state 450 tokens, decisions 800 tokens) with overflow notices.
- **Atomic Operations & Snapshots**: Every memory modification uses temp-and-rename atomic writes and process locking (`.vee/lock`). Pre-apply snapshots saved in `.vee/snapshots/` power `vee undo`.
- **Pure JavaScript / Zero Native Dependencies**: Fast in-memory BM25 indexing (`minisearch`). 100% pure TypeScript/JavaScript running anywhere Node >= 20.0.0 is installed.

---

## Installation

```bash
# Per-project (recommended)
npm install veeshree

# Global CLI
npm install -g veeshree
```

Or execute instantly via `npx`:

```bash
npx veeshree init
```

---

## Quickstart

### 1. Initialize your repository
```bash
vee init
```
Scaffolds `docs/memory/` with pre-populated templates, installs Git hooks (`pre-commit`, `post-checkout`, `post-merge`), protects `.vee/` in `.gitignore`, and generates agent instruction files. *(Token cost: 0)*

### 2. Configure credentials
```bash
# Global machine keystore (~/.veeshree/credentials.json)
vee keys set <provider> <YOUR_API_KEY>

# Supported providers:
# - anthropic : Anthropic Claude (claude-3-7-sonnet, claude-3-5-sonnet)
# - gemini    : Google Gemini (gemini-2.0-flash, gemini-1.5-flash)
# - openai    : OpenAI (gpt-4o, gpt-4o-mini, o3-mini) & custom base_url
# - groq      : Groq LPU Cloud (llama-3.3-70b-versatile)
# - nvidia    : NVIDIA NIM (meta/llama-3.1-70b-instruct)
# - ollama    : Local offline LLMs (llama3.2, qwen2.5-coder) - 100% free
```

### 3. Install MCP server in your AI coding tool
```bash
vee mcp install --client cursor
# or: claude | vscode | gemini
```

### 4. Review pending memory proposals
```bash
# View proposal queue
vee review

# Accept proposal
vee accept <proposal_id>

# Reject proposal
vee reject <proposal_id>
```

### 5. Check code drift & diagnostics
```bash
vee status --check
vee doctor
```

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
| `vee sync [--accept <id> \| --accept all \| --all]` | Drift | Verifies drift against ADR frontmatter (`--accept all` updates baselines) | 0 Tokens |
| `vee undo [steps]` | Recovery | Restores `docs/memory/` to a previous state from pre-apply snapshots | 0 Tokens |
| `vee export` | Portability | Exports full memory layer to JSON or Markdown bundle | 0 Tokens |
| `vee import <file>` | Portability | Imports and verifies memory bundle into `docs/memory/` | 0 Tokens |
| `vee mcp` | MCP | Runs the Model Context Protocol stdio server | 0 Tokens |
| `vee mcp install` | MCP | Configures MCP server in Cursor, Claude Desktop, VS Code, Gemini, or Claude Code | 0 Tokens |
| `vee hooks` | Automation | Manages Git hooks (`install`, `uninstall`, `status`) | 0 Tokens |
| `vee rules` | Automation | Manages agent rule marker blocks (`update`, `uninstall`, `status`) | 0 Tokens |
| `vee ci init` | CI/CD | Generates GitHub Action workflow (`.github/workflows/veeshree.yml`) | 0 Tokens |
| `vee decisions` | ADRs | Lists, creates, shows, links, or supersedes architectural decision records | 0 Tokens |
| `vee keys` | Security | Manages API keys in global keystore (`list`, `set`, `remove`) | 0 Tokens |
| `vee models` | Discovery | Probes local runtimes and configures extractor models (`use`, `pull`) | 0 Tokens |
| `vee config` | Config | Gets or sets configuration properties (`list`, `get`, `set`) | 0 Tokens |
| `vee gc` | Maintenance | Prunes completed tasks and archives progress snapshots | 0 Tokens |

### CLI Output Modes & Git Integration

- **Deterministic `--json` Mode**: Every command advertising `--json` outputs exactly one parseable JSON document on `stdout`. Diagnostic messages, warnings, and informational logs are redirected to `stderr`.
- **Intelligent Git Hooks**: Pre-commit and post-merge hooks resolve project-local binaries (`./node_modules/.bin/vee`) before searching `PATH`. If Veeshree is absent from the host machine or container, hooks exit cleanly (`exit 0`) without false drift alerts or blocking commits.
- **Redaction Guardrail**: Automated secret redaction and payload capping are local heuristic defenses. Redaction is best-effort and does not guarantee detection of arbitrary custom secret formats.

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

Inspect token allocations anytime:
```bash
vee context --explain
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