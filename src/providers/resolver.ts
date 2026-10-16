import type { Extractor } from "./types.js";
import { GeminiExtractor } from "./gemini.js";
import { OpenAIExtractor } from "./openai.js";
import { AnthropicExtractor } from "./anthropic.js";
import { OllamaExtractor } from "./ollama.js";
import { LmStudioExtractor } from "./lmstudio.js";
import { getApiKey } from "../core/auth.js";
import { loadConfig } from "../core/config.js";
import { assertCloudConsent } from "../core/redact/redactor.js";
import { DEFAULT_MODELS } from "../utils/constants.js";
import { VeeError } from "../utils/errors.js";

export interface ResolvedEngine {
  extractor: Extractor;
  provider: string;
  model: string;
  apiKey?: string;
  baseUrl?: string;
}

export async function resolveEngine(
  rootDir: string = process.cwd(),
  customProvider?: string,
  customModel?: string
): Promise<ResolvedEngine> {
  const config = loadConfig(rootDir);

  const provider = (
    customProvider ||
    config.extractor?.provider ||
    config.default_extractor?.provider ||
    "gemini"
  ).toLowerCase();

  let extractor: Extractor;
  let defaultModel: string = DEFAULT_MODELS.gemini;

  switch (provider) {
    case "gemini":
      extractor = new GeminiExtractor();
      defaultModel = DEFAULT_MODELS.gemini;
      break;
    case "openai":
      extractor = new OpenAIExtractor("openai", "https://api.openai.com/v1");
      defaultModel = DEFAULT_MODELS.openai;
      break;
    case "anthropic":
      extractor = new AnthropicExtractor();
      defaultModel = DEFAULT_MODELS.anthropic;
      break;
    case "groq":
      extractor = new OpenAIExtractor("groq", "https://api.groq.com/openai/v1");
      defaultModel = DEFAULT_MODELS.groq;
      break;
    case "nvidia":
      extractor = new OpenAIExtractor("nvidia", "https://integrate.api.nvidia.com/v1");
      defaultModel = DEFAULT_MODELS.nvidia;
      break;
    case "ollama":
      extractor = new OllamaExtractor();
      defaultModel = DEFAULT_MODELS.ollama;
      break;
    case "lmstudio":
      extractor = new LmStudioExtractor();
      defaultModel = DEFAULT_MODELS.lmstudio;
      break;
    default:
      throw new VeeError(`Unsupported AI model provider: '${provider}'.`, "ERR_INVALID_ARGS");
  }

  // Model resolution
  const model =
    customModel ||
    config.extractor?.model ||
    config.default_extractor?.model ||
    defaultModel;

  const baseUrl = config.extractor?.base_url;

  let apiKey: string | undefined;
  if (!extractor.isLocal) {
    apiKey = getApiKey(provider as any, rootDir);

    // SEC-2: Cloud Consent check
    await assertCloudConsent(config);
  }

  return {
    extractor,
    provider,
    model,
    apiKey,
    baseUrl,
  };
}
