import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import defaultModelsConfig from "../models.json" with { type: "json" };
import { VeeError } from "../utils/errors.js";

export type SupportedProvider = "gemini" | "openai" | "anthropic" | "groq" | "nvidia" | "ollama" | "lmstudio";

export interface ModelsConfig {
  defaults: Record<SupportedProvider, string> & Record<string, string>;
  known_models: Record<SupportedProvider, string[]> & Record<string, string[]>;
}

let cachedModelsConfig: ModelsConfig | null = null;

export function loadModelsConfig(rootDir: string = process.cwd()): ModelsConfig {
  if (cachedModelsConfig) {
    return cachedModelsConfig;
  }

  // 1. Check local rootDir/models.json
  const candidatePaths = [
    path.join(rootDir, "models.json"),
    path.join(rootDir, ".vee", "models.json"),
  ];

  try {
    const currentDir = path.dirname(fileURLToPath(import.meta.url));
    candidatePaths.push(
      path.join(currentDir, "..", "models.json"),
      path.join(currentDir, "..", "..", "models.json"),
      path.join(currentDir, "models.json")
    );
  } catch {
    // ignore
  }

  for (const candidate of candidatePaths) {
    try {
      if (fs.existsSync(candidate)) {
        const raw = fs.readFileSync(candidate, "utf-8");
        const parsed = JSON.parse(raw);
        if (parsed.defaults && parsed.known_models) {
          cachedModelsConfig = parsed as ModelsConfig;
          return cachedModelsConfig;
        }
      }
    } catch {
      // ignore
    }
  }

  cachedModelsConfig = defaultModelsConfig as ModelsConfig;
  return cachedModelsConfig;
}

export function getDefaultModels(): Record<SupportedProvider, string> & Record<string, string> {
  const config = loadModelsConfig();
  return config.defaults;
}

export function validateModel(
  provider: string,
  model: string
): { valid: boolean; suggested?: string; available: string[] } {
  const config = loadModelsConfig();
  const normalizedProvider = provider.toLowerCase();
  const available = config.known_models[normalizedProvider] || [];

  if (available.length === 0) {
    // Custom or third party provider without a static catalog
    return { valid: true, available: [] };
  }

  if (available.includes(model)) {
    return { valid: true, available };
  }

  // Find closest suggestion (prefix or substring match)
  const modelLower = model.toLowerCase();
  const suggested =
    available.find((m) => m.toLowerCase().includes(modelLower) || modelLower.includes(m.toLowerCase())) ||
    config.defaults[normalizedProvider] ||
    available[0];

  return {
    valid: false,
    suggested,
    available,
  };
}

export async function verifyModelEndpoint(
  provider: string,
  model: string,
  apiKey?: string,
  baseUrl?: string
): Promise<{ ok: boolean; message?: string; remedy?: string; suggested?: string }> {
  const validation = validateModel(provider, model);
  if (!validation.valid) {
    return {
      ok: false,
      suggested: validation.suggested,
      message: `Unknown model '${model}' for provider '${provider}'.`,
      remedy: `Update extractor.model in .vee/config.json to '${validation.suggested}'. Supported models: ${validation.available.join(", ")}`,
    };
  }

  // Local Ollama check
  if (provider === "ollama") {
    try {
      const host = baseUrl || "http://localhost:11434";
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(`${host}/api/tags`, { signal: controller.signal });
      clearTimeout(timeout);
      if (res.ok) {
        const data = (await res.json()) as { models?: Array<{ name: string }> };
        const localModels = (data.models || []).map((m) => m.name);
        const hasModel = localModels.some((m) => m === model || m.startsWith(`${model}:`));
        if (!hasModel && localModels.length > 0) {
          return {
            ok: false,
            suggested: localModels[0],
            message: `Model '${model}' not found in local Ollama instance.`,
            remedy: `Run 'ollama pull ${model}' or configure an available model: ${localModels.join(", ")}`,
          };
        }
      }
    } catch {
      // Local daemon might be offline; doctor already handles connectivity
    }
  }

  return { ok: true };
}
