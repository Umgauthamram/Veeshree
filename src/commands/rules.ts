import { installAgentRules, uninstallAgentRules, updateAgentRules, KNOWN_AGENT_TARGETS } from "../core/rules/manager.js";
import { logger } from "../utils/logger.js";
import { VeeError } from "../utils/errors.js";

export function handleRulesCommand(
  action: "update" | "uninstall" | "list" = "list",
  options: { agents?: string } = {},
  rootDir: string = process.cwd()
): void {
  const selectedAgents = options.agents
    ? options.agents.split(",").map((a) => a.trim().toLowerCase()).filter(Boolean)
    : undefined;

  if (action === "update" || action === "list") {
    if (action === "list") {
      logger.title("Veeshree Agent Rule Targets");
      for (const t of KNOWN_AGENT_TARGETS) {
        console.log(`- ${logger.bold(t.name.padEnd(12))}: ${t.relPath}`);
      }
      return;
    }

    const updated = updateAgentRules(rootDir);
    logger.success(`Updated Veeshree marker blocks in: ${updated.join(", ")}`);
    return;
  }

  if (action === "uninstall") {
    const removed = uninstallAgentRules(rootDir, selectedAgents);
    if (removed.length > 0) {
      logger.success(`Removed Veeshree marker blocks from: ${removed.join(", ")}`);
    } else {
      logger.info("No Veeshree marker blocks were found.");
    }
    return;
  }

  throw new VeeError(`Unknown rules action '${action}'. Supported: list, update, uninstall`, "ERR_INVALID_ARGS");
}
