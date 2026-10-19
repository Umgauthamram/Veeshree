# Upgrading from Veeshree 0.3.x to 1.0.0

Veeshree `1.0.0` introduces significant stability, security, and protocol improvements over the `0.3.x` release series.

## Major Changes & Improvements

1. **Deterministic MCP Server**:
   - `vee mcp` provides a fully compliant Model Context Protocol server exposing `get_context`, `search_memory`, `get_decision`, `list_decisions`, `check_drift`, `propose_decision`, `propose_constraint`, and `update_task`.
   - Client installers now support `claude-code` (`.mcp.json`) in addition to Claude Desktop, Cursor, VS Code, and Gemini.

2. **Safe Proposal Queue**:
   - Background extractions and ambient watcher cycles now stage proposed decisions in `.vee/proposals/` rather than modifying live constraints or overwriting ADRs without oversight.
   - Run `vee review` to interactively inspect, accept, or reject pending proposals.

3. **Cryptographic Drift Detection**:
   - Live code drift is verified against SHA-256 hashes stored directly in ADR frontmatter (`linked_files: [{ path, sha256 }]`), enabling CI verification without relying on gitignored local caches.
   - Run `vee sync --accept all` to update baselines after intentional refactors.

4. **Deterministic `--json` Mode**:
   - All commands supporting `--json` (such as `vee status --json`, `vee proposals --json`, `vee context --json`) write a single valid JSON document to `stdout`. All logs, diagnostics, and human text are written to `stderr`.

5. **Self-Healing Git Hooks**:
   - Pre-commit and post-merge hooks prioritize `./node_modules/.bin/vee` and exit cleanly (`exit 0`) without false alerts when running in environments where Veeshree is not installed.

## Migration Steps

### Step 1: Update the Dependency

Update Veeshree globally or in your project:

```bash
# Local project
npm install veeshree@latest

# Global CLI
npm install -g veeshree@latest
```

### Step 2: Run Automated Migration

Veeshree includes an automated migration command that upgrades your project structure, re-hashes linked files, and ensures schema compliance:

```bash
vee migrate
```

### Step 3: Run System Diagnostics

Verify the integrity of your memory layer, git hooks, and agent rules:

```bash
vee doctor
```

### Step 4: Reinstall Agent Rules and Hooks (Optional)

If your git hooks or agent rules were customized under `0.3.x`, update them to the `1.0.0` format:

```bash
vee hooks install
vee rules update
```

### Step 5: Verify Status

Run:
```bash
vee status
```
If you have uncommitted baseline changes, accept them using:
```bash
vee sync --accept all
```
