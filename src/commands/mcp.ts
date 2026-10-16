import { startMcpServer } from "../mcp/server.js";
import { installMcpClientConfig, type McpClientType } from "../mcp/client-config.js";
import { logger } from "../utils/logger.js";
import { VeeError } from "../utils/errors.js";

export async function handleMcpCommand(
  action?: string,
  options: { client?: string } = {},
  rootDir: string = process.cwd()
): Promise<void> {
  if (action === "install") {
    if (!options.client) {
      throw new VeeError("Usage: vee mcp install --client <claude|cursor|vscode|gemini>", "ERR_INVALID_ARGS");
    }
    const client = options.client.toLowerCase() as McpClientType;
    const { configPath } = installMcpClientConfig(client, rootDir);
    logger.success(`Configured Veeshree MCP server in ${client} settings: ${configPath}`);
    return;
  }

  // Default: start stdio server
  await startMcpServer(rootDir);
}
