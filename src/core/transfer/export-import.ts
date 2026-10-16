import fs from "node:fs";
import path from "node:path";
import { findMarkdownFiles } from "../indexer.js";
import { MEMORY_DIR_REL } from "../../utils/constants.js";
import { normalizePosix, sanitizeRelativePath } from "../../utils/paths.js";
import { writeAtomic } from "../memory/atomic.js";
import { buildIndex } from "../indexer.js";

export interface MemoryExportBundle {
  manifest: {
    format: "veeshree-memory-export";
    version: "1.0.0";
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
      format: "veeshree-memory-export",
      version: "1.0.0",
      exported_at: new Date().toISOString(),
    },
    files: bundleFiles,
  };
}

export function importMemoryFromArchive(
  rootDir: string = process.cwd(),
  bundle: MemoryExportBundle
): { restoredFiles: string[] } {
  const restoredFiles: string[] = [];

  for (const file of bundle.files) {
    const safeRel = sanitizeRelativePath(file.path);
    if (!safeRel.startsWith("docs/memory/")) {
      continue;
    }
    const fullPath = path.join(rootDir, safeRel);
    writeAtomic(fullPath, file.content);
    restoredFiles.push(safeRel);
  }

  buildIndex(rootDir);
  return { restoredFiles };
}
