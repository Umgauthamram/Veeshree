import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { PROPOSALS_DIR_REL, VEE_DIR_REL } from "../../utils/constants.js";
import { ProposalSchema, type Proposal, type ProposalSource, type ProposalStatus } from "../../schemas/proposal.schema.js";
import type { ExtractionDelta } from "../../schemas/extraction.schema.js";
import { scoreProposalRisk } from "./risk.js";
import { writeAtomic } from "../memory/atomic.js";
import { reconcileExtractionSafe, type ReconcileResult } from "../reconcile/reconciler.js";
import { runGarbageCollection } from "../gc.js";
import { buildIndex } from "../indexer.js";
import { VeeError } from "../../utils/errors.js";

/**
 * Creates a new Proposal and writes it to .vee/proposals/<id>.json
 */
export function createProposal(
  sourceOrDelta: ProposalSource | ExtractionDelta,
  deltaOrRootDir?: ExtractionDelta | string,
  agentOrRootDir?: string,
  rootDirArg?: string
): Proposal {
  let source: ProposalSource = "watch";
  let delta: ExtractionDelta;
  let agent: string | undefined;
  let rootDir: string = process.cwd();

  if (typeof sourceOrDelta === "string") {
    source = sourceOrDelta as ProposalSource;
    delta = deltaOrRootDir as ExtractionDelta;
    agent = agentOrRootDir;
    rootDir = rootDirArg || process.cwd();
  } else {
    delta = sourceOrDelta;
    source = "cli";
    if (typeof deltaOrRootDir === "string") {
      rootDir = deltaOrRootDir;
      agent = agentOrRootDir;
    }
  }

  const proposalsDir = path.join(rootDir, PROPOSALS_DIR_REL);
  if (!fs.existsSync(proposalsDir)) {
    fs.mkdirSync(proposalsDir, { recursive: true });
  }

  const { risk, flags } = scoreProposalRisk(delta);
  const randomSuffix = crypto.randomBytes(4).toString("hex");
  const id = `prop_${Date.now()}_${randomSuffix}`;

  const proposal: Proposal = {
    id,
    created_at: new Date().toISOString(),
    source,
    agent,
    delta,
    risk,
    flags,
    status: "pending",
  };

  saveProposal(proposal, rootDir);
  return proposal;
}

/**
 * Saves a Proposal to disk atomically
 */
export function saveProposal(proposal: Proposal, rootDir: string = process.cwd()): void {
  const proposalsDir = path.join(rootDir, PROPOSALS_DIR_REL);
  if (!fs.existsSync(proposalsDir)) {
    fs.mkdirSync(proposalsDir, { recursive: true });
  }

  const filePath = path.join(proposalsDir, `${proposal.id}.json`);
  writeAtomic(filePath, JSON.stringify(proposal, null, 2));
}

/**
 * Reads a single Proposal by id
 */
export function getProposal(id: string, rootDir: string = process.cwd()): Proposal | null {
  const cleanId = id.endsWith(".json") ? id.slice(0, -5) : id;
  const filePath = path.join(rootDir, PROPOSALS_DIR_REL, `${cleanId}.json`);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    const json = JSON.parse(raw);
    const parsed = ProposalSchema.safeParse(json);
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

/**
 * Lists proposals, optionally filtered by status
 */
export function listProposals(
  rootDir: string = process.cwd(),
  statusFilter?: ProposalStatus
): Proposal[] {
  const proposalsDir = path.join(rootDir, PROPOSALS_DIR_REL);
  if (!fs.existsSync(proposalsDir)) return [];

  const files = fs.readdirSync(proposalsDir).filter((f) => f.endsWith(".json"));
  const proposals: Proposal[] = [];

  for (const f of files) {
    const p = getProposal(f, rootDir);
    if (p) {
      if (!statusFilter || p.status === statusFilter) {
        proposals.push(p);
      }
    }
  }

  return proposals.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

/**
 * Accepts a proposal:
 * - applies delta into docs/memory
 * - marks proposal as accepted
 * - runs automatic maintenance (gc & index)
 */
export async function acceptProposal(
  id: string,
  reviewerOrRootDir: string = "human",
  rootDirArg?: string
): Promise<{ proposal: Proposal; reconcileResult: ReconcileResult; success: boolean }> {
  let reviewer = "human";
  let rootDir = process.cwd();

  if (rootDirArg) {
    reviewer = reviewerOrRootDir;
    rootDir = rootDirArg;
  } else if (
    reviewerOrRootDir &&
    (path.isAbsolute(reviewerOrRootDir) ||
      fs.existsSync(reviewerOrRootDir) ||
      reviewerOrRootDir.includes("/") ||
      reviewerOrRootDir.includes("\\"))
  ) {
    rootDir = reviewerOrRootDir;
    reviewer = "human";
  } else {
    reviewer = reviewerOrRootDir;
  }

  const proposal = getProposal(id, rootDir);
  if (!proposal) {
    throw new VeeError(`Proposal '${id}' not found.`, "ERR_PROPOSAL_NOT_FOUND");
  }

  if (proposal.status !== "pending") {
    throw new VeeError(`Proposal '${id}' is already ${proposal.status}.`, "ERR_INVALID_ARGS");
  }

  // Apply changes to memory
  const reconcileResult = await reconcileExtractionSafe(proposal.delta, rootDir, {
    source: proposal.source,
    acceptedBy: reviewer,
    createSnapshot: true,
  });

  // Update proposal record
  proposal.status = "accepted";
  proposal.reviewed_at = new Date().toISOString();
  proposal.reviewed_by = reviewer;
  saveProposal(proposal, rootDir);

  // Auto maintenance (Section 3.4)
  try {
    runGarbageCollection(rootDir);
  } catch {
    // ignore
  }

  // Update index cache
  buildIndex(rootDir);

  return {
    proposal,
    reconcileResult,
    success: true,
  };
}

/**
 * Rejects a proposal
 */
export function rejectProposal(
  id: string,
  reviewerOrRootDir: string = "human",
  rootDirArg?: string
): { proposal: Proposal; success: boolean } {
  let reviewer = "human";
  let rootDir = process.cwd();

  if (rootDirArg) {
    reviewer = reviewerOrRootDir;
    rootDir = rootDirArg;
  } else if (
    reviewerOrRootDir &&
    (path.isAbsolute(reviewerOrRootDir) ||
      fs.existsSync(reviewerOrRootDir) ||
      reviewerOrRootDir.includes("/") ||
      reviewerOrRootDir.includes("\\"))
  ) {
    rootDir = reviewerOrRootDir;
    reviewer = "human";
  } else {
    reviewer = reviewerOrRootDir;
  }

  const proposal = getProposal(id, rootDir);
  if (!proposal) {
    throw new VeeError(`Proposal '${id}' not found.`, "ERR_PROPOSAL_NOT_FOUND");
  }

  if (proposal.status !== "pending") {
    throw new VeeError(`Proposal '${id}' is already ${proposal.status}.`, "ERR_INVALID_ARGS");
  }

  proposal.status = "rejected";
  proposal.reviewed_at = new Date().toISOString();
  proposal.reviewed_by = reviewer;
  saveProposal(proposal, rootDir);

  return { proposal, success: true };
}
