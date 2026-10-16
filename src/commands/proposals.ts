import { listProposals } from "../core/proposals/queue.js";
import { logger } from "../utils/logger.js";
import type { Proposal, ProposalStatus } from "../schemas/proposal.schema.js";

export function handleProposalsCommand(
  options: { json?: boolean; status?: string } = {},
  rootDir: string = process.cwd()
): Proposal[] {
  const statusFilter = (options.status as ProposalStatus) || undefined;
  const list = listProposals(rootDir, statusFilter);

  if (options.json) {
    console.log(JSON.stringify(list, null, 2));
    return list;
  }

  logger.title("Veeshree Proposals");
  if (list.length === 0) {
    logger.info("No proposals found.");
    return [];
  }

  for (const p of list) {
    const statusBadge =
      p.status === "accepted"
        ? logger.green("[ACCEPTED]")
        : p.status === "rejected"
        ? logger.dim("[REJECTED]")
        : logger.cyan("[PENDING]");

    const riskBadge =
      p.risk === "high" ? logger.red("[HIGH RISK]") : logger.green("[LOW RISK]");

    console.log(`${logger.bold(p.id)} ${statusBadge} ${riskBadge} (${p.source} at ${p.created_at})`);
    if (p.flags.length > 0) {
      console.log(`  Flags: ${logger.yellow(p.flags.join(", "))}`);
    }
  }

  return list;
}
