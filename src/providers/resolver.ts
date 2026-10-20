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
import { validateModel } from "./models.js";
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
  let defaultModel: string = DEFAULT_MODELS.gemini || "gemini-2.0-flash";

  switch (provider) {
    case "gemini":
      extractor = new GeminiExtractor();
      defaultModel = DEFAULT_MODELS.gemini || "gemini-2.0-flash";
      break;
    case "openai":
      extractor = new OpenAIExtractor("openai", "https://api.openai.com/v1");
      defaultModel = DEFAULT_MODELS.openai || "gpt-4o-mini";
      break;
    case "anthropic":
      extractor = new AnthropicExtractor();
      defaultModel = DEFAULT_MODELS.anthropic || "claude-3-5-sonnet-20241022";
      break;
    case "groq":
      extractor = new OpenAIExtractor("groq", "https://api.groq.com/openai/v1");
      defaultModel = DEFAULT_MODELS.groq || "llama-3.3-70b-versatile";
      break;
    case "nvidia":
      extractor = new OpenAIExtractor("nvidia", "https://integrate.api.nvidia.com/v1");
      defaultModel = DEFAULT_MODELS.nvidia || "meta/llama-3.1-70b-instruct";
      break;
    case "ollama":
      extractor = new OllamaExtractor();
      defaultModel = DEFAULT_MODELS.ollama || "llama3.2";
      break;
    case "lmstudio":
      extractor = new LmStudioExtractor();
      defaultModel = DEFAULT_MODELS.lmstudio || "default";
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

  const validation = validateModel(provider, model);
  if (!validation.valid) {
    throw new VeeError(
      `Unknown model '${model}' for provider '${provider}'. Did you mean '${validation.suggested}'? Available models: ${validation.available.join(", ")}`,
      "ERR_INVALID_MODEL"
    );
  }

  const baseUrl = config.extractor?.base_url;

  let apiKey: string | undefined;
  if (!extractor.isLocal) {
    apiKey = getApiKey(provider as any, rootDir);

    // SEC-2: Cloud Consent check
    await assertCloudConsent(config, undefined, rootDir);
  }

  return {
    extractor,
    provider,
    model,
    apiKey,
    baseUrl,
  };
}
