import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

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
      } catch {
        // Windows may ignore some chmod calls
      }
    }
  } catch (err) {
    if (fs.existsSync(tempPath)) {
      try {
        fs.unlinkSync(tempPath);
      } catch {
        // ignore cleanup error
      }
    }
    throw err;
  }
}
