import path from "node:path";
import { startMcpServer } from "../mcp/server.js";
import { installMcpClientConfig, type McpClientType } from "../mcp/client-config.js";
import { logger } from "../utils/logger.js";
import { VeeError } from "../utils/errors.js";

export async function handleMcpCommand(
  action?: string,
  options: { client?: string; noInstall?: boolean; root?: string } = {},
  rootDir: string = process.cwd()
): Promise<void> {
  const effectiveRoot = options.root ? path.resolve(options.root) : rootDir;
  if (action === "install") {
    if (!options.client) {
      throw new VeeError(
        "Usage: vee mcp install --client <claude|claude-code|cursor|vscode|gemini>",
        "ERR_INVALID_ARGS"
      );
    }
    const client = options.client.toLowerCase() as McpClientType;
    const { configPath, backupPath } = installMcpClientConfig(client, effectiveRoot, {
      noInstall: options.noInstall,
      root: options.root,
    });
    if (backupPath) {
      logger.info(`Created backup of existing config at: ${backupPath}`);
    }
    logger.success(`Configured Veeshree MCP server in ${client} settings: ${configPath}`);
    return;
  }

  // Default: start stdio server
  await startMcpServer(effectiveRoot);
}
