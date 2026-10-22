import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { initializeVeeshree } from "../src/commands/init.js";
import { handleMcpToolCall, MCP_TOOLS } from "../src/mcp/tools.js";
import { VeeError } from "../src/utils/errors.js";

describe("MCP Tools Full Coverage Suite", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "vee-mcp-cov-"));
    initializeVeeshree(tempDir);
  });

  afterEach(() => {
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch {
      // ignore
    }
  });

  it("exposes all 8 official MCP tools", () => {
    expect(MCP_TOOLS.length).toBe(8);
    const names = MCP_TOOLS.map((t) => t.name);
    expect(names).toContain("get_context");
    expect(names).toContain("search_memory");
    expect(names).toContain("get_decision");
    expect(names).toContain("list_decisions");
    expect(names).toContain("check_drift");
    expect(names).toContain("propose_decision");
    expect(names).toContain("propose_constraint");
    expect(names).toContain("update_task");
  });

  it("handles get_context with valid and invalid arguments", async () => {
    const res = await handleMcpToolCall("get_context", { task: "implement auth", max_tokens: 1500 }, tempDir);
    expect(typeof res).toBe("string");
    expect(res).toContain("VEESHREE");

    // Invalid max_tokens
    await expect(handleMcpToolCall("get_context", { max_tokens: -5 }, tempDir)).rejects.toThrow(VeeError);
  });

  it("handles search_memory with valid and invalid queries", async () => {
    await expect(handleMcpToolCall("search_memory", {}, tempDir)).rejects.toThrow(VeeError);
    await expect(handleMcpToolCall("search_memory", { query: "" }, tempDir)).rejects.toThrow(VeeError);

    const res = await handleMcpToolCall("search_memory", { query: "memory", include_archived: true }, tempDir);
    const parsed = JSON.parse(res);
    expect(Array.isArray(parsed)).toBe(true);
  });

  it("handles get_decision with existing, missing, and invalid ids", async () => {
    await expect(handleMcpToolCall("get_decision", {}, tempDir)).rejects.toThrow(VeeError);
    await expect(handleMcpToolCall("get_decision", { id: "invalid id with spaces" }, tempDir)).rejects.toThrow(VeeError);

    // Create a dummy decision
    const adrDir = path.join(tempDir, "docs", "memory", "decisions");
    fs.mkdirSync(adrDir, { recursive: true });
    fs.writeFileSync(
      path.join(adrDir, "0001-arch.md"),
      `---\nid: "0001"\ntitle: Architecture\nstatus: active\ndate: "2026-01-01"\n---\n# Architecture\nDetails`,
      "utf-8"
    );

    const res = await handleMcpToolCall("get_decision", { id: "0001" }, tempDir);
    expect(res).toContain("Architecture");

    // Missing decision
    await expect(handleMcpToolCall("get_decision", { id: "9999" }, tempDir)).rejects.toThrow(VeeError);
  });

  it("handles list_decisions with status filters", async () => {
    const resActive = await handleMcpToolCall("list_decisions", { status: "active" }, tempDir);
    expect(Array.isArray(JSON.parse(resActive))).toBe(true);

    const resAll = await handleMcpToolCall("list_decisions", { status: "all" }, tempDir);
    expect(Array.isArray(JSON.parse(resAll))).toBe(true);

    const resSuperseded = await handleMcpToolCall("list_decisions", { status: "superseded" }, tempDir);
    expect(Array.isArray(JSON.parse(resSuperseded))).toBe(true);
  });

  it("handles check_drift with and without specific id", async () => {
    const resAll = await handleMcpToolCall("check_drift", {}, tempDir);
    const parsedAll = JSON.parse(resAll);
    expect(parsedAll.hasDrift).toBeDefined();

    // Specific ID returns a valid drift report
    const resId = await handleMcpToolCall("check_drift", { id: "nonexistent" }, tempDir);
    const parsedId = JSON.parse(resId);
    expect(parsedId.hasDrift).toBe(false);
  });

  it("handles propose_decision with schema validation and queue storage", async () => {
    await expect(handleMcpToolCall("propose_decision", {}, tempDir)).rejects.toThrow(VeeError);

    const res = await handleMcpToolCall(
      "propose_decision",
      {
        title: "Use Vitest for testing",
        decision: "We will adopt Vitest across all test suites",
        reason: "Fast ESM native execution and built-in v8 coverage",
        alternatives: ["Jest", "Mocha"],
        linked_files: ["vitest.config.ts"],
      },
      tempDir
    );

    const parsed = JSON.parse(res);
    expect(parsed.proposal_id).toBeDefined();
    expect(parsed.status).toBe("pending");
  });

  it("handles propose_constraint with hard and soft types", async () => {
    await expect(handleMcpToolCall("propose_constraint", {}, tempDir)).rejects.toThrow(VeeError);

    const resHard = await handleMcpToolCall(
      "propose_constraint",
      { rule: "Never commit plaintext API keys", type: "hard" },
      tempDir
    );
    const parsedHard = JSON.parse(resHard);
    expect(parsedHard.proposal_id).toBeDefined();
    expect(parsedHard.risk).toBe("high");

    const resSoft = await handleMcpToolCall(
      "propose_constraint",
      { rule: "Prefer functional components", type: "soft" },
      tempDir
    );
    const parsedSoft = JSON.parse(resSoft);
    expect(parsedSoft.proposal_id).toBeDefined();
  });

  it("handles update_task for add, complete, and remove actions", async () => {
    await expect(handleMcpToolCall("update_task", {}, tempDir)).rejects.toThrow(VeeError);

    const resAdd = await handleMcpToolCall(
      "update_task",
      { name: "Write Phase D tests", action: "add" },
      tempDir
    );
    const parsedAdd = JSON.parse(resAdd);
    expect(parsedAdd.proposal_id).toBeDefined();

    const resComplete = await handleMcpToolCall(
      "update_task",
      { name: "Write Phase D tests", action: "complete" },
      tempDir
    );
    const parsedComplete = JSON.parse(resComplete);
    expect(parsedComplete.proposal_id).toBeDefined();

    const resRemove = await handleMcpToolCall(
      "update_task",
      { name: "Deprecated task", action: "remove" },
      tempDir
    );
    const parsedRemove = JSON.parse(resRemove);
    expect(parsedRemove.proposal_id).toBeDefined();
  });

  it("rejects unknown tool calls", async () => {
    await expect(handleMcpToolCall("unknown_tool", {}, tempDir)).rejects.toThrow(VeeError);
  });
});
