# Veeshree (`vee`)

<p align="center">
  <strong>Local-first, model-independent context persistence layer for AI software engineering.</strong>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/veeshree"><img src="https://img.shields.io/npm/v/veeshree.svg?color=160f0c&label=npm%20package" alt="npm version" /></a>
  <a href="https://www.npmjs.com/package/veeshree"><img src="https://img.shields.io/npm/dm/veeshree.svg?color=160f0c" alt="npm downloads" /></a>
  <a href="#license"><img src="https://img.shields.io/badge/license-MIT-160f0c.svg" alt="License" /></a>
  <img src="https://img.shields.io/badge/node-%3E%3D18.0.0-160f0c.svg" alt="Node version" />
  <img src="https://img.shields.io/badge/native%20dependencies-0-160f0c.svg" alt="Zero native dependencies" />
</p>

---

## ✱ Overview

**Veeshree** decouples architectural decisions, hard constraints, and task progress from temporary AI chat sessions and saves them as human-readable, version-controlled Markdown directly in `docs/memory/`.

Modern software teams constantly switch between AI models (Claude 3.7 Sonnet, Gemini 2.5 Flash, GPT-4o, and local Ollama instances) and platforms (Google Antigravity, Cursor, Claude Code, Copilot). However, chat histories are ephemeral: once token limits compact or a new session starts, critical knowledge, such as why a library was rejected or which security boundaries must never be crossed is forgotten.

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

## ⚡ Key Highlights

- 🧠 **100% Model Agnostic**: Work across Claude, Gemini, OpenAI, and local Ollama/LM Studio models without vendor lock-in.
- 📁 **Git-Native Markdown**: All memory lives in `docs/memory/` and is reviewed and audited via regular Git Pull Requests.
- ⚡ **Zero-Token Scaffolding**: Heuristic scanner analyzes frameworks, database schemas (Prisma, SQLAlchemy, Drizzle), and Git history without spending any LLM tokens.
- 🛡️ **SHA-256 Code Drift Guard**: Cryptographically tracks source code files linked to Architectural Decision Records (ADRs) and alerts agents when code changes without memory updates.
- 🎯 **Strict Token Budgeting**: Enforces a strict ~2,000 token maximum ceiling per prompt injection, ensuring critical constraints are never truncated.
- 🚀 **Pure JavaScript / Zero Native C++**: Fast in-memory BM25 indexing (`minisearch`) serialized to `.vee/index.json`. Instant install on macOS, Linux, and Windows.

---

## 📦 Installation

Install globally or per-project via npm:

```bash
# Per-project (recommended)
npm install veeshree

# Global CLI
npm install -g veeshree
```

Or execute instantly using `npx`:

```bash
npx veeshree init
```

---

## 🚀 3-Minute Quickstart

### 1. Initialize your repository
```bash
vee init
```
Scaffolds `docs/memory/` with pre-populated templates and generates instruction files for Google Antigravity (`GEMINI.md`, `.agents/rules/veeshree.md`), Claude (`CLAUDE.md`), and Cursor (`.cursorrules`). *(Cost: 0 LLM Tokens)*

### 2. Start ambient memory extraction
```bash
vee watch
```
Runs quietly in a secondary terminal. Debounces your edits, captures git diffs, extracts architectural decisions, and updates task lists automatically.

### 3. Generate token-budgeted prompt context
```bash
vee context "Implement rate limiter middleware"
```
Assembles a priority-ranked prompt payload capped at ~2,000 tokens with system rules, active constraints, milestone snapshot, and relevant BM25-ranked ADRs.

### 4. Check health & code drift
```bash
vee status
```
Displays a live dashboard of current milestones, task completion progress, active model engines, and SHA-256 code drift alerts.

---

## 💾 3 Ways to Save & Manage Data

Veeshree gives you complete freedom in how memory is captured and maintained:

| Mode | How it Works | Best For | Model Key Needed? |
|---|---|---|---|
| **Mode 1: Ambient Watcher** (`vee watch`) | Runs in the background, debounces file saves, parses diffs, and writes ADRs automatically. | Developers who want zero-touch automated memory persistence. | Optional (Local Ollama is 100% free) |
| **Mode 2: Native IDE Rules** | Instructions in `GEMINI.md`, `CLAUDE.md`, and `.cursorrules` instruct the IDE's assistant to read and update `docs/memory/` directly. | Engineers using Antigravity, Cursor, or Claude Code with built-in model subscriptions. | None (uses IDE assistant) |
| **Mode 3: Manual CLI Pipeline** | Explicit commands (`vee context`, `git diff \| vee capture`, `vee sync`) for terminal workflows and scripts. | Scripting, custom shell aliases, git hooks, and CI/CD pipelines. | Optional |

---

## 🛠️ Complete CLI Command Reference

