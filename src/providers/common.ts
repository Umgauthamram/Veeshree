import { ExtractionDeltaSchema, type ExtractionDelta } from "../schemas/extraction.schema.js";
import { VeeError } from "../utils/errors.js";

export const EXTRACTION_SYSTEM_PROMPT = `You are Veeshree's background memory extraction engine.
Analyze the provided conversation transcript, coding log, or Git diff.
Extract structural memory updates strictly conforming to this JSON schema:
{
  "decisions": [
    {
      "title": "Short title of architectural choice",
      "decision": "Concrete implementation decided upon",
      "reason": "Why this choice was made",
      "alternatives_considered": ["Alternative 1", "Alternative 2"],
      "linked_files": ["src/path/to/file.ts"],
      "status": "active"
    }
  ],
  "current_state": {
    "current_feature": "Active feature name or focus",
    "completed_in_session": ["Accomplished milestone 1"],
    "next_immediate_steps": ["Next task to work on"]
  },
  "tasks": [
    { "task_name": "Name of task", "action": "add" | "complete" | "remove" }
  ],
  "constraints": [
    { "rule": "Constraint or security rule established", "type": "hard" | "soft" }
  ],
  "rejected_approaches": [
    { "approach": "Rejected technology or design", "reason": "Why it was discarded" }
  ],
  "discoveries": ["Key behavior or technical finding"]
}

Output ONLY valid raw JSON with no Markdown backticks or commentary.`;

/**
 * Strips markdown codeblocks and cleans json string
 */
export function cleanJsonText(raw: string): string {
  let cleaned = raw.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.slice(0, -3);
  }
  cleaned = cleaned.trim();

  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace >= firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }

  return cleaned;
}

/**
 * Validates and parses raw JSON string into a verified ExtractionDelta
 */
export function validateExtractionJson(rawText: string): ExtractionDelta {
  try {
    const cleaned = cleanJsonText(rawText);
    const parsed = JSON.parse(cleaned);
    const result = ExtractionDeltaSchema.safeParse(parsed);
    if (!result.success) {
      throw new VeeError(
        `Model output failed schema validation: ${result.error.message}`,
        "ERR_PROVIDER_FAILURE"
      );
    }
    return result.data;
  } catch (err: any) {
    throw new VeeError(`Failed to parse extraction JSON: ${err.message}`, "ERR_PROVIDER_FAILURE");
  }
}
