import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { writeAtomic } from "../core/memory/atomic.js";
import { VeeError } from "../utils/errors.js";

export type McpClientType = "claude" | "cursor" | "vscode" | "gemini" | "claude-code";

/**
 * Resolves the configuration file path for a specified MCP client
 */
export function resolveClientConfigPath(client: McpClientType, rootDir: string = process.cwd()): string {
  switch (client) {
    case "claude": {
      if (process.platform === "win32") {
        const appData = process.env.APPDATA || path.join(os.homedir(), "AppData", "Roaming");
        return path.join(appData, "Claude", "claude_desktop_config.json");
      } else if (process.platform === "darwin") {
        return path.join(os.homedir(), "Library", "Application Support", "Claude", "claude_desktop_config.json");
      } else {
        return path.join(os.homedir(), ".config", "Claude", "claude_desktop_config.json");
      }
    }
    case "claude-code":
      return path.join(rootDir, ".mcp.json");
    case "cursor":
      return path.join(rootDir, ".cursor", "mcp.json");
    case "vscode":
      return path.join(rootDir, ".vscode", "mcp.json");
    case "gemini":
      return path.join(rootDir, ".gemini", "mcp_config.json");
    default:
      throw new VeeError(`Unsupported client '${client}'. Supported: claude, claude-code, cursor, vscode, gemini`, "ERR_INVALID_ARGS");
  }
}

import { VEESHREE_VERSION } from "../utils/constants.js";

export interface InstallMcpOptions {
  noInstall?: boolean;
  root?: string;
}

/**
 * Strips single-line and multi-line comments from JSON string
 */
export function stripJsonComments(json: string): string {
  return json.replace(/\\"|"(?:\\"|[^"])*"|(\/\/.*|\/\*[\s\S]*?\*\/)/g, (m, g) => (g ? "" : m));
}

/**
 * Strips comments and trailing commas to parse JSONC safely
 */
export function parseJsonc(raw: string): any {
  const stripped = stripJsonComments(raw);
  const withoutTrailingCommas = stripped.replace(/,\s*([}\]])/g, "$1");
  return JSON.parse(withoutTrailingCommas);
}

function resolveInstalledVeeBinary(rootDir: string): { command: string; args: string[] } {
  const localPkgBin = path.resolve(rootDir, "node_modules", "veeshree", "bin", "vee.js");
  if (fs.existsSync(localPkgBin)) {
    return { command: "node", args: [localPkgBin] };
  }
  const localBin = path.resolve(rootDir, "node_modules", ".bin", process.platform === "win32" ? "vee.cmd" : "vee");
  if (fs.existsSync(localBin)) {
    return { command: localBin, args: [] };
  }
  if (process.argv[1] && fs.existsSync(process.argv[1])) {
    return { command: "node", args: [path.resolve(process.argv[1])] };
  }
  return { command: "vee", args: [] };
}

function buildServerEntry(client: McpClientType, rootDir: string, options: InstallMcpOptions = {}) {
  const isGlobalConfig = client === "claude";
  let command = "npx";
  const serverArgs: string[] = [];

  if (options.noInstall) {
    const resolved = resolveInstalledVeeBinary(rootDir);
    command = resolved.command;
    serverArgs.push(...resolved.args, "mcp");
  } else {
    serverArgs.push("-y", `veeshree@${VEESHREE_VERSION}`, "mcp");
  }

  if (isGlobalConfig || options.root) {
    const targetRoot = options.root ? path.resolve(options.root) : path.resolve(rootDir);
    serverArgs.push("--root", targetRoot);
  }

  return {
    command,
    args: serverArgs,
  };
}

/**
 * Installs Veeshree MCP server definition into client configuration file
 */
export function installMcpClientConfig(
  client: McpClientType,
  rootDir: string = process.cwd(),
  options: InstallMcpOptions = {}
): { configPath: string; client: string; backupPath?: string } {
  const configPath = resolveClientConfigPath(client, rootDir);
  const dir = path.dirname(configPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  let configObj: Record<string, any> = {};
  let backupPath: string | undefined;

  if (fs.existsSync(configPath)) {
    const raw = fs.readFileSync(configPath, "utf-8");
    if (raw.trim().length > 0) {
      try {
        configObj = parseJsonc(raw);
      } catch (err: any) {
        throw new VeeError(
          `Failed to parse existing MCP configuration at '${configPath}': ${err.message}. Aborting to prevent configuration loss.`,
          "ERR_CONFIG_INVALID"
        );
      }
    }

    // Create backup file before modifying
    backupPath = `${configPath}.bak`;
    fs.copyFileSync(configPath, backupPath);
  }

  const serverEntry = buildServerEntry(client, rootDir, options);

  if (client === "vscode") {
    if (!configObj.servers) configObj.servers = {};
    configObj.servers.veeshree = serverEntry;
  } else {
    if (!configObj.mcpServers) configObj.mcpServers = {};
    configObj.mcpServers.veeshree = serverEntry;
  }

  writeAtomic(configPath, JSON.stringify(configObj, null, 2));

  return { configPath, client, backupPath };
}

/**
 * Generates client configuration object without writing to disk
 */
export function generateClientConfig(
  client: McpClientType,
  rootDir: string = process.cwd(),
  options: InstallMcpOptions = {}
): { targetPath: string; content: string } {
  const targetPath = resolveClientConfigPath(client, rootDir);
  const serverEntry = buildServerEntry(client, rootDir, options);

  let configObj: Record<string, any> = {};
  if (client === "vscode") {
    configObj = { servers: { veeshree: serverEntry } };
  } else {
    configObj = { mcpServers: { veeshree: serverEntry } };
  }

  return { targetPath, content: JSON.stringify(configObj, null, 2) };
}
