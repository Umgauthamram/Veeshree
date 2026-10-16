import { z } from "zod";
import { ExtractionDeltaSchema } from "./extraction.schema.js";

export const ProposalSourceSchema = z.enum(["watch", "capture", "mcp", "manual", "cli", "test"]);
export type ProposalSource = z.infer<typeof ProposalSourceSchema>;

export const ProposalStatusSchema = z.enum(["pending", "accepted", "rejected"]);
export type ProposalStatus = z.infer<typeof ProposalStatusSchema>;

export const ProposalRiskSchema = z.enum(["low", "high"]);
export type ProposalRisk = z.infer<typeof ProposalRiskSchema>;

export const ProposalSchema = z.object({
  id: z.string(),
  created_at: z.string(),
  source: ProposalSourceSchema,
  agent: z.string().optional(),
  delta: ExtractionDeltaSchema,
  risk: ProposalRiskSchema,
  flags: z.array(z.string()).default([]),
  status: ProposalStatusSchema.default("pending"),
  reviewed_at: z.string().optional(),
  reviewed_by: z.string().optional(),
});

export type Proposal = z.infer<typeof ProposalSchema>;
