import fs from "node:fs";
import path from "node:path";
import type { ExtractionDelta } from "../types/index.js";
import { buildIndex } from "./indexer.js";
import { writeAtomic } from "./memory/atomic.js";
import {
  parseSections,
  slugifyTitle,
  getNextAdrNumber,
  updateSectionBody,
  normalizeTaskName,
  safeLiteralReplace,
} from "./memory/section-editor.js";
import { stringifyMarkdownFrontmatter, parseDecisionFrontmatter } from "./memory/frontmatter.js";
import { calculateNormalizedFileHash } from "./drift/hasher.js";
import { sanitizeRelativePath } from "../utils/paths.js";
import {
  DECISIONS_DIR_REL,
  ARCHIVE_DECISIONS_DIR_REL,
  CURRENT_STATE_FILE_REL,
  TASKS_FILE_REL,
  CONSTRAINTS_FILE_REL,
  REJECTED_FILE_REL,
  DISCOVERIES_FILE_REL,
} from "../utils/constants.js";

export { reconcileExtractionSafe } from "./reconcile/reconciler.js";

/**
 * Reconciles an extracted delta into the /docs/memory/ markdown files.
 * Synchronous API for backwards compatibility.
 */
export function reconcileExtraction(
  delta: ExtractionDelta,
  rootDir: string = process.cwd(),
  options: { source?: string; acceptedBy?: string } = {}
): {
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
      const nextNum = getNextAdrNumber(rootDir);
      const slug = slugifyTitle(dec.title || "decision");
      const filename = `${nextNum}-${slug}.md`;
      const filePath = path.join(decisionsDir, filename);

      const linkedEntries = (dec.linked_files || []).map((rel) => {
        try {
          const safeRel = sanitizeRelativePath(rel);
          const hash = calculateNormalizedFileHash(path.join(rootDir, safeRel));
          return { path: safeRel, sha256: hash || undefined };
        } catch {
          return { path: rel, sha256: undefined };
        }
      });

      const frontmatterData: Record<string, unknown> = {
        id: `${nextNum}-${slug}`,
        title: dec.title,
        status: dec.status || "active",
        date: new Date().toISOString().split("T")[0],
        tags: dec.tags && dec.tags.length > 0 ? dec.tags : ["architecture"],
        linked_files: linkedEntries,
        generated_by: "veeshree",
      };

      if (dec.supersedes) {
        frontmatterData.supersedes = dec.supersedes;
      }

      const alternatives =
        dec.alternatives_considered && dec.alternatives_considered.length > 0
          ? dec.alternatives_considered.map((a) => `- ${a}`).join("\n")
          : "- None explicitly recorded.";

      const linkedFilesBlock =
        linkedEntries.length > 0
          ? linkedEntries.map((f) => `- \`${f.path}\``).join("\n")
          : "- None specified.";

      const bodyMarkdown = `# ${dec.title}

## Context & Problem Statement
${dec.reason || "Architectural decision recorded from AI coding session."}

## Decision
${dec.decision}

## Rationale
${dec.reason}

## Alternatives Considered
${alternatives}

## Linked Files
${linkedFilesBlock}
`;

      const fullContent = stringifyMarkdownFrontmatter(frontmatterData, bodyMarkdown);

      if (dec.status === "superseded") {
        const archiveDecisionsDir = path.join(rootDir, ARCHIVE_DECISIONS_DIR_REL);
        if (!fs.existsSync(archiveDecisionsDir)) {
          fs.mkdirSync(archiveDecisionsDir, { recursive: true });
        }
        const archiveFilePath = path.join(archiveDecisionsDir, filename);
        writeAtomic(archiveFilePath, fullContent);
        newDecisions.push(`docs/memory/archive/decisions/${filename}`);
        updatedFiles.push(`docs/memory/archive/decisions/${filename}`);
      } else {
        writeAtomic(filePath, fullContent);
        newDecisions.push(`docs/memory/decisions/${filename}`);
        updatedFiles.push(`docs/memory/decisions/${filename}`);
      }
    }
  }

  // 2. Process Current State
  if (delta.current_state) {
    const currentStatePath = path.join(rootDir, CURRENT_STATE_FILE_REL);
    if (fs.existsSync(currentStatePath)) {
      let content = fs.readFileSync(currentStatePath, "utf-8");

      if (delta.current_state.current_feature) {
        content = safeLiteralReplace(
          content,
          /(- \*\*Current Focus\*\*: ).+/m,
          `- **Current Focus**: ${delta.current_state.current_feature}`
        );
      }

      if (delta.current_state.completed_in_session && delta.current_state.completed_in_session.length > 0) {
        const newProgress = delta.current_state.completed_in_session
          .map((c) => `- ${c}`)
          .join("\n");

        content = updateSectionBody(
          content,
          (hText) => /Recent Progress/i.test(hText),
          (body) => {
            const existingLines = body.split("\n").filter((l) => l.trim().length > 0);
            return `${newProgress}\n${existingLines.join("\n")}`.trim();
          }
        );
      }

      if (delta.current_state.next_immediate_steps && delta.current_state.next_immediate_steps.length > 0) {
        const nextStepsList = delta.current_state.next_immediate_steps
          .map((s) => `- [ ] ${s}`)
          .join("\n");

        content = updateSectionBody(
          content,
          (hText) => /Next Immediate Steps/i.test(hText),
          () => nextStepsList
        );
      }

      writeAtomic(currentStatePath, content);
      updatedFiles.push(CURRENT_STATE_FILE_REL);
    }
  }

  // 3. Process Tasks
  if (Array.isArray(delta.tasks) && delta.tasks.length > 0) {
    const tasksPath = path.join(rootDir, TASKS_FILE_REL);
    if (fs.existsSync(tasksPath)) {
      let tasksContent = fs.readFileSync(tasksPath, "utf-8");

      for (const t of delta.tasks) {
        const targetNorm = normalizeTaskName(t.task_name);

        if (t.action === "remove") {
          const lines = tasksContent.split("\n");
          const filtered = lines.filter((line) => {
            if (line.trim().startsWith("- [") && normalizeTaskName(line) === targetNorm) {
              return false;
            }
            return true;
          });
          tasksContent = filtered.join("\n");
        } else if (t.action === "complete") {
          const lines = tasksContent.split("\n");
          let found = false;
          const updatedLines = lines.map((line) => {
            if (line.trim().startsWith("- [") && normalizeTaskName(line) === targetNorm) {
              found = true;
              return `- [x] ${t.task_name}`;
            }
            return line;
          });

          if (!found) {
            tasksContent = updateSectionBody(
              tasksContent,
              (hText) => /Active Tasks/i.test(hText),
              (body) => `${body.trim()}\n- [x] ${t.task_name}`.trim()
            );
          } else {
            tasksContent = updatedLines.join("\n");
          }
        } else if (t.action === "add") {
          const lines = tasksContent.split("\n");
          const exists = lines.some(
            (line) => line.trim().startsWith("- [") && normalizeTaskName(line) === targetNorm
          );
          if (!exists) {
            tasksContent = updateSectionBody(
              tasksContent,
              (hText) => /Active Tasks/i.test(hText),
              (body) => `${body.trim()}\n- [ ] ${t.task_name}`.trim()
            );
          }
        }
      }

      writeAtomic(tasksPath, tasksContent);
      updatedFiles.push(TASKS_FILE_REL);
    }
  }

  // 4. Process Constraints
  if (Array.isArray(delta.constraints) && delta.constraints.length > 0) {
    const constraintsPath = path.join(rootDir, CONSTRAINTS_FILE_REL);
    if (fs.existsSync(constraintsPath)) {
      let constraintsContent = fs.readFileSync(constraintsPath, "utf-8");

      for (const c of delta.constraints) {
        const sourceMeta = c.source ? ` (source: ${c.source})` : "";
        const acceptedMeta = c.accepted_by || options.acceptedBy ? ` [accepted_by: ${c.accepted_by || options.acceptedBy}]` : "";
        const formatted = `- **${c.type === "hard" ? "Rule" : "Guideline"}**: ${c.rule}${sourceMeta}${acceptedMeta}`;

        const ruleLower = c.rule.trim().toLowerCase();
        const alreadyExists = constraintsContent.toLowerCase().includes(ruleLower);

        if (!alreadyExists) {
          const targetSection = c.type === "hard" ? /Hard Constraints/i : /Soft Guidelines/i;
          constraintsContent = updateSectionBody(
            constraintsContent,
            (hText) => targetSection.test(hText),
            (body) => `${body.trim()}\n${formatted}`.trim()
          );
        }
      }

      writeAtomic(constraintsPath, constraintsContent);
      updatedFiles.push(CONSTRAINTS_FILE_REL);
    }
  }

  // 5. Process Rejected Approaches
  if (Array.isArray(delta.rejected_approaches) && delta.rejected_approaches.length > 0) {
    const rejectedPath = path.join(rootDir, REJECTED_FILE_REL);
    if (fs.existsSync(rejectedPath)) {
      let rejectedContent = fs.readFileSync(rejectedPath, "utf-8");

      for (const r of delta.rejected_approaches) {
        const approachNorm = r.approach.trim().toLowerCase();
        if (!rejectedContent.toLowerCase().includes(approachNorm)) {
          const block = `\n### ${r.approach}\n- **Reason Rejected**: ${r.reason}\n`;
          rejectedContent = rejectedContent.trim() + "\n" + block;
        }
      }

      writeAtomic(rejectedPath, rejectedContent);
      updatedFiles.push(REJECTED_FILE_REL);
    }
  }

  // 6. Process Discoveries
  if (Array.isArray(delta.discoveries) && delta.discoveries.length > 0) {
    const discoveriesPath = path.join(rootDir, DISCOVERIES_FILE_REL);
    if (fs.existsSync(discoveriesPath)) {
      let discoveriesContent = fs.readFileSync(discoveriesPath, "utf-8");

      for (const d of delta.discoveries) {
        const discNorm = d.trim().toLowerCase();
        if (!discoveriesContent.toLowerCase().includes(discNorm)) {
          discoveriesContent = discoveriesContent.trim() + `\n- ${d}\n`;
        }
      }

      writeAtomic(discoveriesPath, discoveriesContent);
      updatedFiles.push(DISCOVERIES_FILE_REL);
    }
  }

  // 7. Update index
  buildIndex(rootDir);

  return {
    newDecisions,
    updatedFiles: Array.from(new Set(updatedFiles)),
  };
}
