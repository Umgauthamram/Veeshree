import fs from "node:fs";
import crypto from "node:crypto";
import { normalizeContent } from "../../utils/paths.js";

/**
 * Calculates SHA-256 hash of a file after normalizing line endings (LF) and stripping UTF-8 BOM.
 * This guarantees cross-platform consistency between Windows (CRLF), macOS and Linux (LF).
 */
export function calculateNormalizedFileHash(filePath: string): string | null {
  if (!fs.existsSync(filePath)) {
    return null;
  }
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    const normalized = normalizeContent(raw);
    return crypto.createHash("sha256").update(normalized, "utf-8").digest("hex");
  } catch {
    return null;
  }
}
