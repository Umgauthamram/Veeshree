import { resolveEngine } from "../providers/resolver.js";
import type { ExtractionDelta } from "../schemas/extraction.schema.js";

/**
 * Extracts structured memory updates from content using resolved AI engine
 */
export async function extractMemoryFromContent(
  content: string,
  rootDir: string = process.cwd(),
  customProvider?: string,
  customModel?: string
): Promise<ExtractionDelta> {
  const resolved = await resolveEngine(rootDir, customProvider, customModel);
  return resolved.extractor.extract(content, resolved.model, {
    apiKey: resolved.apiKey,
    baseUrl: resolved.baseUrl,
  });
}
