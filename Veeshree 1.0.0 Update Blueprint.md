# Veeshree 1.0.0: Full Update and Release Blueprint

Baseline: veeshree 0.3.1 | Target: 1.0.0 | Prepared: Oct 15, 2026 | Status: proposal, awaiting approval

## 1. Purpose and scope

This document defines every change needed to take Veeshree from the 0.3.1 prototype to a stable 1.0.0 release: fix all verified security issues and bugs, automate the manual workflow, add the missing features, clean the codebase, and publish to npm as 1.0.0. Each item states the problem, the change, the files affected, the tests, and a done condition, so it can be built phase by phase.

Out of scope for 1.0.0: vector or semantic search (needs a native dependency, planned for 1.1), a hosted cloud service, and an IDE extension.

## 2. Baseline findings being resolved

| ID | Finding | Phase |
| --- | --- | --- |
| SEC-1 | LLM output is written to constraints.md with no review (memory poisoning) | 1 |
| SEC-2 | Diffs and untracked files go to cloud LLMs with no redaction, size cap or consent | 1 |
| SEC-3 | credentials.json is mode 644; Gemini key is sent in the URL | 1 |
| SEC-4 | `ollama pull ${model}` runs through a shell (injection) | 1 |
| SEC-5 | Vulnerable or outdated dependencies (js-yaml via gray-matter, vitest chain) | 1, 5 |
| BUG-1 | Drift flag never clears; documented `sync` reset and `capture --diff` do not exist | 2 |
| BUG-2 | Drift baseline lives in gitignored index.json, so CI never detects drift; `status --check` reads a cache; `sync` always exits 0 | 2 |
| BUG-3 | `$&` and `$1` in LLM text corrupt memory files | 2 |
| BUG-4 | Same-slug ADR overwrites human-written ones; non-Latin titles create `.md` | 2 |
| BUG-5 | Progress is replaced, not appended; next-steps regex wipes the file tail | 2 |
| BUG-6 | `remove` task action ignored; substring dedupe; non-atomic writes | 2 |
| BUG-7 | Token cap not enforced (constraints are unbounded) | 2 |
| BUG-8 | Watcher self-triggers, resends the full diff every time, swallows errors, breaks on Linux with Node 18 | 2 |
| BUG-9 | Existing CLAUDE.md or .cursorrules are skipped; Ollama picks models\[0\] | 2, 3 |
| GAP-1 | No git hooks (planned in the original blueprint; `auto_sync_on_commit` is dead config) | 3 |
| GAP-2 | No MCP server | 4 |
| GAP-3 | No Anthropic provider or custom base URL | 4 |
| GAP-4 | No review queue, dry-run, undo or export | 4 |
| QUAL-1 | 24 `process.exit` calls, 31 `any`, 25 empty catches, dead config, hard-coded version | 5 |
| QUAL-2 | 17 happy-path tests; no CI, lint or coverage | 5 |
| REL-1 | Empty repo metadata; no CHANGELOG, SECURITY.md or provenance | 6 |

## 3. Decisions and principles

1. Safe by default. The review queue is on and cloud upload is off until the user opts in. Hands-free behavior is available with `--auto`.
2. Breaking changes are allowed at 1.0.0. `vee migrate` upgrades 0.3.x projects.
3. Node 20 or later (reliable recursive `fs.watch`, supported LTS).
4. No native dependencies. Zero native stays a promise.
5. Every fixed bug gets a regression test that reproduces the original failure.
6. 'No issues' means every quality gate in section 10 passes. It does not mean no bug can ever exist.
7. Vector search moves to 1.1.
8. Publishing to npm is done by the maintainer; section 6.5 lists the steps.

## 4. Target architecture

