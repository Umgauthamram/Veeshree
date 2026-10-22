/**
 * Redaction patterns for sensitive credentials, keys, headers, and tokens.
 * NOTE: Secret redaction is a best-effort heuristic safety guardrail and does not
 * guarantee detection of all possible custom secret formats.
 */
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
    regex: /AIza[0-9A-Za-z\-_]{30,40}/g,
    replacement: "[REDACTED:google_api_key]",
  },
  // Google OAuth Access Token
  {
    name: "gcp_oauth_token",
    regex: /ya29\.[0-9A-Za-z\-_]{20,}/g,
    replacement: "[REDACTED:gcp_token]",
  },
  // OpenAI API Key
  {
    name: "openai_key",
    regex: /sk-(?:proj-|live-|test-)?[A-Za-z0-9_-]{20,}/g,
    replacement: "[REDACTED:openai_key]",
  },
  // Anthropic API Key
  {
    name: "anthropic_key",
    regex: /sk-ant-[A-Za-z0-9_-]{20,}/g,
    replacement: "[REDACTED:anthropic_key]",
  },
  // GitHub Tokens (classic and fine-grained)
  {
    name: "github_token",
    regex: /(?:gh[pousr]_[A-Za-z0-9_]{20,}|github_pat_[A-Za-z0-9_]{40,})/g,
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
    regex: /xox[baprs]-[0-9A-Za-z-]{10,}/g,
    replacement: "[REDACTED:slack_token]",
  },
  // JWT tokens
  {
    name: "jwt_token",
    regex: /ey[A-Za-z0-9_-]{10,}\.ey[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g,
    replacement: "[REDACTED:jwt_token]",
  },
  // Database / Service URI with username:password@host (any scheme)
  {
    name: "uri_password",
    regex: /([a-zA-Z][a-zA-Z0-9+.-]*:\/\/[^:\s/]+:)([^@\s/]+)(@[^\s"']+)/gi,
    replacement: "$1[REDACTED:password]$3",
  },
  // Stripe API Keys (secret, restricted, test, live)
  {
    name: "stripe_key",
    regex: /(?:sk|rk)_(?:live|test)_[0-9a-zA-Z]{14,}/g,
    replacement: "[REDACTED:stripe_key]",
  },
  // Authorization Headers (Bearer, Basic, token)
  {
    name: "auth_header",
    regex:
      /Authorization:\s*(?:Bearer\s+[A-Za-z0-9_.+=~-]{6,}|Basic\s+[A-Za-z0-9+/=]{6,}|[^\r\n]{6,})/gi,
    replacement: "Authorization: [REDACTED:auth_header]",
  },
  // Standalone Bearer tokens (not preceded by Authorization:)
  {
    name: "bearer_token",
    regex: /\bBearer\s+[A-Za-z0-9_.+=~-]{6,}/gi,
    replacement: "Bearer [REDACTED:bearer_token]",
  },
  // Azure Secrets & Connection Keys
  {
    name: "azure_key",
    regex: /(?:AccountKey|SharedAccessSignature|sig)=([A-Za-z0-9%+/=]{16,})/gi,
    replacement: "AccountKey=[REDACTED:azure_key]",
  },
  // NPM Tokens
  {
    name: "npm_token",
    regex: /npm_[A-Za-z0-9]{36}/g,
    replacement: "[REDACTED:npm_token]",
  },
  // Password assignments of ANY length (quoted)
  {
    name: "password_quoted",
    regex: /(["']?(?:password|passwd|pwd)["']?\s*[:=]\s*["'])([^"'\r\n]+)(["'])/gi,
    replacement: "$1[REDACTED:password]$3",
  },
  // Password assignments of ANY length (unquoted)
  {
    name: "password_unquoted",
    regex: /(["']?(?:password|passwd|pwd)["']?\s*[:=]\s*)([^\s,"';\r\n]+)/gi,
    replacement: "$1[REDACTED:password]",
  },
  // URL or Form Password Parameters
  {
    name: "password_param",
    regex: /((?:password|passwd|pwd)=)([^&\s"']*)/gi,
    replacement: "$1[REDACTED:password]",
  },
];

/**
 * Generic assignment pattern for high entropy values assigned to key/token/secret variables
 */
const HIGH_ENTROPY_ASSIGNMENT =
  /((?:api_?key|token|secret|access_?key|private_?key)\s*[:=]\s*["']?)([A-Za-z0-9_\-+/]{16,})(["']?)/gi;

/**
 * Redacts known sensitive patterns and high-entropy secret assignments.
 * Redaction is best effort; do not rely on it as a guarantee for sensitive production secrets.
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
