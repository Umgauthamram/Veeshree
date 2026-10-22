import { installGitHooks, uninstallGitHooks, getHooksStatus } from "../core/hooks/manager.js";
import { logger } from "../utils/logger.js";
import { VeeError } from "../utils/errors.js";

export function handleHooksCommand(
  action: "install" | "uninstall" | "status" = "status",
  rootDir: string = process.cwd(),
  options: { json?: boolean } = {}
): unknown {
  const isJson = options.json || logger.isJson();
  if (isJson) logger.setJson(true);

  if (action === "install") {
    const installed = installGitHooks(rootDir);
    if (isJson) {
      const payload = { action: "install", installed };
      logger.json(payload);
      return installed;
    }
    logger.success(`Installed Veeshree Git hooks: ${installed.join(", ")}`);
    return installed;
  }

  if (action === "uninstall") {
    const removed = uninstallGitHooks(rootDir);
    if (isJson) {
      const payload = { action: "uninstall", removed };
      logger.json(payload);
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
      logger.json(status);
      return status;
    }
    logger.title("Veeshree Git Hooks Status");
    if (!status.isGitRepo) {
      logger.warn("Not a Git repository.");
      return status;
    }

    logger.log(`Hooks Directory:  ${logger.dim(status.hooksDir)}`);
    logger.log(
      `pre-commit:       ${status.preCommitInstalled ? logger.green("[INSTALLED]") : logger.dim("[NOT INSTALLED]")}`
    );
    logger.log(
      `post-checkout:    ${status.postCheckoutInstalled ? logger.green("[INSTALLED]") : logger.dim("[NOT INSTALLED]")}`
    );
    logger.log(
      `post-merge:       ${status.postMergeInstalled ? logger.green("[INSTALLED]") : logger.dim("[NOT INSTALLED]")}`
    );
    return status;
  }

  throw new VeeError(
    `Unknown hooks action '${action}'. Supported: install, uninstall, status`,
    "ERR_INVALID_ARGS"
  );
}
