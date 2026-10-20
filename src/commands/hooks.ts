import { installGitHooks, uninstallGitHooks, getHooksStatus } from "../core/hooks/manager.js";
import { logger } from "../utils/logger.js";
import { VeeError } from "../utils/errors.js";

export function handleHooksCommand(
  action: "install" | "uninstall" | "status" = "status",
  rootDir: string = process.cwd(),
  options: { json?: boolean } = {}
): any {
  const isJson = options.json || logger.isJson();
  if (isJson) logger.setJson(true);

  if (action === "install") {
    const installed = installGitHooks(rootDir);
    if (isJson) {
      console.log(JSON.stringify({ action: "install", installed }, null, 2));
      return installed;
    }
    logger.success(`Installed Veeshree Git hooks: ${installed.join(", ")}`);
    return installed;
  }

  if (action === "uninstall") {
    const removed = uninstallGitHooks(rootDir);
    if (isJson) {
      console.log(JSON.stringify({ action: "uninstall", removed }, null, 2));
      return removed;
    }
    if (removed.length > 0) {
      logger.success(`Uninstalled Veeshree Git hooks: ${removed.join(", ")}`);
    } else {
      logger.info("No Veeshree Git hooks were found to remove.");
    }
    return removed;
  }

  if (action === "status") {
    const status = getHooksStatus(rootDir);
    if (isJson) {
      console.log(JSON.stringify(status, null, 2));
      return status;
    }
    logger.title("Veeshree Git Hooks Status");
    if (!status.isGitRepo) {
      logger.warn("Not a Git repository.");
      return status;
    }

    console.log(`Hooks Directory:  ${logger.dim(status.hooksDir)}`);
    console.log(`pre-commit:       ${status.preCommitInstalled ? logger.green("[INSTALLED]") : logger.dim("[NOT INSTALLED]")}`);
    console.log(`post-checkout:    ${status.postCheckoutInstalled ? logger.green("[INSTALLED]") : logger.dim("[NOT INSTALLED]")}`);
    console.log(`post-merge:       ${status.postMergeInstalled ? logger.green("[INSTALLED]") : logger.dim("[NOT INSTALLED]")}`);
    return status;
  }

  throw new VeeError(`Unknown hooks action '${action}'. Supported: install, uninstall, status`, "ERR_INVALID_ARGS");
}
