import fs from "node:fs";
import path from "node:path";

export function generateCursorRulesTemplate(): string {
  return `# Veeshree Context Persistence Rules for Cursor

You are operating within a repository utilizing Veeshree for persistent project context.
Before making architectural recommendations or modifying code:
1. Review active architectural constraints in \`docs/memory/constraints.md\`.
2. Inspect active architectural decisions in \`docs/memory/decisions/\`.
3. Check current milestone progress in \`docs/memory/current-state.md\` and \`docs/memory/tasks.md\`.
4. Never suggest or re-implement approaches recorded in \`docs/memory/rejected.md\`.
5. Keep changes focused and respect established project patterns.
`;
}

export function generateClaudeRulesTemplate(): string {
  return `# Claude Code Project Memory Guidelines (Veeshree)

This project uses Veeshree for model-independent memory persistence.
- Always consult \`docs/memory/current-state.md\` for current architecture and active milestones.
- Strictly adhere to all Hard Constraints defined in \`docs/memory/constraints.md\`.
- Check \`docs/memory/decisions/\` before making significant structural modifications.
- Avoid rejected approaches documented in \`docs/memory/rejected.md\`.
`;
}

export function generateGeminiRulesTemplate(): string {
  return `# Veeshree Persistent Context Rules

## System Context & Architectural Guidelines
You are assisting in a software project backed by Veeshree for version-controlled memory persistence.

1. **State Awareness**: Check \`docs/memory/current-state.md\` and \`docs/memory/tasks.md\` for active goals.
2. **Architectural Constraints**: Respect all rules in \`docs/memory/constraints.md\`.
3. **Decision Records**: Reference established ADRs in \`docs/memory/decisions/\`.
4. **Negative Knowledge**: Do not propose technologies or designs listed in \`docs/memory/rejected.md\`.
`;
}

export function generateCopilotRulesTemplate(): string {
  return `# GitHub Copilot Instructions (Veeshree Memory)

- Review \`docs/memory/current-state.md\` for current project status and active focus.
- Adhere to architectural constraints in \`docs/memory/constraints.md\`.
- Check \`docs/memory/decisions/\` for existing architectural choices.
- Respect rejected decisions listed in \`docs/memory/rejected.md\`.
`;
}

export function installIdeRules(rootDir: string = process.cwd()): string[] {
  const installed: string[] = [];

  // 1. .cursorrules
  const cursorPath = path.join(rootDir, ".cursorrules");
  if (!fs.existsSync(cursorPath)) {
    fs.writeFileSync(cursorPath, generateCursorRulesTemplate(), "utf-8");
    installed.push(".cursorrules");
  }

  // 2. CLAUDE.md
  const claudePath = path.join(rootDir, "CLAUDE.md");
  if (!fs.existsSync(claudePath)) {
    fs.writeFileSync(claudePath, generateClaudeRulesTemplate(), "utf-8");
    installed.push("CLAUDE.md");
  }

  // 3. GEMINI.md & .agents/rules/veeshree.md (Antigravity & Gemini)
  const geminiPath = path.join(rootDir, "GEMINI.md");
  if (!fs.existsSync(geminiPath)) {
    fs.writeFileSync(geminiPath, generateGeminiRulesTemplate(), "utf-8");
    installed.push("GEMINI.md");
  }

  const agentsRulesDir = path.join(rootDir, ".agents", "rules");
  fs.mkdirSync(agentsRulesDir, { recursive: true });
  const antigravityRulePath = path.join(agentsRulesDir, "veeshree.md");
  if (!fs.existsSync(antigravityRulePath)) {
    fs.writeFileSync(antigravityRulePath, generateGeminiRulesTemplate(), "utf-8");
    installed.push(".agents/rules/veeshree.md");
  }

  // 4. .github/copilot-instructions.md
  const githubDir = path.join(rootDir, ".github");
  fs.mkdirSync(githubDir, { recursive: true });
  const copilotPath = path.join(githubDir, "copilot-instructions.md");
  if (!fs.existsSync(copilotPath)) {
    fs.writeFileSync(copilotPath, generateCopilotRulesTemplate(), "utf-8");
    installed.push(".github/copilot-instructions.md");
  }

  return installed;
}
