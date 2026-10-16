import fs from "node:fs";
import path from "node:path";
import { normalizePosix } from "../../utils/paths.js";

const BINARY_EXTENSIONS = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".bmp",
  ".ico",
  ".svg",
  ".webp",
  ".mp4",
  ".mov",
  ".avi",
  ".mkv",
  ".mp3",
  ".wav",
  ".ogg",
  ".pdf",
  ".zip",
  ".tar",
  ".gz",
  ".7z",
  ".exe",
  ".dll",
  ".so",
  ".dylib",
  ".wasm",
  ".pyc",
  ".class",
  ".db",
  ".sqlite",
]);

const LOCKFILE_NAMES = new Set([
  "package-lock.json",
  "yarn.lock",
  "pnpm-lock.yaml",
  "bun.lockb",
  "composer.lock",
  "cargo.lock",
  "gemfile.lock",
  "poetry.lock",
]);

/**
 * Parses simple ignore rules from .gitignore or .veeignore
 */
export function parseIgnoreFile(filePath: string): string[] {
  if (!fs.existsSync(filePath)) return [];
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    return raw
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith("#"));
  } catch {
    return [];
  }
}

/**
 * Checks if a relative or absolute file path matches the privacy denylist:
 * - .env*
 * - *.pem, *.key, id_rsa*
 * - lockfiles
 * - binaries
 * - .gitignore or .veeignore patterns
 */
export function isDenylistedFile(filePath: string, rootDir: string = process.cwd()): boolean {
  const base = path.basename(filePath);
  const ext = path.extname(filePath).toLowerCase();
  const relPath = normalizePosix(path.relative(rootDir, filePath));

  // Denylisted secrets files
  if (base.startsWith(".env")) return true;
  if (ext === ".pem" || ext === ".key") return true;
  if (base.startsWith("id_rsa") || base.startsWith("id_ed25519") || base.startsWith("id_ecdsa")) return true;

  // Lockfiles
  if (LOCKFILE_NAMES.has(base)) return true;

  // Binaries
  if (BINARY_EXTENSIONS.has(ext)) return true;

  // Ignore memory files themselves and .vee directory
  if (relPath.startsWith("docs/memory") || relPath.startsWith(".vee")) return true;

  // Check .veeignore
  const veeignorePath = path.join(rootDir, ".veeignore");
  const veeRules = parseIgnoreFile(veeignorePath);
  for (const rule of veeRules) {
    if (matchesSimpleGlob(relPath, rule) || matchesSimpleGlob(base, rule)) {
      return true;
    }
  }

  // Check .gitignore
  const gitignorePath = path.join(rootDir, ".gitignore");
  const gitRules = parseIgnoreFile(gitignorePath);
  for (const rule of gitRules) {
    if (matchesSimpleGlob(relPath, rule) || matchesSimpleGlob(base, rule)) {
      return true;
    }
  }

  return false;
}

function matchesSimpleGlob(filePath: string, pattern: string): boolean {
  let cleanPattern = pattern.replace(/^\/+/, "").replace(/\/+$/, "");
  if (!cleanPattern) return false;

  if (cleanPattern.startsWith("*.")) {
    const ext = cleanPattern.slice(1);
    return filePath.endsWith(ext);
  }

  if (filePath === cleanPattern || filePath.startsWith(`${cleanPattern}/`) || filePath.endsWith(`/${cleanPattern}`)) {
    return true;
  }

  return false;
}
