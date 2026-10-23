import fs from "node:fs";
import path from "node:path";
import { runCommandSafe } from "../../utils/process.js";
import { VeeError, isEnoent } from "../../utils/errors.js";
import { logger } from "../../utils/logger.js";

const HOOK_START_MARKER = "# veeshree:start";
const HOOK_END_MARKER = "# veeshree:end";

export interface HooksStatus {
  isGitRepo: boolean;
  hooksDir: string;
  installed: boolean;
  preCommitInstalled: boolean;
  postCheckoutInstalled: boolean;
  postMergeInstalled: boolean;
}

/**
 * Resolves Git hooks directory respecting core.hooksPath and Husky
 */
export function resolveGitHooksDir(rootDir: string = process.cwd()): string | null {
  const gitDir = path.join(rootDir, ".git");
  if (!fs.existsSync(gitDir)) {
    return null;
  }

  // Check Husky
  const huskyDir = path.join(rootDir, ".husky");
  if (fs.existsSync(huskyDir) && fs.statSync(huskyDir).isDirectory()) {
    return huskyDir;
  }

  // Check core.hooksPath
  try {
    const customHooksPath = runCommandSafe("git", ["config", "core.hooksPath"], { cwd: rootDir });
    if (customHooksPath) {
      return path.isAbsolute(customHooksPath)
        ? customHooksPath
        : path.join(rootDir, customHooksPath);
    }
  } catch (err: unknown) {
    logger.debug(
      `Failed to query core.hooksPath via git config: ${err instanceof Error ? err.message : String(err)}`
    );
  }

  return path.join(gitDir, "hooks");
}

export function generatePreCommitScript(blockOnDrift: boolean): string {
  const blockVal = blockOnDrift ? "1" : "0";
  return `${HOOK_START_MARKER}
if [ "$VEE_SKIP_HOOKS" = "1" ]; then
  exit 0
fi

# 1. Resolve vee binary: local node_modules first, then PATH
VEE_BIN=""
if [ -f "./node_modules/.bin/vee" ]; then
  VEE_BIN="./node_modules/.bin/vee"
elif [ -f "./node_modules/.bin/veeshree" ]; then
  VEE_BIN="./node_modules/.bin/veeshree"
elif command -v vee >/dev/null 2>&1; then
  VEE_BIN="vee"
elif command -v veeshree >/dev/null 2>&1; then
  VEE_BIN="veeshree"
fi

if [ -z "$VEE_BIN" ]; then
  # Veeshree not available; skip silently without false drift warning
  exit 0
fi

$VEE_BIN status --check --quiet
EXIT_CODE=$?

# Exit code 1 indicates code drift detected by 'status --check'
if [ $EXIT_CODE -eq 1 ]; then
  if [ "$VEE_BLOCK_ON_DRIFT" = "1" ] || [ "${blockVal}" = "1" ]; then
    echo "[ERROR] Veeshree: Code drift detected. Commit blocked."
    exit 1
  else
    echo "[WARN] Veeshree: Code has drifted from architectural decisions. Run 'vee sync' to review."
  fi
fi
${HOOK_END_MARKER}`;
}

function generatePostHookScript(): string {
  return `${HOOK_START_MARKER}
if [ "$VEE_SKIP_HOOKS" = "1" ]; then
  exit 0
fi

VEE_BIN=""
if [ -f "./node_modules/.bin/vee" ]; then
  VEE_BIN="./node_modules/.bin/vee"
elif [ -f "./node_modules/.bin/veeshree" ]; then
  VEE_BIN="./node_modules/.bin/veeshree"
elif command -v vee >/dev/null 2>&1; then
  VEE_BIN="vee"
elif command -v veeshree >/dev/null 2>&1; then
  VEE_BIN="veeshree"
fi

if [ -n "$VEE_BIN" ]; then
  $VEE_BIN sync --quiet 2>/dev/null || true
fi
${HOOK_END_MARKER}`;
}

/**
 * Installs or updates Veeshree marker blocks in pre-commit, post-checkout, and post-merge hooks
 */