```
src/
  cli.ts                 only place that parses argv and calls process.exit
  commands/              thin handlers returning typed results
  core/
    memory/              markdown model, section editor, atomic writes, lock
    drift/               hashing, baselines, status
    context/             tier budgeting, estimator, explain
    proposals/           queue, risk scoring, accept/reject
    reconcile/           applies accepted deltas
    redact/              secret patterns, denylist, .veeignore
    hooks/               git hook install and status
    rules/               marker-block writers for agent rule files
    watch/               watcher, daemon, incremental diff state
    snapshots/           pre-apply backups for undo
  providers/             gemini, openai-compatible, anthropic, ollama, lmstudio
  mcp/                   server, tool schemas, client config writers
  schemas/               zod schemas for every file and input boundary
  utils/                 logger, errors, paths, process helpers
tests/                   unit, integration, e2e, regression
```

## Phase 1: Security

### 1.1 Proposal queue (SEC-1)

**Change.** Every writer (watch, capture, MCP) produces a Proposal saved to `.vee/proposals/<id>.json` with id, created\_at, source (watch, capture or mcp), agent, a validated delta, risk (low or high), flags and status (pending, accepted, rejected). The reconciler runs only on accept. Any constraint, any ADR that updates or supersedes another, and any delta matching suspicious patterns (shell piped to sh, unknown URLs, instruction-override phrases, requests to disable checks) is scored high risk. High-risk proposals always need a human, even with `--auto`. Accepted constraints record `source` and `accepted_by` metadata.

**Files.** New `core/proposals/`; change the call sites in watcher, capture and reconciler.

**Tests.** An injected `curl | sh` constraint becomes a pending high-risk proposal and never reaches constraints.md or `vee context` output.

**Done when.** No code path writes memory from LLM output without a proposal.

### 1.2 Redaction, size caps and cloud consent (SEC-2)

**Change.** New `core/redact/`. Denylist: `.env*`, `*.pem`, `*.key`, `id_rsa*`, lockfiles, binaries, anything matched by `.gitignore` or `.veeignore`. Pattern redaction for common key formats (OpenAI, Google, GitHub, AWS, Slack, JWT, private-key blocks) plus high-entropy values assigned to names like key, token or secret. Matches become `[REDACTED:type]`. Payload is capped by `privacy.max_payload_bytes` (default 24576), truncating by diff hunk. `privacy.allow_cloud` defaults to false: the first cloud call prompts in a TTY and fails with instructions in non-TTY. Local engines are unaffected. `--show-payload` prints exactly what would be sent.

**Tests.** Fixtures with fake secrets never appear in the outgoing payload; oversize diffs are truncated; cloud call without consent is refused.

### 1.3 Credentials (SEC-3)

**Change.** Write credentials.json with mode 0600 in a 0700 directory, using atomic temp-and-rename. Verify and repair permissions on every load. On Windows, warn and recommend environment variables. Send the Gemini key in the `x-goog-api-key` header, never the URL. `vee keys list` shows the source of each key and flags insecure storage. Project-local key storage prints a warning.

**Tests.** Mode is 600 after save; a loose file is repaired; no key appears in any logged URL.

### 1.4 Command execution (SEC-4)

**Change.** Replace every `execSync` with `execFileSync` or `spawn` using argument arrays. Validate model names against `^[A-Za-z0-9._:/-]+$`. This covers `models pull`, scanner git calls, doctor and watcher.

**Tests.** `vee models pull 'x; touch /tmp/pwn'` is rejected and nothing runs.

### 1.5 Dependencies (SEC-5)

**Change.** Replace gray-matter with the `yaml` package plus a small frontmatter splitter using a safe schema. Upgrade zod, commander, tsup, typescript and vitest to current majors and fix breaking changes. Enable Dependabot or Renovate and an audit step in CI.

**Done when.** `npm audit --omit=dev` reports 0, and the full audit reports no high or critical issues.

## Phase 2: Bug fixes

### 2.1 Drift model (BUG-1, BUG-2)

**Change.** Store baselines in ADR frontmatter, which is committed and shared:

```
linked_files:
  - path: src/auth/jwt.ts
    sha256: <hash>
```

