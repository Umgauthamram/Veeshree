import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { VeeshreeConfigSchema, type VeeshreeConfig } from "../schemas/config.schema.js";
import { CONFIG_FILE_REL } from "../utils/constants.js";
import { writeAtomic } from "./memory/atomic.js";
import { logger } from "../utils/logger.js";

export function getDefaultConfig(): VeeshreeConfig {
  return VeeshreeConfigSchema.parse({});
}

export function getGlobalConfigPath(): string {
  return path.join(os.homedir(), ".veeshree", "config.json");
}

export function getProjectConfigPath(rootDir: string = process.cwd()): string {
  return path.join(rootDir, CONFIG_FILE_REL);
}

/**
 * Loads configuration with precedence:
 * 1. Environment variables
 * 2. Project local .vee/config.json
 * 3. Global ~/.veeshree/config.json
 * 4. Defaults
 */
export function loadConfig(targetDir: string = process.cwd()): VeeshreeConfig {
  let merged: Record<string, unknown> = {};

  // 1. Global config
  const globalPath = getGlobalConfigPath();
  if (fs.existsSync(globalPath)) {
    try {
      merged = {
        ...merged,
        ...(JSON.parse(fs.readFileSync(globalPath, "utf-8")) as Record<string, unknown>),
      };
    } catch (err: unknown) {
      logger.debug(
        `Failed to read global config: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  // 2. Project local config
  const projectPath = getProjectConfigPath(targetDir);
  if (fs.existsSync(projectPath)) {
    try {
      merged = {
        ...merged,
        ...(JSON.parse(fs.readFileSync(projectPath, "utf-8")) as Record<string, unknown>),
      };
    } catch (err: unknown) {
      logger.debug(
        `Failed to read project config: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  // Map 0.3.x legacy settings if present
  if (merged.default_extractor && !merged.extractor) {
    merged.extractor = merged.default_extractor;
  }
  const settings = merged.settings as Record<string, unknown> | undefined;
  const context = (merged.context as Record<string, unknown> | undefined) || {};
  if (settings?.max_context_tokens && !context.max_tokens) {
    merged.context = { ...context, max_tokens: settings.max_context_tokens };
  }

  // 3. Environment variable overrides
  if (process.env.VEE_PROVIDER) {
    const ext = (merged.extractor as Record<string, unknown> | undefined) || {};
    merged.extractor = { ...ext, provider: process.env.VEE_PROVIDER };
  }
  if (process.env.VEE_MODEL) {
    const ext = (merged.extractor as Record<string, unknown> | undefined) || {};
    merged.extractor = { ...ext, model: process.env.VEE_MODEL };
  }
  if (process.env.VEE_ALLOW_CLOUD) {
    const priv = (merged.privacy as Record<string, unknown> | undefined) || {};
    merged.privacy = {
      ...priv,
      allow_cloud: process.env.VEE_ALLOW_CLOUD === "true" || process.env.VEE_ALLOW_CLOUD === "1",
    };
  }
  if (process.env.VEE_MAX_TOKENS) {
    const num = parseInt(process.env.VEE_MAX_TOKENS, 10);
    if (!isNaN(num)) {
      const ctx = (merged.context as Record<string, unknown> | undefined) || {};
      merged.context = { ...ctx, max_tokens: num };
    }
  }

  let parsed: VeeshreeConfig;
  try {
    parsed = VeeshreeConfigSchema.parse(merged);
  } catch {
    parsed = getDefaultConfig();
  }

  // Populate backward compatibility accessors
  const compat = parsed as unknown as Record<string, unknown>;
  if (!compat.default_extractor) {
    compat.default_extractor = {
      provider: parsed.extractor.provider,
      model: parsed.extractor.model,
    };
  }
  if (!compat.settings) {
    compat.settings = {
      max_context_tokens: parsed.context.max_tokens,
      auto_sync_on_commit: parsed.hooks.enabled,
    };
  }

  return parsed;
}

export function saveConfig(
  config: VeeshreeConfig,
  targetDir: string = process.cwd(),
  isGlobal: boolean = false
): void {
  const configPath = isGlobal ? getGlobalConfigPath() : getProjectConfigPath(targetDir);
  writeAtomic(configPath, JSON.stringify(config, null, 2));
}

/**
 * Retrieves nested config property by dot-notation path (e.g. 'privacy.allow_cloud')
 */
export function getConfigProperty(config: Record<string, unknown>, keyPath: string): unknown {
  const parts = keyPath.split(".");
  let cur: unknown = config;
  for (const p of parts) {
    if (cur === undefined || cur === null || typeof cur !== "object") return undefined;
    cur = (cur as Record<string, unknown>)[p];
  }
  return cur;
}

/**
 * Sets nested config property by dot-notation path
 */
export function setConfigProperty(
  config: Record<string, unknown>,
  keyPath: string,
  value: unknown
): void {
  const parts = keyPath.split(".");
  let cur: Record<string, unknown> = config;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    if (!p) continue;
    if (!cur[p] || typeof cur[p] !== "object") {
      cur[p] = {};
    }
    cur = cur[p] as Record<string, unknown>;
  }
  const lastKey = parts[parts.length - 1];
  if (lastKey) {
    cur[lastKey] = value;
  }
}
