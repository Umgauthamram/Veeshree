import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { WATCH_PID_FILE_REL, WATCH_LOG_FILE_REL, VEE_DIR_REL } from "../../utils/constants.js";
import { VeeError } from "../../utils/errors.js";
import { logger } from "../../utils/logger.js";

export interface DaemonStatus {
  running: boolean;
  pid?: number;
  logPath: string;
}

/**
 * Checks if a process with given PID is currently active
 */
function isProcessAlive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch (err: unknown) {
    logger.debug(
      `isProcessAlive failed for PID ${pid}: ${err instanceof Error ? err.message : String(err)}`
    );
    return false;
  }
}

/**
 * Returns the current daemon status
 */
export function getDaemonStatus(rootDir: string = process.cwd()): DaemonStatus {
  const pidPath = path.join(rootDir, WATCH_PID_FILE_REL);
  const logPath = path.join(rootDir, WATCH_LOG_FILE_REL);

  if (!fs.existsSync(pidPath)) {
    return { running: false, logPath };
  }

  try {
    const pidStr = fs.readFileSync(pidPath, "utf-8").trim();
    const pid = parseInt(pidStr, 10);
    if (!isNaN(pid) && isProcessAlive(pid)) {
      return { running: true, pid, logPath };
    }
  } catch (err: unknown) {
    logger.debug(
      `Failed to read daemon pid file: ${err instanceof Error ? err.message : String(err)}`
    );
  }

  // PID file exists but process is dead -> clean up stale pid file
  try {
    fs.unlinkSync(pidPath);
  } catch (err: unknown) {
    logger.debug(
      `Failed to unlink stale daemon pid file: ${err instanceof Error ? err.message : String(err)}`
    );
  }

  return { running: false, logPath };
}

export function resolveCliEntrypoint(rootDir: string = process.cwd()): string {
  if (process.argv[1]) {
    const candidate = path.resolve(process.argv[1]);
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      return candidate;
    }
  }

  const candidates = [
    path.resolve(rootDir, "dist", "cli.js"),
    path.resolve(rootDir, "bin", "vee.js"),
    path.resolve(__dirname, "cli.js"),
    path.resolve(__dirname, "../cli.js"),
    path.resolve(__dirname, "../../dist/cli.js"),
  ];

  for (const c of candidates) {
    if (fs.existsSync(c) && fs.statSync(c).isFile()) {
      return c;
    }
  }

  return path.resolve(rootDir, "bin", "vee.js");
}

/**
 * Starts the watcher in background daemon mode
 */
export async function startDaemon(
  rootDir: string = process.cwd(),
  options: { debounce?: string; provider?: string; model?: string; auto?: boolean } = {}
): Promise<{ pid: number; logPath: string }> {
  const status = getDaemonStatus(rootDir);
  if (status.running && status.pid) {
    throw new VeeError(
      `Watcher daemon is already running (PID: ${status.pid}).`,
      "ERR_INVALID_ARGS"
    );
  }

  const veeDir = path.join(rootDir, VEE_DIR_REL);
  if (!fs.existsSync(veeDir)) {
    fs.mkdirSync(veeDir, { recursive: true });
  }

  // Find entrypoint script
  const cliScript = resolveCliEntrypoint(rootDir);

  const args: string[] = [cliScript, "watch"];
  if (options.debounce) args.push("--debounce", options.debounce);
  if (options.provider) args.push("--provider", options.provider);
  if (options.model) args.push("--model", options.model);
  if (options.auto) args.push("--auto");

  const logPath = path.join(rootDir, WATCH_LOG_FILE_REL);
  const logDir = path.dirname(logPath);
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  const outFd = fs.openSync(logPath, "a");
  const errFd = fs.openSync(logPath, "a");

  const child = spawn(process.execPath, args, {
    cwd: rootDir,
    detached: true,
    stdio: ["ignore", outFd, errFd],
    windowsHide: true,
  });

  child.unref();

  const pid = child.pid;
  if (!pid) {
    throw new VeeError(
      "Failed to spawn background watcher daemon process.",
      "ERR_PROVIDER_FAILURE"
    );
  }

  const pidPath = path.join(rootDir, WATCH_PID_FILE_REL);
  fs.writeFileSync(pidPath, String(pid), "utf-8");

  // Wait ~1 second and confirm the child process is alive before reporting success
  await new Promise((r) => setTimeout(r, 1000));

  let alive: boolean;
  try {
    process.kill(pid, 0);
    alive = true;
  } catch (err: unknown) {
    logger.debug(
      `Daemon PID ${pid} not alive: ${err instanceof Error ? err.message : String(err)}`
    );
    alive = false;
  }

  if (!alive) {
    try {
      fs.unlinkSync(pidPath);
    } catch (err: unknown) {
      logger.debug(
        `Failed to unlink daemon pidPath: ${err instanceof Error ? err.message : String(err)}`
      );
    }

    let logTail = "";
    if (fs.existsSync(logPath)) {
      const logs = fs.readFileSync(logPath, "utf-8").trim();
      logTail = logs.split("\n").slice(-10).join("\n");
    }

    throw new VeeError(
      `Watcher daemon failed to start (process exited immediately).${logTail ? `\nLogs:\n${logTail}` : ""}`,
      "ERR_PROVIDER_FAILURE"
    );
  }

  return { pid, logPath };
}

/**
 * Stops the running watcher daemon
 */
export function stopDaemon(rootDir: string = process.cwd()): { stopped: boolean; pid?: number } {
  const status = getDaemonStatus(rootDir);
  if (!status.running || !status.pid) {
    return { stopped: false };
  }

  const pid = status.pid;
  try {
    if (process.platform === "win32") {
      spawn("taskkill", ["/pid", String(pid), "/f", "/t"]);
    } else {
      process.kill(pid, "SIGTERM");
    }
  } catch (err: unknown) {
    logger.debug(
      `Failed to kill daemon PID ${pid}: ${err instanceof Error ? err.message : String(err)}`
    );
  }

  const pidPath = path.join(rootDir, WATCH_PID_FILE_REL);
  if (fs.existsSync(pidPath)) {
    try {
      fs.unlinkSync(pidPath);
    } catch (err: unknown) {
      logger.debug(
        `Failed to unlink daemon pidPath: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  return { stopped: true, pid };
}
