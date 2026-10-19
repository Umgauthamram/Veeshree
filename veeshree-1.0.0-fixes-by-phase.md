# Veeshree 1.0.0: Fixes by Phase

Source: review of `veeshree_v1_0_0.zip` against the 1.0.0 Update Blueprint.
Goal: turn the current build into a releasable `1.0.0` (ship `1.0.0-rc.1` first).

Legend: **P0** = blocks release, **P1** = must fix before 1.0.0, **P2** = polish.
Each item: what is wrong, the fix, the test that proves it.

---

## Phase 0: Release blockers (install, build, publish)

### 0.1 `npm ci` fails (P0)
- **Problem:** `@types/node ^20` conflicts with `vitest 5` peer dependency (`^22 || >=24`). Fresh clones, CI and `prepublishOnly` cannot install without `--legacy-peer-deps`.
- **Fix:** pin `@types/node` to `^22` (or a version satisfying vitest's peer range); regenerate `package-lock.json`; keep `engines.node >=20`.
- **Test:** clean clone, `npm ci && npm run build && npm test` succeeds with no flags.

### 0.2 No CI, so provenance cannot work (P0)
- **Problem:** `publishConfig.provenance: true` fails on a local `npm publish`. No `.github/workflows` exist.
- **Fix:** add workflows: `ci.yml` (lint, typecheck, test on Ubuntu/macOS/Windows, Node 20 and 22, `npm audit`), `release.yml` (tag triggers publish with provenance via trusted publishing).
- **Test:** push a branch, all matrix jobs green; dry-run release on a tag.

### 0.3 Version is hard-coded in 6 places (P1)
- **Problem:** `"1.0.0"` appears in `cli.ts`, `mcp/server.ts`, `config.schema.ts`, `export-import.ts`, `migrate.ts`.
- **Fix:** inject version from `package.json` at build time (tsup `define`) and import one `VERSION` constant.
- **Test:** change package.json version, rebuild, `vee --version` and MCP `serverInfo` match.

---

## Phase 1: Security fixes

### 1.1 MCP resource path traversal (P0)
- **Problem:** `memory://decisions/<id>` joins `id` into the path unchecked; any `.md` file outside `docs/memory/decisions` is readable.
- **Fix:** validate `id` against `^[A-Za-z0-9._-]+$`, resolve the path, and reject anything not inside the decisions directory (`path.relative` check). Also list decision resources in `ListResources`.
- **Test:** `memory://decisions/../../../x/secret` returns an error; valid ids still work.

### 1.2 `vee mcp install` overwrites user config (P0)
- **Problem:** unparsable JSON (for example VS Code `mcp.json` with comments) is replaced by `{}`, destroying the user's file. Entry uses unpinned `npx -y veeshree mcp`.
- **Fix:** on parse failure, abort with a clear error (or parse JSONC); back up the original to `<file>.bak` before every write; pin the version in the entry (`veeshree@<current>`) or use `--no-install`; support Claude Code's `.mcp.json` and set the project root explicitly (`--root`) for global configs.
- **Test:** config with comments is preserved or refused, never wiped; backup file created.

### 1.3 MCP input validation and limits (P1)
- **Problem:** no zod validation; a 2 MB decision was accepted; 300 calls left 301 pending proposals; bad arguments accepted.
- **Fix:** zod schemas per tool (max lengths, array limits, required fields); cap payload size (for example 16 KB); cap pending proposals (for example 50) and rate-limit proposal creation; return structured errors.
- **Test:** oversize input rejected; 51st pending proposal refused; `action: 42` rejected.

### 1.4 `capture` ignores the denylist (P0)
- **Problem:** `capture --diff` sends tracked `.env`, `.pem`, lockfile and binary diffs; only the watcher's untracked path uses the denylist.
- **Fix:** filter `git diff` per file before redaction (use `git diff --name-only` plus per-file diff, or `:(exclude)` pathspecs); apply the same filter to `--file` input paths.
- **Test:** a changed tracked `.env` and `*.pem` never appear in `--show-payload`.

### 1.5 Redaction gaps (P1)
- **Problem (verified):** DB URL passwords, Stripe `sk_live_` keys, Bearer tokens and short passwords are sent unredacted.
- **Fix:** add patterns: `scheme://user:pass@host`, `sk_live_`/`sk_test_`/`rk_live_`, `Bearer <token>`, `Authorization:` headers, `password|passwd|pwd` assignments of any length, Azure/GCP/npm tokens. Document that redaction is best effort.
- **Test:** fixture file with each secret type; none survive.

### 1.6 `.veeignore` not implemented (P1)
- **Problem:** promised in the blueprint and README, absent in code.
- **Fix:** load `.veeignore` (gitignore syntax) and `.gitignore` in the denylist; apply in capture, watcher, scanner and context.
- **Test:** an ignored path never reaches any payload.

### 1.7 Risk scoring is bypassable (P1)
- **Problem (verified):** `eval $(curl ...)`, `bash -c "$(wget ...)"` and paraphrased override text score low, so `--auto` writes them into ADRs and tasks.
- **Fix:** broaden patterns (`eval`, `$(...)`, `bash -c`, base64 decode to shell, `chmod +x`, `sudo`, `rm -rf`, `curl`/`wget` anywhere); treat any text containing a URL or shell metacharacters as high; never auto-apply ADR bodies, only tasks and state; add an allowlist mode.
- **Test:** each bypass variant scores high; benign ADRs stay low.

### 1.8 `import` bypasses the review queue (P1)
- **Problem:** imported bundles write memory directly, with no proposal and no snapshot.
- **Fix:** take a snapshot before import; send imported constraints through the proposal queue (or require `--yes` plus a diff preview); validate the manifest and version.
- **Test:** imported constraint becomes a pending proposal; `vee undo` restores pre-import state.

### 1.9 Privacy consent and watcher payload (P1)
- **Problem:** consent is not persisted (daemon can never prompt); watcher resends the whole cumulative diff.
- **Fix:** after a yes, offer to save `privacy.allow_cloud` (per project); send only new hunks since the last processed state.
- **Test:** second extraction payload excludes already-processed hunks.

---

## Phase 2: Correctness fixes

### 2.1 `--json` output is invalid (P0)
- **Problem (verified):** `context`, `status`, `sync` print human text or mixed JSON lines; only `proposals --json` is valid. The `ci init` workflow depends on this.
- **Fix:** in JSON mode, print exactly one JSON document to stdout and send all logs to stderr; apply to every command that advertises `--json`.
- **Test:** each `--json` command piped to a JSON parser succeeds.

### 2.2 `sync --accept` CLI is wrong (P0)
- **Problem (verified):** `vee sync --accept --all` (the command sync recommends) errors; bare `--accept` errors; only `--accept all` works.
- **Fix:** support `--accept <id>`, `--accept all`, and an `--all` flag; make bare `--accept` an error with usage; update the printed hint to match.
- **Test:** all documented forms work; the hint text runs as printed.

### 2.3 Hook false warnings (P0)
- **Problem (verified):** if veeshree is not installed locally, `npx --no-install` fails and the hook prints a "code has drifted" warning; with `block_on_drift` it would block commits.
- **Fix:** detect "command not found" separately from drift (exit code 1 vs 127/other); skip silently or print a distinct message; resolve a local binary first (`node_modules/.bin/vee`), then global.
- **Test:** hook in a repo without veeshree installed exits 0 with no drift message.

### 2.4 One bad ADR crashes drift checks (P1)
- **Problem (verified):** a `../` linked path throws and stops `sync`, `status` and hooks entirely.
- **Fix:** catch per-file errors in `checkWorkspaceDrift`, mark the record `invalid_path`, continue, and report it.
- **Test:** workspace with one bad ADR still reports the others.

### 2.5 Watcher fixes (P1)
- **Problem:** backoff calculated but never applied; path filter `includes(".git")`/`includes("dist")` skips `.github/` and any path containing "dist"; tracked diff not denylist-filtered; fs.watch `error` event unhandled.
- **Fix:** apply real delayed retry on failure; match path segments, not substrings; reuse the Phase 1.4 file filter; handle watcher errors and fall back to polling.
- **Test:** edits under `.github/` trigger; failure delays next attempt; watcher error does not crash.

### 2.6 New ADR does not link to the one it replaces (P2)
- **Problem (verified):** an extracted "Database" decision creates `0001-database.md` next to the existing `database.md` with no supersede link or conflict flag.
- **Fix:** detect same-title or same-linked-file ADRs and propose a supersede (high risk) instead of a duplicate.
- **Test:** same-title decision produces a supersede proposal.

### 2.7 `init` experience (P2)
- **Problem:** `init` prints three next steps and does not run doctor; no agent or engine auto-detection summary.
- **Fix:** run doctor at the end, detect installed agents and local engines, print one next step.

---

## Phase 3: Codebase cleanup

### 3.1 Remove legacy duplicates (P0)
- **Problem:** `core/reconciler.ts`, `core/watcher.ts`, `core/context.ts`, `core/engine-resolver.ts`, `core/ide.ts` are dead or superseded, and `src/index.ts` still exports the old buggy `reconcileExtraction` and `assembleContext`.
- **Fix:** delete them, repoint any remaining imports to the new modules, and trim `src/index.ts` to the intended public API (no commands re-exported wholesale).
- **Test:** `tsc` clean; a test asserts the public exports list.

### 3.2 Types and errors (P1)
- **Problem:** 47 `any`, 61 `catch {` blocks, 85 `console.log`.
- **Fix:** replace `any` with proper types or `unknown` plus zod; every catch logs or rethrows `VeeError`; route output through the logger (CLI layer only prints).
- **Test:** ESLint rules `no-explicit-any`, `no-empty`, `no-console` pass.

### 3.3 Lint and formatting (P1)
- **Fix:** add ESLint (typescript-eslint strict), Prettier, `.editorconfig`; wire into CI and a pre-commit script.

### 3.4 Dependencies (P1)
- **Fix:** upgrade zod 3 to 4, commander 12 to current, tsup, TypeScript, esbuild (clears the 1 low advisory); fix breaking changes; keep `npm audit` at zero high or critical.

### 3.5 Repo hygiene (P2)
- **Fix:** move `Veeshree 1.0.0 Update Blueprint.md`, `veeshree execution.md`, `veeshree version 1.md` to `docs/internal/` and delete `AI Context Handoff.pdf`; remove the unused import in `redact/redactor.ts`; unify the `Veeshree` casing in output.

---

## Phase 4: Tests and documentation

### 4.1 Regression tests (P0)
Add one test per fix above (1.1 to 2.4 at minimum). Current 38 tests all pass while every bug in this list exists.

### 4.2 Coverage and e2e (P1)
- Add `vitest.config.ts` with coverage thresholds (85% lines, 80% branches).
- Add CLI end-to-end tests (init, capture dry-run, sync, status, hooks, mcp via the SDK client, import/export, undo).
- Add mock-server tests for each provider and the watcher.

### 4.3 Docs (P1)
- Fix README and website: correct `sync --accept` usage, `--json` behavior after fixes, hook behavior, redaction limits (best effort, not a guarantee).
- Add CONTRIBUTING.md, CODE_OF_CONDUCT.md, issue templates, and a threat-model section in SECURITY.md.
- Add an upgrade guide for 0.3.x to 1.0.0.

---

## Phase 5: Release

1. All P0 and P1 items above are merged; CI green on all three operating systems.
2. `npm version 1.0.0-rc.1`, tag, publish to the `next` dist-tag via CI.
3. Test the rc in three projects: fresh, existing `CLAUDE.md`, and a 0.3.1 upgrade via `vee migrate`.
4. Fix rc findings, then `npm version 1.0.0` and tag.
5. CI publishes `latest` with provenance; verify the provenance badge on npm.
6. Publish the GitHub release and CHANGELOG entry; deprecate versions below 1.0.0 with a pointer to the upgrade guide.

---

## Effort estimate

| Phase | Rough effort |
|---|---|
| 0 Release blockers | 1 day |
| 1 Security | 4 to 5 days |
| 2 Correctness | 3 to 4 days |
| 3 Cleanup | 3 to 4 days |
| 4 Tests and docs | 3 to 4 days |
| 5 Release and rc | 3 days plus rc feedback time |

Total: roughly 17 to 21 working days for one developer. Estimates are rough.

## Not verified in this review

Windows behavior, the background daemon, auto-gc, `undo`, and every provider against a live API. Add these to the Phase 4 test plan.
