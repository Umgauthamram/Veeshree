import { z } from "zod";
import { VEESHREE_VERSION } from "../utils/constants.js";

export const ExtractorProviderSchema = z.enum([
  "gemini",
  "openai",
  "anthropic",
  "groq",
  "nvidia",
  "ollama",
  "lmstudio",
]);

export type ExtractorProvider = z.infer<typeof ExtractorProviderSchema>;

export const VeeshreeConfigSchema = z.object({
  schema_version: z.number().default(1),
  version: z.string().optional().default(VEESHREE_VERSION),
  extractor: z
    .object({
      provider: ExtractorProviderSchema.default("gemini"),
      model: z.string().default("gemini-2.0-flash"),
      base_url: z.string().optional(),
    })
    .default({
      provider: "gemini",
      model: "gemini-2.0-flash",
    }),
  privacy: z
    .object({
      allow_cloud: z.boolean().default(false),
      max_payload_bytes: z.number().default(24576),
    })
    .default({
      allow_cloud: false,
      max_payload_bytes: 24576,
    }),
  context: z
    .object({
      max_tokens: z.number().default(2000),
      constraints_cap: z.number().default(400),
      state_cap: z.number().default(450),
      decisions_cap: z.number().default(800),
    })
    .default({
      max_tokens: 2000,
      constraints_cap: 400,
      state_cap: 450,
      decisions_cap: 800,
    }),
  watch: z
    .object({
      debounce_seconds: z.number().default(5),
      max_calls_per_hour: z.number().default(30),
      auto: z.boolean().default(false),
    })
    .default({
      debounce_seconds: 5,
      max_calls_per_hour: 30,
      auto: false,
    }),
  hooks: z
    .object({
      enabled: z.boolean().default(true),
      block_on_drift: z.boolean().default(false),
    })
    .default({
      enabled: true,
      block_on_drift: false,
    }),
  proposals: z
    .object({
      auto_apply_low_risk: z.boolean().default(false),
    })
    .default({
      auto_apply_low_risk: false,
    }),
  gc: z
    .object({
      max_progress: z.number().default(5),
      max_completed_tasks: z.number().default(20),
    })
    .default({
      max_progress: 5,
      max_completed_tasks: 20,
    }),

  // Backwards compatibility with 0.3.x projects
  keys: z.record(z.string()).optional().default({}),
  default_extractor: z
    .object({
      provider: z.string().optional(),
      model: z.string().optional(),
    })
    .optional(),
  local_engine: z
    .object({
      enabled: z.boolean().optional(),
      port: z.number().optional(),
      model: z.string().optional(),
    })
    .optional(),
  settings: z
    .object({
      max_context_tokens: z.number().optional(),
      auto_sync_on_commit: z.boolean().optional(),
    })
    .optional(),
});

export type VeeshreeConfig = z.infer<typeof VeeshreeConfigSchema>;
