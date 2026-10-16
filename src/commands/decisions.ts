import fs from "node:fs";
import path from "node:path";
import { loadOrBuildIndex, buildIndex } from "../core/indexer.js";
import { parseDecisionFrontmatter, stringifyMarkdownFrontmatter } from "../core/memory/frontmatter.js";
import { writeAtomic } from "../core/memory/atomic.js";
import { slugifyTitle, getNextAdrNumber } from "../core/memory/section-editor.js";
import { calculateNormalizedFileHash } from "../core/drift/hasher.js";
import { sanitizeRelativePath, normalizePosix } from "../utils/paths.js";
import { DECISIONS_DIR_REL, ARCHIVE_DECISIONS_DIR_REL } from "../utils/constants.js";
import { logger } from "../utils/logger.js";
import { VeeError } from "../utils/errors.js";

export interface DecisionsOptions {
  all?: boolean;
  status?: string;
  subcommand?: "list" | "new" | "show" | "supersede" | "link";
  title?: string;
  id?: string;
  targetFile?: string;
}

export function handleDecisionsCommand(
  options: DecisionsOptions = {},
  rootDir: string = process.cwd()
): void {
  const sub = options.subcommand || "list";

  if (sub === "new") {
    if (!options.title) {
      throw new VeeError("Usage: vee decisions new <title>", "ERR_INVALID_ARGS");
    }
    const nextNum = getNextAdrNumber(rootDir);
    const slug = slugifyTitle(options.title);
    const filename = `${nextNum}-${slug}.md`;
    const fullPath = path.join(rootDir, DECISIONS_DIR_REL, filename);

    const frontmatter = {
      id: `${nextNum}-${slug}`,
      title: options.title,
      status: "active",
      date: new Date().toISOString().split("T")[0],
      tags: ["architecture"],
      linked_files: [],
      generated_by: "veeshree",
    };

    const body = `# ${options.title}

## Context & Problem Statement
Describe the context and problem statement here.

## Decision
Concrete decision and architectural approach.

## Rationale
Why this choice was selected.

## Alternatives Considered
- None explicitly recorded.

## Linked Files
- None specified.
`;

    writeAtomic(fullPath, stringifyMarkdownFrontmatter(frontmatter, body));
    buildIndex(rootDir);
    logger.success(`Created new ADR: docs/memory/decisions/${filename}`);
    return;
  }

  if (sub === "show") {
    if (!options.id) {
      throw new VeeError("Usage: vee decisions show <id>", "ERR_INVALID_ARGS");
    }
    const adr = findAdr(options.id, rootDir);
    if (!adr) {
      throw new VeeError(`ADR '${options.id}' not found.`, "ERR_FILE_NOT_FOUND");
    }

    logger.title(`ADR: ${adr.data.title || adr.id}`);
    console.log(`ID:           ${adr.id}`);
    console.log(`Status:       ${adr.data.status}`);
    console.log(`Date:         ${adr.data.date}`);
    console.log(`File:         ${adr.relPath}`);

    // Walk supersede chain
    if (adr.data.supersedes) {
      console.log(`Supersedes:   ${logger.yellow(adr.data.supersedes)}`);
    }
    if (adr.data.superseded_by) {
      console.log(`Superseded By:${logger.yellow(adr.data.superseded_by)}`);
    }

    console.log("\n" + "-".repeat(60) + "\n");
    console.log(adr.content);
    return;
  }

  if (sub === "supersede") {
    if (!options.id || !options.title) {
      throw new VeeError("Usage: vee decisions supersede <old-id> <new-title>", "ERR_INVALID_ARGS");
    }
    const oldAdr = findAdr(options.id, rootDir);
    if (!oldAdr) {
      throw new VeeError(`Original ADR '${options.id}' not found.`, "ERR_FILE_NOT_FOUND");
    }

    const nextNum = getNextAdrNumber(rootDir);
    const slug = slugifyTitle(options.title);
    const newId = `${nextNum}-${slug}`;
    const newFilename = `${newId}.md`;
    const newFullPath = path.join(rootDir, DECISIONS_DIR_REL, newFilename);

    // Update old ADR
    oldAdr.data.status = "superseded";
    oldAdr.data.superseded_by = newId;
    writeAtomic(oldAdr.fullPath, stringifyMarkdownFrontmatter(oldAdr.data, oldAdr.content));

    // Create new ADR
    const newFrontmatter = {
      id: newId,
      title: options.title,
      status: "active",
      date: new Date().toISOString().split("T")[0],
      tags: oldAdr.data.tags || ["architecture"],
      linked_files: oldAdr.data.linked_files || [],
      supersedes: oldAdr.id,
      generated_by: "veeshree",
    };

    const newBody = `# ${options.title}

## Context & Problem Statement
Supersedes ADR [${oldAdr.id}] '${oldAdr.data.title}'.

## Decision
New architectural decision details.

## Rationale
Why the previous approach was superseded.

## Alternatives Considered
- Previous decision: [${oldAdr.id}]

## Linked Files
- Retained linked files from prior ADR.
`;

    writeAtomic(newFullPath, stringifyMarkdownFrontmatter(newFrontmatter, newBody));
    buildIndex(rootDir);

    logger.success(`Marked ADR '${oldAdr.id}' as SUPERSEDED by '${newId}'.`);
    logger.success(`Created replacement ADR: docs/memory/decisions/${newFilename}`);
    return;
  }

  if (sub === "link") {
    if (!options.id || !options.targetFile) {
      throw new VeeError("Usage: vee decisions link <id> <file-path>", "ERR_INVALID_ARGS");
    }
    const adr = findAdr(options.id, rootDir);
    if (!adr) {
      throw new VeeError(`ADR '${options.id}' not found.`, "ERR_FILE_NOT_FOUND");
    }

    const safeRel = sanitizeRelativePath(options.targetFile);
    const absPath = path.join(rootDir, safeRel);
    const hash = calculateNormalizedFileHash(absPath);

    if (!Array.isArray(adr.data.linked_files)) {
      adr.data.linked_files = [];
    }

    // Check if already linked
    const existingIdx = adr.data.linked_files.findIndex((item: any) => {
      const p = typeof item === "string" ? item : item.path;
      return p === safeRel;
    });

    const newEntry = { path: safeRel, sha256: hash || undefined };
    if (existingIdx >= 0) {
      adr.data.linked_files[existingIdx] = newEntry;
    } else {
      adr.data.linked_files.push(newEntry);
    }

    writeAtomic(adr.fullPath, stringifyMarkdownFrontmatter(adr.data, adr.content));
    buildIndex(rootDir);

    logger.success(`Linked '${safeRel}' (${hash ? hash.slice(0, 12) + "..." : "missing"}) to ADR [${adr.id}].`);
    return;
  }

  // Default: list
  const indexData = loadOrBuildIndex(rootDir);
  let decisions = indexData.documents.filter(
    (d) => d.type === "decision" || d.type === "archived_decision"
  );

  if (options.status) {
    decisions = decisions.filter((d) => d.status === options.status);
  } else if (!options.all) {
    decisions = decisions.filter((d) => d.status === "active");
  }

  logger.title("Architectural Decision Records (ADRs)");

  if (decisions.length === 0) {
    logger.info("No architectural decision records found.");
    return;
  }

  for (const doc of decisions) {
    const statusBadge =
      doc.status === "active"
        ? logger.cyan("[ACTIVE]")
        : doc.status === "superseded"
        ? logger.yellow("[SUPERSEDED]")
        : logger.dim(`[${doc.status.toUpperCase()}]`);

    const driftBadge = doc.stale ? logger.warn(" [STALE CODE DRIFT]") : "";

    console.log(`${logger.bold(doc.title)} ${statusBadge}${driftBadge}`);
    console.log(`  ID:     ${logger.bold(doc.id)}`);
    console.log(`  File:   ${logger.dim(doc.path)}`);
    if (doc.tags.length > 0) {
      console.log(`  Tags:   ${logger.dim(doc.tags.join(", "))}`);
    }
    if (doc.linked_files.length > 0) {
      console.log(`  Linked: ${logger.dim(doc.linked_files.join(", "))}`);
    }
    console.log("");
  }
}

function findAdr(
  identifier: string,
  rootDir: string
): { id: string; fullPath: string; relPath: string; data: any; content: string } | null {
  const dirs = [
    path.join(rootDir, DECISIONS_DIR_REL),
    path.join(rootDir, ARCHIVE_DECISIONS_DIR_REL),
  ];

  for (const dir of dirs) {
    if (!fs.existsSync(dir)) continue;
    const files = fs.readdirSync(dir).filter((f) => f.endsWith(".md"));
    for (const f of files) {
      const fileId = path.basename(f, ".md");
      const fullPath = path.join(dir, f);
      const raw = fs.readFileSync(fullPath, "utf-8");
      const { data, content } = parseDecisionFrontmatter(raw);

      if (data.id === identifier || fileId === identifier || fileId.endsWith(`-${identifier}`)) {
        return {
          id: data.id || fileId,
          fullPath,
          relPath: normalizePosix(path.relative(rootDir, fullPath)),
          data,
          content,
        };
      }
    }
  }

  return null;
}
