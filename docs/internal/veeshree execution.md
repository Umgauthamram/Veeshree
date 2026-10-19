# Veeshree (`vee`) — Development Execution Blueprint

## Phase 1: Foundation & Cold Start Engine (`vee init`)

### 1.1 CLI Scaffolding & Argument Parsing
* **[READ / INPUT]** Read command-line arguments and flags passed via `commander` (`process.argv`). Read execution environment details (`process.cwd()`, `process.env`).
* **[PROCESS / LOGIC]** Validate command syntax, verify Node.js runtime compatibility (v18.0.0+), and route execution to the appropriate module.
* **[WRITE / OUTPUT]** Output formatted help menus and initial terminal status using `picocolors`.

### 1.2 Local Heuristic Scanner (Zero-Token Ingestion)
* **[READ / INPUT]** 
  * Read `package.json`, `requirements.txt`, or `go.mod` in the current directory.
  * Read infrastructure configurations (`docker-compose.yml`, `schema.prisma`, `.env.example`).
  * Read the last 5 commit messages via child process execution (`git log -5 --pretty=format:"%s"`).
* **[PROCESS / LOGIC]** Parse JSON/YAML/Prisma text streams to identify dependencies (e.g., Next.js, Express, PostgreSQL, Redis) and summarize recent developer activity.
* **[WRITE / OUTPUT]** Generate initial data structs containing the detected stack and feature targets.

### 1.3 Directory & Config Generation
* **[READ / INPUT]** Read global fallback configuration if present (`~/.veeshree/config.json`).
* **[PROCESS / LOGIC]** Merge default system preferences with user overrides.
* **[WRITE / OUTPUT]** 
  * Create `/docs/memory/decisions/` and `/docs/memory/archive/` directory trees.
  * Write `/.vee/config.json` containing default provider settings and max token limits.
  * Write the bootstrapped `/docs/memory/current-state.md` file using metadata from the heuristic scanner.
  * Create placeholder decision files (e.g., `decisions/database.md`) seeded with `[Pending AI Observation]`.

---

## Phase 2: Indexing, Retrieval & Hash Integrity (`vee sync`, `vee context`)

### 2.1 File System Ingestion & Hash Parsing (`vee sync`)
* **[READ / INPUT]** 
  * Read all `.md` files under `/docs/memory/` and parse Frontmatter YAML headers and body text.
  * Read source code files referenced in the `linked_files` frontmatter array.
* **[PROCESS / LOGIC]** 
  * Compute SHA-256 hashes of the target source code files using Node's native `crypto` module.
  * Compare computed hashes against previously stored values in `index.json`. Set `stale: true` for any records where code changed without a corresponding memory update.
* **[WRITE / OUTPUT]** Serialize the updated `minisearch` index, document tags, and calculated file hashes into `/.vee/index.json`.

### 2.2 Token Budgeting & Context Assembly (`vee context`)
* **[READ / INPUT]** Read `/docs/memory/constraints.md`, `/docs/memory/current-state.md`, and query `/.vee/index.json` using search terms derived from the user request.
* **[PROCESS / LOGIC]** 
  * Calculate character-to-token estimates for all retrieved files.
  * Reserve mandatory allocations (~300 tokens for system rules, ~200 tokens for hard constraints, ~400 tokens for current state).
  * Rank and truncate retrieved decision records to fit strictly within the 2,000-token limit.
* **[WRITE / OUTPUT]** Stream the assembled system prompt payload to `stdout` for integration with external agents or scripts.

### 2.3 Automated Git Hook Installation
* **[READ / INPUT]** Inspect `.git/hooks/` path existence in the target repository.
* **[PROCESS / LOGIC]** Generate shell executable scripts calling `npx vee sync` and `npx vee status --check`.
* **[WRITE / OUTPUT]** Write executable hook scripts into `.git/hooks/post-checkout` and `.git/hooks/pre-commit`.

---

## Phase 3: AI Extraction & Background Processing (`vee capture`, `vee keys`)

### 3.1 Runtime & Key Management (`vee models`, `vee keys`)
* **[READ / INPUT]** 
  * Read `/.vee/config.json` for stored API keys.
  * Read system environment variables (`OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, etc.).
  * Issue local HTTP `GET` requests to default ports (`11434` for Ollama, `1234` for LM Studio) to check active local LLM engines.
* **[PROCESS / LOGIC]** Evaluate key validity, mask key strings for security display, and select the default active extractor model.
* **[WRITE / OUTPUT]** Save updated key sets to `/.vee/config.json` or display formatted engine availability to the terminal.

### 3.2 Chat Log Ingestion & Schema Reconciliation (`vee capture`)
* **[READ / INPUT]** 
  * Read raw conversation logs or Git diff streams passed via file path (`--file`) or standard input (`stdin`).
  * Read active `tasks.md` and decision records to provide baseline state context to the extractor.
* **[PROCESS / LOGIC]** 
  * Invoke Vercel AI SDK's `generateObject` with the Zod extraction schema to parse conversation deltas into structured JSON arrays (`decisions`, `tasks`, `constraints`, `rejected_approaches`).
  * Reconcile extracted actions against existing files (e.g., mark task checkmarks as complete, format new ADR Markdown headers).
* **[WRITE / OUTPUT]** 
  * Update checkbox states in `/docs/memory/tasks.md`.
  * Append entries to `/docs/memory/rejected.md` and `/docs/memory/discoveries.md`.
  * Write new Architectural Decision Records into `/docs/memory/decisions/`.

---

## Phase 4: State Management & Developer Interface (`vee status`, `vee gc`)

### 4.1 State Garbage Collection & Archiving (`vee gc`)
* **[READ / INPUT]** 
  * Read `/docs/memory/current-state.md` and count completed task entries.
  * Read frontmatter `status` attributes across all files in `/docs/memory/decisions/`.
* **[PROCESS / LOGIC]** 
  * Slice progress items exceeding the rolling buffer limit (maximum 5 items).
  * Filter decision files tagged with `status: superseded`.
* **[WRITE / OUTPUT]** 
  * Move sliced completed tasks to `/docs/memory/archive/completed-tasks.md`.
  * Relocate superseded decision files to `/docs/memory/archive/decisions/`.
  * Re-index `/.vee/index.json` to purge archived records from active prompt retrieval.

### 4.2 Terminal Dashboard & Search Interface (`vee status`, `vee search`)
* **[READ / INPUT]** Read `/.vee/index.json`, `/docs/memory/tasks.md`, and system metadata.
* **[PROCESS / LOGIC]** Aggregate task completion ratios, count active decisions, list stale hash flags, or run keyword queries through `minisearch`.
* **[WRITE / OUTPUT]** Render formatted console dashboards displaying project memory health, task status, or search query results.