import { logger } from "../utils/logger.js";
import { checkWorkspaceDrift, type WorkspaceDriftReport } from "../core/drift/status.js";
import { acceptBaselines } from "../core/drift/baselines.js";
import { buildIndex } from "../core/indexer.js";

export interface SyncOptions {
  accept?: string;
  json?: boolean;
  quiet?: boolean;
  dryRun?: boolean;
}

export function syncVeeshree(
  rootDir: string = process.cwd(),
  options: SyncOptions = {}
): { report: WorkspaceDriftReport; acceptedCount?: number; exitCode: number } {
  if (options.quiet) logger.setQuiet(true);
  if (options.json) logger.setJson(true);

  // If --accept is specified, update baselines
  if (options.accept) {
    if (options.dryRun) {
      logger.info(`[DRY-RUN] Would accept baselines for: ${options.accept}`);
      return {
        report: checkWorkspaceDrift(rootDir),
        acceptedCount: 0,
        exitCode: 0,
      };
    }

    logger.title(`Accepting Drift Baselines: ${options.accept}`);
    const result = acceptBaselines(options.accept, rootDir);
    buildIndex(rootDir);

    logger.success(`Updated baseline hashes in ${result.updatedAdrs.length} ADR(s) across ${result.totalUpdatedFiles} linked file(s).`);
    return {
      report: checkWorkspaceDrift(rootDir),
      acceptedCount: result.totalUpdatedFiles,
      exitCode: 0,
    };
  }

  // Read-only report (re-hashes all live files)
  logger.title("Synchronizing Veeshree Memory & Code Hashes");
  const driftReport = checkWorkspaceDrift(rootDir);
  buildIndex(rootDir); // refresh cache

  if (options.json) {
    console.log(JSON.stringify(driftReport, null, 2));
    return {
      report: driftReport,
      exitCode: driftReport.hasDrift ? 1 : 0,
    };
  }

  logger.info(`Inspected ${logger.bold(String(driftReport.totalRecords))} architectural decision records.`);

  if (!driftReport.hasDrift) {
    logger.success("All memory records are in sync with live codebase hashes.");
  } else {
    logger.warn(`Found ${driftReport.driftedRecordsCount} record(s) with code drift:`);
    for (const r of driftReport.records) {
      if (r.isDrifted) {
        for (const f of r.files) {
          if (f.status === "missing") {
            console.log(`  - ${logger.red("[MISSING]")} ${r.title}: ${f.path}`);
          } else if (f.status === "drifted") {
            console.log(`  - ${logger.yellow("[DRIFTED]")} ${r.title}: ${f.path}`);
          }
        }
      }
    }
    logger.info(`Run 'vee sync --accept <id|--all>' to accept new baselines into ADR frontmatter.`);
  }

  return {
    report: driftReport,
    exitCode: driftReport.hasDrift ? 1 : 0,
  };
}
