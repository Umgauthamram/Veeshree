import readline from "node:readline";
import { redactSecrets } from "./patterns.js";
import { isDenylistedFile } from "./denylist.js";
import { DEFAULT_MAX_PAYLOAD_BYTES } from "../../utils/constants.js";
import { VeeError } from "../../utils/errors.js";
import type { VeeshreeConfig } from "../../schemas/config.schema.js";

/**
 * Redacts secrets from text content
 */
export function redactContent(content: string): string {
  return redactSecrets(content);
}

/**
 * Truncates diff payload by hunk so it does not exceed maxBytes
 */
export function capDiffPayload(diff: string, maxBytes: number = DEFAULT_MAX_PAYLOAD_BYTES): string {
  const buffer = Buffer.from(diff, "utf-8");
  if (buffer.length <= maxBytes) {
    return diff;
  }

  // Split by hunks or file headers
  const lines = diff.split("\n");
  const acceptedLines: string[] = [];
  let currentBytes = 0;

  for (const line of lines) {
    const lineBytes = Buffer.byteLength(line, "utf-8") + 1;
    if (currentBytes + lineBytes + 120 > maxBytes) {
      acceptedLines.push("\n# [Payload truncated to preserve privacy.max_payload_bytes]");
      break;
    }
    acceptedLines.push(line);
    currentBytes += lineBytes;
  }

  return acceptedLines.join("\n");
}

/**
 * Verifies cloud consent for external LLM calls.
 * If privacy.allow_cloud is false:
 * - Prompts if in interactive TTY
 * - Throws VeeError with instructions if non-interactive
 */
export async function assertCloudConsent(
  config: VeeshreeConfig,
  onConsentGranted?: () => void
): Promise<void> {
  if (config.privacy?.allow_cloud) {
    return;
  }

  const isInteractive = process.stdin.isTTY && process.stdout.isTTY;
  if (!isInteractive) {
    throw new VeeError(
      "Cloud AI calls require explicit consent. Enable via: 'vee config set privacy.allow_cloud true' or run locally using Ollama.",
      "ERR_CLOUD_CONSENT_REQUIRED"
    );
  }

  // Interactive prompt
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const answer = await new Promise<string>((resolve) => {
    rl.question(
      "\n[PRIVACY] Veeshree is about to send a redacted code diff to an external cloud LLM provider.\nAllow cloud requests? (y/N): ",
      (ans) => {
        rl.close();
        resolve(ans.trim().toLowerCase());
      }
    );
  });

  if (answer === "y" || answer === "yes") {
    if (onConsentGranted) onConsentGranted();
  } else {
    throw new VeeError(
      "Cloud extraction declined. Cloud calls remain disabled. Run locally via Ollama or run 'vee config set privacy.allow_cloud true' later.",
      "ERR_CLOUD_CONSENT_REQUIRED"
    );
  }
}

export * from "./patterns.js";
export * from "./denylist.js";
