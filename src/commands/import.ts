import fs from "node:fs";
import path from "node:path";
import { writeAtomic } from "../core/memory/atomic.js";
import { buildIndex } from "../core/indexer.js";
import { createMemorySnapshot } from "../core/snapshots/snapshot-manager.js";
import { createProposal } from "../core/proposals/queue.js";
import { parseDecisionFrontmatter } from "../core/memory/frontmatter.js";
import { sanitizeRelativePath } from "../utils/paths.js";
import { logger } from "../utils/logger.js";
import { VeeError } from "../utils/errors.js";
import type { Proposal } from "../schemas/proposal.schema.js";
import type { ExtractionDelta } from "../schemas/extraction.schema.js";

export interface ImportOptions {
  yes?: boolean;
}

export function handleImportCommand(
  filePath: string,
  options: ImportOptions = {},
  rootDir: string = process.cwd()
): { proposal?: Proposal; importedFiles: number } {
  if (!filePath || !fs.existsSync(filePath)) {
    throw new VeeError(`Import file not found: ${filePath}`, "ERR_FILE_NOT_FOUND");
  }

  // 1. Create safety snapshot before any changes
  try {
    createMemorySnapshot(rootDir, `Pre-import snapshot from ${path.basename(filePath)}`);
  } catch {
    // If docs/memory doesn't exist yet, proceed
  }

  const raw = fs.readFileSync(filePath, "utf-8");
  let bundle: Record<string, string> = {};

  if (raw.trim().startsWith("{")) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed.manifest) {
        if (parsed.manifest.format !== "veeshree-memory-export") {
          throw new VeeError("Invalid bundle manifest format. Expected 'veeshree-memory-export'.", "ERR_INVALID_ARGS");
        }
      }
      if (parsed.files && Array.isArray(parsed.files)) {
        for (const f of parsed.files) {
          if (f.path && typeof f.content === "string") {
            bundle[f.path] = f.content;
          }
        }
      } else {
        bundle = parsed;
      }
    } catch (err: any) {
      if (err instanceof VeeError) throw err;
      throw new VeeError(`Failed to parse JSON bundle: ${err.message}`, "ERR_INVALID_ARGS");
    }
  } else {
    // Markdown bundle parsing
    const regex = /<!-- FILE: ([\s\S]+?) -->\n([\s\S]*?)<!-- END FILE -->/g;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(raw)) !== null) {
      const relPath = match[1]?.trim();
      const content = match[2] || "";
      if (relPath) {
        bundle[relPath] = content;
      }
    }
  }

  const keys = Object.keys(bundle);
  if (keys.length === 0) {
    throw new VeeError("No valid memory documents detected in import bundle.", "ERR_INVALID_ARGS");
  }

  logger.title(`Importing Memory Bundle (${keys.length} files)`);

  // If --yes flag is passed, apply directly
  if (options.yes) {
    for (const [relPath, content] of Object.entries(bundle)) {
      const safeRel = sanitizeRelativePath(relPath);
      if (!safeRel.startsWith("docs/memory/")) {
        logger.warn(`Skipping untrusted destination path outside docs/memory: ${safeRel}`);
        continue;
      }
      const fullPath = path.join(rootDir, safeRel);
      writeAtomic(fullPath, content);
    }

    buildIndex(rootDir);
    logger.success(`Successfully imported ${keys.length} memory file(s).`);
    return { importedFiles: keys.length };
  }

  // If --yes not passed, route decisions and constraints through the proposal queue
  const delta: ExtractionDelta = {
    decisions: [],
    current_state: {
      current_feature: `Imported from ${path.basename(filePath)}`,
      completed_in_session: [],
      next_immediate_steps: [],
    },
    tasks: [],
    constraints: [],
    rejected_approaches: [],
    discoveries: [],
  };

  for (const [relPath, content] of Object.entries(bundle)) {
    const safeRel = sanitizeRelativePath(relPath);
    if (!safeRel.startsWith("docs/memory/")) continue;

    if (safeRel.includes("/decisions/")) {
      const { data, content: body } = parseDecisionFrontmatter(content);
      delta.decisions.push({
        title: data.title || path.basename(safeRel, ".md"),
        decision: body.slice(0, 500).trim(),
        reason: "Imported from external memory bundle",
        alternatives_considered: (data as any).alternatives_considered || [],
        linked_files: (data.linked_files || []).map((f) => (typeof f === "string" ? f : f.path)),
        tags: data.tags || ["import"],
        status: data.status || "active",
      });
    } else if (safeRel.endsWith("constraints.md")) {
      const lines = content.split("\n").filter((l) => l.trim().startsWith("-"));
      for (const line of lines) {
        const rule = line.replace(/^-\s*/, "").trim();
        if (rule) {
          delta.constraints.push({ rule, type: "hard", source: "import" });
        }
      }
    }
  }

  const proposal = createProposal("manual", delta, "import", rootDir);
  logger.info(`Import staged in review queue as proposal: ${logger.bold(proposal.id)} [Risk: ${proposal.risk.toUpperCase()}]`);
  logger.info(`Run 'vee accept ${proposal.id}' to inspect and apply, or re-run with --yes to import directly.`);

  return { proposal, importedFiles: keys.length };
}
