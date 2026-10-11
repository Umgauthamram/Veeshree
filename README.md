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

- **100% Model Agnostic**: Work across Claude, Gemini, OpenAI, and local Ollama / LM Studio models without vendor lock-in.
- **Git-Native Markdown**: All memory lives in `docs/memory/` and is reviewed and audited via regular Git Pull Requests.
- **Zero-Token Scaffolding**: Heuristic scanner analyzes frameworks, database schemas (Prisma, SQLAlchemy, Drizzle), and Git history without spending any LLM tokens.
- **Global Keystore (Zero Key Leakage)**: API keys are stored in your machine user directory (`~/.veeshree/credentials.json`), preventing accidental Git commits or repository leaks.
- **SHA-256 Code Drift Guard**: Cryptographically tracks source code files linked to Architectural Decision Records (ADRs) and alerts agents when code changes without memory updates.
- **Strict Token Budgeting**: Enforces a strict ~2,000 token maximum ceiling per prompt injection, ensuring critical constraints are never truncated.
- **Pure JavaScript / Zero Native Dependencies**: Fast in-memory BM25 indexing (`minisearch`) serialized to `.vee/index.json`. Instant install on macOS, Linux, and Windows.

---

## Installation

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

## Quickstart

### 1. Initialize your repository
```bash
vee init
```
Scaffolds `docs/memory/` with pre-populated templates, protects local config in `.gitignore`, and generates instruction files for Google Antigravity (`GEMINI.md`, `.agents/rules/veeshree.md`), Claude (`CLAUDE.md`), and Cursor (`.cursorrules`). *(Token cost: 0)*

### 2. Configure your AI model credentials
```bash
# Store securely in global machine keystore (~/.veeshree/credentials.json)
vee keys set <provider> <YOUR_API_KEY>

# Supported providers:
# - gemini : Google Gemini (gemini-2.0-flash, gemini-1.5-flash)
# - groq   : Groq LPU Cloud (llama-3.3-70b-versatile, ultra-fast)
# - nvidia : NVIDIA NIM (meta/llama-3.1-70b-instruct)
# - openai : OpenAI (gpt-4o-mini, gpt-4o)

# Examples:
vee keys set gemini AIzaSy...
vee keys set groq gsk_...
vee keys set nvidia nvapi-...
vee keys set openai sk-...
```
Keys are stored in your user profile directory by default, ensuring they are accessible across all local projects without ever being checked into Git or exposed to GitHub.

### 3. Start ambient memory extraction
```bash
vee watch
```
Runs quietly in a secondary terminal tab or background daemon. Debounces your edits, captures git diffs, extracts architectural decisions, and updates task lists automatically.

### 4. Run system health & security diagnostics
```bash
vee doctor
```
Verifies memory scaffold integrity, validates `.gitignore` secret protections, confirms active model connectivity, and checks for code drift.

### 5. Generate token-budgeted prompt context
```bash
vee context "Implement rate limiter middleware"
```
Assembles a priority-ranked prompt payload capped at ~2,000 tokens with system rules, active constraints, milestone snapshots, and relevant BM25-ranked ADRs.

---

## Security & Keystore Architecture

Veeshree employs a multi-tiered security hierarchy to eliminate API key exposure:

1. **Global Machine Keystore (Default)**:
   Running `vee keys set <provider> <key>` saves credentials to `~/.veeshree/credentials.json` (outside the repository). No keys ever touch project folders.
2. **Automated `.gitignore` Protection**:
   `vee init` automatically verifies and appends `/.vee/config.json` and `/.vee/index.json` to `.gitignore`.
3. **Environment & Local `.env` Support**:
   Veeshree resolves keys in the following priority:
   - System environment (`GEMINI_API_KEY`, `GROQ_API_KEY`, `NVIDIA_API_KEY`, `OPENAI_API_KEY`)
   - Project `.env` file
   - Local `.vee/config.json` (project-specific override if set with `--local`)
   - Global keystore (`~/.veeshree/credentials.json`)

### Key Management Commands
```bash
# Set key globally (default)
vee keys set gemini AIzaSy...

# Update existing key
vee keys update gemini AIzaSy...

# Set key locally in project only
vee keys set gemini AIzaSy... --local

# List all providers and credential sources
vee keys list

# Remove a configured key
vee keys remove gemini
```

---

## Model Selection & Version Management

Veeshree allows you to select, configure, and pull model versions directly from the terminal:

