import { setApiKey, removeApiKey, listApiKeys, type KeyProvider } from "../core/auth.js";
import { logger } from "../utils/logger.js";

export interface KeysCommandOptions {
  local?: boolean;
  global?: boolean;
}

export function handleKeysCommand(
  action: string,
  provider?: string,
  key?: string,
  options: KeysCommandOptions = {},
  rootDir: string = process.cwd()
): void {
  const validProviders: KeyProvider[] = ["openai", "anthropic", "gemini"];

  if (action === "list") {
    logger.title("Configured AI Provider API Keys");
    const keys = listApiKeys(rootDir);
    for (const [p, info] of Object.entries(keys)) {
      const statusStr = info.configured ? logger.cyan(`Configured via ${info.source}`) : logger.dim("Not Configured");
      console.log(`- ${logger.bold(p.toUpperCase().padEnd(10))}: ${info.masked} [${statusStr}]`);
    }
    console.log("");
    logger.info("Keys stored in your global keystore (~/.veeshree/credentials.json) apply to all projects without Git exposure.");
    return;
  }

  if (action === "set" || action === "update") {
    if (!provider || !key) {
      logger.error(`Usage: vee keys ${action} <provider> <key> [--local]`);
      process.exit(1);
    }
    const p = provider.toLowerCase() as KeyProvider;
    if (!validProviders.includes(p)) {
      logger.error(`Invalid provider: ${provider}. Supported: ${validProviders.join(", ")}`);
      process.exit(1);
    }

    // Default to global storage unless --local is explicitly requested
    const isGlobal = !options.local;

    setApiKey(p, key, rootDir, isGlobal);

    if (isGlobal) {
      logger.success(`API key ${action === "update" ? "updated" : "stored"} securely in global keystore (~/.veeshree/credentials.json) for provider: ${p}`);
      logger.info("This key is accessible across all your projects and is NEVER committed to Git.");
    } else {
      logger.success(`API key ${action === "update" ? "updated" : "stored"} locally in .vee/config.json for provider: ${p}`);
      logger.warn("Caution: Storing keys locally in .vee/config.json requires ensuring .vee/ is ignored in .gitignore.");
    }
    return;
  }

  if (action === "remove") {
    if (!provider) {
      logger.error("Usage: vee keys remove <provider> [--local|--global]");
      process.exit(1);
    }
    const p = provider.toLowerCase() as KeyProvider;
    const isGlobal = options.local ? false : options.global ? true : undefined;
    removeApiKey(p, rootDir, isGlobal);
    logger.success(`Removed API key for provider: ${p}`);
    return;
  }

  logger.error(`Unknown keys action: ${action}. Use 'set', 'update', 'list', or 'remove'.`);
}