Hash normalized content (LF line endings, BOM stripped). `.vee/index.json` becomes a pure cache. Statuses are ok, drifted and missing. `vee sync` is read-only and reports. `vee sync --accept <id|--all>` explicitly rewrites baselines. Accepting a proposal that touches an ADR refreshes its hashes. Reject absolute paths and `..` segments. Exit codes: 0 ok, 1 drift, 2 error. Both `sync` and `status --check` always re-hash live files and support `--json`.

**Tests.** Edit a linked file and see drifted; accept and see ok; delete the cache and still detect drift; CRLF-only change stays ok; fresh clone in CI detects drift.

### 2.2 Reconciler rewrite (BUG-3, BUG-4, BUG-5, BUG-6)

**Change.**

- Section-aware markdown editor: parse headings into a tree, edit named sections, serialize. No free-text regex substitution; any replacement uses function replacers so `$` sequences are literal.
- ADR files are numbered `NNNN-slug`, with fallback slug `decision` when the slug is empty. Never overwrite. Updating a decision creates a new ADR with `supersedes: <id>` and marks the old one `status: superseded` with `superseded_by`.
- Files written by Veeshree carry `generated_by: veeshree`; files without it are never modified without an explicit proposal.
- Progress items are prepended; the five-item cap is enforced by gc. Next steps replace only the content inside section 4.
- Tasks: add (normalized dedupe), complete (normalized match, otherwise add as completed), remove (implemented). Dedupe uses normalized exact lines, not substrings.
- Atomic temp-and-rename writes and a process lock at `.vee/lock` (O\_EXCL, stale after 60 seconds).
- A snapshot is taken before each apply, feeding `vee undo`.

**Tests.** Every reproduced failure becomes a test: `$&` task text, same-slug ADR, non-Latin title, progress append, tail preservation, remove action, concurrent writers.

### 2.3 Token budget (BUG-7)

**Change.** Per-tier caps come from config. Constraints default to 400 tokens, ordered by priority, with `[pin]` marking rules that always stay. Overflow drops the lowest-priority rules, prints a visible notice, and `vee doctor` warns. A final trim pass guarantees total output is at most `max_context_tokens`. The estimator is pluggable: default heuristic with a 10 percent safety margin. `vee context --explain` shows usage per tier.

**Tests.** 200 constraints still produce output within the cap and leave room for at least one decision.

### 2.4 Watcher (BUG-8)

**Change.** Ignore `docs/memory`, `.vee`, lockfiles, binaries and anything in `.gitignore` or `.veeignore`. Track the last processed diff fingerprint in `.vee/watch-state.json` and send only new hunks. Use recursive watch on Node 20 or later and fall back to polling `git status --porcelain` every 2 seconds where unsupported. Log errors to `.vee/logs/watch.log`; never fail silently. Single-flight with a queue, exponential backoff on API errors, and a ceiling of `watch.max_calls_per_hour`. Output goes to the proposal queue, or is auto-applied when low risk under `--auto`.

**Tests.** Writing to docs/memory does not retrigger; an unchanged diff is not resent; API failure backs off and logs.

### 2.5 Smaller fixes (BUG-9)

- Ollama model choice: use the configured model; otherwise filter out embedding models; otherwise prompt.
- Wire or remove dead config fields (`local_engine`, `auto_sync_on_commit`).
- Untracked-file capture covers more than ts, js, tsx, jsx and py, and respects redaction.

## Phase 3: Automation

### 3.1 Git hooks (GAP-1)

`vee hooks install|uninstall|status`. `vee init` installs them by default (asks in a TTY). Respect `core.hooksPath` and Husky. If a hook already exists, append a marked block instead of replacing it. Hooks: pre-commit runs `vee status --check --quiet` (blocks only if `hooks.block_on_drift` is true, default warn); post-checkout and post-merge run `vee sync --quiet`. `VEE_SKIP_HOOKS=1` bypasses all of them. `auto_sync_on_commit` now controls this.

### 3.2 Agent rule files

