import fs from "node:fs";
import { extractMemoryFromContent } from "../core/extractor.js";
import { createProposal, acceptProposal } from "../core/proposals/queue.js";
import { redactContent, capDiffPayload } from "../core/redact/redactor.js";
import { runCommandSafe } from "../utils/process.js";
import { loadConfig } from "../core/config.js";
import { logger } from "../utils/logger.js";
import { VeeError } from "../utils/errors.js";
import type { Proposal } from "../schemas/proposal.schema.js";

export interface CaptureOptions {
  file?: string;
  diff?: boolean;
  provider?: string;
  model?: string;
  auto?: boolean;
  dryRun?: boolean;
  showPayload?: boolean;
}

export async function handleCaptureCommand(
  options: CaptureOptions,
  rootDir: string = process.cwd()
): Promise<{ proposal?: Proposal; payload?: string; autoApplied?: boolean }> {
  logger.title("Capturing Architectural Memory");

  let content = "";
  if (options.diff) {
    try {
      content = runCommandSafe("git", ["diff", "HEAD"], { cwd: rootDir });
    } catch (err: any) {
      throw new VeeError(`Failed to read git diff: ${err.message}`, "ERR_PROVIDER_FAILURE");
    }
  } else if (options.file) {
    if (!fs.existsSync(options.file)) {
      throw new VeeError(`File not found: ${options.file}`, "ERR_FILE_NOT_FOUND");
    }
    content = fs.readFileSync(options.file, "utf-8");
  } else {
    content = await readStdin();
  }

  if (!content.trim()) {
    throw new VeeError(
      "No content provided. Pass a file with --file, run with --diff, or pipe through standard input.",
      "ERR_INVALID_ARGS"
    );
  }

  // Redaction and capping (SEC-2)
  const config = loadConfig(rootDir);
  const maxPayload = config.privacy?.max_payload_bytes || 24576;
  const redacted = redactContent(content);
  const capped = capDiffPayload(redacted, maxPayload);

  if (options.showPayload) {
    console.log(capped);
    return { payload: capped };
  }

  if (options.dryRun) {
    logger.info(`[DRY-RUN] Would send ${capped.length} bytes of redacted content to extraction engine.`);
    return { payload: capped };
  }

  logger.info("Extracting structural memory delta via background LLM...");
  const delta = await extractMemoryFromContent(capped, rootDir, options.provider, options.model);

  // Proposal queue (SEC-1)
  const proposal = createProposal("capture", delta, "cli_capture", rootDir);
  logger.success(`Extracted memory proposal: ${logger.bold(proposal.id)} [Risk: ${proposal.risk.toUpperCase()}]`);

  const shouldAutoApply = options.auto || config.proposals?.auto_apply_low_risk;
  if (shouldAutoApply && proposal.risk === "low") {
    const { reconcileResult } = await acceptProposal(proposal.id, "auto_capture", rootDir);
    logger.success(`[AUTO] Proposal accepted and applied (+${reconcileResult.newDecisions.length} decisions, ${reconcileResult.updatedFiles.length} files updated).`);
    return { proposal, autoApplied: true };
  }

  if (proposal.risk === "high") {
    logger.warn(`Proposal flagged as HIGH RISK (${proposal.flags.join(", ")}). Human review required.`);
    logger.info(`Run 'vee review' or 'vee accept ${proposal.id}' to inspect and apply.`);
  } else {
    logger.info(`Proposal queued for review. Run 'vee accept ${proposal.id}' to apply.`);
  }

  return { proposal, autoApplied: false };
}

async function readStdin(): Promise<string> {
  return new Promise((resolve) => {
    let data = "";
    if (process.stdin.isTTY) {
      resolve("");
      return;
    }
    process.stdin.setEncoding("utf-8");
    process.stdin.on("data", (chunk) => (data += chunk));
    process.stdin.on("end", () => resolve(data));
  });
}
