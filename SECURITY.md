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

### 1. Proposal Queue & Memory Poisoning Protection
LLM extractions never write directly to architectural constraints or supersede existing decisions without explicit human review. Any extraction containing sensitive keywords, instructions to disable safety checks, or rule updates is automatically assigned high-risk status and staged in `.vee/proposals/`.

### 2. Secret Redaction & Data Privacy
- **Automatic Pattern Redaction**: Diff payloads and context prompts pass through a pattern-matching filter covering OpenAI, Google Gemini, Anthropic, AWS, GitHub, Slack tokens, private keys, and JWTs.
- **Sensitive File Denylist**: Files matching `.env*`, `*.pem`, `*.key`, `id_rsa*`, lockfiles, and binaries are barred from being processed or transmitted.
- **Size Capping**: Outgoing diff payloads are capped at 24KB by default to prevent inadvertent data exposure and token budget exhaustion.
- **Explicit Cloud Consent**: External cloud AI requests are disabled by default (`privacy.allow_cloud: false`). When run in a terminal without cloud consent, Veeshree prompts interactively; in non-interactive CI environments, it blocks execution until explicitly opted in or configured for local offline models (Ollama / LM Studio).

### 3. Safe Execution & Path Traversal Prevention
- All file writes are strictly constrained to `docs/memory/` and `.vee/` using path sanitization that rejects directory traversal (`..`, absolute paths, and null bytes).
- Subprocesses executed by the CLI are run with safe argument arrays (`execFileSync`) rather than shell interpolation, eliminating shell injection risks.
- Model names are restricted to safe alphanumeric and punctuation patterns.

### 4. Zero Native Dependencies
Veeshree guarantees 100% pure JavaScript/TypeScript execution with zero C++ native extensions, minimizing attack surface and eliminating compilation exploits.