Write idempotent marker blocks (`<!-- veeshree:start -->` to `<!-- veeshree:end -->`) and append them to existing files instead of skipping. Targets: CLAUDE.md, AGENTS.md, .cursorrules, GEMINI.md, .agents/rules/veeshree.md, .github/copilot-instructions.md. Rules tell the agent to call the MCP tools when available and otherwise read the files. `vee init --agents claude,cursor` selects targets, `vee rules update` refreshes blocks after an upgrade, and uninstall removes only the block.

### 3.3 Background daemon

`vee watch --daemon` writes a pid file and log under `.vee/`. `vee watch status` and `vee watch stop` manage it. Works on Windows, macOS and Linux. Optional launchd or systemd user service installers are a stretch goal.

### 3.4 Automatic maintenance

gc runs automatically after an accept when completed tasks exceed 20 or progress exceeds 5 items. `vee init` runs doctor automatically. `vee status` prints a reminder when proposals are pending or drift is unresolved.

### 3.5 CI integration

`vee ci init` writes `.github/workflows/veeshree.yml` running `npx veeshree status --check --json`. A reusable GitHub Action is a post-1.0 option.

### 3.6 Zero-config start

`vee init` detects installed agents (`.cursor`, `.claude`, `.github`) and local engines, picks defaults, installs hooks and rules, runs doctor, and prints one clear next step.

## Phase 4: New features

### 4.1 MCP server (GAP-2)

`vee mcp` runs a stdio server built on the official MCP SDK.

| Tool | Purpose | Writes? |
| --- | --- | --- |
| get\_context(task, max\_tokens?) | Token-budgeted context with stale warnings | No |
| search\_memory(query, include\_archived?) | BM25 search across memory | No |
| get\_decision(id) | Full ADR with supersede chain | No |
| list\_decisions(status?) | Catalog of ADRs | No |
| check\_drift(id?) | Live drift status | No |
| propose\_decision(title, decision, reason, alternatives?, linked\_files?) | Create ADR proposal | Proposal only |
| propose\_constraint(rule, type) | Create constraint proposal (always high risk) | Proposal only |
| update\_task(name, action) | Add, complete or remove a task | Proposal (auto for low risk with --auto) |

Resources: `memory://constraints`, `memory://state`, `memory://decisions/{id}`.

Rules: every input is validated with zod; writes are limited to `docs/memory`; payload size and call rate are capped; every write returns a proposal id. `vee mcp install --client claude|cursor|vscode|gemini` writes each client's config. Verify each client's current config format at implementation time, since these change.

**Tests.** Use the SDK client against the server: tools list, schema rejection, path-escape attempts, proposal creation.

### 4.2 Review commands (GAP-4)

`vee review` (interactive list with diffs), `vee accept <id|--all-low>`, `vee reject <id>`, `vee proposals --json`.

### 4.3 Providers (GAP-3)

A single `Extractor` interface: name, isLocal and `extract(payload)`, with a 30 second timeout, retries, schema validation and one repair retry. New providers: Anthropic, and an OpenAI-compatible provider with a configurable `base_url` (covers OpenRouter, Azure, vLLM and similar). Default model names live in a shipped config file, not in code.

### 4.4 Safety tools

`--dry-run` on init, capture, gc, accept and `sync --accept`. `vee undo [n]` restores from the last 20 snapshots. `vee export --format json|md` and `vee import`.

### 4.5 ADR tooling

`vee decisions new|show|supersede|link`. Status transitions are validated, and `show` prints the supersede chain.

### 4.6 Config and diagnostics

`vee config get|set|list|path` with precedence: environment, project `.vee/config.json`, global `~/.veeshree/config.json`, defaults. `vee doctor --fix` repairs permissions, gitignore, hooks, missing files and rule blocks.

### 4.7 CLI ergonomics

Global `--json`, `--quiet`, `--no-color`; stable exit codes; `vee completion` for shells; `.veeignore` with gitignore syntax; `vee context --format markdown|json|xml`.

