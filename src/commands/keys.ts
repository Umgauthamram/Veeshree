import {
  setApiKey,
  removeApiKey,
  listApiKeys,
  SUPPORTED_KEY_PROVIDERS,
  type KeyProvider,
} from "../core/auth.js";
import { logger } from "../utils/logger.js";
import { VeeError } from "../utils/errors.js";

export interface KeysCommandOptions {
  local?: boolean;
  global?: boolean;
  json?: boolean;
}

export function handleKeysCommand(
  action: string,
  provider?: string,
  key?: string,
  options: KeysCommandOptions = {},
  rootDir: string = process.cwd()
): any {
  const isJson = options.json || logger.isJson();
  if (isJson) logger.setJson(true);

  if (action === "list") {
    const keys = listApiKeys(rootDir);
    if (isJson) {
      console.log(JSON.stringify(keys, null, 2));
      return keys;
    }
    logger.title("Configured AI Provider API Keys");
    for (const [p, info] of Object.entries(keys)) {
      const statusStr = info.configured ? logger.cyan(`Configured via ${info.source}`) : logger.dim("Not Configured");
      const warningStr = info.insecureWarning ? ` ${logger.yellow(`[WARN: ${info.insecureWarning}]`)}` : "";
      console.log(`- ${logger.bold(p.toUpperCase().padEnd(10))}: ${info.masked} [${statusStr}]${warningStr}`);
    }
    console.log("");
    logger.info("Keys stored in your global keystore (~/.veeshree/credentials.json) apply to all projects without Git exposure.");
    return keys;
  }

  if (action === "set" || action === "update") {
    if (!provider || !key) {
      throw new VeeError(
        `Usage: vee keys ${action} <provider> <key> [--local]\nSupported providers: ${SUPPORTED_KEY_PROVIDERS.join(", ")}`,
        "ERR_INVALID_ARGS"
      );
    }
    const p = provider.toLowerCase() as KeyProvider;
    if (!SUPPORTED_KEY_PROVIDERS.includes(p)) {
      throw new VeeError(
        `Invalid provider '${provider}'. Supported: ${SUPPORTED_KEY_PROVIDERS.join(", ")}`,
        "ERR_INVALID_ARGS"
      );
    }

    const isGlobal = !options.local;
    setApiKey(p, key, rootDir, isGlobal);

    if (isGlobal) {
      logger.success(`API key stored securely in global keystore (~/.veeshree/credentials.json) for provider: ${p}`);
    } else {
      logger.success(`API key stored locally in .vee/config.json for provider: ${p}`);
      logger.warn("Project-local key storage detected. Avoid committing .vee/config.json.");
    }
    return;
  }

  if (action === "remove") {
    if (!provider) {
      throw new VeeError("Usage: vee keys remove <provider> [--local|--global]", "ERR_INVALID_ARGS");
    }
    const p = provider.toLowerCase() as KeyProvider;
    const isGlobal = options.local ? false : options.global ? true : undefined;
    removeApiKey(p, rootDir, isGlobal);
    logger.success(`Removed API key for provider: ${p}`);
    return;
  }

  throw new VeeError(`Unknown keys action: '${action}'. Supported: list, set, update, remove.`, "ERR_INVALID_ARGS");
}
