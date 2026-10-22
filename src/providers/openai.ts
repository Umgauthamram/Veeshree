import type { Extractor, ProviderCallOptions } from "./types.js";
import type { ExtractionDelta } from "../schemas/extraction.schema.js";
import { EXTRACTION_SYSTEM_PROMPT, validateExtractionJson } from "./common.js";
import { VeeError } from "../utils/errors.js";

export class OpenAIExtractor implements Extractor {
  readonly name: string;
  readonly isLocal = false;
  private defaultBaseUrl: string;

  constructor(name: string = "openai", defaultBaseUrl: string = "https://api.openai.com/v1") {
    this.name = name;
    this.defaultBaseUrl = defaultBaseUrl;
  }

  async extract(
    payload: string,
    model: string,
    options: ProviderCallOptions = {}
  ): Promise<ExtractionDelta> {
    if (!options.apiKey) {
      throw new VeeError(
        `${this.name} API key is required. Run 'vee keys set ${this.name} <KEY>'`,
        "ERR_AUTH_REQUIRED"
      );
    }

    const baseUrl = (options.baseUrl || this.defaultBaseUrl).replace(/\/+$/, "");
    const url = `${baseUrl}/chat/completions`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), options.timeoutMs || 30000);

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${options.apiKey}`,
        },
        body: JSON.stringify({
          model,
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
        const errText = await response.text();
        throw new VeeError(
          `${this.name} API returned status ${response.status}: ${errText}`,
          "ERR_PROVIDER_FAILURE"
        );
      }

      interface OpenAIResponse {
        choices?: Array<{ message?: { content?: string } }>;
      }
      const data = (await response.json()) as OpenAIResponse;
      const rawText = data.choices?.[0]?.message?.content;
      if (!rawText) {
        throw new VeeError(
          `${this.name} returned empty completion response.`,
          "ERR_PROVIDER_FAILURE"
        );
      }

      return validateExtractionJson(rawText);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") {
        throw new VeeError(
          `${this.name} extraction request timed out after 30 seconds.`,
          "ERR_PROVIDER_FAILURE"
        );
      }
      throw err instanceof VeeError
        ? err
        : new VeeError(
            `${this.name} call failed: ${err instanceof Error ? err.message : String(err)}`,
            "ERR_PROVIDER_FAILURE"
          );
    } finally {
      clearTimeout(timeout);
    }
  }
}