## Phase 5: Code cleanup

### 5.1 Structure and errors

Adopt the layout in section 4. Introduce `VeeError` with a code and exit code. Commands return typed results; only `cli.ts` prints and exits. This removes the 24 scattered `process.exit` calls.

### 5.2 Types and validation

Turn on `strict` and `noUncheckedIndexedAccess`. Zero `any`. Parse with zod at every boundary: config, frontmatter, index, LLM output, MCP input.

### 5.3 Lint, format, logging

ESLint with typescript-eslint (no-explicit-any, no-empty, no-floating-promises), Prettier and editorconfig. One logger with levels and JSON output; no stray `console.log`.

### 5.4 Dead code and housekeeping

Remove unused config, read the version from package.json at build time (single source), delete the internal planning PDF and move blueprint documents to `docs/internal/` or remove them. Replace all 25 empty catches with handled or logged errors.

### 5.5 Cross-platform and performance

Store paths POSIX-normalized, handle CRLF, and run CI on Windows. Index incrementally using mtime and size, hashing linked files only when they changed. Stream large diffs.

### 5.6 Tests

Grow from 17 tests to full coverage: unit, integration, CLI end-to-end, watcher, providers (with mock servers), MCP, and one regression test per finding in section 2. Coverage thresholds in CI: 85 percent lines, 80 percent branches.

## Phase 6: Release 1.0.0

### 6.1 Repository and package metadata

Public GitHub repo. Fill `repository`, `homepage`, `bugs`, `author`, keywords. `engines.node >=20`. An ESM `exports` map with types, `bin`, `sideEffects: false`, and `publishConfig.provenance: true`. Run `npm pack --dry-run` and confirm only intended files ship.

### 6.2 Documentation

Rewrite the README with accurate claims (remove 0ms cold start, correct the drift description, list real commands and the honest comparison with other tools). Fix the website docs to match (hashes in frontmatter, real commands). Add CHANGELOG (Keep a Changelog), SECURITY.md (reporting process and threat model), CONTRIBUTING.md, CODE\_OF\_CONDUCT.md, issue templates, and a LICENSE with the copyright holder named.

### 6.3 CI and CD

Workflows: ci (lint, typecheck, tests on Ubuntu, macOS and Windows with Node 20 and 22), audit, and release (tag triggers publish through npm trusted publishing with provenance).

### 6.4 Versioning plan

0.3.1 to 1.0.0-rc.1 (publish under the `next` dist-tag) to one or two weeks of testing to 1.0.0 (`latest`). Follow semver from here. After release, deprecate versions below 1.0.0 with a message pointing to the upgrade guide.

### 6.5 Manual release checklist

1. All gates in section 10 are green on the main branch.
2. `npm version 1.0.0-rc.1` and tag; CI publishes with `--tag next`.
3. Install the rc in three real projects (fresh, existing with CLAUDE.md, 0.3.x upgrade) and run through the migration guide.
4. Fix issues, then `npm version 1.0.0` and tag.
5. CI publishes to `latest`; verify the provenance badge on npm.
6. Publish the GitHub release with the CHANGELOG entry and update the website.
7. Run `npm deprecate` on older versions.

## 7. Migration from 0.3.x

`vee migrate` performs these steps and supports `--dry-run`:

1. Back up `docs/memory/` to `.vee/backup-0.3.x/`.
2. Read old hashes from `.vee/index.json` and write them into ADR frontmatter.
3. Convert existing ADR filenames to `NNNN-slug`, keeping old names as aliases.
4. Add marker blocks to existing rule files without touching other content.
5. Add `schema_version: 1` to config and move keys out of `.vee/config.json` with a prompt.
6. Offer to install git hooks.
7. Run doctor and print a summary.

Breaking changes to document: Node 20 or later; `sync` is read-only (use `--accept`); drift data moves into frontmatter; cloud upload requires opt-in; the review queue is on by default.

## 8. Command reference for 1.0.0

