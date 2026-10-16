export interface RedactionPattern {
  name: string;
  regex: RegExp;
  replacement: string;
}

export const SECRET_PATTERNS: RedactionPattern[] = [
  // Private Key Blocks
  {
    name: "private_key",
    regex: /-----BEGIN [A-Z ]+PRIVATE KEY-----[\s\S]+?-----END [A-Z ]+PRIVATE KEY-----/g,
    replacement: "[REDACTED:private_key]",
  },
  // Google API Key
  {
    name: "google_api_key",
    regex: /AIza[0-9A-Za-z\-_]{35}/g,
    replacement: "[REDACTED:google_api_key]",
  },
  // OpenAI API Key
  {
    name: "openai_key",
    regex: /sk-(?:proj-|live-|test-)?[A-Za-z0-9_\-]{20,}/g,
    replacement: "[REDACTED:openai_key]",
  },
  // Anthropic API Key
  {
    name: "anthropic_key",
    regex: /sk-ant-[A-Za-z0-9_\-]{30,}/g,
    replacement: "[REDACTED:anthropic_key]",
  },
  // GitHub Tokens
  {
    name: "github_token",
    regex: /gh[pousr]_[A-Za-z0-9_]{20,}/g,
    replacement: "[REDACTED:github_token]",
  },
  // AWS Access Key ID
  {
    name: "aws_key",
    regex: /AKIA[0-9A-Z]{16}/g,
    replacement: "[REDACTED:aws_key]",
  },
  // Slack Tokens
  {
    name: "slack_token",
    regex: /xox[baprs]-[0-9A-Za-z\-]{10,}/g,
    replacement: "[REDACTED:slack_token]",
  },
  // JWT tokens
  {
    name: "jwt_token",
    regex: /ey[A-Za-z0-9_\-]{10,}\.ey[A-Za-z0-9_\-]{10,}\.[A-Za-z0-9_\-]{10,}/g,
    replacement: "[REDACTED:jwt_token]",
  },
];

/**
 * Generic assignment pattern for high entropy values assigned to key/token/secret variables
 */
const HIGH_ENTROPY_ASSIGNMENT = /((?:api_?key|token|secret|password|access_?key|private_?key)\s*[:=]\s*["']?)([A-Za-z0-9_\-+/]{16,})(["']?)/gi;

/**
 * Redacts known sensitive patterns and high-entropy secret assignments
 */
export function redactSecrets(content: string): string {
  let redacted = content;

  for (const { regex, replacement } of SECRET_PATTERNS) {
    redacted = redacted.replace(regex, replacement);
  }

  // Redact high entropy assignments
  redacted = redacted.replace(HIGH_ENTROPY_ASSIGNMENT, (_match, prefix, secretVal, suffix) => {
    // If already redacted, skip
    if (secretVal.startsWith("[REDACTED:")) return _match;
    return `${prefix}[REDACTED:secret]${suffix}`;
  });

  return redacted;
}
