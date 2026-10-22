import { logger } from "../utils/logger.js";
import { checkWorkspaceDrift, type WorkspaceDriftReport } from "../core/drift/status.js";
import { acceptBaselines } from "../core/drift/baselines.js";
import { buildIndex } from "../core/indexer.js";

import { VeeError } from "../utils/errors.js";

export interface SyncOptions {
  accept?: string | boolean;
  all?: boolean;
  json?: boolean;
  quiet?: boolean;
  dryRun?: boolean;
}

export function syncVeeshree(
  rootDir: string = process.cwd(),
  options: SyncOptions = {}
): { report: WorkspaceDriftReport; acceptedCount?: number; exitCode: number } {
  const isJson = options.json || logger.isJson();
  if (options.quiet) logger.setQuiet(true);
  if (isJson) logger.setJson(true);

  let target = typeof options.accept === "string" ? options.accept : undefined;
  if (options.all) {
    target = "all";
  } else if (options.accept === true || target === "") {
    throw new VeeError(
      "Usage: vee sync --accept <id> or vee sync --accept all (or vee sync --accept --all)",
      "ERR_INVALID_ARGS"
    );
  }

  // If accept target is specified, update baselines
  if (target) {
    if (options.dryRun) {
      const rep = checkWorkspaceDrift(rootDir);
      if (isJson) {
        logger.json({ dryRun: true, target, report: rep, acceptedCount: 0 });
      } else {
        logger.info(`[DRY-RUN] Would accept baselines for: ${target}`);
      }
      return {
        report: rep,
        acceptedCount: 0,
        exitCode: 0,
      };
    }

    if (!isJson) logger.title(`Accepting Drift Baselines: ${target}`);
    const result = acceptBaselines(target, rootDir);
    buildIndex(rootDir);

    const postReport = checkWorkspaceDrift(rootDir);
    if (isJson) {
      logger.json({
        target,
        updatedAdrs: result.updatedAdrs,
        acceptedCount: result.totalUpdatedFiles,
        report: postReport,
      });
    } else {
      logger.success(
        `Updated baseline hashes in ${result.updatedAdrs.length} ADR(s) across ${result.totalUpdatedFiles} linked file(s).`
      );
    }

    return {
      report: postReport,
      acceptedCount: result.totalUpdatedFiles,
      exitCode: 0,
    };
  }

  // Read-only report (re-hashes all live files)
  if (!isJson) logger.title("Synchronizing Veeshree Memory & Code Hashes");
  const driftReport = checkWorkspaceDrift(rootDir);
  buildIndex(rootDir); // refresh cache

  if (isJson) {
    logger.json(driftReport);
    return {
      report: driftReport,
      exitCode: driftReport.hasDrift ? 1 : 0,
    };
  }

  logger.info(
    `Inspected ${logger.bold(String(driftReport.totalRecords))} architectural decision records.`
  );

  if (!driftReport.hasDrift) {
    logger.success("All memory records are in sync with live codebase hashes.");
  } else {
    logger.warn(`Found ${driftReport.driftedRecordsCount} record(s) with code drift:`);
    for (const r of driftReport.records) {
      if (r.isDrifted) {
        for (const f of r.files) {
          if (f.status === "missing") {
            logger.log(`  - ${logger.red("[MISSING]")} ${r.title}: ${f.path}`);
          } else if (f.status === "drifted") {
            logger.log(`  - ${logger.yellow("[DRIFTED]")} ${r.title}: ${f.path}`);
          }
        }
      }
    }
    logger.info(
      `Run 'vee sync --accept all' or 'vee sync --accept <id>' to accept new baselines into ADR frontmatter.`
    );
  }

  return {
    report: driftReport,
    exitCode: driftReport.hasDrift ? 1 : 0,
  };
}
