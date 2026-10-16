import type { Extractor, ProviderCallOptions } from "./types.js";
import type { ExtractionDelta } from "../schemas/extraction.schema.js";
import { EXTRACTION_SYSTEM_PROMPT, validateExtractionJson } from "./common.js";
import { VeeError } from "../utils/errors.js";

export class AnthropicExtractor implements Extractor {
  readonly name = "anthropic";
  readonly isLocal = false;

  async extract(payload: string, model: string, options: ProviderCallOptions = {}): Promise<ExtractionDelta> {
    if (!options.apiKey) {
      throw new VeeError("Anthropic API key is required. Run 'vee keys set anthropic <KEY>'", "ERR_AUTH_REQUIRED");
    }

    const baseUrl = (options.baseUrl || "https://api.anthropic.com/v1").replace(/\/+$/, "");
    const url = `${baseUrl}/messages`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), options.timeoutMs || 30000);

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": options.apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model,
          max_tokens: 4096,
          system: EXTRACTION_SYSTEM_PROMPT,
          messages: [
            {
              role: "user",
              content: `TRANSCRIPT / DIFF:\n${payload}`,
            },
          ],
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new VeeError(`Anthropic API returned status ${response.status}: ${errText}`, "ERR_PROVIDER_FAILURE");
      }

      const data = (await response.json()) as any;
      const rawText = data.content?.[0]?.text;
      if (!rawText) {
        throw new VeeError("Anthropic returned empty completion content.", "ERR_PROVIDER_FAILURE");
      }

      return validateExtractionJson(rawText);
    } catch (err: any) {
      if (err.name === "AbortError") {
        throw new VeeError("Anthropic extraction request timed out after 30 seconds.", "ERR_PROVIDER_FAILURE");
      }
      throw err instanceof VeeError ? err : new VeeError(`Anthropic call failed: ${err.message}`, "ERR_PROVIDER_FAILURE");
    } finally {
      clearTimeout(timeout);
    }
  }
}