| Command | Category | Description | Token Cost |
|---|---|---|---|
| [`vee init`](#vee-init) | Scaffolding | Scans repo stack, scaffolds `docs/memory/`, creates IDE rule files | 0 Tokens |
| [`vee watch`](#vee-watch) | Ambient Engine | Starts background file watcher for automatic diff extraction | Low (~1-2k per diff) |
| [`vee status`](#vee-status) | Dashboard | Live terminal overview of milestones, tasks, models, and drift | 0 Tokens |
| [`vee context [query]`](#vee-context) | Context Injection | Assembles strict ~2,000 token prompt payload with BM25 ADRs | 0 Tokens |
| [`vee sync`](#vee-sync) | Indexing | Recalculates source file SHA-256 hashes and updates search index | 0 Tokens |
| [`vee capture`](#vee-capture) | AI Extraction | Parses git diffs or conversation transcripts into ADRs and tasks | Low (~1-2k Tokens) |
| [`vee models`](#vee-models) | Discovery | Probes local Ollama / LM Studio ports and cloud API credentials | 0 Tokens |
| [`vee keys`](#vee-keys) | Security | Securely stores and masks API keys in `.vee/config.json` | 0 Tokens |
| [`vee search <query>`](#vee-search) | Search | Fast BM25 keyword and phrase search across all memory files | 0 Tokens |
| [`vee decisions`](#vee-decisions) | Inspection | Lists all Architectural Decision Records with status and tags | 0 Tokens |
| [`vee gc`](#vee-gc) | Pruning | Prunes completed tasks and archives superseded ADRs | 0 Tokens |

---

## 📂 Repository Memory Structure

```plaintext
your-codebase/
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
└── .agents/rules/veeshree.md        <-- Native IDE assistant instruction file
```

---

## 🎯 Token Budget Allocation Pipeline

When injecting context into an AI model, Veeshree enforces an uncompromising **~2,000 token maximum ceiling** organized into strict priority tiers:

```
Priority Tier Allocation (~2,000 Token Cap):
----------------------------------------------------------------------
Tier 1: System Context & Rules Directives     ~300 tokens   [CRITICAL - NEVER TRUNCATED]
Tier 2: Hard Architectural Constraints        ~200 tokens   [CRITICAL - NEVER TRUNCATED]
Tier 3: Current Project State & Milestones    ~400 tokens   [HIGH PRIORITY]
Tier 4: Top Matching Decisions (BM25)         ~1,100 tokens [DYNAMICALLY ALLOCATED]
----------------------------------------------------------------------
Total Context Payload:                       <= 2,000 tokens
```

---

## 🛡️ SHA-256 Code Drift Detection

Every Architectural Decision Record (ADR) tracks the exact SHA-256 checksums of the source files it governs. If code is modified out-of-band without an ADR update, Veeshree detects the drift:

```bash
! DRIFT DETECTED: docs/memory/decisions/auth.md
Linked file 'src/auth/jwt.ts' hash mismatch:
  Recorded SHA-256 : a8f32c91b58...
  Current SHA-256  : e7b10492c81...
Warning: The implementation has diverged from documented architectural design.
To reconcile: run 'vee capture --diff' or 'vee sync'
```

---

## 📊 Comparison: Why Veeshree?

| Capability | Raw Chat Logs | Vector Memory (Mem0, etc.) | Veeshree (`vee`) |
|---|---|---|---|
| **Model Independence** | ❌ Tied to specific chat session | ⚠️ Requires remote cloud API | **✓ 100% Model Agnostic** |
| **Human Verifiability** | ❌ Hidden in proprietary UI | ❌ Opaque binary vector embeddings | **✓ Git-Native Markdown Files** |
| **Architectural Rationale** | ⚠️ Lost during context compaction | ❌ Unstructured fact snippets | **✓ Structured ADRs & Rejected Alternatives** |
| **Code Drift Detection** | ❌ None | ❌ None | **✓ Cryptographic SHA-256 Hash Guard** |
| **Token Budget Control** | ❌ Bloated (50k+ tokens) | ⚠️ Variable retrieval window | **✓ Strict ~2,000 Token Cap** |
| **Installation Friction** | N/A | Requires Python, C++ builds, or DBs | **✓ Pure JavaScript / Zero Native C++** |

---

## 🤖 Supported Model Providers & Local Engines

- **Cloud APIs**: Google Gemini (`gemini-2.5-flash`, `gemini-1.5-pro`), OpenAI (`gpt-4o`, `gpt-4o-mini`), Anthropic (`claude-3-5-sonnet`).
- **Local Zero-Cost Engines**: Ollama (`http://localhost:11434`, e.g. `llama3.2`, `qwen2.5-coder`), LM Studio (`http://localhost:1234`).

Configure keys locally with:
```bash
vee keys set gemini AIzaSy...
vee keys set openai sk-...
vee keys list
```

---

## 📄 License

MIT © 2026 Veeshree