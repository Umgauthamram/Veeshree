import fs from "node:fs";
import path from "node:path";
import { parseDecisionFrontmatter, stringifyMarkdownFrontmatter } from "../memory/frontmatter.js";
import { writeAtomic } from "../memory/atomic.js";
import { calculateNormalizedFileHash } from "./hasher.js";
import { sanitizeRelativePath } from "../../utils/paths.js";
import { DECISIONS_DIR_REL, ARCHIVE_DECISIONS_DIR_REL } from "../../utils/constants.js";
import { VeeError } from "../../utils/errors.js";

export interface BaselineAcceptResult {
  updatedAdrs: string[];
  totalUpdatedFiles: number;
}

/**
 * Explicitly updates and commits baseline SHA-256 hashes in ADR frontmatter
 */
export function acceptBaselines(
  target: string,
  rootDir: string = process.cwd()
): BaselineAcceptResult {
  const dirs = [
    path.join(rootDir, DECISIONS_DIR_REL),
    path.join(rootDir, ARCHIVE_DECISIONS_DIR_REL),
  ];

  const acceptAll = target === "--all" || target === "all";
  const updatedAdrs: string[] = [];
  let totalUpdatedFiles = 0;

  for (const dir of dirs) {
    if (!fs.existsSync(dir)) continue;

    const files = fs.readdirSync(dir).filter((f) => f.endsWith(".md"));
    for (const f of files) {
      const fullPath = path.join(dir, f);
      const fileId = path.basename(f, ".md");
      const rawContent = fs.readFileSync(fullPath, "utf-8");
      const { data, content } = parseDecisionFrontmatter(rawContent);

      const adrId = data.id || fileId;
      if (!acceptAll && adrId !== target && fileId !== target) {
        continue;
      }

      const linked = Array.isArray(data.linked_files) ? data.linked_files : [];
      let adrChanged = false;

      const newLinkedFiles = linked.map((entry) => {
        let entryPath: string;
        let existingHash: string | undefined;

        if (typeof entry === "string") {
          entryPath = entry;
        } else {
          entryPath = entry.path;
          existingHash = entry.sha256;
        }

        const safeRel = sanitizeRelativePath(entryPath);
        const absoluteLinked = path.join(rootDir, safeRel);
        const currentHash = calculateNormalizedFileHash(absoluteLinked);

        if (currentHash && currentHash !== existingHash) {
          adrChanged = true;
          totalUpdatedFiles++;
          return { path: safeRel, sha256: currentHash };
        }

        return { path: safeRel, sha256: currentHash || existingHash };
      });

      if (adrChanged) {
        data.linked_files = newLinkedFiles;
        const serialized = stringifyMarkdownFrontmatter(data as any, content);
        writeAtomic(fullPath, serialized);
        updatedAdrs.push(adrId);
      }
    }
  }

  if (!acceptAll && updatedAdrs.length === 0) {
    throw new VeeError(`ADR '${target}' not found or has no drifted files to accept.`, "ERR_FILE_NOT_FOUND");
  }

  return {
    updatedAdrs,
    totalUpdatedFiles,
  };
}
