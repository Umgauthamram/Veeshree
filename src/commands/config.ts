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

export function handleConfigCommand(
  action: "get" | "set" | "list" | "path" = "list",
  key?: string,
  value?: string,
  options: { global?: boolean } = {},
  rootDir: string = process.cwd()
): void {
  if (action === "path") {
    const p = options.global ? getGlobalConfigPath() : getProjectConfigPath(rootDir);
    console.log(p);
    return;
  }

  if (action === "list") {
    const config = loadConfig(rootDir);
    logger.title("Veeshree Configuration (Merged)");
    console.log(JSON.stringify(config, null, 2));
    return;
  }

  if (action === "get") {
    if (!key) {
      throw new VeeError("Usage: vee config get <key> (e.g. vee config get privacy.allow_cloud)", "ERR_INVALID_ARGS");
    }
    const config = loadConfig(rootDir);
    const val = getConfigProperty(config, key);
    if (val === undefined) {
      logger.info(`(not set)`);
    } else {
      console.log(typeof val === "object" ? JSON.stringify(val, null, 2) : String(val));
    }
    return;
  }

  if (action === "set") {
    if (!key || value === undefined) {
      throw new VeeError("Usage: vee config set <key> <value>", "ERR_INVALID_ARGS");
    }
    const config = loadConfig(rootDir) as any;

    let parsedVal: any = value;
    if (value === "true") parsedVal = true;
    else if (value === "false") parsedVal = false;
    else if (!isNaN(Number(value)) && value.trim() !== "") parsedVal = Number(value);

    setConfigProperty(config, key, parsedVal);
    saveConfig(config, rootDir, options.global);
    logger.success(`Set ${key} = ${parsedVal} (${options.global ? "global" : "project local"})`);
    return;
  }

  throw new VeeError(`Unknown config action '${action}'. Supported: get, set, list, path`, "ERR_INVALID_ARGS");
}
