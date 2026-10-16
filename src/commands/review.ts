import { listProposals } from "../core/proposals/queue.js";
import { logger } from "../utils/logger.js";
import type { Proposal } from "../schemas/proposal.schema.js";

export function handleReviewCommand(rootDir: string = process.cwd()): Proposal[] {
  logger.title("Veeshree Proposal Review Queue");

  const pending = listProposals(rootDir, "pending");
  if (pending.length === 0) {
    logger.success("No proposals pending review. Memory is up to date.");
    return [];
  }

  logger.info(`Found ${logger.bold(String(pending.length))} pending proposal(s) awaiting review:\n`);

  for (const p of pending) {
    const riskBadge =
      p.risk === "high" ? logger.red("[HIGH RISK]") : logger.green("[LOW RISK]");

    console.log(`${logger.bold(p.id)} ${riskBadge} (${logger.dim(p.source)} at ${p.created_at})`);
    if (p.flags.length > 0) {
      console.log(`  Flags: ${logger.yellow(p.flags.join(", "))}`);
    }

    // Print delta summary
    if (p.delta.decisions.length > 0) {
      console.log(`  Decisions (+${p.delta.decisions.length}):`);
      for (const d of p.delta.decisions) {
        console.log(`    - ${logger.bold(d.title)}: ${d.decision}`);
      }
    }

    if (p.delta.constraints.length > 0) {
      console.log(`  Constraints (+${p.delta.constraints.length}):`);
      for (const c of p.delta.constraints) {
        console.log(`    - [${c.type.toUpperCase()}] ${c.rule}`);
      }
    }

    if (p.delta.tasks.length > 0) {
      console.log(`  Tasks (+${p.delta.tasks.length}):`);
      for (const t of p.delta.tasks) {
        console.log(`    - [${t.action.toUpperCase()}] ${t.task_name}`);
      }
    }

    if (p.delta.current_state?.current_feature) {
      console.log(`  Current Focus -> ${p.delta.current_state.current_feature}`);
    }

    console.log(`\n  ${logger.dim(`-> To accept: vee accept ${p.id}`)}`);
    console.log(`  ${logger.dim(`-> To reject: vee reject ${p.id}`)}\n`);
  }

  logger.info("Run 'vee accept --all-low' to accept all low-risk proposals at once.");
  return pending;
}
