import type { Extractor, ProviderCallOptions } from "./types.js";
import type { ExtractionDelta } from "../schemas/extraction.schema.js";
import { EXTRACTION_SYSTEM_PROMPT, validateExtractionJson } from "./common.js";
import { VeeError } from "../utils/errors.js";

export class LmStudioExtractor implements Extractor {
  readonly name = "lmstudio";
  readonly isLocal = true;

  async extract(payload: string, model: string, options: ProviderCallOptions = {}): Promise<ExtractionDelta> {
    const endpoint = (options.baseUrl || "http://127.0.0.1:1234/v1").replace(/\/+$/, "");

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), options.timeoutMs || 45000);

    try {
      const response = await fetch(`${endpoint}/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: model || "local-model",
          messages: [
            { role: "system", content: EXTRACTION_SYSTEM_PROMPT },
            { role: "user", content: `TRANSCRIPT / DIFF:\n${payload}` },
          ],
          response_format: { type: "json_object" },
          temperature: 0.1,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new VeeError(`LM Studio returned status ${response.status}: ${await response.text()}`, "ERR_PROVIDER_FAILURE");
      }

      const data = (await response.json()) as any;
      const rawText = data.choices?.[0]?.message?.content;
      if (!rawText) {
        throw new VeeError("LM Studio returned empty completion response.", "ERR_PROVIDER_FAILURE");
      }

      return validateExtractionJson(rawText);
    } catch (err: any) {
      if (err.name === "AbortError") {
        throw new VeeError("LM Studio extraction request timed out.", "ERR_PROVIDER_FAILURE");
      }
      throw err instanceof VeeError ? err : new VeeError(`LM Studio call failed: ${err.message}`, "ERR_PROVIDER_FAILURE");
    } finally {
      clearTimeout(timeout);
    }
  }
}
