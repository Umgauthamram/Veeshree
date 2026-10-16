import path from "node:path";
import { VeeError } from "./errors.js";

/**
 * Normalizes a file path to POSIX style (forward slashes)
 */
export function normalizePosix(p: string): string {
  return p.replace(/\\/g, "/");
}

/**
 * Validates and normalizes a relative file path, rejecting absolute paths and directory traversal
 */
export function sanitizeRelativePath(relPath: string): string {
  const normalized = normalizePosix(relPath).trim();
  if (path.isAbsolute(relPath) || normalized.startsWith("/") || /^[a-zA-Z]:/.test(normalized)) {
    throw new VeeError(`Absolute paths are not permitted: ${relPath}`, "ERR_SECURITY_VIOLATION");
  }
  const parts = normalized.split("/");
  if (parts.includes("..")) {
    throw new VeeError(`Directory traversal ('..') is not permitted: ${relPath}`, "ERR_SECURITY_VIOLATION");
  }
  return path.posix.normalize(normalized);
}

/**
 * Normalizes file content for consistent SHA-256 hashing across platforms:
 * strips UTF-8 BOM, normalizes CRLF and CR to LF
 */
export function normalizeContent(content: string): string {
  let text = content;
  // Strip BOM
  if (text.charCodeAt(0) === 0xfeff) {
    text = text.slice(1);
  }
  // Normalize line endings
  return text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}
