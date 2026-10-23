# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0-rc.1]

### Installation
```bash
npm install veeshree@next
# or run directly:
npx veeshree@next init
```

### Major Highlights
- **1.0.0-rc.1 Release**: Transitioned Veeshree from early prototype to a reliable, model-independent architectural memory layer with zero native dependencies.
- **Safe by Default**: The review queue is enabled by default. External cloud LLM calls require explicit consent (`privacy.allow_cloud`).
- **MCP Server**: Official Model Context Protocol stdio server with tools for context assembly, drift inspection, decision proposals, and task updates.
- **Automated Git Hooks & Agent Rules**: Idempotent marker blocks for `pre-commit`, `post-checkout`, `post-merge` and instructions for Cursor, Claude, Gemini, Antigravity, AGENTS.md, and GitHub Copilot.
- **Node >= 20.0.0**: Leveraging native recursive `fs.watch`, structured cloning, and Node LTS stability.

### Security Fixes
- **SEC-1 (Proposal Queue & Memory Poisoning Protection)**: LLM extractions proposing new constraints, instruction overrides, or ADR superseding are automatically scored as high-risk and diverted to `.vee/proposals/` for human review prior to touching markdown memory files.
- **SEC-2 (Automatic Secret Redaction & Denylist)**: Secret patterns for OpenAI, Gemini, Anthropic, AWS, GitHub, Slack tokens, JWTs, and private keys are redacted from outgoing diff payloads and context logs. Denylisted files (`.env*`, `.pem`, `.key`, `id_rsa*`, lockfiles, binaries) are never sent to external LLMs. Payload size is strictly capped at 24KB by default.
- **SEC-3 (Secure Gemini Authentication)**: Gemini API keys are now securely passed in the `x-goog-api-key` request header instead of query parameter URLs.
- **SEC-4 (Command Injection Prevention)**: Model names and CLI subcommands are validated against strict alphanumeric patterns and executed using binary argument arrays without shell expansion.
- **SEC-5 (Dependency Modernization)**: Removed vulnerable `gray-matter` / `js-yaml` dependency chain in favor of safe, modern `yaml`. Upgraded Vitest and Vite test runner toolchain.

### Bug Fixes
- **BUG-1 (Drift Flag Clearing)**: Live drift detection now clears committed drift flags upon running `vee sync` or `vee sync --accept`.
- **BUG-2 (Committed Frontmatter Baselines)**: Hash baselines are stored directly in version-controlled ADR frontmatter (`linked_files: [{ path, sha256 }]`), allowing fresh checkouts in CI to detect drift without relying on gitignored local index caches.
- **BUG-3 (Literal String Substitution)**: Replaced regex replacement string interpolation with safe literal replacement, eliminating corruption caused by `$&`, `$1`, and `` $` `` in LLM extractions.
- **BUG-4 (ADR Naming Collisions & Non-Latin Slugs)**: Implemented sequential `NNNN-slug.md` ADR naming (e.g., `0001-database-engine.md`). Non-Latin titles default safely to `NNNN-decision.md` without collisions.
- **BUG-5 (Rolling Progress Preservation)**: Isolated section 4 (`Next Immediate Steps`) editing to prevent wiping tail notes or subsequent sections when updating recent progress in `current-state.md`.
- **BUG-6 (Task Actions & Exact Line Deduplication)**: Implemented task `remove` action and transitioned deduplication from substring matching to exact normalized line matching.
- **BUG-7 (Token Budget Enforcement)**: Configured strict per-tier token budgets (constraints default to 400 tokens with `[pin]` preservation). Overflow drops lower-priority rules with visible notices.
- **BUG-8 (Robust Watcher & Rate Limiting)**: Watcher ignores `.vee` and `docs/memory` to prevent retriggering loops, checks diff fingerprints in `watch-state.json` to avoid resending unchanged diffs, and limits calls per hour.
- **BUG-9 (Agent Rule Marker Blocks)**: Added marker-delimited rule blocks that preserve existing user guidelines in `CLAUDE.md`, `.cursorrules`, etc. Ollama extractor filters out embedding models when auto-selecting runtimes.

### Added
- **MCP Tooling (`vee mcp`)**: Stdio server with tools (`get_context`, `search_memory`, `get_decision`, `list_decisions`, `check_drift`, `propose_decision`, `propose_constraint`, `update_task`) and client installers for Claude, Cursor, VS Code, and Gemini.
- **Review Workflow**: Commands `vee review`, `vee accept <id>`, `vee reject <id>`, and `vee proposals`.
- **Snapshot & Undo Engine**: Pre-apply snapshots saved in `.vee/snapshots/` (last 20 retained) powering `vee undo [steps]`.
- **New Providers**: Native Anthropic Claude extractor (`claude-3-7-sonnet`) and configurable OpenAI `base_url` for OpenRouter, Azure, and local vLLM.
- **Portability**: `vee export` and `vee import` for JSON or Markdown bundle transfers.
- **Migration Engine (`vee migrate`)**: Automatically upgrades 0.3.x projects to 1.0.0, backs up legacy state, transfers cached hashes to frontmatter baselines, standardizes ADR filenames, and installs hooks.
- **CI Health Check (`vee ci init`)**: Generates `.github/workflows/veeshree.yml` for automated drift verification in pull requests.

### Changed
- Centralized all CLI exits to `src/cli.ts` with structured typed errors (`VeeError`) and exit codes.
- `package.json` specifies Node.js `>= 20.0.0` and exports map with TypeScript definitions.
- Config upgraded to `schema_version: 1` with full backwards-compatibility mappings for 0.3.x keys.

[1.0.0-rc.1]: https://github.com/Umgauthamram/veeshree/releases/tag/v1.0.0-rc.1
