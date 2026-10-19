import fs from "node:fs";
import path from "node:path";
import { parseDecisionFrontmatter } from "../memory/frontmatter.js";
import { calculateNormalizedFileHash } from "./hasher.js";
import { sanitizeRelativePath, normalizePosix } from "../../utils/paths.js";
import { DECISIONS_DIR_REL, ARCHIVE_DECISIONS_DIR_REL } from "../../utils/constants.js";

export type FileDriftStatus = "ok" | "drifted" | "missing" | "invalid_path";

export interface LinkedFileDrift {
  path: string;
  baselineHash?: string;
  currentHash?: string;
  status: FileDriftStatus;
}

export interface AdrDriftRecord {
  id: string;
  title: string;
  path: string;
  status: "active" | "superseded" | "proposed";
  files: LinkedFileDrift[];
  isDrifted: boolean;
}

export interface WorkspaceDriftReport {
  timestamp: string;
  records: AdrDriftRecord[];
  totalRecords: number;
  driftedRecordsCount: number;
  hasDrift: boolean;
}

/**
 * Checks live drift status by comparing disk code hashes with committed baseline hashes in ADR frontmatter.
 * Never relies on a local gitignored cache to detect drift!
 */
export function checkWorkspaceDrift(rootDir: string = process.cwd(), specificId?: string): WorkspaceDriftReport {
  const dirs = [
    path.join(rootDir, DECISIONS_DIR_REL),
    path.join(rootDir, ARCHIVE_DECISIONS_DIR_REL),
  ];

  const records: AdrDriftRecord[] = [];

  for (const dir of dirs) {
    if (!fs.existsSync(dir)) continue;

    const files = fs.readdirSync(dir).filter((f) => f.endsWith(".md"));
    for (const f of files) {
      const fullPath = path.join(dir, f);
      const relPath = normalizePosix(path.relative(rootDir, fullPath));
      const content = fs.readFileSync(fullPath, "utf-8");
      const { data } = parseDecisionFrontmatter(content);

      const id = data.id || path.basename(f, ".md");
      if (specificId && id !== specificId && path.basename(f, ".md") !== specificId) {
        continue;
      }

      const fileStatuses: LinkedFileDrift[] = [];
      let adrIsDrifted = false;

      const linked = Array.isArray(data.linked_files) ? data.linked_files : [];
      for (const entry of linked) {
        let entryPath: string;
        let baselineHash: string | undefined;

        if (typeof entry === "string") {
          entryPath = entry;
        } else {
          entryPath = entry.path;
          baselineHash = entry.sha256;
        }

        try {
          // Sanitize path (rejects absolute or directory traversal)
          const safeRel = sanitizeRelativePath(entryPath);
          const absoluteLinked = path.join(rootDir, safeRel);

          const currentHash = calculateNormalizedFileHash(absoluteLinked);

          let status: FileDriftStatus = "ok";
          if (currentHash === null) {
            status = "missing";
            adrIsDrifted = true;
          } else if (!baselineHash || baselineHash !== currentHash) {
            status = "drifted";
            adrIsDrifted = true;
          }

          fileStatuses.push({
            path: safeRel,
            baselineHash,
            currentHash: currentHash || undefined,
            status,
          });
        } catch {
          // Bad or invalid path marked without crashing drift check (Phase 2.4)
          adrIsDrifted = true;
          fileStatuses.push({
            path: entryPath,
            baselineHash,
            status: "invalid_path",
          });
        }
      }

      records.push({
        id,
        title: data.title || id,
        path: relPath,
        status: data.status || "active",
        files: fileStatuses,
        isDrifted: adrIsDrifted,
      });
    }
  }

  const driftedRecordsCount = records.filter((r) => r.isDrifted).length;

  return {
    timestamp: new Date().toISOString(),
    records,
    totalRecords: records.length,
    driftedRecordsCount,
    hasDrift: driftedRecordsCount > 0,
  };
}
