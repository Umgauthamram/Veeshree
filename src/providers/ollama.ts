import type { Extractor, ProviderCallOptions } from "./types.js";
import type { ExtractionDelta } from "../schemas/extraction.schema.js";
import { EXTRACTION_SYSTEM_PROMPT, validateExtractionJson } from "./common.js";
import { VeeError } from "../utils/errors.js";
import { logger } from "../utils/logger.js";

const EMBEDDING_MODEL_PATTERNS = [/embed/i, /bge/i, /minilm/i, /nomic/i, /bert/i, /rerank/i];

export class OllamaExtractor implements Extractor {
  readonly name = "ollama";
  readonly isLocal = true;

  async extract(
    payload: string,
    modelName: string,
    options: ProviderCallOptions = {}
  ): Promise<ExtractionDelta> {
    const endpoint = (options.baseUrl || "http://127.0.0.1:11434").replace(/\/+$/, "");

    let activeModel = modelName;
    if (!activeModel || activeModel === "default") {
      activeModel = await this.selectNonEmbeddingModel(endpoint);
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), options.timeoutMs || 45000);

    try {
      const response = await fetch(`${endpoint}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: activeModel,
          system: EXTRACTION_SYSTEM_PROMPT,
          prompt: `TRANSCRIPT / DIFF:\n${payload}`,
          stream: false,
          format: "json",
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new VeeError(
          `Ollama API error (${response.status}): ${await response.text()}`,
          "ERR_PROVIDER_FAILURE"
        );
      }

      interface OllamaResponse {
        response?: string;
      }
      const data = (await response.json()) as OllamaResponse;
      if (!data.response) {
        throw new VeeError("Ollama returned empty response.", "ERR_PROVIDER_FAILURE");
      }

      return validateExtractionJson(data.response);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") {
        throw new VeeError("Ollama extraction request timed out.", "ERR_PROVIDER_FAILURE");
      }
      throw err instanceof VeeError
        ? err
        : new VeeError(
            `Ollama call failed: ${err instanceof Error ? err.message : String(err)}`,
            "ERR_PROVIDER_FAILURE"
          );
    } finally {
      clearTimeout(timeout);
    }
  }

  private async selectNonEmbeddingModel(endpoint: string): Promise<string> {
    try {
      const res = await fetch(`${endpoint}/api/tags`, { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        interface OllamaTagsResponse {
          models?: Array<{ name?: string; model?: string }>;
        }
        const json = (await res.json()) as OllamaTagsResponse;
        const models: string[] = Array.isArray(json.models)
          ? json.models.map((m) => m.name || m.model || "").filter(Boolean)
          : [];
        const nonEmbedding = models.filter(
          (m) => !EMBEDDING_MODEL_PATTERNS.some((pat) => pat.test(m))
        );
        if (nonEmbedding.length > 0 && nonEmbedding[0]) {
          return nonEmbedding[0];
        }
      }
    } catch (err: unknown) {
      logger.debug(`Ollama tags probe failed: ${err instanceof Error ? err.message : String(err)}`);
    }
    return "llama3.2";
  }
}
