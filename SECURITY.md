# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0.0 | :x:                |

## Reporting a Vulnerability

The Veeshree team takes software security seriously. If you discover a vulnerability or potential security flaw, please report it responsibly:

- **Do NOT open a public GitHub issue.**
- Email your findings directly to `security@veeshree.dev` (or create a private GitHub Security Advisory at https://github.com/Umgauthamram/veeshree/security/advisories/new).
- Include detailed reproduction steps, sample inputs, and an assessment of the vulnerability's impact.
- You will receive an initial response within 48 hours acknowledging receipt.

## Security Architecture & Threat Model

Veeshree operates as a persistence layer for multi-model AI software engineering. It is designed around the principle of **Safe by Default**:

### Threat Model & Defense Boundaries

#### 1. What Redaction Does and Does Not Guarantee
- **Heuristic Defense-in-Depth**: Automatic pattern redaction is a local heuristic guardrail covering known token formats (OpenAI, Gemini, Anthropic, AWS, GCP, Stripe, GitHub, Slack, DB connection strings, bearer tokens, private keys, JWTs).
- **No Absolute Guarantees**: Redaction does **not** guarantee detection of arbitrary, custom-formatted, obfuscated, or bespoke secret strings. It must never replace proper secrets management (e.g., environment variables or secret vaults). Developers must never commit production credentials to version control.
- **Sensitive File Denylist & Size Capping**: Files matching `.env*`, `*.pem`, `*.key`, `id_rsa*`, lockfiles (`package-lock.json`, `pnpm-lock.yaml`, `yarn.lock`), `.veeignore`, and binaries are excluded from diffs. Outgoing payloads are capped at 24KB by default.

#### 2. Why Cloud Upload Is Opt-In
- **Zero Inadvertent Data Leakage**: By default, `privacy.allow_cloud` is set to `false`. Diff payloads and contextual prompts never leave the local environment unless explicit consent is granted by the user.
- **Offline / Local First**: Teams can use local offline models (Ollama, LM Studio) without cloud credentials or consent prompts. In CI environments, operations requiring remote LLMs fail closed unless `privacy.allow_cloud: true` is explicitly configured.

#### 3. How the Proposal Queue Defends Against Memory Poisoning
- **Staged Untrusted Deltas**: Extractions from LLMs and unverified import bundles never write directly to architectural constraints, tasks, or ADRs.
- **Risk Scoring**: Any extraction containing flagged patterns (system prompt overrides, instruction to disable safety checks, bypass tests, or alter constraints) receives a `high` risk score and is staged in `.vee/proposals/` for human review.

#### 4. Limits of Memory Poisoning Defenses
- **Natural-Language Poisoning Limits**: Subtle natural-language poisoning, semantic ambiguity, indirect prompt injection, and carefully phrased adversarial suggestions cannot be fully or reliably detected by heuristic pattern matching alone.
- **Human Review as Final Authority**: The proposal queue, automated git diffs, and version-controlled `docs/memory/` Markdown files ensure all architectural mutations remain transparent, inspectable, and reversible via standard Git history and `vee undo`.

### Safe Execution & Path Traversal Prevention
- All file writes are strictly constrained to `docs/memory/` and `.vee/` using path sanitization that rejects directory traversal (`..`, absolute paths, and null bytes).
- Subprocesses executed by the CLI are run with safe argument arrays (`execFileSync`, `spawn`) rather than shell interpolation, eliminating shell injection risks.
- Model names are restricted to safe alphanumeric and punctuation patterns.

### Zero Native Dependencies
Veeshree guarantees 100% pure JavaScript/TypeScript execution with zero C++ native extensions, minimizing attack surface and eliminating compilation exploits.

