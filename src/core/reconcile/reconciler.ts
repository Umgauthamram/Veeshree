import fs from "node:fs";
import path from "node:path";
import type { ExtractionDelta } from "../../schemas/extraction.schema.js";
import { writeAtomic } from "../memory/atomic.js";
import { withLock } from "../memory/lock.js";
import { parseDecisionFrontmatter, stringifyMarkdownFrontmatter } from "../memory/frontmatter.js";
import {
  parseSections,
  serializeSections,
  slugifyTitle,
  getNextAdrNumber,
  updateSectionBody,
  normalizeTaskName,
  safeLiteralReplace,
} from "../memory/section-editor.js";
import { createMemorySnapshot } from "../snapshots/snapshot-manager.js";
import { calculateNormalizedFileHash } from "../drift/hasher.js";
import { sanitizeRelativePath } from "../../utils/paths.js";
import {
  DECISIONS_DIR_REL,
  ARCHIVE_DECISIONS_DIR_REL,
  CURRENT_STATE_FILE_REL,
  TASKS_FILE_REL,
  CONSTRAINTS_FILE_REL,
  REJECTED_FILE_REL,
  DISCOVERIES_FILE_REL,
} from "../../utils/constants.js";

export interface ReconcileOptions {
  source?: string;
  acceptedBy?: string;
  createSnapshot?: boolean;
}

export interface ReconcileResult {
  newDecisions: string[];
  updatedFiles: string[];
}

/**
 * Reconciles an accepted extraction delta into docs/memory markdown files.
 * Uses atomic writes, process locking, section-aware editing, and pre-apply snapshots.
 */
export async function reconcileExtractionSafe(
  delta: ExtractionDelta,
  rootDir: string = process.cwd(),
  options: ReconcileOptions = {}
): Promise<ReconcileResult> {
  return withLock(rootDir, () => {
    // 1. Take a snapshot before applying changes for undo
    if (options.createSnapshot !== false) {
      try {
        createMemorySnapshot(rootDir, `Reconcile delta (${options.source || "manual"})`);
      } catch {
        // If memory dir does not exist yet (fresh repo), ignore
      }
    }

    const updatedFiles: string[] = [];
    const newDecisions: string[] = [];

    // 2. Process Decisions
    if (Array.isArray(delta.decisions) && delta.decisions.length > 0) {
      const decisionsDir = path.join(rootDir, DECISIONS_DIR_REL);
      if (!fs.existsSync(decisionsDir)) {
        fs.mkdirSync(decisionsDir, { recursive: true });
      }

      for (const dec of delta.decisions) {
        const nextNum = getNextAdrNumber(rootDir);
        const slug = slugifyTitle(dec.title);
        const filename = `${nextNum}-${slug}.md`;
        const filePath = path.join(decisionsDir, filename);

        // Compute baseline hashes for linked files
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
          // Mark superseded ADR
          markAdrSuperseded(dec.supersedes, `${nextNum}-${slug}`, rootDir);
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

    // 3. Process Current State
    if (delta.current_state) {
      const currentStatePath = path.join(rootDir, CURRENT_STATE_FILE_REL);
      if (fs.existsSync(currentStatePath)) {
        let content = fs.readFileSync(currentStatePath, "utf-8");

        // Focus update
        if (delta.current_state.current_feature) {
          content = safeLiteralReplace(
            content,
            /(- \*\*Current Focus\*\*: ).+/m,
            `- **Current Focus**: ${delta.current_state.current_feature}`
          );
        }

        // Section 3: Recent Progress (prepend completed items)
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

        // Section 4: Next Immediate Steps (replace only section 4 body)
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

    // 4. Process Tasks (add, complete, remove)
    if (Array.isArray(delta.tasks) && delta.tasks.length > 0) {
      const tasksPath = path.join(rootDir, TASKS_FILE_REL);
      if (fs.existsSync(tasksPath)) {
        let tasksContent = fs.readFileSync(tasksPath, "utf-8");

        for (const t of delta.tasks) {
          const targetNorm = normalizeTaskName(t.task_name);

          if (t.action === "remove") {
            // Remove line if matches target task name
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
              // Add as completed under Active Tasks
              tasksContent = updateSectionBody(
                tasksContent,
                (hText) => /Active Tasks/i.test(hText),
                (body) => `${body.trim()}\n- [x] ${t.task_name}`.trim()
              );
            } else {
              tasksContent = updatedLines.join("\n");
            }
          } else if (t.action === "add") {
            // Normalized dedupe using exact line match
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

    // 5. Process Constraints
    if (Array.isArray(delta.constraints) && delta.constraints.length > 0) {
      const constraintsPath = path.join(rootDir, CONSTRAINTS_FILE_REL);
      if (fs.existsSync(constraintsPath)) {
        let constraintsContent = fs.readFileSync(constraintsPath, "utf-8");

        for (const c of delta.constraints) {
          const sourceMeta = c.source ? ` (source: ${c.source})` : "";
          const acceptedMeta = c.accepted_by || options.acceptedBy ? ` [accepted_by: ${c.accepted_by || options.acceptedBy}]` : "";
          const formatted = `- **${c.type === "hard" ? "Rule" : "Guideline"}**: ${c.rule}${sourceMeta}${acceptedMeta}`;

          // Normalized dedupe
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

    // 6. Process Rejected Approaches
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

    // 7. Process Discoveries
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

    return {
      newDecisions,
      updatedFiles: Array.from(new Set(updatedFiles)),
    };
  });
}

function markAdrSuperseded(oldAdrIdentifier: string, newAdrId: string, rootDir: string): void {
  const dirs = [
    path.join(rootDir, DECISIONS_DIR_REL),
    path.join(rootDir, ARCHIVE_DECISIONS_DIR_REL),
  ];

  for (const dir of dirs) {
    if (!fs.existsSync(dir)) continue;
    const files = fs.readdirSync(dir).filter((f) => f.endsWith(".md"));

    for (const f of files) {
      const fullPath = path.join(dir, f);
      const raw = fs.readFileSync(fullPath, "utf-8");
      const { data, content } = parseDecisionFrontmatter(raw);

      if (data.id === oldAdrIdentifier || path.basename(f, ".md") === oldAdrIdentifier) {
        data.status = "superseded";
        data.superseded_by = newAdrId;
        const updatedContent = stringifyMarkdownFrontmatter(data as any, content);
        writeAtomic(fullPath, updatedContent);
      }
    }
  }
}
