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
  VEESHREE_VERSION,
} from "../utils/constants.js";

/**
 * Starts the Veeshree MCP Server over stdio
 */
export async function startMcpServer(rootDir: string = process.cwd()): Promise<void> {
  const server = new Server(
    {
      name: "veeshree",
      version: VEESHREE_VERSION,
    },
    {
      capabilities: {
        tools: {},
        resources: {},
      },
    }
  );

  const MAX_PAYLOAD_BYTES = 16384; // 16 KB

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
      const payloadString = JSON.stringify(request.params);
      if (Buffer.byteLength(payloadString, "utf-8") > MAX_PAYLOAD_BYTES) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Error executing ${name}: Payload exceeds 16 KB maximum limit.`,
            },
          ],
        };
      }

      const text = await handleMcpToolCall(name, (args as Record<string, unknown>) || {}, rootDir);
      return {
        content: [{ type: "text", text }],
      };
    } catch (err: unknown) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Error executing ${name}: ${err instanceof Error ? err.message : String(err)}`,
          },
        ],
      };
    }
  });

  // List resources handler
  server.setRequestHandler(ListResourcesRequestSchema, async () => {
    const resources = [
      {
        uri: "memory://constraints",
        name: "Project Constraints",
        description: "Active architectural and security constraints (constraints.md)",
        mimeType: "text/markdown",
      },
      {
        uri: "memory://state",
        name: "Current Project State",
        description:
          "Current focus, recent milestones, and next immediate steps (current-state.md)",
        mimeType: "text/markdown",
      },
    ];

    const decisionsDir = path.resolve(rootDir, DECISIONS_DIR_REL);
    if (fs.existsSync(decisionsDir)) {
      const files = fs.readdirSync(decisionsDir).filter((f) => f.endsWith(".md"));
      for (const f of files) {
        const id = f.replace(/\.md$/, "");
        resources.push({
          uri: `memory://decisions/${id}`,
          name: `Decision: ${id}`,
          description: `Architectural Decision Record (${f})`,
          mimeType: "text/markdown",
        });
      }
    }

    return { resources };
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
      if (!/^[A-Za-z0-9._-]+$/.test(id)) {
        throw new Error(
          `Invalid decision ID '${id}'. Decision IDs may only contain letters, numbers, dots, underscores, and hyphens.`
        );
      }

      const decisionsDir = path.resolve(rootDir, DECISIONS_DIR_REL);
      const filename = id.endsWith(".md") ? id : `${id}.md`;
      const candidate = path.resolve(decisionsDir, filename);

      const rel = path.relative(decisionsDir, candidate);
      if (rel.startsWith("..") || path.isAbsolute(rel)) {
        throw new Error(`Access denied: path traversal detected for '${id}'`);
      }

      if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
        return {
          contents: [{ uri, mimeType: "text/markdown", text: fs.readFileSync(candidate, "utf-8") }],
        };
      }
      throw new Error(`Decision '${id}' not found`);
    }

    throw new Error(`Resource not found: ${uri}`);
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
}
