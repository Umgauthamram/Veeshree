import http from "node:http";
import type { ModelRuntimeInfo } from "../types/index.js";
import { getApiKey } from "./auth.js";

async function probeHttpJson(url: string, timeoutMs: number = 800): Promise<{ ok: boolean; data?: any; latencyMs?: number }> {
  return new Promise((resolve) => {
    const startTime = Date.now();
    try {
      const u = new URL(url);
      const req = http.request(
        {
          hostname: u.hostname,
          port: u.port,
          path: u.pathname + (u.search || ""),
          method: "GET",
          timeout: timeoutMs,
        },
        (res) => {
          let data = "";
          res.on("data", (chunk) => (data += chunk));
          res.on("end", () => {
            const latencyMs = Date.now() - startTime;
            if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
              try {
                resolve({ ok: true, data: JSON.parse(data), latencyMs });
              } catch {
                resolve({ ok: true, data, latencyMs });
              }
            } else {
              resolve({ ok: false, latencyMs });
            }
          });
        }
      );

      req.on("error", () => resolve({ ok: false }));
      req.on("timeout", () => {
        req.destroy();
        resolve({ ok: false });
      });
      req.end();
    } catch {
      resolve({ ok: false });
    }
  });
}

export async function detectAvailableModels(rootDir: string = process.cwd()): Promise<ModelRuntimeInfo[]> {
  const runtimes: ModelRuntimeInfo[] = [];

  // 1. Probe Local Ollama (port 11434)
  const ollamaProbe = await probeHttpJson("http://127.0.0.1:11434/api/tags");
  if (ollamaProbe.ok && ollamaProbe.data && Array.isArray(ollamaProbe.data.models)) {
    const modelNames = ollamaProbe.data.models.map((m: any) => m.name || m.model);
    runtimes.push({
      name: "Ollama (Local Engine)",
      provider: "ollama",
      status: "available",
      endpoint: "http://127.0.0.1:11434",
      models: modelNames.length > 0 ? modelNames : ["default"],
      latencyMs: ollamaProbe.latencyMs,
    });
  } else {
    runtimes.push({
      name: "Ollama (Local Engine)",
      provider: "ollama",
      status: "unavailable",
      endpoint: "http://127.0.0.1:11434",
      models: [],
    });
  }

  // 2. Probe Local LM Studio (port 1234)
  const lmStudioProbe = await probeHttpJson("http://127.0.0.1:1234/v1/models");
  if (lmStudioProbe.ok && lmStudioProbe.data && Array.isArray(lmStudioProbe.data.data)) {
    const modelNames = lmStudioProbe.data.data.map((m: any) => m.id);
    runtimes.push({
      name: "LM Studio (Local Engine)",
      provider: "lmstudio",
      status: "available",
      endpoint: "http://127.0.0.1:1234",
      models: modelNames.length > 0 ? modelNames : ["local-model"],
      latencyMs: lmStudioProbe.latencyMs,
    });
  } else {
    runtimes.push({
      name: "LM Studio (Local Engine)",
      provider: "lmstudio",
      status: "unavailable",
      endpoint: "http://127.0.0.1:1234",
      models: [],
    });
  }

  // 3. Gemini Cloud Provider
  const geminiKey = getApiKey("gemini", rootDir);
  runtimes.push({
    name: "Google Gemini Cloud",
    provider: "gemini",
    status: geminiKey ? "available" : "missing_key",
    models: ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-pro"],
  });

  // 4. Groq Cloud LPU Provider
  const groqKey = getApiKey("groq", rootDir);
  runtimes.push({
    name: "Groq Cloud LPU",
    provider: "groq",
    status: groqKey ? "available" : "missing_key",
    models: ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "mixtral-8x7b-32768"],
  });

  // 5. NVIDIA NIM Provider
  const nvidiaKey = getApiKey("nvidia", rootDir);
  runtimes.push({
    name: "NVIDIA NIM Cloud",
    provider: "nvidia",
    status: nvidiaKey ? "available" : "missing_key",
    models: ["meta/llama-3.1-70b-instruct", "meta/llama-3.1-8b-instruct"],
  });

  // 6. OpenAI Cloud Provider
  const openaiKey = getApiKey("openai", rootDir);
  runtimes.push({
    name: "OpenAI Cloud",
    provider: "openai",
    status: openaiKey ? "available" : "missing_key",
    models: ["gpt-4o-mini", "gpt-4o", "o3-mini", "o1-preview"],
  });

  return runtimes;
}

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

  // 2. Probe Local Engines First
  const availableRuntimes = await detectAvailableModels(rootDir);
  const ollama = availableRuntimes.find((r) => r.provider === "ollama" && r.status === "available");
  if (ollama && ollama.models.length > 0) {
    const selectedModel = ollama.models[0] || "llama3";
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
    const selectedModel = lmstudio.models[0] || "default";
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

  // 4. Check Cloud Providers (Gemini -> Groq -> NVIDIA -> OpenAI)
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

  throw new Error(
    "No active AI engine or API key detected.\n" +
      "  -> To use local models (free): Start Ollama (http://127.0.0.1:11434) or LM Studio.\n" +
      "  -> To use cloud models: Run 'vee keys set <provider> <KEY>' (gemini, groq, nvidia, openai)."
  );
}
