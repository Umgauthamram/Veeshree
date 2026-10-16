import fs from "node:fs";
import path from "node:path";
import { findMarkdownFiles } from "../core/indexer.js";
import { MEMORY_DIR_REL } from "../utils/constants.js";
import { normalizePosix } from "../utils/paths.js";
import { logger } from "../utils/logger.js";

export function handleExportCommand(
  options: { format?: "json" | "md" } = {},
  rootDir: string = process.cwd()
): void {
  const memoryDir = path.join(rootDir, MEMORY_DIR_REL);
  if (!fs.existsSync(memoryDir)) {
    logger.error("No docs/memory directory found to export.");
    return;
  }

  const files = findMarkdownFiles(memoryDir);
  const bundle: Record<string, string> = {};

  for (const f of files) {
    const rel = normalizePosix(path.relative(rootDir, f));
    bundle[rel] = fs.readFileSync(f, "utf-8");
  }

  const format = options.format || "json";

  if (format === "json") {
    process.stdout.write(JSON.stringify(bundle, null, 2) + "\n");
  } else {
    // Single markdown bundle
    const parts: string[] = [];
    for (const [relPath, content] of Object.entries(bundle)) {
      parts.push(`<!-- FILE: ${relPath} -->\n${content}\n<!-- END FILE -->`);
    }
    process.stdout.write(parts.join("\n\n") + "\n");
  }
}