| Command | Purpose |
| --- | --- |
| init | Scaffold memory, detect agents, install rules and hooks |
| migrate | Upgrade a 0.3.x project |
| watch / watch --daemon / watch status / watch stop | Ambient capture into proposals |
| capture | Extract memory from a diff or transcript into a proposal |
| review / accept / reject / proposals | Manage the proposal queue |
| context | Build token-budgeted context (`--explain`, `--format`) |
| search / decisions | Search and manage ADRs |
| sync / sync --accept | Check or accept drift baselines |
| status | Dashboard; `--check` for CI |
| gc | Archive old progress, tasks and superseded ADRs |
| undo / export / import | Recovery and portability |
| mcp / mcp install | MCP server and client setup |
| hooks / rules / ci init | Automation setup |
| keys / models / config / doctor | Credentials, providers, settings and diagnostics |
| completion | Shell completions |

## 9. Configuration reference (1.0.0)

- `schema_version`: 1
- `extractor.provider`, `extractor.model`, `extractor.base_url`
- `privacy.allow_cloud` (default false), `privacy.max_payload_bytes` (default 24576)
- `context.max_tokens` (default 2000), `context.constraints_cap` (default 400), `context.state_cap`, `context.decisions_cap`
- `watch.debounce_seconds` (default 5), `watch.max_calls_per_hour`, `watch.auto` (default false)
- `hooks.enabled` (default true), `hooks.block_on_drift` (default false)
- `proposals.auto_apply_low_risk` (default false)
- `gc.max_progress` (default 5), `gc.max_completed_tasks` (default 20)

## 10. Quality gates for 1.0.0

1. `tsc` strict passes with zero errors and zero `any`.
2. ESLint and Prettier pass with zero warnings.
3. All tests pass on Ubuntu, macOS and Windows with Node 20 and 22; coverage at or above 85 percent lines.
4. A regression test exists for every ID in section 2 and fails against 0.3.1.
5. `npm audit --omit=dev` reports 0; no high or critical issues in the full audit.
6. Secret-leak test: fixture secrets never appear in outgoing payloads, logs or context output.
7. Injection test: malicious extraction output cannot reach memory without human acceptance.
8. Drift test: a fresh clone in CI detects drift from committed hashes.
9. Token test: `vee context` never exceeds the configured cap.
10. Migration test: a 0.3.1 fixture project upgrades cleanly and passes doctor.
11. `npm pack` contents reviewed; provenance enabled; README claims match behavior.

## 11. Definition of done

Version 1.0.0 is done when every gate in section 10 passes, every finding in section 2 is closed with a linked test, the rc has run in at least three real projects without a blocking issue, and the release checklist in section 6.5 is complete.

## 12. Risks and post-1.0 roadmap

**Risks.** MCP client config formats change often, so the installers need a verification step and a manual fallback. Redaction by pattern is best effort, not a guarantee, so the docs must say so and keep cloud opt-in. Moving hashes into frontmatter breaks 0.3.x workflows, which `vee migrate` mitigates. Scope is large for one release, so ship the rc early.

**Roadmap.** 1.1: optional vector search (sqlite-vec as an opt-in add-on package), service installers for the daemon, a reusable GitHub Action. 1.2: team features such as shared review queues, a VS Code extension, and multi-repo memory.

## 13. Suggested order and rough effort

| Order | Work | Rough effort |
| --- | --- | --- |
| 1 | Phase 5 foundations (structure, errors, strict types, lint, CI) | 3 to 4 days |
| 2 | Phase 1 security | 4 to 5 days |
| 3 | Phase 2 bug fixes with regression tests | 5 to 6 days |
| 4 | Phase 3 automation | 3 to 4 days |
| 5 | Phase 4 features (review, providers, undo first; MCP last) | 6 to 8 days |
| 6 | Phase 6 docs, migration, rc, release | 4 to 5 days |

Total is roughly 25 to 32 working days for one developer. Estimates are rough and exclude rc feedback time.
