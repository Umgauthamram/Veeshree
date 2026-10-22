import type { ScannedProjectInfo } from "../types/index.js";

export function generateCurrentStateTemplate(info: ScannedProjectInfo): string {
  const stackSummary = [
    `- **Primary Purpose**: ${info.purpose}`,
    info.languages.length > 0 ? `- **Languages**: ${info.languages.join(", ")}` : "",
    info.frameworks.length > 0 ? `- **Frameworks / Libraries**: ${info.frameworks.join(", ")}` : "",
    info.databases.length > 0 ? `- **Databases / Data Layer**: ${info.databases.join(", ")}` : "",
    info.domainEntities.length > 0
      ? `- **Core Domain Entities**: ${info.domainEntities.join(", ")}`
      : "",
    info.apiEndpoints.length > 0
      ? `- **Detected API Endpoints**: ${info.apiEndpoints.slice(0, 8).join(", ")}`
      : "",
    info.infrastructure.length > 0
      ? `- **Infrastructure & Tools**: ${info.infrastructure.join(", ")}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");

  const commitSummary =
    info.recentCommits.length > 0
      ? info.recentCommits.map((c) => `- ${c}`).join("\n")
      : "- Initial setup / repository initialization";

  const activeFocus = info.activeFeatureFocus || "Project Initialization & Core Architecture";

  return `# Current Project State

## 1. System Overview & Purpose
- **Project Name**: ${info.name}
- **Active Branch**: \`${info.activeBranch || "main"}\`
- **Detected Stack & Architecture**:
${stackSummary || "- Standard software project"}

## 2. Active Feature / Milestone
- **Current Focus**: ${activeFocus}
- **Status**: In Progress

## 3. Recent Progress (Rolling Snapshot - Max 5)
${commitSummary}

## 4. Next Immediate Steps
- [ ] Define initial architectural constraints in \`docs/memory/constraints.md\`
- [ ] Record key architectural decision records in \`docs/memory/decisions/\`
- [ ] Set active development goals in \`docs/memory/tasks.md\`
`;
}

export function generateTasksTemplate(): string {
  return `# Project Tasks & Milestones

## Active Tasks
- [ ] Bootstrap foundational architecture & core dependencies
- [ ] Configure environment variables & local development setup
- [ ] Implement initial core features

## Backlog
- [ ] Set up testing suite and continuous integration
- [ ] Document production deployment & infrastructure guidelines
`;
}

export function generateConstraintsTemplate(): string {
  return `# Architectural & Security Constraints

## Hard Constraints (Never Violate)
- **Zero Opaque Lock-in**: Project memory must reside in human-readable Markdown inside \`docs/memory/\`.
- **Token Budget Discipline**: Injected context payloads must strictly adhere to token allocations.
- **Pure JavaScript / Zero Native C++**: CLI dependencies must run across Node.js without native build toolchains.

## Soft Guidelines (Best Practices)
- Prefer explicit architectural decision records (ADRs) before implementing major refactors.
- Keep source code files linked to corresponding decision records in frontmatter (\`linked_files\`).
`;
}

export function generateRejectedTemplate(): string {
  return `# Rejected Approaches & Trade-Offs

## Rejected Alternatives
*This file records explicitly evaluated and discarded architectural choices to prevent future AI agents from re-proposing rejected approaches.*

### Example Entry
- **Approach**: Heavy Native Vector Database (e.g. native C++ bindings for local vector store)
- **Reason Rejected**: Introduces platform-specific compilation errors and heavy installation dependencies on client machines. Chosen alternative: pure JS \`minisearch\` with zero native dependencies.
`;
}

export function generateDiscoveriesTemplate(): string {
  return `# System Behaviors & Discoveries

## Key Technical Discoveries
*This file documents unexpected system behaviors, performance quirks, and technical findings uncovered during development.*

- **Repository Initialized**: Bootstrapped with Veeshree context persistence layer.
`;
}

export function generateDecisionStubTemplate(
  title: string,
  category: string,
  detectedTech: string = "Standard"
): string {
  return `---
title: "${title}"
status: "active"
date: "${new Date().toISOString().split("T")[0]}"
tags: ["${category.toLowerCase()}", "architecture"]
linked_files: []
---

# ${title}

## Context & Problem Statement
Selection and architecture of ${category.toLowerCase()} for the project.

## Decision
[Pending AI Observation] Detected: ${detectedTech}.

## Rationale
Captured automatically during initial repository scan. Detailed trade-offs and alternatives to be recorded as development proceeds.

## Alternatives Considered
- Standard alternative evaluated during planning.

## Consequences & Linked Files
- Linked Source Files: None yet specified.
`;
}
