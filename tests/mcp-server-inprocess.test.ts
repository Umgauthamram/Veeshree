import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { startMcpServer } from "../src/mcp/server.js";
import { initializeVeeshree } from "../src/commands/init.js";
import { handleDecisionsCommand } from "../src/commands/decisions.js";

describe("MCP Server In-Process Test Suite", () => {
  let tempDir: string;
  let client: Client;
  let clientTransport: any;
  let serverTransport: any;

  beforeEach(async () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "vee-mcp-serv-"));
    initializeVeeshree(tempDir);
    handleDecisionsCommand({ subcommand: "new", title: "In-Process Test ADR" }, tempDir);

    const [cTransport, sTransport] = InMemoryTransport.createLinkedPair();
    clientTransport = cTransport;
    serverTransport = sTransport;

    client = new Client(
      { name: "test-client", version: "1.0.0" },
      { capabilities: {} }
    );

    await startMcpServer(tempDir, serverTransport);
    await client.connect(clientTransport);
  });

  afterEach(async () => {
    try {
      await client.close();
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch {
      // ignore cleanup error
    }
  });

  it("lists all available MCP tools", async () => {
    const tools = await client.listTools();
    expect(tools.tools.length).toBeGreaterThan(0);
    const names = tools.tools.map((t) => t.name);
    expect(names).toContain("get_context");
    expect(names).toContain("search_memory");
    expect(names).toContain("check_drift");
  });

  it("calls tools and enforces payload bounds", async () => {
    // Normal call
    const res = await client.callTool({
      name: "get_context",
      arguments: { task: "architecture review" },
    });
    expect(res.content).toBeDefined();

    // Call tool that throws error
    const errRes = (await client.callTool({
      name: "get_decision",
      arguments: { id: "non-existent-9999" },
    })) as any;
    expect(errRes.isError).toBe(true);
    expect(errRes.content[0].text).toContain("Error executing get_decision");

    // Exceed 16KB payload
    const largeArgs = {
      task: "a".repeat(20000),
    };
    const overflowRes = (await client.callTool({
      name: "get_context",
      arguments: largeArgs,
    })) as any;
    expect(overflowRes.isError).toBe(true);
    expect(overflowRes.content[0].text).toContain("exceeds 16 KB maximum limit");
  });

  it("lists and reads memory resources", async () => {
    const list = await client.listResources();
    expect(list.resources.length).toBeGreaterThanOrEqual(2);
    const uris = list.resources.map((r) => r.uri);
    expect(uris).toContain("memory://constraints");
    expect(uris).toContain("memory://state");

    // Read constraints
    const constraintsRes = await client.readResource({ uri: "memory://constraints" });
    expect(constraintsRes.contents[0].text).toContain("Constraints");

    // Read state
    const stateRes = await client.readResource({ uri: "memory://state" });
    expect(stateRes.contents[0].text).toContain("Current Project State");

    // Read existing decision
    const decisionUri = uris.find((u) => u.startsWith("memory://decisions/"));
    if (decisionUri) {
      const decRes = await client.readResource({ uri: decisionUri });
      expect(decRes.contents[0].text).toContain("In-Process Test ADR");
    }

    // Read decision with invalid ID chars
    await expect(
      client.readResource({ uri: "memory://decisions/bad*id#here" })
    ).rejects.toThrow(/Invalid decision ID/);

    // Read decision with path traversal
    await expect(
      client.readResource({ uri: "memory://decisions/../../passwords" })
    ).rejects.toThrow();

    // Read missing decision
    await expect(
      client.readResource({ uri: "memory://decisions/9999-missing" })
    ).rejects.toThrow(/Decision '9999-missing' not found/);

    // Read unknown uri
    await expect(
      client.readResource({ uri: "memory://unknown-resource" })
    ).rejects.toThrow(/Resource not found/);
  });
});
