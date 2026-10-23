export type VeeErrorCode =
  | "ERR_DRIFT_DETECTED"
  | "ERR_INVALID_ARGS"
  | "ERR_NOT_INITIALIZED"
  | "ERR_CONFIG_INVALID"
  | "ERR_AUTH_REQUIRED"
  | "ERR_CLOUD_CONSENT_REQUIRED"
  | "ERR_PAYLOAD_TOO_LARGE"
  | "ERR_PROVIDER_FAILURE"
  | "ERR_PROPOSAL_NOT_FOUND"
  | "ERR_PROPOSAL_HIGH_RISK"
  | "ERR_PROPOSAL_LIMIT"
  | "ERR_LOCK_TIMEOUT"
  | "ERR_FILE_NOT_FOUND"
  | "ERR_MIGRATION_FAILED"
  | "ERR_MCP_ERROR"
  | "ERR_SECURITY_VIOLATION"
  | "ERR_INVALID_MODEL"
  | "ERR_UNKNOWN";

export class VeeError extends Error {
  public readonly code: VeeErrorCode;
  public readonly exitCode: number;
  public readonly details?: unknown;

  constructor(
    message: string,
    code: VeeErrorCode = "ERR_UNKNOWN",
    exitCode: number = 2,
    details?: unknown
  ) {
    super(message);
    this.name = "VeeError";
    this.code = code;
    this.exitCode = exitCode;
    this.details = details;
    Object.setPrototypeOf(this, VeeError.prototype);
  }
}

/**
 * Checks if an error represents an ENOENT (file not found) error.
 */
export function isEnoent(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  return (err as { code?: string }).code === "ENOENT";
}
