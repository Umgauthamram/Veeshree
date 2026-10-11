import fs from "node:fs";
import path from "node:path";
import type { ExtractionDelta } from "../types/index.js";
import { buildIndex } from "./indexer.js";
import {
  DECISIONS_DIR_REL,
  ARCHIVE_DECISIONS_DIR_REL,
  CURRENT_STATE_FILE_REL,
  TASKS_FILE_REL,
  CONSTRAINTS_FILE_REL,
  REJECTED_FILE_REL,
  DISCOVERIES_FILE_REL,
} from "../utils/constants.js";

/**
 * Normalizes title into a kebab-case file name
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

/**
 * Reconciles an extracted delta into the /docs/memory/ markdown files
 */
export function reconcileExtraction(delta: ExtractionDelta, rootDir: string = process.cwd()): {
  newDecisions: string[];
  updatedFiles: string[];
} {
  const updatedFiles: string[] = [];
  const newDecisions: string[] = [];

  // 1. Process Decisions
  if (Array.isArray(delta.decisions) && delta.decisions.length > 0) {
    const decisionsDir = path.join(rootDir, DECISIONS_DIR_REL);
    if (!fs.existsSync(decisionsDir)) {
      fs.mkdirSync(decisionsDir, { recursive: true });
    }

    for (const dec of delta.decisions) {
      const slug = slugify(dec.title || "architectural-decision");
      const filename = `${slug}.md`;
      const filePath = path.join(decisionsDir, filename);

      const frontmatter = `---
title: "${dec.title.replace(/"/g, '\\"')}"
status: "${dec.status || "active"}"
date: "${new Date().toISOString().split("T")[0]}"
tags: ${JSON.stringify(dec.tags && dec.tags.length > 0 ? dec.tags : ["architecture"])}
linked_files: ${JSON.stringify(dec.linked_files || [])}
---

# ${dec.title}

## Context & Problem Statement
${dec.reason || "Architectural decision recorded from AI coding session."}

## Decision
${dec.decision}

## Rationale
${dec.reason}

## Alternatives Considered
${
  dec.alternatives_considered && dec.alternatives_considered.length > 0
    ? dec.alternatives_considered.map((a) => `- ${a}`).join("\n")
    : "- None explicitly recorded."
}

## Linked Files
${
  dec.linked_files && dec.linked_files.length > 0
    ? dec.linked_files.map((f) => `- \`${f}\``).join("\n")
    : "- None specified."
}
`;

      if (dec.status === "superseded") {
        const archiveDecisionsDir = path.join(rootDir, ARCHIVE_DECISIONS_DIR_REL);
        if (!fs.existsSync(archiveDecisionsDir)) {
          fs.mkdirSync(archiveDecisionsDir, { recursive: true });
        }
        const archiveFilePath = path.join(archiveDecisionsDir, filename);
        fs.writeFileSync(archiveFilePath, frontmatter, "utf-8");
        if (fs.existsSync(filePath)) {
          try {
            fs.unlinkSync(filePath);
          } catch {
            // ignore
          }
        }
        newDecisions.push(`docs/memory/archive/decisions/${filename}`);
        updatedFiles.push(`docs/memory/archive/decisions/${filename}`);
      } else {
        fs.writeFileSync(filePath, frontmatter, "utf-8");
        newDecisions.push(`docs/memory/decisions/${filename}`);
        updatedFiles.push(`docs/memory/decisions/${filename}`);
      }
    }
  }

  // 2. Process Current State
  if (delta.current_state) {
    const currentStatePath = path.join(rootDir, CURRENT_STATE_FILE_REL);
    if (fs.existsSync(currentStatePath)) {
      let stateContent = fs.readFileSync(currentStatePath, "utf-8");

      if (delta.current_state.current_feature) {
        stateContent = stateContent.replace(
          /(- \*\*Current Focus\*\*: ).+/m,
          `$1${delta.current_state.current_feature}`
        );
      }

      if (delta.current_state.completed_in_session && delta.current_state.completed_in_session.length > 0) {
        const completedLines = delta.current_state.completed_in_session.map((c) => `- ${c}`).join("\n");
        // Append to recent progress section
        stateContent = stateContent.replace(
          /(## 3\. Recent Progress[^\n]*\n)([\s\S]*?)(## 4\.|$)/,
          `$1${completedLines}\n\n$3`
        );
      }

      if (delta.current_state.next_immediate_steps && delta.current_state.next_immediate_steps.length > 0) {
        const nextSteps = delta.current_state.next_immediate_steps.map((s) => `- [ ] ${s}`).join("\n");
        stateContent = stateContent.replace(
          /(## 4\. Next Immediate Steps[^\n]*\n)([\s\S]*)/,
          `$1${nextSteps}\n`
        );
      }

      fs.writeFileSync(currentStatePath, stateContent, "utf-8");
      updatedFiles.push(CURRENT_STATE_FILE_REL);
    }
  }

  // 3. Process Tasks
  if (Array.isArray(delta.tasks) && delta.tasks.length > 0) {
    const tasksPath = path.join(rootDir, TASKS_FILE_REL);
    if (fs.existsSync(tasksPath)) {
      let tasksContent = fs.readFileSync(tasksPath, "utf-8");

      for (const t of delta.tasks) {
        if (t.action === "complete") {
          // Check off if exists
          const escaped = t.task_name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
          const taskRegex = new RegExp(`- \\[ \\] (${escaped})`, "i");
          if (taskRegex.test(tasksContent)) {
            tasksContent = tasksContent.replace(taskRegex, `- [x] $1`);
          } else {
            // Append as completed
            tasksContent = tasksContent.replace(
              /(## Active Tasks[^\n]*\n)/,
              `$1- [x] ${t.task_name}\n`
            );
          }
        } else if (t.action === "add") {
          tasksContent = tasksContent.replace(
            /(## Active Tasks[^\n]*\n)/,
            `$1- [ ] ${t.task_name}\n`
          );
        }
      }

      fs.writeFileSync(tasksPath, tasksContent, "utf-8");
      updatedFiles.push(TASKS_FILE_REL);
    }
  }

  // 4. Process Constraints
  if (Array.isArray(delta.constraints) && delta.constraints.length > 0) {
    const constraintsPath = path.join(rootDir, CONSTRAINTS_FILE_REL);
    if (fs.existsSync(constraintsPath)) {
      let constraintsContent = fs.readFileSync(constraintsPath, "utf-8");

      for (const c of delta.constraints) {
        const formatted = `- **${c.type === "hard" ? "Rule" : "Guideline"}**: ${c.rule}`;
        if (!constraintsContent.includes(c.rule)) {
          if (c.type === "hard") {
            constraintsContent = constraintsContent.replace(
              /(## Hard Constraints[^\n]*\n)/,
              `$1${formatted}\n`
            );
          } else {
            constraintsContent = constraintsContent.replace(
              /(## Soft Guidelines[^\n]*\n)/,
              `$1${formatted}\n`
            );
          }
        }
      }

      fs.writeFileSync(constraintsPath, constraintsContent, "utf-8");
      updatedFiles.push(CONSTRAINTS_FILE_REL);
    }
  }

  // 5. Process Rejected Approaches
  if (Array.isArray(delta.rejected_approaches) && delta.rejected_approaches.length > 0) {
    const rejectedPath = path.join(rootDir, REJECTED_FILE_REL);
    if (fs.existsSync(rejectedPath)) {
      let rejectedContent = fs.readFileSync(rejectedPath, "utf-8");

      for (const r of delta.rejected_approaches) {
        const block = `\n### ${r.approach}\n- **Reason Rejected**: ${r.reason}\n`;
        if (!rejectedContent.includes(r.approach)) {
          rejectedContent += block;
        }
      }

      fs.writeFileSync(rejectedPath, rejectedContent, "utf-8");
      updatedFiles.push(REJECTED_FILE_REL);
    }
  }

  // 6. Process Discoveries
  if (Array.isArray(delta.discoveries) && delta.discoveries.length > 0) {
    const discoveriesPath = path.join(rootDir, DISCOVERIES_FILE_REL);
    if (fs.existsSync(discoveriesPath)) {
      let discoveriesContent = fs.readFileSync(discoveriesPath, "utf-8");

      for (const d of delta.discoveries) {
        const item = `- ${d}\n`;
        if (!discoveriesContent.includes(d)) {
          discoveriesContent += item;
        }
      }

      fs.writeFileSync(discoveriesPath, discoveriesContent, "utf-8");
      updatedFiles.push(DISCOVERIES_FILE_REL);
    }
  }

  // 7. Trigger memory sync to update index & hashes
  buildIndex(rootDir);

  return {
    newDecisions,
    updatedFiles: Array.from(new Set(updatedFiles)),
  };
}
