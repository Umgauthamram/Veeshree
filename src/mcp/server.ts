import fs from "node:fs";
import path from "node:path";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { MCP_TOOLS, handleMcpToolCall } from "./tools.js";
import {
  CONSTRAINTS_FILE_REL,
  CURRENT_STATE_FILE_REL,
  DECISIONS_DIR_REL,
} from "../utils/constants.js";

/**
 * Starts the Veeshree MCP Server over stdio
 */
export async function startMcpServer(rootDir: string = process.cwd()): Promise<void> {
  const server = new Server(
    {
      name: "veeshree",
      version: "1.0.0",
    },
    {
      capabilities: {
        tools: {},
        resources: {},
      },
    }
  );

  // List tools handler
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: MCP_TOOLS,
    };
  });

  // Call tool handler
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    try {
      const text = await handleMcpToolCall(name, args as Record<string, unknown>, rootDir);
      return {
        content: [{ type: "text", text }],
      };
    } catch (err: any) {
      return {
        isError: true,
        content: [{ type: "text", text: `Error executing ${name}: ${err.message}` }],
      };
    }
  });

  // List resources handler
  server.setRequestHandler(ListResourcesRequestSchema, async () => {
    return {
      resources: [
        {
          uri: "memory://constraints",
          name: "Project Constraints",
          description: "Active architectural and security constraints (constraints.md)",
          mimeType: "text/markdown",
        },
        {
          uri: "memory://state",
          name: "Current Project State",
          description: "Current focus, recent milestones, and next immediate steps (current-state.md)",
          mimeType: "text/markdown",
        },
      ],
    };
  });

  // Read resource handler
  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const uri = request.params.uri;
    if (uri === "memory://constraints") {
      const p = path.join(rootDir, CONSTRAINTS_FILE_REL);
      const content = fs.existsSync(p) ? fs.readFileSync(p, "utf-8") : "# Constraints\n";
      return {
        contents: [{ uri, mimeType: "text/markdown", text: content }],
      };
    } else if (uri === "memory://state") {
      const p = path.join(rootDir, CURRENT_STATE_FILE_REL);
      const content = fs.existsSync(p) ? fs.readFileSync(p, "utf-8") : "# Current State\n";
      return {
        contents: [{ uri, mimeType: "text/markdown", text: content }],
      };
    } else if (uri.startsWith("memory://decisions/")) {
      const id = uri.replace("memory://decisions/", "");
      const decisionsDir = path.join(rootDir, DECISIONS_DIR_REL);
      const candidate = path.join(decisionsDir, id.endsWith(".md") ? id : `${id}.md`);
      if (fs.existsSync(candidate)) {
        return {
          contents: [{ uri, mimeType: "text/markdown", text: fs.readFileSync(candidate, "utf-8") }],
        };
      }
    }

    throw new Error(`Resource not found: ${uri}`);
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
}
