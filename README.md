# Veeshree (`vee`)

> **Local-first, model-independent context persistence layer for multi-model AI software development.**

Decouple your project memory, architectural decisions, and constraints from ephemeral AI chat sessions. Veeshree stores structural memory as version-controlled Markdown in `/docs/memory/` and indexes it for rapid, token-budgeted prompt injection.

---

## ⚡ Features

- 🧠 **Model-Independent Memory**: Treat AI models (Claude 3.5 Sonnet, GPT-4o, Gemini 2.0, Ollama) as temporary workers while keeping project knowledge permanent.
- 📁 **Git-Native Markdown**: Decisions, constraints, and tasks live in `/docs/memory/` — verifiable in standard Pull Request reviews.
- ⚡ **Zero-Token Cold Start**: Analyzes frameworks, database models (Prisma, SQLAlchemy), API routes, and Git history without spending LLM tokens.
- 🛡️ **SHA-256 Code Drift Detection**: Automated hooks verify linked source files and alert AI agents when code changes without memory updates.
- 🎯 **Strict Token Budgeting**: Packs ~2,000 max tokens prioritizing rules, constraints, active state, and BM25 matched decisions.
- 🚀 **Zero Native C++ Dependencies**: Pure JavaScript in-memory indexing (`minisearch`) for instant, cross-platform installation.

---

## 📦 Installation

Install globally via npm:

```bash
npm install -g veeshree
```

Or run directly with npx:

```bash
npx veeshree init
```

---

## 🚀 Quickstart Workflow

### 1. Initialize your project
```bash
vee init
```
Automatically scaffolds `/docs/memory/` and registers Git pre-commit & post-checkout hooks.

### 2. Generate prompt context before coding with AI
```bash
vee context "Implement rate limiter middleware"
```
Or simply run `vee context` to auto-detect your current branch and active focus!

### 3. Check project health & task progress
```bash
vee status
```

### 4. Capture memory updates after an AI coding session
```bash
git diff | vee capture
```

### 5. Search architectural decisions
```bash
vee search "database"
```

---

## 🛠️ Complete CLI Command Reference

| Command | Category | Purpose | Token Impact |
|---|---|---|---|
| `vee init` | Lifecycle | Bootstraps project memory, heuristic scanner, & Git hooks | 0 Tokens |
| `vee context [request]` | Core Engine | Generates ~2,000 token budget prompt payload | 0 Tokens |
| `vee sync` | Maintenance | Re-indexes memory & recalculates code SHA-256 hashes | 0 Tokens |
| `vee capture` | AI Extractor | Parses logs/diffs to update `/docs/memory/` records | Low (~2k Tokens) |
| `vee keys` | Auth | Securely store/manage provider API keys locally | 0 Tokens |
| `vee models` | Inspection | Probes local LLMs (Ollama, LM Studio) & cloud keys | 0 Tokens |
| `vee status` | Inspection | Displays task progress dashboard & drift alerts | 0 Tokens |
| `vee search <query>` | Inspection | Searches indexed ADRs and constraints with scoring | 0 Tokens |
| `vee decisions` | Inspection | Lists all ADR records with active/superseded status | 0 Tokens |
| `vee gc` | Maintenance | Archives completed tasks and superseded decisions | 0 Tokens |

---

## 📂 Repository Memory Structure

```plaintext
my-project/
├── docs/
│   └── memory/                      <-- Version-controlled human-readable memory
│       ├── decisions/               <-- Architectural Decision Records (ADRs)
│       │   ├── database.md
│       │   └── caching.md
│       ├── current-state.md         <-- Active feature & rolling milestone snapshot
│       ├── tasks.md                 <-- Pending and completed task lists
│       ├── constraints.md           <-- Locked architectural & security rules
│       ├── discoveries.md           <-- System behaviors & technical findings
│       ├── rejected.md              <-- Discarded alternatives & trade-offs
│       └── archive/                 <-- Pruned historical records
├── .vee/                            <-- Local search index & config (git ignored)
└── .git/hooks/                      <-- Automated Git synchronization
```

---

## 📄 License

MIT © 2026 Veeshree