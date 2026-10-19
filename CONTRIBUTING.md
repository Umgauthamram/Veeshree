# Contributing to Veeshree

Thank you for your interest in contributing to Veeshree! We welcome contributions to make architectural memory persistence faster, safer, and simpler for developers and AI tools.

## Development Setup

1. **Prerequisites**: Node.js `>=20.0.0` and npm.
2. **Clone and Install**:
   ```bash
   git clone https://github.com/Umgauthamram/veeshree.git
   cd veeshree
   npm ci
   ```
3. **Build**:
   ```bash
   npm run build
   ```
4. **Run Tests**:
   ```bash
   npm test
   ```

## Design Principles

- **Zero Native Dependencies**: All code must remain pure TypeScript/JavaScript. No node-gyp, native binaries, or C++ bindings.
- **Local-First & Model Agnostic**: Memory persists in plain version-controlled Markdown (`docs/memory/`). Never introduce cloud lock-in.
- **Safe by Default**: Risky mutations must go through the Proposal Queue. Never bypass human review for constraint changes or superseding ADRs.
- **Deterministic CLI**: Commands supporting `--json` must write exactly one JSON object to `stdout`, keeping all logs in `stderr`.

## Pull Request Guidelines

1. Fork the repository and create your branch from `main`.
2. Ensure TypeScript compilation passes with zero errors (`npx tsc --noEmit`).
3. Ensure all Vitest tests pass (`npm test`). Add tests for any new features or bug fixes.
4. Keep git commits clear and descriptive.

## Security Disclosures

Please do **not** report security vulnerabilities via public GitHub issues. Refer to [SECURITY.md](SECURITY.md) for reporting procedures.
