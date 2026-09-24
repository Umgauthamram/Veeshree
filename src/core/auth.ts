import { loadConfig, saveConfig } from "./config.js";

export type KeyProvider = "openai" | "anthropic" | "gemini";

export function maskKey(key: string): string {
  if (!key) return "(not set)";
  if (key.length <= 8) return "********";
  return `${key.slice(0, 4)}...${key.slice(-4)}`;
}

export function setApiKey(provider: KeyProvider, key: string, rootDir: string = process.cwd()): void {
  const config = loadConfig(rootDir);
  if (!config.keys) {
    config.keys = { openai: "", anthropic: "", gemini: "" };
  }
  config.keys[provider] = key.trim();
  saveConfig(config, rootDir);
}

export function removeApiKey(provider: KeyProvider, rootDir: string = process.cwd()): void {
  const config = loadConfig(rootDir);
  if (config.keys) {
    config.keys[provider] = "";
    saveConfig(config, rootDir);
  }
}


export function getApiKey(provider: KeyProvider, rootDir: string = process.cwd()): string | undefined {
  // 1. Check process.env first
  const envVarName = `${provider.toUpperCase()}_API_KEY`;
  if (process.env[envVarName]) {
    return process.env[envVarName];
  }

  // 2. Check .vee/config.json
  const config = loadConfig(rootDir);
  if (config.keys && config.keys[provider]) {
    return config.keys[provider];
  }

  return undefined;
}

export function listApiKeys(rootDir: string = process.cwd()): Record<string, { configured: boolean; masked: string; source: string }> {
  const config = loadConfig(rootDir);
  const providers: KeyProvider[] = ["gemini", "openai", "anthropic"];
  const result: Record<string, { configured: boolean; masked: string; source: string }> = {};

  for (const p of providers) {
    const envVar = `${p.toUpperCase()}_API_KEY`;
    if (process.env[envVar]) {
      result[p] = {
        configured: true,
        masked: maskKey(process.env[envVar]!),
        source: `env (${envVar})`,
      };
    } else if (config.keys && config.keys[p]) {
      result[p] = {
        configured: true,
        masked: maskKey(config.keys[p]!),
        source: "config (.vee/config.json)",
      };
    } else {
      result[p] = {
        configured: false,
        masked: "(not set)",
        source: "none",
      };
    }
  }

  return result;
}
