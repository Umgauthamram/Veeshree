import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { isEnoent } from "../../utils/errors.js";
import { logger } from "../../utils/logger.js";

/**
 * Writes data to a file atomically using a temporary file and atomic rename.
 * Guarantees no partial or corrupted writes if interrupted.
 */
export function writeAtomic(
  filePath: string,
  data: string | Buffer,
  options: { mode?: number; encoding?: BufferEncoding } = {}
): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const randomSuffix = crypto.randomBytes(6).toString("hex");
  const tempPath = path.join(dir, `.tmp-${path.basename(filePath)}-${randomSuffix}`);

  try {
    fs.writeFileSync(tempPath, data, {
      encoding: options.encoding || "utf-8",
      mode: options.mode,
    });
    fs.renameSync(tempPath, filePath);
    if (options.mode !== undefined) {
      try {
        fs.chmodSync(filePath, options.mode);
      } catch (chmodErr: unknown) {
        if (process.platform !== "win32") {
          logger.warn(
            `Failed to set mode ${options.mode.toString(8)} on ${filePath}: ${chmodErr instanceof Error ? chmodErr.message : String(chmodErr)}`
          );
        }
      }
    }
  } catch (err) {
    if (fs.existsSync(tempPath)) {
      try {
        fs.unlinkSync(tempPath);
      } catch (unlinkErr: unknown) {
        if (!isEnoent(unlinkErr)) {
          logger.warn(
            `Failed to clean up atomic temp file ${tempPath}: ${unlinkErr instanceof Error ? unlinkErr.message : String(unlinkErr)}`
          );
        }
      }
    }
    throw err;
  }
}
