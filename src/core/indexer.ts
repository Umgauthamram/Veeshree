import fs from "node:fs";
import path from "node:path";
import MiniSearch from "minisearch";
import type { IndexDocument, VeeshreeIndexData } from "../types/index.js";
import { parseDecisionFrontmatter } from "./memory/frontmatter.js";
import { calculateNormalizedFileHash } from "./drift/hasher.js";
import { sanitizeRelativePath, normalizePosix } from "../utils/paths.js";
import { writeAtomic } from "./memory/atomic.js";
import { MEMORY_DIR_REL, INDEX_FILE_REL, VEE_DIR_REL } from "../utils/constants.js";

/**
 * Calculates normalized SHA-256 hash of a file on disk
 */
export function calculateFileHash(filePath: string): string | null {
  return calculateNormalizedFileHash(filePath);
}

/**
 * Recursively find all .md files in a directory
 */
export function findMarkdownFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const results: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findMarkdownFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      results.push(fullPath);
    }
  }
  return results;
}

/**
 * Parses a markdown memory file into an IndexDocument using safe YAML frontmatter
 */
export function parseMemoryFile(
  filePath: string,
  rootDir: string,
  previousIndex?: VeeshreeIndexData
): IndexDocument {
  const relPath = normalizePosix(path.relative(rootDir, filePath));
  const rawContent = fs.readFileSync(filePath, "utf-8");
  const stats = fs.statSync(filePath);

  const { data, content } = parseDecisionFrontmatter(rawContent);

  // Determine document type
  let docType: IndexDocument["type"] = "other";
  if (relPath.includes("archive/decisions") || relPath.includes("archive\\decisions")) {
    docType = "archived_decision";
  } else if (relPath.includes("decisions/")) {
    docType = "decision";
  } else if (relPath.endsWith("current-state.md")) {
    docType = "state";
  } else if (relPath.endsWith("tasks.md")) {
    docType = "tasks";
  } else if (relPath.endsWith("constraints.md")) {
    docType = "constraints";
  } else if (relPath.endsWith("rejected.md")) {
    docType = "rejected";
  } else if (relPath.endsWith("discoveries.md")) {
    docType = "discoveries";
  }

  // Derive title
  let title = data.title;
  if (!title) {
    const firstH1 = content.match(/^#\s+(.+)$/m);
    title = firstH1 && firstH1[1] ? firstH1[1].trim() : path.basename(filePath, ".md");
  }

  const id = data.id || path.basename(filePath, ".md");

  // Check linked files and calculate hashes & drift
  const linked = Array.isArray(data.linked_files) ? data.linked_files : [];
  const linkedFiles: string[] = [];
  const linkedHashes: Record<string, string> = {};
  let isStale = false;

  const prevDoc = previousIndex?.documents.find(
    (d) => d.id === id || d.path === relPath || d.title === title
  );

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
      const safeRel = sanitizeRelativePath(entryPath);
      linkedFiles.push(safeRel);
      const absoluteLinked = path.join(rootDir, safeRel);
      const hash = calculateNormalizedFileHash(absoluteLinked);

      if (hash) {
        linkedHashes[safeRel] = hash;
        if (baselineHash) {
          if (baselineHash !== hash) {
            isStale = true;
          }
        } else if (prevDoc?.linked_hashes?.[safeRel]) {
          if (prevDoc.linked_hashes[safeRel] !== hash) {
            isStale = true;
          }
        }
      } else {
        isStale = true;
      }
    } catch {
      isStale = true;
    }
  }

  return {
    id,
    path: relPath,
    title,
    type: docType,
    status: data.status || "active",
    tags: Array.isArray(data.tags) ? data.tags : [],
    linked_files: linkedFiles,
    linked_hashes: linkedHashes,
    stale: isStale,
    content,
    last_modified: stats.mtime.toISOString(),
  };
}

/**
 * Builds and updates the index cache for the workspace
 */
export function buildIndex(rootDir: string = process.cwd()): VeeshreeIndexData {
  const memoryDir = path.join(rootDir, MEMORY_DIR_REL);
  const mdFiles = findMarkdownFiles(memoryDir);

  const indexPath = path.join(rootDir, INDEX_FILE_REL);
  let previousIndex: VeeshreeIndexData | undefined;
  if (fs.existsSync(indexPath)) {
    try {
      previousIndex = JSON.parse(fs.readFileSync(indexPath, "utf-8"));
    } catch {
      // Ignore corrupted index cache
    }
  }

  const documents: IndexDocument[] = [];

  for (const file of mdFiles) {
    const doc = parseMemoryFile(file, rootDir, previousIndex);
    documents.push(doc);
  }

  const indexData: VeeshreeIndexData = {
    last_updated: new Date().toISOString(),
    documents,
  };

  const veeDir = path.join(rootDir, VEE_DIR_REL);
  if (!fs.existsSync(veeDir)) {
    fs.mkdirSync(veeDir, { recursive: true });
  }
  writeAtomic(indexPath, JSON.stringify(indexData, null, 2));

  return indexData;
}

/**
 * Creates and initializes MiniSearch instance loaded with indexed documents
 */
export function createSearchEngine(documents: IndexDocument[]): MiniSearch<IndexDocument> {
  const miniSearch = new MiniSearch<IndexDocument>({
    fields: ["title", "content", "tags", "path"],
    storeFields: [
      "id",
      "title",
      "path",
      "type",
      "status",
      "tags",
      "linked_files",
      "stale",
      "content",
    ],
    searchOptions: {
      boost: { title: 2, tags: 1.5, content: 1 },
      prefix: true,
      fuzzy: 0.2,
    },
  });

  miniSearch.addAll(documents);
  return miniSearch;
}

/**
 * Loads index cache from disk or rebuilds if missing
 */
export function loadOrBuildIndex(rootDir: string = process.cwd()): VeeshreeIndexData {
  const indexPath = path.join(rootDir, INDEX_FILE_REL);
  if (fs.existsSync(indexPath)) {
    try {
      return JSON.parse(fs.readFileSync(indexPath, "utf-8"));
    } catch {
      return buildIndex(rootDir);
    }
  }
  return buildIndex(rootDir);
}
