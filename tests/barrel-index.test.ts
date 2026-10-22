import { describe, it, expect } from "vitest";
import * as RootIndex from "../src/index.js";
import * as ContextIndex from "../src/core/context/index.js";
import * as DriftIndex from "../src/core/drift/index.js";
import * as HooksIndex from "../src/core/hooks/index.js";
import * as MemoryIndex from "../src/core/memory/index.js";
import * as ProposalsIndex from "../src/core/proposals/index.js";
import * as ReconcileIndex from "../src/core/reconcile/index.js";
import * as RedactIndex from "../src/core/redact/index.js";
import * as RulesIndex from "../src/core/rules/index.js";
import * as SnapshotsIndex from "../src/core/snapshots/index.js";
import * as TransferIndex from "../src/core/transfer/index.js";
import * as WatchIndex from "../src/core/watch/index.js";
import * as McpIndex from "../src/mcp/index.js";
import * as ProvidersIndex from "../src/providers/index.js";
import * as SchemasIndex from "../src/schemas/index.js";

describe("Barrel Indexes Coverage Suite", () => {
  it("imports and validates all public barrel exports", () => {
    expect(RootIndex.VEESHREE_VERSION).toBeDefined();
    expect(RootIndex.logger).toBeDefined();
    expect(RootIndex.VeeError).toBeDefined();
    expect(RootIndex.buildContext).toBeDefined();
    expect(RootIndex.searchMemory).toBeDefined();

    expect(ContextIndex.buildContext).toBeDefined();
    expect(DriftIndex.checkWorkspaceDrift).toBeDefined();
    expect(HooksIndex.installGitHooks).toBeDefined();
    expect(MemoryIndex.acquireLock).toBeDefined();
    expect(ProposalsIndex.createProposal).toBeDefined();
    expect(ReconcileIndex.reconcileExtractionSafe).toBeDefined();
    expect(RedactIndex.redactContent).toBeDefined();
    expect(RulesIndex.installAgentRules).toBeDefined();
    expect(SnapshotsIndex.createMemorySnapshot).toBeDefined();
    expect(TransferIndex.exportMemoryToArchive).toBeDefined();
    expect(WatchIndex.startMemoryWatcher).toBeDefined();
    expect(McpIndex.startMcpServer).toBeDefined();
    expect(ProvidersIndex.AnthropicExtractor).toBeDefined();
    expect(SchemasIndex.VeeshreeConfigSchema).toBeDefined();
  });
});
