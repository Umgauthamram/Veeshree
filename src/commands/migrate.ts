import fs from "node:fs";
import path from "node:path";
import { BACKUP_03X_DIR_REL, MEMORY_DIR_REL, DECISIONS_DIR_REL, CONFIG_FILE_REL, INDEX_FILE_REL } from "../utils/constants.js";
import { parseDecisionFrontmatter, stringifyMarkdownFrontmatter } from "../core/memory/frontmatter.js";
import { writeAtomic } from "../core/memory/atomic.js";
import { slugifyTitle, getNextAdrNumber } from "../core/memory/section-editor.js";
import { installAgentRules } from "../core/rules/manager.js";
import { installGitHooks } from "../core/hooks/manager.js";
import { handleDoctorCommand } from "./doctor.js";
import { loadConfig, saveConfig } from "../core/config.js";
import { buildIndex } from "../core/indexer.js";
import { calculateNormalizedFileHash } from "../core/drift/hasher.js";
import { sanitizeRelativePath } from "../utils/paths.js";
import { logger } from "../utils/logger.js";
import { VeeError } from "../utils/errors.js";

export interface MigrateOptions {
  dryRun?: boolean;
}

/**
 * Copies a directory recursively
 */
function copyDirSync(src: string, dest: string): void {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else if (entry.isFile()) {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

export interface MigrateResult {
  success: boolean;
  adrsUpdated: number;
}

export async function handleMigrateCommand(
  options: MigrateOptions | string = {},
  rootDirArg?: string
): Promise<MigrateResult> {
  const opts: MigrateOptions = typeof options === "string" ? {} : options;
  const rootDir: string = typeof options === "string" ? options : rootDirArg || process.cwd();

  logger.title("Migrating Project to Veeshree 1.0.0");

  const memoryDir = path.join(rootDir, MEMORY_DIR_REL);
  if (!fs.existsSync(memoryDir)) {
    throw new VeeError("docs/memory directory not found. Nothing to migrate.", "ERR_NOT_INITIALIZED");
  }

  if (opts.dryRun) {
    logger.info("[DRY-RUN] Simulating 0.3.x -> 1.0.0 migration plan:");
    logger.info("1. Would back up docs/memory/ to .vee/backup-0.3.x/");
    logger.info("2. Would transfer cached hashes from .vee/index.json into ADR frontmatter");
    logger.info("3. Would rename ADR files to NNNN-slug numbering");
    logger.info("4. Would add idempotent marker blocks to existing agent rule files");
    logger.info("5. Would upgrade config schema to version 1");
    logger.info("6. Would install Git hooks");
    logger.info("7. Would run doctor diagnostics");
    return { success: true, adrsUpdated: 0 };
  }

  // 1. Backup docs/memory/ to .vee/backup-0.3.x/
  const backupDir = path.join(rootDir, BACKUP_03X_DIR_REL);
  if (fs.existsSync(backupDir)) {
    fs.rmSync(backupDir, { recursive: true, force: true });
  }
  copyDirSync(memoryDir, backupDir);
  logger.success(`1. Created safe backup of docs/memory/ at .vee/backup-0.3.x/`);

  // 2. Read old hashes from .vee/index.json
  const indexPath = path.join(rootDir, INDEX_FILE_REL);
  let oldHashesMap: Record<string, Record<string, string>> = {};
  if (fs.existsSync(indexPath)) {
    try {
      const oldIndex = JSON.parse(fs.readFileSync(indexPath, "utf-8"));
      if (Array.isArray(oldIndex.documents)) {
        for (const doc of oldIndex.documents) {
          if (doc.linked_hashes) {
            oldHashesMap[doc.path] = doc.linked_hashes;
          }
        }
      }
    } catch {
      // ignore
    }
  }

  // 3. Convert existing ADR filenames to NNNN-slug and embed hashes
  let adrsUpdated = 0;
  const decisionsDir = path.join(rootDir, DECISIONS_DIR_REL);
  if (fs.existsSync(decisionsDir)) {
    const files = fs.readdirSync(decisionsDir).filter((f) => f.endsWith(".md"));
    for (const file of files) {
      const fullPath = path.join(decisionsDir, file);
      const raw = fs.readFileSync(fullPath, "utf-8");
      const { data, content } = parseDecisionFrontmatter(raw);

      // Embed hashes into linked_files frontmatter
      const relDocPath = `docs/memory/decisions/${file}`;
      const cachedHashes = oldHashesMap[relDocPath] || {};

      const linked = Array.isArray(data.linked_files) ? data.linked_files : [];
      const newLinkedFiles = linked.map((item: any) => {
        const p = typeof item === "string" ? item : item.path;
        let sha256 = (typeof item === "object" && item.sha256) ? item.sha256 : cachedHashes[p];
        if (!sha256) {
          try {
            const safeRel = sanitizeRelativePath(p);
            sha256 = calculateNormalizedFileHash(path.join(rootDir, safeRel)) || undefined;
          } catch {
            // ignore
          }
        }
        return { path: p, sha256 };
      });

      data.linked_files = newLinkedFiles;
      data.generated_by = data.generated_by || "veeshree";
      adrsUpdated++;

      // Check if filename already has NNNN prefix
      if (!/^\d{4}-/.test(file)) {
        const nextNum = getNextAdrNumber(rootDir);
        const base = path.basename(file, ".md");
        const slug = slugifyTitle(base);
        const newFilename = `${nextNum}-${slug}.md`;
        const newFullPath = path.join(decisionsDir, newFilename);

        data.id = data.id || base; // keep old name as alias
        writeAtomic(newFullPath, stringifyMarkdownFrontmatter(data as any, content));
        try {
          fs.unlinkSync(fullPath);
        } catch {
          // ignore
        }
        logger.info(`   Renamed ADR: ${file} -> ${newFilename}`);
      } else {
        writeAtomic(fullPath, stringifyMarkdownFrontmatter(data as any, content));
      }
    }
  }
  logger.success("2 & 3. Embedded baseline hashes in ADR frontmatter & standardized filenames.");

  // 4. Add marker blocks to agent rule files without touching other content
  const updatedRules = installAgentRules(rootDir);
  logger.success(`4. Updated agent rule marker blocks: ${updatedRules.join(", ")}`);

  // 5. Upgrade config schema
  const config = loadConfig(rootDir);
  config.schema_version = 1;
  config.version = "1.0.0";
  saveConfig(config, rootDir);
  logger.success("5. Upgraded .vee/config.json to schema_version 1.");

  // 6. Install git hooks
  try {
    const installedHooks = installGitHooks(rootDir);
    logger.success(`6. Installed Git hooks: ${installedHooks.join(", ")}`);
  } catch {
    logger.warn("6. Git hooks skipped (not a Git repository or hooks disabled).");
  }

  // 7. Rebuild index and run doctor
  buildIndex(rootDir);
  logger.log("");
  logger.title("7. Running Diagnostic Health Check After Migration");
  await handleDoctorCommand({ fix: true }, rootDir);

  logger.log("");
  logger.success("Migration complete! Project upgraded to Veeshree 1.0.0.");
  return { success: true, adrsUpdated };
}
