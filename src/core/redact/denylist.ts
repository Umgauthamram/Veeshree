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
  const absPath = path.isAbsolute(filePath) ? filePath : path.resolve(rootDir, filePath);
  const base = path.basename(absPath);
  const ext = path.extname(absPath).toLowerCase();
  const relPath = normalizePosix(path.relative(rootDir, absPath));

  // Denylisted secrets files
  if (base.startsWith(".env")) return true;
  if (ext === ".pem" || ext === ".key") return true;
  if (base.startsWith("id_rsa") || base.startsWith("id_ed25519") || base.startsWith("id_ecdsa"))
    return true;

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

export function matchesSimpleGlob(filePath: string, pattern: string): boolean {
  const cleanPattern = pattern.trim();
  if (!cleanPattern || cleanPattern.startsWith("#")) return false;

  const normalized = normalizePosix(filePath).replace(/^\/+/, "");
  const base = path.basename(normalized);

  const cleanNoSlash = cleanPattern.replace(/^\/+/, "").replace(/\/+$/, "");
  if (normalized === cleanNoSlash || base === cleanNoSlash) {
    return true;
  }

  if (normalized.startsWith(`${cleanNoSlash}/`)) {
    return true;
  }

  try {
    const isRootMatch = cleanPattern.startsWith("/");
    const isDirOnly = cleanPattern.endsWith("/");
    let regStr = cleanNoSlash
      .replace(/[.+^${}()|[\]\\]/g, "\\$&")
      .replace(/\*\*/g, "___GLOBSTAR___")
      .replace(/\*/g, "[^/]*")
      .replace(/\?/g, "[^/]")
      .replace(/___GLOBSTAR___/g, ".*");

    if (isRootMatch) {
      regStr = `^${regStr}${isDirOnly ? "(?:/.*)?$" : "$"}`;
    } else {
      regStr = `(?:^|/)${regStr}${isDirOnly ? "(?:/.*)?$" : "$"}`;
    }
    const regex = new RegExp(regStr, "i");
    if (regex.test(normalized) || regex.test(base)) {
      return true;
    }
  } catch {
    // fallback
  }

  return false;
}

/**
 * Filters a raw git diff, removing any file chunks whose target paths match the denylist or .veeignore
 */
export function filterDiffByDenylist(rawDiff: string, rootDir: string = process.cwd()): string {
  if (!rawDiff || !rawDiff.trim()) return rawDiff;

  const chunks = rawDiff.split(/(?=^diff --git )/m);
  const keptChunks: string[] = [];

  for (const chunk of chunks) {
    if (!chunk.trim()) continue;
    let shouldExclude = false;

    // Check diff header: diff --git a/path b/path
    const gitMatch = chunk.match(
      /^diff --git (?:a\/|"(?:a\/)?)(.+?)(?:"\s+|\s+)(?:b\/|"(?:b\/)?)(.+?)(?:"|\r?\n|$)/m
    );
    if (gitMatch) {
      const fileA = gitMatch[1]?.trim().replace(/^"|"$/g, "");
      const fileB = gitMatch[2]?.trim().replace(/^"|"$/g, "");
      if (
        (fileA && isDenylistedFile(fileA, rootDir)) ||
        (fileB && isDenylistedFile(fileB, rootDir))
      ) {
        shouldExclude = true;
      }
    }

    // Check --- a/file or +++ b/file
    if (!shouldExclude) {
      const headerAMatch = chunk.match(/^---\s+(?:a\/|"?)(.+?)"?(?:\t|\r?\n|$)/m);
      const headerBMatch = chunk.match(/^\+\+\+\s+(?:b\/|"?)(.+?)"?(?:\t|\r?\n|$)/m);
      const pathA =
        headerAMatch && headerAMatch[1] && headerAMatch[1] !== "/dev/null"
          ? headerAMatch[1].trim().replace(/^"|"$/g, "")
          : null;
      const pathB =
        headerBMatch && headerBMatch[1] && headerBMatch[1] !== "/dev/null"
          ? headerBMatch[1].trim().replace(/^"|"$/g, "")
          : null;

      if (
        (pathA && isDenylistedFile(pathA, rootDir)) ||
        (pathB && isDenylistedFile(pathB, rootDir))
      ) {
        shouldExclude = true;
      }
    }

    if (!shouldExclude) {
      keptChunks.push(chunk);
    }
  }

  return keptChunks.join("");
}
