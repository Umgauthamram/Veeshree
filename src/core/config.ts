import fs from "node:fs";
import path from "node:path";
import { VeeshreeConfigSchema, type VeeshreeConfig } from "../types/index.js";
import { CONFIG_FILE_REL, VEE_DIR_REL } from "../utils/constants.js";

export function getDefaultConfig(): VeeshreeConfig {
  return VeeshreeConfigSchema.parse({});
}

export function loadConfig(targetDir: string = process.cwd()): VeeshreeConfig {
  const configPath = path.join(targetDir, CONFIG_FILE_REL);
  if (!fs.existsSync(configPath)) {
    return getDefaultConfig();
  }
  try {
    const raw = fs.readFileSync(configPath, "utf-8");
    const json = JSON.parse(raw);
    return VeeshreeConfigSchema.parse(json);
  } catch {
    return getDefaultConfig();
  }
}

export function saveConfig(config: VeeshreeConfig, targetDir: string = process.cwd()): void {
  const veeDir = path.join(targetDir, VEE_DIR_REL);
  if (!fs.existsSync(veeDir)) {
    fs.mkdirSync(veeDir, { recursive: true });
  }
  const configPath = path.join(targetDir, CONFIG_FILE_REL);
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2), "utf-8");
}
