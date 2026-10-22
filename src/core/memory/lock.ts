import fs from "node:fs";
import path from "node:path";
import { LOCK_FILE_REL, LOCK_STALE_MS, VEE_DIR_REL } from "../../utils/constants.js";
import { VeeError } from "../../utils/errors.js";
import { logger } from "../../utils/logger.js";

export interface LockHandle {
  release: () => void;
}

/**
 * Acquires a process lock at .vee/lock using exclusive file creation.
 * If the lock is older than LOCK_STALE_MS (60s), it is considered stale and broken.
 */
export function acquireLock(rootDir: string = process.cwd(), timeoutMs: number = 5000): LockHandle {
  const veeDir = path.join(rootDir, VEE_DIR_REL);
  if (!fs.existsSync(veeDir)) {
    fs.mkdirSync(veeDir, { recursive: true });
  }

  const lockPath = path.join(rootDir, LOCK_FILE_REL);
  const startTime = Date.now();

  while (Date.now() - startTime < timeoutMs) {
    try {
      // Check if existing lock is stale
      if (fs.existsSync(lockPath)) {
        try {
          const stats = fs.statSync(lockPath);
          const age = Date.now() - stats.mtimeMs;
          if (age > LOCK_STALE_MS) {
            // Lock is stale, unlink it
            fs.unlinkSync(lockPath);
          }
        } catch (err: unknown) {
          logger.debug(
            `Failed to stat/unlink stale lock: ${err instanceof Error ? err.message : String(err)}`
          );
        }
      }

      // O_CREAT | O_EXCL
      const fd = fs.openSync(
        lockPath,
        fs.constants.O_CREAT | fs.constants.O_EXCL | fs.constants.O_WRONLY
      );
      const payload = JSON.stringify({ pid: process.pid, time: new Date().toISOString() });
      fs.writeSync(fd, payload);
      fs.closeSync(fd);

      let released = false;
      return {
        release: () => {
          if (released) return;
          released = true;
          try {
            if (fs.existsSync(lockPath)) {
              fs.unlinkSync(lockPath);
            }
          } catch (err: unknown) {
            logger.debug(
              `Failed to release lock file: ${err instanceof Error ? err.message : String(err)}`
            );
          }
        },
      };
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      if (code === "EEXIST") {
        // Wait and retry
        const delay = 50;
        const waitUntil = Date.now() + delay;
        while (Date.now() < waitUntil) {
          // busy wait short slice
        }
        continue;
      }
      const message = err instanceof Error ? err.message : String(err);
      throw new VeeError(`Failed to acquire process lock: ${message}`, "ERR_LOCK_TIMEOUT");
    }
  }

  throw new VeeError(
    "Failed to acquire memory lock at .vee/lock. Another process is modifying memory.",
    "ERR_LOCK_TIMEOUT"
  );
}

/**
 * Executes a function holding the memory lock
 */
export async function withLock<T>(rootDir: string, fn: () => Promise<T> | T): Promise<T> {
  const lock = acquireLock(rootDir);
  try {
    return await fn();
  } finally {
    lock.release();
  }
}
