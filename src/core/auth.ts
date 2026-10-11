import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { loadConfig, saveConfig } from "./config.js";

export type KeyProvider = "gemini" | "groq" | "nvidia" | "openai";

export function maskKey(key: string): string {
  if (!key) return "(not set)";
  if (key.length <= 8) return "********";
  return `${key.slice(0, 4)}...${key.slice(-4)}`;
}

export function getGlobalCredentialsDir(): string {
  return path.join(os.homedir(), ".veeshree");
}

export function getGlobalCredentialsPath(): string {
  return path.join(getGlobalCredentialsDir(), "credentials.json");
}

export function loadGlobalCredentials(): Record<string, string> {
  const filePath = getGlobalCredentialsPath();
  if (!fs.existsSync(filePath)) {
    return {};
  }
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function saveGlobalCredentials(credentials: Record<string, string>): void {
  const dir = getGlobalCredentialsDir();
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const filePath = getGlobalCredentialsPath();
  fs.writeFileSync(filePath, JSON.stringify(credentials, null, 2), "utf-8");
}

function parseEnvFile(filePath: string): Record<string, string> {
  const result: Record<string, string> = {};
  if (!fs.existsSync(filePath)) return result;
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx > 0) {
        const k = trimmed.slice(0, eqIdx).trim();
        let v = trimmed.slice(eqIdx + 1).trim();
        if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
          v = v.slice(1, -1);
        }
        result[k] = v;
      }
    }
  } catch {
    // ignore
  }
  return result;
}

export function setApiKey(
  provider: KeyProvider,
  key: string,
  rootDir: string = process.cwd(),
  isGlobal: boolean = false
): void {
  const trimmed = key.trim();

  if (isGlobal) {
    const globalCreds = loadGlobalCredentials();
    globalCreds[provider] = trimmed;
    saveGlobalCredentials(globalCreds);
    return;
  }

  // Local repository config (.vee/config.json)
  const config = loadConfig(rootDir);
  if (!config.keys) {
    config.keys = { openai: "", gemini: "", groq: "", nvidia: "" };
  }
  config.keys[provider] = trimmed;
  saveConfig(config, rootDir);
}

export function removeApiKey(
  provider: KeyProvider,
  rootDir: string = process.cwd(),
  isGlobal?: boolean
): void {
  // If explicitly global or unspecified, clean from global
  if (isGlobal === true || isGlobal === undefined) {
    const globalCreds = loadGlobalCredentials();
    if (globalCreds[provider]) {
      delete globalCreds[provider];
      saveGlobalCredentials(globalCreds);
    }
  }

  // If explicitly local or unspecified, clean from local
  if (isGlobal === false || isGlobal === undefined) {
    const config = loadConfig(rootDir);
    if (config.keys && config.keys[provider]) {
      config.keys[provider] = "";
      saveConfig(config, rootDir);
    }
  }
}

export function getApiKey(provider: KeyProvider, rootDir: string = process.cwd()): string | undefined {
  const envVarName = `${provider.toUpperCase()}_API_KEY`;

  // 1. Check process.env first (runtime / CI / shell)
  if (process.env[envVarName]) {
    return process.env[envVarName];
  }

  // 2. Check local .env file in rootDir
  const localEnv = parseEnvFile(path.join(rootDir, ".env"));
  if (localEnv[envVarName]) {
    return localEnv[envVarName];
  }

  // 3. Check local .vee/config.json (project-specific override)
  const config = loadConfig(rootDir);
  if (config.keys && config.keys[provider]) {
    return config.keys[provider];
  }

  // 4. Check global machine credentials (~/.veeshree/credentials.json)
  const globalCreds = loadGlobalCredentials();
  if (globalCreds[provider]) {
    return globalCreds[provider];
  }

  return undefined;
}

export function listApiKeys(
  rootDir: string = process.cwd()
): Record<string, { configured: boolean; masked: string; source: string; isGlobal: boolean }> {
  const config = loadConfig(rootDir);
  const globalCreds = loadGlobalCredentials();
  const localEnv = parseEnvFile(path.join(rootDir, ".env"));
  const providers: KeyProvider[] = ["gemini", "groq", "nvidia", "openai"];
  const result: Record<string, { configured: boolean; masked: string; source: string; isGlobal: boolean }> = {};

  for (const p of providers) {
    const envVar = `${p.toUpperCase()}_API_KEY`;
    if (process.env[envVar]) {
      result[p] = {
        configured: true,
        masked: maskKey(process.env[envVar]!),
        source: `environment ($${envVar})`,
        isGlobal: false,
      };
    } else if (localEnv[envVar]) {
      result[p] = {
        configured: true,
        masked: maskKey(localEnv[envVar]!),
        source: `local .env ($${envVar})`,
        isGlobal: false,
      };
    } else if (config.keys && config.keys[p]) {
      result[p] = {
        configured: true,
        masked: maskKey(config.keys[p]!),
        source: "local config (.vee/config.json)",
        isGlobal: false,
      };
    } else if (globalCreds[p]) {
      result[p] = {
        configured: true,
        masked: maskKey(globalCreds[p]!),
        source: "global keystore (~/.veeshree/credentials.json)",
        isGlobal: true,
      };
    } else {
      result[p] = {
        configured: false,
        masked: "(not set)",
        source: "none",
        isGlobal: false,
      };
    }
  }

  return result;
}
