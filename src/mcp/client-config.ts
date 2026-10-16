import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { writeAtomic } from "../core/memory/atomic.js";
import { VeeError } from "../utils/errors.js";

export type McpClientType = "claude" | "cursor" | "vscode" | "gemini";

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
    case "cursor":
      return path.join(rootDir, ".cursor", "mcp.json");
    case "vscode":
      return path.join(rootDir, ".vscode", "mcp.json");
    case "gemini":
      return path.join(rootDir, ".gemini", "mcp_config.json");
    default:
      throw new VeeError(`Unsupported client '${client}'. Supported: claude, cursor, vscode, gemini`, "ERR_INVALID_ARGS");
  }
}

/**
 * Installs Veeshree MCP server definition into client configuration file
 */
export function installMcpClientConfig(
  client: McpClientType,
  rootDir: string = process.cwd()
): { configPath: string; client: string } {
  const configPath = resolveClientConfigPath(client, rootDir);
  const dir = path.dirname(configPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  let configObj: Record<string, any> = {};
  if (fs.existsSync(configPath)) {
    try {
      configObj = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    } catch {
      configObj = {};
    }
  }

  const serverEntry = {
    command: "npx",
    args: ["-y", "veeshree", "mcp"],
  };

  if (client === "vscode") {
    if (!configObj.servers) configObj.servers = {};
    configObj.servers.veeshree = serverEntry;
  } else {
    if (!configObj.mcpServers) configObj.mcpServers = {};
    configObj.mcpServers.veeshree = serverEntry;
  }

  writeAtomic(configPath, JSON.stringify(configObj, null, 2));

  return { configPath, client };
}

/**
 * Generates client configuration object without writing to disk
 */
export function generateClientConfig(
  client: McpClientType,
  rootDir: string = process.cwd()
): { targetPath: string; content: string } {
  const targetPath = resolveClientConfigPath(client, rootDir);
  const serverEntry = {
    command: "npx",
    args: ["-y", "veeshree", "mcp"],
  };

  let configObj: Record<string, any> = {};
  if (client === "vscode") {
    configObj = { servers: { veeshree: serverEntry } };
  } else {
    configObj = { mcpServers: { veeshree: serverEntry } };
  }

  return { targetPath, content: JSON.stringify(configObj, null, 2) };
}
