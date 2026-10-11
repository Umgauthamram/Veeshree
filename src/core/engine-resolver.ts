import { detectAvailableModels } from "./models.js";
import { getApiKey } from "./auth.js";
import { loadConfig } from "./config.js";

export interface ResolvedEngine {
  provider: "ollama" | "lmstudio" | "gemini" | "openai" | "anthropic";
  model: string;
  source: string;
  isLocal: boolean;
  apiKey?: string;
  endpoint?: string;
}

/**
 * Automatically discovers the best active AI engine / model
 * Hierarchy:
 * 1. Explicit Custom Provider & Model (if passed)
 * 2. Local Ollama (if active on 11434 with downloaded models)
 * 3. Local LM Studio (if active on 1234)
 * 4. Gemini (from GEMINI_API_KEY env or .vee/config.json)
 * 5. OpenAI (from OPENAI_API_KEY env or .vee/config.json)
 * 6. Anthropic (from ANTHROPIC_API_KEY env or .vee/config.json)
 * 7. Configured default extractor from .vee/config.json
 */
export async function resolveActiveEngine(
  rootDir: string = process.cwd(),
  customProvider?: string,
  customModel?: string
): Promise<ResolvedEngine> {
  const config = loadConfig(rootDir);

  // 1. If explicit custom provider requested
  if (customProvider) {
    if (customProvider === "ollama") {
      return {
        provider: "ollama",
        model: customModel || "llama3",
        source: "explicit CLI override",
        isLocal: true,
        endpoint: "http://127.0.0.1:11434",
      };
    }
    if (customProvider === "lmstudio") {
      return {
        provider: "lmstudio",
        model: customModel || "local-model",
        source: "explicit CLI override",
        isLocal: true,
        endpoint: "http://127.0.0.1:1234",
      };
    }
    const key = getApiKey(customProvider as any, rootDir);
    if (!key) {
      throw new Error(
        `API key for '${customProvider}' not found. Please set '${customProvider.toUpperCase()}_API_KEY' or run 'vee keys set ${customProvider} <KEY>'.`
      );
    }
    return {
      provider: customProvider as any,
      model: customModel || (customProvider === "gemini" ? "gemini-2.0-flash" : "gpt-4o-mini"),
      source: "explicit CLI override",
      isLocal: false,
      apiKey: key,
    };
  }

  // 2. Probe Local Engines First (Zero Cost, Zero Data Leaving Machine)
  const availableRuntimes = await detectAvailableModels(rootDir);
  const ollama = availableRuntimes.find((r) => r.provider === "ollama" && r.status === "available");
  if (ollama && ollama.models.length > 0) {
    const selectedModel = ollama.models[0];
    return {
      provider: "ollama",
      model: selectedModel,
      source: `local engine (Ollama on ${ollama.endpoint})`,
      isLocal: true,
      endpoint: ollama.endpoint,
    };
  }

  const lmstudio = availableRuntimes.find((r) => r.provider === "lmstudio" && r.status === "available");
  if (lmstudio && lmstudio.models.length > 0) {
    const selectedModel = lmstudio.models[0];
    return {
      provider: "lmstudio",
      model: selectedModel,
      source: `local engine (LM Studio on ${lmstudio.endpoint})`,
      isLocal: true,
      endpoint: lmstudio.endpoint,
    };
  }

  // 3. Check Cloud Providers with Ambient Environment Keys / Keystore
  const geminiKey = getApiKey("gemini", rootDir);
  if (geminiKey) {
    const defaultModel = config.default_extractor?.model && config.default_extractor.model !== "gemini-2.5-flash"
      ? config.default_extractor.model
      : "gemini-2.0-flash";
    const envSource = process.env["GEMINI_API_KEY"] ? "environment ($GEMINI_API_KEY)" : "keystore (~/.veeshree/credentials.json)";
    return {
      provider: "gemini",
      model: defaultModel,
      source: envSource,
      isLocal: false,
      apiKey: geminiKey,
    };
  }

  const openaiKey = getApiKey("openai", rootDir);
  if (openaiKey) {
    const defaultModel = config.default_extractor?.model && config.default_extractor.provider === "openai"
      ? config.default_extractor.model
      : "gpt-4o-mini";
    const envSource = process.env["OPENAI_API_KEY"] ? "environment ($OPENAI_API_KEY)" : "keystore (~/.veeshree/credentials.json)";
    return {
      provider: "openai",
      model: defaultModel,
      source: envSource,
      isLocal: false,
      apiKey: openaiKey,
    };
  }

  const anthropicKey = getApiKey("anthropic", rootDir);
  if (anthropicKey) {
    const defaultModel = config.default_extractor?.model && config.default_extractor.provider === "anthropic"
      ? config.default_extractor.model
      : "claude-3-5-haiku";
    const envSource = process.env["ANTHROPIC_API_KEY"] ? "environment ($ANTHROPIC_API_KEY)" : "keystore (~/.veeshree/credentials.json)";
    return {
      provider: "anthropic",
      model: defaultModel,
      source: envSource,
      isLocal: false,
      apiKey: anthropicKey,
    };
  }

  // 4. No active model engine found -> informative error
  throw new Error(
    "No active AI engine or API key detected.\n" +
      "  -> To use local models (free): Start Ollama (http://127.0.0.1:11434) or LM Studio.\n" +
      "  -> To use cloud models: Run 'vee keys set gemini <KEY>' or export GEMINI_API_KEY."
  );
}
