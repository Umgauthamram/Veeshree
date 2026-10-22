import fs from "node:fs";
import path from "node:path";
import { findMarkdownFiles } from "../indexer.js";
import { MEMORY_DIR_REL, VEESHREE_VERSION } from "../../utils/constants.js";
import { normalizePosix, sanitizeRelativePath } from "../../utils/paths.js";
import { writeAtomic } from "../memory/atomic.js";
import { buildIndex } from "../indexer.js";

export interface MemoryExportBundle {
  manifest: {
    format: "veeshree-memory-export" | "veeshree-memory-markdown-export";
    version: string;
    exported_at: string;
  };
  files: Array<{
    path: string;
    content: string;
  }>;
}

export function exportMemoryToArchive(
  rootDir: string = process.cwd(),
  format: "json" | "md" = "json"
): MemoryExportBundle {
  const memoryDir = path.join(rootDir, MEMORY_DIR_REL);
  const files = findMarkdownFiles(memoryDir);

  const bundleFiles = files.map((f) => ({
    path: normalizePosix(path.relative(rootDir, f)),
    content: fs.readFileSync(f, "utf-8"),
  }));

  return {
    manifest: {
      format: format === "md" ? "veeshree-memory-markdown-export" : "veeshree-memory-export",
      version: VEESHREE_VERSION,
      exported_at: new Date().toISOString(),
    },
    files: bundleFiles,
  };
}

import { createMemorySnapshot } from "../snapshots/snapshot-manager.js";
import { VeeError } from "../../utils/errors.js";
import { scoreProposalRisk } from "../proposals/risk.js";
import { createProposal } from "../proposals/queue.js";
import { parseDecisionFrontmatter } from "../memory/frontmatter.js";
import type { Proposal } from "../../schemas/proposal.schema.js";
import type { ExtractionDelta } from "../../schemas/extraction.schema.js";

export interface ImportMemoryArchiveOptions {
  yes?: boolean;
}

export function importMemoryFromArchive(
  rootDir: string = process.cwd(),
  bundle: MemoryExportBundle,
  options: ImportMemoryArchiveOptions = {}
): { restoredFiles: string[]; proposal?: Proposal } {
  if (!bundle || !bundle.manifest || bundle.manifest.format !== "veeshree-memory-export") {
    throw new VeeError(
      "Invalid memory export bundle: missing or invalid manifest format",
      "ERR_INVALID_ARGS"
    );
  }

  // Safety snapshot before applying imported changes (undo support)
  try {
    createMemorySnapshot(
      rootDir,
      `Pre-import snapshot (bundle v${bundle.manifest.version || "1.0.0"})`
    );
  } catch {
    // If docs/memory doesn't exist yet, proceed
  }

  const restoredFiles: string[] = [];
  const delta: ExtractionDelta = {
    decisions: [],
    current_state: {
      current_feature: "Imported memory delta",
      completed_in_session: [],
      next_immediate_steps: [],
    },
    tasks: [],
    constraints: [],
    rejected_approaches: [],
    discoveries: [],
  };

  const constraintsFilePath = path.join(rootDir, "docs", "memory", "constraints.md");
  const existingConstraintsContent = fs.existsSync(constraintsFilePath)
    ? fs.readFileSync(constraintsFilePath, "utf-8")
    : null;

  for (const file of bundle.files || []) {
    const safeRel = sanitizeRelativePath(file.path);
    if (!safeRel.startsWith("docs/memory/")) {
      continue;
    }

    const fullPath = path.join(rootDir, safeRel);

    // If --yes flag is explicitly provided, bypass proposal review and write directly
    if (options.yes) {
      writeAtomic(fullPath, file.content);
      restoredFiles.push(safeRel);
      continue;
    }

    // 1. Constraints review
    if (safeRel === "docs/memory/constraints.md" || safeRel.endsWith("constraints.md")) {
      const lines = file.content.split("\n").filter((l) => l.trim().startsWith("-"));
      const extractedConstraints = lines
        .map((l) => ({
          rule: l.replace(/^-\s*(\*\*[^*]+\*\*:\s*)?/, "").trim(),
          type: "hard" as const,
          source: "import",
        }))
        .filter((c) => c.rule.length > 0);

      const constraintDelta: Partial<ExtractionDelta> = {
        constraints:
          extractedConstraints.length > 0
            ? extractedConstraints
            : [{ rule: file.content.trim(), type: "hard", source: "import" }],
      };

      const { flags } = scoreProposalRisk(constraintDelta);
      const hasSuspiciousPatterns = flags.some((f) => f.startsWith("suspicious_pattern:"));
      const isExistingDifferent =
        existingConstraintsContent !== null &&
        existingConstraintsContent.trim() !== file.content.trim();

      // If malicious/suspicious pattern found OR modifying existing constraints without --yes, route through proposal
      if (hasSuspiciousPatterns || isExistingDifferent || existingConstraintsContent !== null) {
        delta.constraints!.push(...constraintDelta.constraints!);
        continue; // DO NOT write to constraints.md!
      } else {
        // Clean baseline restore into empty memory directory
        writeAtomic(fullPath, file.content);
        restoredFiles.push(safeRel);
        continue;
      }
    }

    // 2. ADR review
    if (safeRel.includes("/decisions/")) {
      const { data, content: body } = parseDecisionFrontmatter(file.content);
      const decItem = {
        title: data.title || path.basename(safeRel, ".md"),
        decision: body.slice(0, 1000).trim(),
        reason: "Imported from external memory bundle",
        alternatives_considered:
          (data as { alternatives_considered?: string[] }).alternatives_considered || [],
        linked_files: (data.linked_files || []).map((f) => (typeof f === "string" ? f : f.path)),
        tags: data.tags || ["import"],
        status: data.status || "active",
        supersedes: data.supersedes,
      };

      const decDelta: Partial<ExtractionDelta> = {
        decisions: [decItem],
      };

      const { flags } = scoreProposalRisk(decDelta);
      const hasFlaggedPatterns = flags.length > 0;

      if (hasFlaggedPatterns) {
        delta.decisions!.push(decItem);
        continue; // DO NOT write to decisions dir directly!
      } else {
        writeAtomic(fullPath, file.content);
        restoredFiles.push(safeRel);
        continue;
      }
    }

    // 3. Regular non-security files (tasks, current-state, rejected, discoveries)
    writeAtomic(fullPath, file.content);
    restoredFiles.push(safeRel);
  }

  let proposal: Proposal | undefined;
  const hasPendingProposals =
    (delta.constraints && delta.constraints.length > 0) ||
    (delta.decisions && delta.decisions.length > 0);

  if (hasPendingProposals) {
    proposal = createProposal("manual", delta, "import", rootDir);
  }

  buildIndex(rootDir);
  return { restoredFiles, proposal };
}
