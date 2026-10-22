import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { loadConfig, saveConfig } from "./config.js";
import { writeAtomic } from "./memory/atomic.js";
import { logger } from "../utils/logger.js";

export type KeyProvider = "gemini" | "groq" | "nvidia" | "openai" | "anthropic";

export const SUPPORTED_KEY_PROVIDERS: KeyProvider[] = [
  "gemini",
  "openai",
  "anthropic",
  "groq",
  "nvidia",
];

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

/**
 * Loads credentials, repairing permissions to 0600 (SEC-3)
 */
export function loadGlobalCredentials(): Record<string, string> {
  const filePath = getGlobalCredentialsPath();
  const dir = getGlobalCredentialsDir();

  if (!fs.existsSync(filePath)) {
    return {};
  }

  // Verify and repair permissions (0600 on file, 0700 on dir)
  try {
    if (process.platform !== "win32") {
      fs.chmodSync(dir, 0o700);
      fs.chmodSync(filePath, 0o600);
    }
  } catch {
    // ignore
  }

  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

/**
 * Saves credentials with mode 0600 in mode 0700 directory atomically (SEC-3)
 */
export function saveGlobalCredentials(credentials: Record<string, string>): void {
  const dir = getGlobalCredentialsDir();
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
  }

  try {
    if (process.platform !== "win32") {
      fs.chmodSync(dir, 0o700);
    }
  } catch {
    // ignore
  }

  const filePath = getGlobalCredentialsPath();
  writeAtomic(filePath, JSON.stringify(credentials, null, 2), { mode: 0o600 });
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
  logger.warn(
    "Project-local key storage detected. For better security, consider using global keystore or environment variables."
  );
  const config = loadConfig(rootDir);
  if (!config.keys) {
    config.keys = {};
  }
  config.keys[provider] = trimmed;
  saveConfig(config, rootDir);
}

export function removeApiKey(
  provider: KeyProvider,
  rootDir: string = process.cwd(),
  isGlobal?: boolean
): void {
  if (isGlobal === true || isGlobal === undefined) {
    const globalCreds = loadGlobalCredentials();
    if (globalCreds[provider]) {
      delete globalCreds[provider];
      saveGlobalCredentials(globalCreds);
    }
  }

  if (isGlobal === false || isGlobal === undefined) {
    const config = loadConfig(rootDir);
    if (config.keys && config.keys[provider]) {
      delete config.keys[provider];
      saveConfig(config, rootDir);
    }
  }
}

export function getApiKey(
  provider: KeyProvider,
  rootDir: string = process.cwd()
): string | undefined {
  const envVarName = `${provider.toUpperCase()}_API_KEY`;

  // 1. Check process.env first
  if (process.env[envVarName]) {
    return process.env[envVarName];
  }

  // 2. Check local .env file in rootDir
  const localEnv = parseEnvFile(path.join(rootDir, ".env"));
  if (localEnv[envVarName]) {
    return localEnv[envVarName];
  }

  // 3. Check local .vee/config.json
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

export interface KeyInfo {
  configured: boolean;
  masked: string;
  source: string;
  isGlobal: boolean;
  insecureWarning?: string;
}

export function listApiKeys(rootDir: string = process.cwd()): Record<string, KeyInfo> {
  const config = loadConfig(rootDir);
  const globalCreds = loadGlobalCredentials();
  const localEnv = parseEnvFile(path.join(rootDir, ".env"));
  const result: Record<string, KeyInfo> = {};

  for (const p of SUPPORTED_KEY_PROVIDERS) {
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
        insecureWarning: "Plaintext file in working directory",
      };
    } else if (config.keys && config.keys[p]) {
      result[p] = {
        configured: true,
        masked: maskKey(config.keys[p]!),
        source: "local config (.vee/config.json)",
        isGlobal: false,
        insecureWarning: "Local config is less secure than global keystore",
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
