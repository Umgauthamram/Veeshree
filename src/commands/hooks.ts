import { installGitHooks, uninstallGitHooks, getHooksStatus } from "../core/hooks/manager.js";
import { logger } from "../utils/logger.js";
import { VeeError } from "../utils/errors.js";

export function handleHooksCommand(
  action: "install" | "uninstall" | "status" = "status",
  rootDir: string = process.cwd()
): void {
  if (action === "install") {
    const installed = installGitHooks(rootDir);
    logger.success(`Installed Veeshree Git hooks: ${installed.join(", ")}`);
    return;
  }

  if (action === "uninstall") {
    const removed = uninstallGitHooks(rootDir);
    if (removed.length > 0) {
      logger.success(`Uninstalled Veeshree Git hooks: ${removed.join(", ")}`);
    } else {
      logger.info("No Veeshree Git hooks were found to remove.");
    }
    return;
  }

  if (action === "status") {
    const status = getHooksStatus(rootDir);
    logger.title("Veeshree Git Hooks Status");
    if (!status.isGitRepo) {
      logger.warn("Not a Git repository.");
      return;
    }

    console.log(`Hooks Directory:  ${logger.dim(status.hooksDir)}`);
    console.log(`pre-commit:       ${status.preCommitInstalled ? logger.green("[INSTALLED]") : logger.dim("[NOT INSTALLED]")}`);
    console.log(`post-checkout:    ${status.postCheckoutInstalled ? logger.green("[INSTALLED]") : logger.dim("[NOT INSTALLED]")}`);
    console.log(`post-merge:       ${status.postMergeInstalled ? logger.green("[INSTALLED]") : logger.dim("[NOT INSTALLED]")}`);
    return;
  }

  throw new VeeError(`Unknown hooks action '${action}'. Supported: install, uninstall, status`, "ERR_INVALID_ARGS");
}
