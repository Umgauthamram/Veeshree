import { z } from "zod";

export const ExtractionDecisionSchema = z.object({
  title: z.string(),
  decision: z.string(),
  reason: z.string(),
  alternatives_considered: z.array(z.string()).optional().default([]),
  linked_files: z.array(z.string()).optional().default([]),
  status: z.enum(["active", "superseded", "proposed"]).default("active"),
  tags: z.array(z.string()).optional().default([]),
  supersedes: z.string().optional(),
});

export const ExtractionTaskSchema = z.object({
  task_name: z.string(),
  action: z.enum(["add", "complete", "remove"]).default("add"),
});

export const ExtractionConstraintSchema = z.object({
  rule: z.string(),
  type: z.enum(["hard", "soft"]).default("hard"),
  source: z.string().optional(),
  accepted_by: z.string().optional(),
});

export const ExtractionRejectedSchema = z.object({
  approach: z.string(),
  reason: z.string(),
});

export const ExtractionCurrentStateSchema = z.object({
  current_feature: z.string().optional().default(""),
  completed_in_session: z.array(z.string()).optional().default([]),
  next_immediate_steps: z.array(z.string()).optional().default([]),
});

export const ExtractionDeltaSchema = z.object({
  decisions: z.array(ExtractionDecisionSchema).default([]),
  current_state: ExtractionCurrentStateSchema.default({}),
  tasks: z.array(ExtractionTaskSchema).default([]),
  constraints: z.array(ExtractionConstraintSchema).default([]),
  rejected_approaches: z.array(ExtractionRejectedSchema).default([]),
  discoveries: z.array(z.string()).default([]),
});

export type ExtractionDelta = z.infer<typeof ExtractionDeltaSchema>;
export type ExtractionDecision = z.infer<typeof ExtractionDecisionSchema>;
export type ExtractionTask = z.infer<typeof ExtractionTaskSchema>;
export type ExtractionConstraint = z.infer<typeof ExtractionConstraintSchema>;
export type ExtractionRejected = z.infer<typeof ExtractionRejectedSchema>;
export type ExtractionCurrentState = z.infer<typeof ExtractionCurrentStateSchema>;
