import { listProposals, acceptProposal, getProposal } from "../core/proposals/queue.js";
import { logger } from "../utils/logger.js";
import { VeeError } from "../utils/errors.js";

export interface AcceptOptions {
  allLow?: boolean;
  dryRun?: boolean;
}

export async function handleAcceptCommand(
  targetId?: string,
  options: AcceptOptions = {},
  rootDir: string = process.cwd()
): Promise<string[]> {
  const isAllLow = options.allLow || targetId === "--all-low";

  if (isAllLow) {
    const pending = listProposals(rootDir, "pending");
    const lowRisk = pending.filter((p) => p.risk === "low");

    if (lowRisk.length === 0) {
      logger.info("No low-risk pending proposals found to accept.");
      return [];
    }

    if (options.dryRun) {
      logger.info(
        `[DRY-RUN] Would accept ${lowRisk.length} low-risk proposal(s): ${lowRisk.map((p) => p.id).join(", ")}`
      );
      return lowRisk.map((p) => p.id);
    }

    logger.title(`Accepting All Low-Risk Proposals (${lowRisk.length})`);
    const acceptedIds: string[] = [];

    for (const p of lowRisk) {
      const { reconcileResult } = await acceptProposal(p.id, "human_all_low", rootDir);
      acceptedIds.push(p.id);
      logger.success(
        `Accepted ${p.id} (+${reconcileResult.newDecisions.length} decisions, ${reconcileResult.updatedFiles.length} files updated).`
      );
    }

    logger.success(`Successfully applied ${acceptedIds.length} low-risk proposal(s).`);
    return acceptedIds;
  }

  if (!targetId) {
    throw new VeeError("Usage: vee accept <id|--all-low>", "ERR_INVALID_ARGS");
  }

  const proposal = getProposal(targetId, rootDir);
  if (!proposal) {
    throw new VeeError(`Proposal '${targetId}' not found.`, "ERR_PROPOSAL_NOT_FOUND");
  }

  if (options.dryRun) {
    logger.info(`[DRY-RUN] Would accept proposal ${targetId} (${proposal.risk} risk)`);
    return [targetId];
  }

  logger.title(`Accepting Proposal: ${targetId}`);
  const { reconcileResult } = await acceptProposal(targetId, "human", rootDir);
  logger.success(`Proposal accepted and applied to memory.`);
  if (reconcileResult.newDecisions.length > 0) {
    logger.info(`New decisions created: ${reconcileResult.newDecisions.join(", ")}`);
  }
  logger.info(`Files updated: ${reconcileResult.updatedFiles.join(", ")}`);

  return [targetId];
}
