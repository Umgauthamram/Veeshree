import { rejectProposal } from "../core/proposals/queue.js";
import { logger } from "../utils/logger.js";
import { VeeError } from "../utils/errors.js";

export function handleRejectCommand(id: string, rootDir: string = process.cwd()): void {
  if (!id) {
    throw new VeeError("Usage: vee reject <id>", "ERR_INVALID_ARGS");
  }

  const res = rejectProposal(id, "human", rootDir);
  logger.success(`Rejected proposal: ${res.proposal.id}`);
}
