import { z } from "zod";

export const LinkedFileEntrySchema = z.union([
  z.string().transform((val) => ({ path: val, sha256: undefined as string | undefined })),
  z.object({
    path: z.string(),
    sha256: z.string().optional(),
  }),
]);

export type LinkedFileEntry = z.infer<typeof LinkedFileEntrySchema>;

export const DecisionFrontmatterSchema = z.object({
  id: z.string().optional(),
  title: z.string().optional(),
  status: z.enum(["active", "superseded", "proposed"]).default("active"),
  date: z.string().optional(),
  tags: z.array(z.string()).default([]),
  linked_files: z.array(LinkedFileEntrySchema).default([]),
  supersedes: z.string().optional(),
  superseded_by: z.string().optional(),
  generated_by: z.string().optional(),
});

export type DecisionFrontmatter = z.infer<typeof DecisionFrontmatterSchema>;
