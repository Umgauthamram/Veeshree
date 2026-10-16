import fs from "node:fs";
import path from "node:path";

export interface MarkdownSection {
  level: number;
  headerText: string;
  headerLine: string;
  body: string;
}

/**
 * Parses markdown into structured heading sections
 */
export function parseSections(markdown: string): MarkdownSection[] {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const sections: MarkdownSection[] = [];

  let currentLevel = 0;
  let currentHeaderLine = "";
  let currentHeaderText = "";
  let currentBodyLines: string[] = [];

  for (const line of lines) {
    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (match) {
      if (currentHeaderLine || currentBodyLines.length > 0) {
        sections.push({
          level: currentLevel,
          headerText: currentHeaderText,
          headerLine: currentHeaderLine,
          body: currentBodyLines.join("\n"),
        });
      }
      currentLevel = match[1] ? match[1].length : 1;
      currentHeaderLine = line;
      currentHeaderText = match[2] ? match[2].trim() : "";
      currentBodyLines = [];
    } else {
      currentBodyLines.push(line);
    }
  }

  if (currentHeaderLine || currentBodyLines.length > 0) {
    sections.push({
      level: currentLevel,
      headerText: currentHeaderText,
      headerLine: currentHeaderLine,
      body: currentBodyLines.join("\n"),
    });
  }

  return sections;
}

/**
 * Re-assembles markdown from sections
 */
export function serializeSections(sections: MarkdownSection[]): string {
  const parts: string[] = [];
  for (const sec of sections) {
    if (sec.headerLine) {
      parts.push(sec.headerLine);
    }
    const cleanBody = sec.body.trim();
    if (cleanBody) {
      parts.push(cleanBody);
    }
  }
  return parts.join("\n\n").trim() + "\n";
}

/**
 * Safe replacement that treats replacement strings with $&, $1, etc. as purely literal text.
 */
export function safeLiteralReplace(
  source: string,
  targetPattern: RegExp | string,
  literalReplacement: string
): string {
  if (typeof targetPattern === "string") {
    return source.replace(targetPattern, () => literalReplacement);
  }
  return source.replace(targetPattern, () => literalReplacement);
}

/**
 * Normalizes title into a kebab-case slug.
 * Returns 'decision' if the slug would otherwise be empty (e.g. non-Latin characters).
 */
export function slugifyTitle(title: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
  return slug.length > 0 ? slug : "decision";
}

/**
 * Finds next 4-digit ADR prefix (e.g. 0001, 0002) by checking existing files in decisions and archive/decisions.
 */
export function getNextAdrNumber(rootDir: string): string {
  const dirs = [
    path.join(rootDir, "docs", "memory", "decisions"),
    path.join(rootDir, "docs", "memory", "archive", "decisions"),
  ];

  let maxNum = 0;
  for (const dir of dirs) {
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir);
      for (const f of files) {
        const m = f.match(/^(\d{4})-/);
        if (m) {
          const num = parseInt(m[1] || "0", 10);
          if (num > maxNum) maxNum = num;
        }
      }
    }
  }

  const next = maxNum + 1;
  return String(next).padStart(4, "0");
}

/**
 * Replaces or updates the body of a named section without affecting other sections.
 */
export function updateSectionBody(
  markdown: string,
  sectionMatcher: string | ((headerText: string, headerLine: string) => boolean),
  updater: string | ((existingBody: string) => string)
): string {
  const matcher =
    typeof sectionMatcher === "string"
      ? (text: string, line: string) =>
          text.toLowerCase().includes(sectionMatcher.toLowerCase()) ||
          line.toLowerCase().includes(sectionMatcher.toLowerCase())
      : sectionMatcher;

  const updateFn = typeof updater === "string" ? () => updater : updater;

  const sections = parseSections(markdown);
  let matched = false;

  for (const sec of sections) {
    if (matcher(sec.headerText, sec.headerLine)) {
      sec.body = updateFn(sec.body);
      matched = true;
      break;
    }
  }

  if (!matched) {
    // If section not found, return markdown as-is
    return markdown;
  }

  return serializeSections(sections);
}

/**
 * Normalizes a task line for comparison
 */
export function normalizeTaskName(task: string): string {
  return task
    .replace(/^-\s*\[[ xX]\]\s*/, "")
    .trim()
    .toLowerCase();
}