```bash
# Probe active LLM engines (Ollama, LM Studio, Gemini, OpenAI, Claude)
vee models

# Set default extraction model version
vee models use gemini gemini-2.0-flash
vee models use openai gpt-4o-mini
vee models use ollama llama3.2

# Download or update a local Ollama model
vee models pull llama3.2
vee models pull qwen2.5-coder
```

---

## Complete CLI Command Reference

| Command | Category | Description | Token Cost |
|---|---|---|---|
| `vee init` | Scaffolding | Scans repo stack, scaffolds `docs/memory/`, updates `.gitignore`, creates IDE rules | 0 Tokens |
| `vee doctor` | Diagnostics | Validates memory health, `.gitignore` security, and AI engine connectivity | 0 Tokens |
| `vee watch` | Ambient Engine | Starts background file watcher for automatic diff extraction | Low (~1-2k per diff) |
| `vee status` | Dashboard | Live terminal overview of milestones, tasks, models, and drift | 0 Tokens |
| `vee context [query]` | Context Injection | Assembles strict ~2,000 token prompt payload with BM25 ADRs | 0 Tokens |
| `vee sync` | Indexing | Recalculates source file SHA-256 hashes and updates search index | 0 Tokens |
| `vee capture` | AI Extraction | Parses git diffs or conversation transcripts into ADRs and tasks | Low (~1-2k Tokens) |
| `vee models` | Discovery | Probes local Ollama / LM Studio ports and cloud API credentials | 0 Tokens |
| `vee models use <p> <m>` | Model Config | Sets active extraction model version (e.g., gemini-2.0-flash) | 0 Tokens |
| `vee models pull <m>` | Local Engine | Pulls/updates model weights using local Ollama | 0 Tokens |
| `vee keys list` | Security | Lists configured AI model providers with masked keys and sources | 0 Tokens |
| `vee keys set <p> <key>` | Security | Stores an API key in machine keystore (or `--local` for project) | 0 Tokens |
| `vee keys update <p> <key>` | Security | Updates an existing API key | 0 Tokens |
| `vee keys remove <p>` | Security | Removes a stored API key | 0 Tokens |
| `vee search <query>` | Search | Fast BM25 keyword and phrase search across all memory files | 0 Tokens |
| `vee decisions` | Inspection | Lists all Architectural Decision Records with status and tags | 0 Tokens |
| `vee gc` | Pruning | Prunes completed tasks and archives superseded ADRs | 0 Tokens |

---

## Repository Memory Structure

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
│   ├── config.json                  <-- Project settings
│   └── index.json                   <-- Fast search index & SHA-256 code hashes
└── .agents/rules/veeshree.md        <-- Native IDE assistant instruction file
```

---

## Token Budget Allocation Pipeline

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

## SHA-256 Code Drift Detection

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

## Architecture Comparison

| Capability | Raw Chat Logs | Vector Memory (Mem0, etc.) | Veeshree (`vee`) |
|---|---|---|---|
| **Model Independence** | Tied to specific chat session | Requires remote cloud API | Yes (100% Model Agnostic) |
| **Human Verifiability** | Hidden in proprietary UI | Opaque binary vector embeddings | Yes (Git-Native Markdown Files) |
| **Architectural Rationale** | Lost during context compaction | Unstructured fact snippets | Yes (Structured ADRs & Rejected Alternatives) |
| **Code Drift Detection** | None | None | Yes (Cryptographic SHA-256 Hash Guard) |
| **Token Budget Control** | Bloated (50k+ tokens) | Variable retrieval window | Yes (Strict ~2,000 Token Cap) |
| **Secret Protection** | N/A | Variable | Yes (Global Keystore + Auto-Gitignore) |
| **Installation Friction** | N/A | Requires Python, C++ builds, or DBs | Pure JavaScript / Zero Native Dependencies |

---

## Supported Model Providers & Engines

- **Cloud APIs**: Google Gemini (`gemini-2.0-flash`, `gemini-1.5-flash`, `gemini-1.5-pro`), Groq (`llama-3.3-70b-versatile`, `llama-3.1-8b-instant`), NVIDIA (`meta/llama-3.1-70b-instruct`, `meta/llama-3.1-8b-instruct`), OpenAI (`gpt-4o-mini`, `gpt-4o`, `o3-mini`).
- **Local Zero-Cost Engines**: Ollama (`http://localhost:11434`, e.g. `llama3.2`, `qwen2.5-coder`), LM Studio (`http://localhost:1234`).

---

## License

MIT © 2026 Veeshree