import fs from "node:fs";
import path from "node:path";
import { writeAtomic } from "../core/memory/atomic.js";
import { buildIndex } from "../core/indexer.js";
import { sanitizeRelativePath } from "../utils/paths.js";
import { logger } from "../utils/logger.js";
import { VeeError } from "../utils/errors.js";

export function handleImportCommand(filePath: string, rootDir: string = process.cwd()): void {
  if (!filePath || !fs.existsSync(filePath)) {
    throw new VeeError(`Import file not found: ${filePath}`, "ERR_FILE_NOT_FOUND");
  }

  const raw = fs.readFileSync(filePath, "utf-8");
  let bundle: Record<string, string> = {};

  if (raw.trim().startsWith("{")) {
    try {
      bundle = JSON.parse(raw);
    } catch (err: any) {
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
}
