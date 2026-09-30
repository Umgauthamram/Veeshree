import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import matter from "gray-matter";
import MiniSearch from "minisearch";
import type { IndexDocument, VeeshreeIndexData, DecisionFrontmatter } from "../types/index.js";
import {
  MEMORY_DIR_REL,
  DECISIONS_DIR_REL,
  ARCHIVE_DIR_REL,
  ARCHIVE_DECISIONS_DIR_REL,
  INDEX_FILE_REL,
  VEE_DIR_REL,
} from "../utils/constants.js";

/**
 * Calculates SHA-256 hash of a file on disk
 */
export function calculateFileHash(filePath: string): string | null {
  if (!fs.existsSync(filePath)) {
    return null;
  }
  try {
    const fileBuffer = fs.readFileSync(filePath);
    return crypto.createHash("sha256").update(fileBuffer).digest("hex");
  } catch {
    return null;
  }
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
 * Parses a markdown memory file into an IndexDocument
 */
export function parseMemoryFile(filePath: string, rootDir: string): IndexDocument {
  const relPath = path.relative(rootDir, filePath).replace(/\\/g, "/");
  const rawContent = fs.readFileSync(filePath, "utf-8");
  const stats = fs.statSync(filePath);

  let parsed: matter.GrayMatterFile<string>;
  try {
    parsed = matter(rawContent);
  } catch {
    parsed = { data: {}, content: rawContent } as any;
  }

  const data = (parsed.data || {}) as DecisionFrontmatter;
  const content = parsed.content.trim();

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
    title = firstH1 ? firstH1[1].trim() : path.basename(filePath, ".md");
  }

  // ID derivation
  const id = data.id || `doc-${relPath.replace(/[^a-zA-Z0-9_-]/g, "-")}`;

  // Check linked files and calculate hashes & drift
  const linkedFiles: string[] = Array.isArray(data.linked_files) ? data.linked_files : [];
  const linkedHashes: Record<string, string> = {};
  let isStale = false;

  for (const linkedRel of linkedFiles) {
    const absoluteLinkedPath = path.isAbsolute(linkedRel) ? linkedRel : path.join(rootDir, linkedRel);
    const hash = calculateFileHash(absoluteLinkedPath);
    if (hash) {
      linkedHashes[linkedRel] = hash;
    } else {
      // Linked file does not exist or was deleted -> flag as stale
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
 * Builds and updates the index for the workspace
 */
export function buildIndex(rootDir: string = process.cwd()): VeeshreeIndexData {
  const memoryDir = path.join(rootDir, MEMORY_DIR_REL);
  const mdFiles = findMarkdownFiles(memoryDir);

  // Load existing index if available to check previous hashes
  const indexPath = path.join(rootDir, INDEX_FILE_REL);
  let oldDocsMap: Record<string, IndexDocument> = {};
  if (fs.existsSync(indexPath)) {
    try {
      const oldIndex: VeeshreeIndexData = JSON.parse(fs.readFileSync(indexPath, "utf-8"));
      for (const doc of oldIndex.documents) {
        oldDocsMap[doc.path] = doc;
      }
    } catch {
      // ignore
    }
  }

  const documents: IndexDocument[] = [];

  for (const file of mdFiles) {
    const doc = parseMemoryFile(file, rootDir);
    const oldDoc = oldDocsMap[doc.path];

    if (oldDoc && oldDoc.linked_hashes) {
      // Compare current hashes with previous stored hashes
      for (const [linkedFile, currentHash] of Object.entries(doc.linked_hashes)) {
        const previousHash = oldDoc.linked_hashes[linkedFile];
        if (previousHash && previousHash !== currentHash) {
          // Code changed without memory update!
          doc.stale = true;
          // Keep the original baseline hash so subsequent calls also identify drift until memory is reconciled
          doc.linked_hashes[linkedFile] = previousHash;
        }
      }
      if (oldDoc.stale) {
        doc.stale = true;
      }
    }

    documents.push(doc);
  }

  const indexData: VeeshreeIndexData = {
    last_updated: new Date().toISOString(),
    documents,
  };

  // Save index to .vee/index.json
  const veeDir = path.join(rootDir, VEE_DIR_REL);
  if (!fs.existsSync(veeDir)) {
    fs.mkdirSync(veeDir, { recursive: true });
  }
  fs.writeFileSync(indexPath, JSON.stringify(indexData, null, 2), "utf-8");

  return indexData;
}

/**
 * Creates and initializes MiniSearch instance loaded with indexed documents
 */
export function createSearchEngine(documents: IndexDocument[]): MiniSearch<IndexDocument> {
  const miniSearch = new MiniSearch<IndexDocument>({
    fields: ["title", "content", "tags", "path"],
    storeFields: ["id", "title", "path", "type", "status", "tags", "linked_files", "stale", "content"],
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
 * Loads index from disk or rebuilds if missing
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
