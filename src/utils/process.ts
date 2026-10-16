import { execFileSync, spawnSync } from "node:child_process";
import { VeeError } from "./errors.js";

const SAFE_MODEL_NAME_REGEX = /^[A-Za-z0-9._:/-]+$/;

export function isValidModelName(model: string): boolean {
  return SAFE_MODEL_NAME_REGEX.test(model.trim());
}

/**
 * Validates a model name against command injection attempts
 */
export function validateModelName(model: string): string {
  const trimmed = model.trim();
  if (!isValidModelName(trimmed)) {
    throw new VeeError(
      `Invalid model name '${model}'. Model names may only contain alphanumeric characters, dots, underscores, colons, slashes, and hyphens.`,
      "ERR_SECURITY_VIOLATION"
    );
  }
  return trimmed;
}

/**
 * Executes a binary safely using argument arrays (no shell interpretation)
 */
export function runCommandSafe(
  file: string,
  args: string[],
  options: { cwd?: string; encoding?: BufferEncoding; timeout?: number } = {}
): string {
  try {
    const result = execFileSync(file, args, {
      cwd: options.cwd || process.cwd(),
      encoding: options.encoding || "utf-8",
      timeout: options.timeout || 30000,
      stdio: ["ignore", "pipe", "pipe"],
      windowsHide: true,
    });
    return (result || "").toString().trim();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    throw new VeeError(`Command failed: ${file} ${args.join(" ")} (${message})`, "ERR_PROVIDER_FAILURE");
  }
}

/**
 * Executes a binary safely with inherited stdio
 */
export function runCommandInteractive(
  file: string,
  args: string[],
  options: { cwd?: string } = {}
): void {
  const result = spawnSync(file, args, {
    cwd: options.cwd || process.cwd(),
    stdio: "inherit",
    windowsHide: true,
  });
  if (result.error) {
    throw new VeeError(`Failed to run command ${file}: ${result.error.message}`, "ERR_PROVIDER_FAILURE");
  }
  if (result.status !== 0) {
    throw new VeeError(`Command ${file} exited with code ${result.status}`, "ERR_PROVIDER_FAILURE", result.status || 1);
  }
}