export function installGitHooks(
  rootDir: string = process.cwd(),
  options: { blockOnDrift?: boolean } = {}
): string[] {
  const hooksDir = resolveGitHooksDir(rootDir);
  if (!hooksDir) {
    throw new VeeError(
      "Cannot install Git hooks: repository is not initialized with Git.",
      "ERR_FILE_NOT_FOUND"
    );
  }

  if (!fs.existsSync(hooksDir)) {
    fs.mkdirSync(hooksDir, { recursive: true });
  }

  const installedHooks: string[] = [];

  // 1. pre-commit
  const preCommitPath = path.join(hooksDir, "pre-commit");
  writeHookFile(preCommitPath, generatePreCommitScript(options.blockOnDrift || false));
  installedHooks.push("pre-commit");

  // 2. post-checkout
  const postCheckoutPath = path.join(hooksDir, "post-checkout");
  writeHookFile(postCheckoutPath, generatePostHookScript());
  installedHooks.push("post-checkout");

  // 3. post-merge
  const postMergePath = path.join(hooksDir, "post-merge");
  writeHookFile(postMergePath, generatePostHookScript());
  installedHooks.push("post-merge");

  return installedHooks;
}

/**
 * Removes Veeshree marker blocks from git hooks
 */
export function uninstallGitHooks(rootDir: string = process.cwd()): string[] {
  const hooksDir = resolveGitHooksDir(rootDir);
  if (!hooksDir || !fs.existsSync(hooksDir)) return [];

  const removedHooks: string[] = [];
  const hookNames = ["pre-commit", "post-checkout", "post-merge"];

  for (const name of hookNames) {
    const hookPath = path.join(hooksDir, name);
    if (fs.existsSync(hookPath)) {
      const content = fs.readFileSync(hookPath, "utf-8");
      if (content.includes(HOOK_START_MARKER)) {
        const regex = new RegExp(`\\n?${HOOK_START_MARKER}[\\s\\S]*?${HOOK_END_MARKER}\\n?`, "g");
        const cleaned = content.replace(regex, "").trim();

        if (!cleaned || cleaned === "#!/bin/sh" || cleaned === "#!/bin/bash") {
          fs.unlinkSync(hookPath);
        } else {
          fs.writeFileSync(hookPath, cleaned + "\n", "utf-8");
        }
        removedHooks.push(name);
      }
    }
  }

  return removedHooks;
}

/**
 * Inspects Git hook status
 */
export function getHooksStatus(rootDir: string = process.cwd()): HooksStatus {
  const hooksDir = resolveGitHooksDir(rootDir);
  if (!hooksDir || !fs.existsSync(hooksDir)) {
    return {
      isGitRepo: false,
      hooksDir: hooksDir || "",
      installed: false,
      preCommitInstalled: false,
      postCheckoutInstalled: false,
      postMergeInstalled: false,
    };
  }

  const preCommit = checkHookFile(path.join(hooksDir, "pre-commit"));
  const postCheckout = checkHookFile(path.join(hooksDir, "post-checkout"));
  const postMerge = checkHookFile(path.join(hooksDir, "post-merge"));

  return {
    isGitRepo: true,
    hooksDir,
    installed: preCommit && postCheckout && postMerge,
    preCommitInstalled: preCommit,
    postCheckoutInstalled: postCheckout,
    postMergeInstalled: postMerge,
  };
}

function checkHookFile(filePath: string): boolean {
  if (!fs.existsSync(filePath)) return false;
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    return content.includes(HOOK_START_MARKER);
  } catch (err: unknown) {
    if (!isEnoent(err)) {
      logger.warn(
        `Failed to inspect git hook file at ${filePath}: ${err instanceof Error ? err.message : String(err)}`
      );
    }
    return false;
  }
}

function writeHookFile(filePath: string, markerBlock: string): void {
  if (fs.existsSync(filePath)) {
    const existing = fs.readFileSync(filePath, "utf-8");
    if (existing.includes(HOOK_START_MARKER)) {
      // Replace existing marker block
      const regex = new RegExp(`${HOOK_START_MARKER}[\\s\\S]*?${HOOK_END_MARKER}`, "g");
      const updated = existing.replace(regex, markerBlock);
      fs.writeFileSync(filePath, updated, "utf-8");
    } else {
      // Append marker block
      const updated = `${existing.trim()}\n\n${markerBlock}\n`;
      fs.writeFileSync(filePath, updated, "utf-8");
    }
  } else {
    const newContent = `#!/bin/sh\n\n${markerBlock}\n`;
    fs.writeFileSync(filePath, newContent, "utf-8");
  }

  try {
    fs.chmodSync(filePath, 0o755);
  } catch (err: unknown) {
    if (process.platform !== "win32") {
      logger.warn(
        `Failed to set mode 0755 on hook ${filePath}: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }
}
