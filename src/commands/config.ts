import {
  loadConfig,
  saveConfig,
  getConfigProperty,
  setConfigProperty,
  getProjectConfigPath,
  getGlobalConfigPath,
} from "../core/config.js";
import { logger } from "../utils/logger.js";
import { VeeError } from "../utils/errors.js";
import type { VeeshreeConfig } from "../schemas/config.schema.js";

export function handleConfigCommand(
  action: "get" | "set" | "list" | "path" = "list",
  key?: string,
  value?: string,
  options: { global?: boolean; json?: boolean } = {},
  rootDir: string = process.cwd()
): void {
  const isJson = options.json || logger.isJson();
  if (isJson) logger.setJson(true);

  if (action === "path") {
    const p = options.global ? getGlobalConfigPath() : getProjectConfigPath(rootDir);
    logger.raw(p);
    return;
  }

  if (action === "list") {
    const config = loadConfig(rootDir);
    if (!isJson) {
      logger.title("Veeshree Configuration (Merged)");
    }
    logger.json(config);
    return;
  }

  if (action === "get") {
    if (!key) {
      throw new VeeError(
        "Usage: vee config get <key> (e.g. vee config get privacy.allow_cloud)",
        "ERR_INVALID_ARGS"
      );
    }
    const config = loadConfig(rootDir) as unknown as Record<string, unknown>;
    const val = getConfigProperty(config, key);
    if (val === undefined) {
      logger.info(`(not set)`);
    } else {
      if (typeof val === "object" && val !== null) {
        logger.json(val);
      } else {
        logger.raw(String(val));
      }
    }
    return;
  }

  if (action === "set") {
    if (!key || value === undefined) {
      throw new VeeError("Usage: vee config set <key> <value>", "ERR_INVALID_ARGS");
    }
    const config = loadConfig(rootDir) as unknown as Record<string, unknown>;

    let parsedVal: unknown = value;
    if (value === "true") parsedVal = true;
    else if (value === "false") parsedVal = false;
    else if (!isNaN(Number(value)) && value.trim() !== "") parsedVal = Number(value);

    setConfigProperty(config, key, parsedVal);
    saveConfig(config as unknown as VeeshreeConfig, rootDir, options.global);
    logger.success(
      `Set ${key} = ${String(parsedVal)} (${options.global ? "global" : "project local"})`
    );
    return;
  }

  throw new VeeError(
    `Unknown config action '${action}'. Supported: get, set, list, path`,
    "ERR_INVALID_ARGS"
  );
}
