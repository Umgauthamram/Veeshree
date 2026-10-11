import { detectAvailableModels } from "./models.js";
import { getApiKey } from "./auth.js";
import { loadConfig } from "./config.js";

export interface ResolvedEngine {
  provider: "ollama" | "lmstudio" | "gemini" | "groq" | "nvidia" | "openai";
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
 * 4. Configured default extractor from .vee/config.json (if key is set)
 * 5. Gemini (from GEMINI_API_KEY env, .env, keystore, or .vee/config.json)
 * 6. Groq (from GROQ_API_KEY env, .env, keystore, or .vee/config.json)
 * 7. NVIDIA (from NVIDIA_API_KEY env, .env, keystore, or .vee/config.json)
 * 8. OpenAI (from OPENAI_API_KEY env, .env, keystore, or .vee/config.json)
 */
export async function resolveActiveEngine(
  rootDir: string = process.cwd(),
  customProvider?: string,
  customModel?: string
): Promise<ResolvedEngine> {
  const config = loadConfig(rootDir);

  // 1. If explicit custom provider requested
  if (customProvider) {
    const cp = customProvider.toLowerCase();
    if (cp === "ollama") {
      return {
        provider: "ollama",
        model: customModel || "llama3",
        source: "explicit CLI override",
        isLocal: true,
        endpoint: "http://127.0.0.1:11434",
      };
    }
    if (cp === "lmstudio") {
      return {
        provider: "lmstudio",
        model: customModel || "local-model",
        source: "explicit CLI override",
        isLocal: true,
        endpoint: "http://127.0.0.1:1234",
      };
    }

    const key = getApiKey(cp as any, rootDir);
    if (!key) {
      throw new Error(
        `API key for '${customProvider}' not found. Please set '${cp.toUpperCase()}_API_KEY' or run 'vee keys set ${cp} <KEY>'.`
      );
    }

    if (cp === "gemini") {
      return {
        provider: "gemini",
        model: customModel || "gemini-2.0-flash",
        source: "explicit CLI override",
        isLocal: false,
        apiKey: key,
      };
    }

    if (cp === "groq") {
      return {
        provider: "groq",
        model: customModel || "llama-3.3-70b-versatile",
        source: "explicit CLI override",
        isLocal: false,
        apiKey: key,
        endpoint: "https://api.groq.com/openai/v1/chat/completions",
      };
    }

    if (cp === "nvidia") {
      return {
        provider: "nvidia",
        model: customModel || "meta/llama-3.1-70b-instruct",
        source: "explicit CLI override",
        isLocal: false,
        apiKey: key,
        endpoint: "https://integrate.api.nvidia.com/v1/chat/completions",
      };
    }

    if (cp === "openai") {
      return {
        provider: "openai",
        model: customModel || "gpt-4o-mini",
        source: "explicit CLI override",
        isLocal: false,
        apiKey: key,
        endpoint: "https://api.openai.com/v1/chat/completions",
      };
    }

    throw new Error(`Unsupported provider '${customProvider}'. Supported: gemini, groq, nvidia, openai, ollama, lmstudio`);
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

  // 3. Check if user configured a preferred default_extractor and its key is present
  const preferredProvider = config.default_extractor?.provider;
  if (preferredProvider && preferredProvider !== "gemini") {
    const prefKey = getApiKey(preferredProvider as any, rootDir);
    if (prefKey) {
      const preferredModel = config.default_extractor?.model;
      if (preferredProvider === "groq") {
        return {
          provider: "groq",
          model: preferredModel || "llama-3.3-70b-versatile",
          source: "configured default extractor (.vee/config.json)",
          isLocal: false,
          apiKey: prefKey,
          endpoint: "https://api.groq.com/openai/v1/chat/completions",
        };
      }
      if (preferredProvider === "nvidia") {
        return {
          provider: "nvidia",
          model: preferredModel || "meta/llama-3.1-70b-instruct",
          source: "configured default extractor (.vee/config.json)",
          isLocal: false,
          apiKey: prefKey,
          endpoint: "https://integrate.api.nvidia.com/v1/chat/completions",
        };
      }
      if (preferredProvider === "openai") {
        return {
          provider: "openai",
          model: preferredModel || "gpt-4o-mini",
          source: "configured default extractor (.vee/config.json)",
          isLocal: false,
          apiKey: prefKey,
          endpoint: "https://api.openai.com/v1/chat/completions",
        };
      }
    }
  }

  // 4. Check Cloud Providers with Ambient Environment Keys / Keystore (Gemini -> Groq -> NVIDIA -> OpenAI)
  const geminiKey = getApiKey("gemini", rootDir);
  if (geminiKey) {
    const defaultModel = config.default_extractor?.model && config.default_extractor.provider === "gemini"
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

  const groqKey = getApiKey("groq", rootDir);
  if (groqKey) {
    const defaultModel = config.default_extractor?.model && config.default_extractor.provider === "groq"
      ? config.default_extractor.model
      : "llama-3.3-70b-versatile";
    const envSource = process.env["GROQ_API_KEY"] ? "environment ($GROQ_API_KEY)" : "keystore (~/.veeshree/credentials.json)";
    return {
      provider: "groq",
      model: defaultModel,
      source: envSource,
      isLocal: false,
      apiKey: groqKey,
      endpoint: "https://api.groq.com/openai/v1/chat/completions",
    };
  }

  const nvidiaKey = getApiKey("nvidia", rootDir);
  if (nvidiaKey) {
    const defaultModel = config.default_extractor?.model && config.default_extractor.provider === "nvidia"
      ? config.default_extractor.model
      : "meta/llama-3.1-70b-instruct";
    const envSource = process.env["NVIDIA_API_KEY"] ? "environment ($NVIDIA_API_KEY)" : "keystore (~/.veeshree/credentials.json)";
    return {
      provider: "nvidia",
      model: defaultModel,
      source: envSource,
      isLocal: false,
      apiKey: nvidiaKey,
      endpoint: "https://integrate.api.nvidia.com/v1/chat/completions",
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
      endpoint: "https://api.openai.com/v1/chat/completions",
    };
  }

  // 5. No active model engine found -> informative error
  throw new Error(
    "No active AI engine or API key detected.\n" +
      "  -> To use local models (free): Start Ollama (http://127.0.0.1:11434) or LM Studio.\n" +
      "  -> To use cloud models: Run 'vee keys set <provider> <KEY>' (gemini, groq, nvidia, openai)."
  );
}
