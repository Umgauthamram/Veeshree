import fs from "node:fs";
import path from "node:path";
import { writeAtomic } from "../core/memory/atomic.js";
import { buildIndex } from "../core/indexer.js";
import { createMemorySnapshot } from "../core/snapshots/snapshot-manager.js";
import { importMemoryFromArchive } from "../core/transfer/export-import.js";
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

  const memoryExportBundle = {
    manifest: {
      format: "veeshree-memory-export" as const,
      version: "1.0.0",
      exported_at: new Date().toISOString(),
    },
    files: Object.entries(bundle).map(([p, content]) => ({ path: p, content })),
  };

  const { restoredFiles, proposal } = importMemoryFromArchive(rootDir, memoryExportBundle, { yes: options.yes });

  if (proposal) {
    logger.info(`Import staged in review queue as proposal: ${logger.bold(proposal.id)} [Risk: ${proposal.risk.toUpperCase()}]`);
    logger.info(`Run 'vee accept ${proposal.id}' to inspect and apply, or re-run with --yes to import directly.`);
  }

  if (restoredFiles.length > 0) {
    logger.success(`Successfully imported ${restoredFiles.length} memory file(s).`);
  }

  return { proposal, importedFiles: restoredFiles.length };
}
