import { startMemoryWatcher } from "../core/watch/watcher.js";
import { startDaemon, stopDaemon, getDaemonStatus } from "../core/watch/daemon.js";
import { logger } from "../utils/logger.js";

export interface WatchCommandOptions {
  debounce?: string;
  provider?: string;
  model?: string;
  auto?: boolean;
  daemon?: boolean;
  json?: boolean;
  subcommand?: "status" | "stop";
}

export async function handleWatchCommand(
  options: WatchCommandOptions = {},
  rootDir: string = process.cwd()
): Promise<unknown> {
  const isJson = options.json || logger.isJson();
  if (isJson) logger.setJson(true);

  if (options.subcommand === "status") {
    const status = getDaemonStatus(rootDir);
    if (isJson) {
      logger.json(status);
      return status;
    }
    if (status.running) {
      logger.success(`Watcher daemon is RUNNING (PID: ${status.pid}). Log: ${status.logPath}`);
    } else {
      logger.info("Watcher daemon is NOT running.");
    }
    return status;
  }

  if (options.subcommand === "stop") {
    const result = stopDaemon(rootDir);
    if (isJson) {
      logger.json(result);
      return result;
    }
    if (result.stopped) {
      logger.success(`Stopped watcher daemon (PID: ${result.pid}).`);
    } else {
      logger.info("No active watcher daemon found to stop.");
    }
    return result;
  }

  if (options.daemon) {
    const { pid, logPath } = await startDaemon(rootDir, options);
    logger.success(`Watcher daemon spawned in background (PID: ${pid}).`);
    logger.info(`Output logging to: ${logPath}`);
    logger.info(`Check status anytime with 'vee watch status' or stop with 'vee watch stop'.`);
    return;
  }

  const debounceSeconds = options.debounce ? parseInt(options.debounce, 10) : undefined;
  await startMemoryWatcher(rootDir, {
    debounceSeconds,
    provider: options.provider,
    model: options.model,
    auto: options.auto,
  });
}
