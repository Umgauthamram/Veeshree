import type { ExtractionDelta } from "../schemas/extraction.schema.js";

export interface ProviderCallOptions {
  apiKey?: string;
  baseUrl?: string;
  timeoutMs?: number;
}

export interface Extractor {
  readonly name: string;
  readonly isLocal: boolean;
  extract(payload: string, model: string, options?: ProviderCallOptions): Promise<ExtractionDelta>;
}
