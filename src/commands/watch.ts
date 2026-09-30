import { startMemoryWatcher, type WatcherOptions } from "../core/watcher.js";
import { logger } from "../utils/logger.js";

export async function handleWatchCommand(options: { debounce?: string; provider?: string; model?: string }) {
  try {
    const debounceMs = options.debounce ? parseInt(options.debounce, 10) * 1000 : 5000;
    await startMemoryWatcher(process.cwd(), {
      debounceMs,
      provider: options.provider,
      model: options.model,
    });
  } catch (err: any) {
    logger.error(`Failed to start memory watcher: ${err?.message || err}`);
    process.exit(1);
  }
}
