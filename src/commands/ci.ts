import path from "node:path";
import { writeAtomic } from "../core/memory/atomic.js";
import { logger } from "../utils/logger.js";

const GITHUB_WORKFLOW_TEMPLATE = `name: Veeshree Memory Integrity & Drift Check

on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]

jobs:
  drift-check:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Verify Architectural Drift
        run: npx --yes veeshree status --check --json
`;

export function handleCiCommand(
  action: "init" = "init",
  rootDir: string = process.cwd()
): void {
  const workflowPath = path.join(rootDir, ".github", "workflows", "veeshree.yml");
  writeAtomic(workflowPath, GITHUB_WORKFLOW_TEMPLATE);
  logger.success(`Created GitHub Actions CI workflow: .github/workflows/veeshree.yml`);
}
