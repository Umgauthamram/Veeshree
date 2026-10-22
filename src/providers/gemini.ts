import type { Extractor, ProviderCallOptions } from "./types.js";
import type { ExtractionDelta } from "../schemas/extraction.schema.js";
import { EXTRACTION_SYSTEM_PROMPT, validateExtractionJson } from "./common.js";
import { VeeError } from "../utils/errors.js";

export class GeminiExtractor implements Extractor {
  readonly name = "gemini";
  readonly isLocal = false;

  async extract(
    payload: string,
    model: string,
    options: ProviderCallOptions = {}
  ): Promise<ExtractionDelta> {
    if (!options.apiKey) {
      throw new VeeError(
        "Gemini API key is required. Run 'vee keys set gemini <KEY>'",
        "ERR_AUTH_REQUIRED"
      );
    }

    // SEC-3: Gemini API key sent in header, NEVER in URL
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), options.timeoutMs || 30000);

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": options.apiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: `${EXTRACTION_SYSTEM_PROMPT}\n\nTRANSCRIPT / DIFF:\n${payload}` }],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
          },
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new VeeError(
          `Gemini API returned status ${response.status}: ${errText}`,
          "ERR_PROVIDER_FAILURE"
        );
      }

      interface GeminiResponse {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      }
      const data = (await response.json()) as GeminiResponse;
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) {
        throw new VeeError(
          "Gemini returned empty or malformed completion candidate.",
          "ERR_PROVIDER_FAILURE"
        );
      }

      return validateExtractionJson(rawText);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") {
        throw new VeeError(
          "Gemini extraction request timed out after 30 seconds.",
          "ERR_PROVIDER_FAILURE"
        );
      }
      throw err instanceof VeeError
        ? err
        : new VeeError(
            `Gemini call failed: ${err instanceof Error ? err.message : String(err)}`,
            "ERR_PROVIDER_FAILURE"
          );
    } finally {
      clearTimeout(timeout);
    }
  }
}
