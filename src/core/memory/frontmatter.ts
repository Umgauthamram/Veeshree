import YAML from "yaml";
import {
  DecisionFrontmatterSchema,
  type DecisionFrontmatter,
} from "../../schemas/frontmatter.schema.js";

export interface ParsedMarkdown<T = Record<string, unknown>> {
  data: T;
  content: string;
}

/**
 * Safely parses YAML frontmatter using the 'yaml' package (no gray-matter vulnerability).
 */
export function parseMarkdownFrontmatter<T = Record<string, unknown>>(
  raw: string
): ParsedMarkdown<T> {
  const normalized = raw.replace(/\r\n/g, "\n");
  const match = normalized.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);

  if (!match) {
    return {
      data: {} as T,
      content: normalized.trim(),
    };
  }

  const yamlPart = match[1] || "";
  const bodyPart = match[2] || "";
  try {
    const parsed = (YAML.parse(yamlPart) || {}) as T;
    return {
      data: parsed,
      content: bodyPart.trim(),
    };
  } catch {
    return {
      data: {} as T,
      content: normalized.trim(),
    };
  }
}

/**
 * Specifically parses and validates ADR frontmatter with Zod
 */
export function parseDecisionFrontmatter(raw: string): ParsedMarkdown<DecisionFrontmatter> {
  const parsed = parseMarkdownFrontmatter(raw);
  const result = DecisionFrontmatterSchema.safeParse(parsed.data);
  const data: DecisionFrontmatter = result.success
    ? result.data
    : {
        status: "active",
        tags: [],
        linked_files: [],
      };
  return {
    data,
    content: parsed.content,
  };
}

/**
 * Serializes data and markdown body into frontmatter format
 */
export function stringifyMarkdownFrontmatter(
  data: Record<string, unknown>,
  content: string
): string {
  const yamlPart = YAML.stringify(data).trim();
  const cleanBody = content.trim();
  if (!yamlPart || yamlPart === "{}") {
    return `${cleanBody}\n`;
  }
  return `---\n${yamlPart}\n---\n\n${cleanBody}\n`;
}
