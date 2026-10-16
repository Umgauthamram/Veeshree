import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { VeeshreeConfigSchema, type VeeshreeConfig } from "../schemas/config.schema.js";
import { CONFIG_FILE_REL, VEE_DIR_REL } from "../utils/constants.js";
import { writeAtomic } from "./memory/atomic.js";

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
  let merged: Record<string, any> = {};

  // 1. Global config
  const globalPath = getGlobalConfigPath();
  if (fs.existsSync(globalPath)) {
    try {
      merged = { ...merged, ...JSON.parse(fs.readFileSync(globalPath, "utf-8")) };
    } catch {
      // ignore
    }
  }

  // 2. Project local config
  const projectPath = getProjectConfigPath(targetDir);
  if (fs.existsSync(projectPath)) {
    try {
      merged = { ...merged, ...JSON.parse(fs.readFileSync(projectPath, "utf-8")) };
    } catch {
      // ignore
    }
  }

  // Map 0.3.x legacy settings if present
  if (merged.default_extractor && !merged.extractor) {
    merged.extractor = merged.default_extractor;
  }
  if (merged.settings?.max_context_tokens && !merged.context?.max_tokens) {
    if (!merged.context) merged.context = {};
    merged.context.max_tokens = merged.settings.max_context_tokens;
  }

  // 3. Environment variable overrides
  if (process.env.VEE_PROVIDER) {
    if (!merged.extractor) merged.extractor = {};
    merged.extractor.provider = process.env.VEE_PROVIDER;
  }
  if (process.env.VEE_MODEL) {
    if (!merged.extractor) merged.extractor = {};
    merged.extractor.model = process.env.VEE_MODEL;
  }
  if (process.env.VEE_ALLOW_CLOUD) {
    if (!merged.privacy) merged.privacy = {};
    merged.privacy.allow_cloud = process.env.VEE_ALLOW_CLOUD === "true" || process.env.VEE_ALLOW_CLOUD === "1";
  }
  if (process.env.VEE_MAX_TOKENS) {
    const num = parseInt(process.env.VEE_MAX_TOKENS, 10);
    if (!isNaN(num)) {
      if (!merged.context) merged.context = {};
      merged.context.max_tokens = num;
    }
  }

  let parsed: VeeshreeConfig;
  try {
    parsed = VeeshreeConfigSchema.parse(merged);
  } catch {
    parsed = getDefaultConfig();
  }

  // Populate backward compatibility accessors
  if (!parsed.default_extractor) {
    (parsed as any).default_extractor = {
      provider: parsed.extractor.provider,
      model: parsed.extractor.model,
    };
  }
  if (!parsed.settings) {
    (parsed as any).settings = {
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
export function getConfigProperty(config: Record<string, any>, keyPath: string): any {
  const parts = keyPath.split(".");
  let cur: any = config;
  for (const p of parts) {
    if (cur === undefined || cur === null) return undefined;
    cur = cur[p];
  }
  return cur;
}

/**
 * Sets nested config property by dot-notation path
 */
export function setConfigProperty(config: Record<string, any>, keyPath: string, value: any): void {
  const parts = keyPath.split(".");
  let cur: any = config;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    if (!p) continue;
    if (!cur[p] || typeof cur[p] !== "object") {
      cur[p] = {};
    }
    cur = cur[p];
  }
  const lastKey = parts[parts.length - 1];
  if (lastKey) {
    cur[lastKey] = value;
  }
}
