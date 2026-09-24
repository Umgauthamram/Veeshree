import { setApiKey, removeApiKey, listApiKeys, type KeyProvider } from "../core/auth.js";
import { logger } from "../utils/logger.js";

export function handleKeysCommand(action: string, provider?: string, key?: string, rootDir: string = process.cwd()): void {
  const validProviders: KeyProvider[] = ["openai", "anthropic", "gemini"];

  if (action === "list") {
    logger.title("Configured AI Provider API Keys");
    const keys = listApiKeys(rootDir);
    for (const [p, info] of Object.entries(keys)) {
      const statusStr = info.configured ? logger.cyan(`Configured (${info.source})`) : logger.dim("Not Configured");
      console.log(`- ${logger.bold(p.toUpperCase().padEnd(10))}: ${info.masked} [${statusStr}]`);
    }
    console.log("");
    return;
  }

  if (action === "set") {
    if (!provider || !key) {
      logger.error("Usage: vee keys set <provider> <key>");
      process.exit(1);
    }
    const p = provider.toLowerCase() as KeyProvider;
    if (!validProviders.includes(p)) {
      logger.error(`Invalid provider: ${provider}. Supported: ${validProviders.join(", ")}`);
      process.exit(1);
    }
    setApiKey(p, key, rootDir);
    logger.success(`API key stored locally in .vee/config.json for provider: ${p}`);
    return;
  }

  if (action === "remove") {
    if (!provider) {
      logger.error("Usage: vee keys remove <provider>");
      process.exit(1);
    }
    const p = provider.toLowerCase() as KeyProvider;
    removeApiKey(p, rootDir);
    logger.success(`Removed API key for provider: ${p}`);
    return;
  }

  logger.error(`Unknown keys action: ${action}. Use 'set', 'list', or 'remove'.`);
}
