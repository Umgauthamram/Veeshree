import fs from "node:fs";
import path from "node:path";
import { z } from "zod";
import { buildContext } from "../core/context/builder.js";
import { searchMemory } from "../core/search.js";
import { checkWorkspaceDrift } from "../core/drift/status.js";
import { loadOrBuildIndex } from "../core/indexer.js";
import { parseDecisionFrontmatter } from "../core/memory/frontmatter.js";
import { createProposal, acceptProposal } from "../core/proposals/queue.js";
import { loadConfig } from "../core/config.js";
import { sanitizeRelativePath } from "../utils/paths.js";
import { DECISIONS_DIR_REL, ARCHIVE_DECISIONS_DIR_REL } from "../utils/constants.js";
import { VeeError } from "../utils/errors.js";

const GetContextSchema = z.object({
  task: z.string().max(1000, "task description too long").optional(),
  max_tokens: z.number().int().positive().max(100000, "max_tokens too high").optional(),
});

const SearchMemorySchema = z.object({
  query: z.string().min(1, "Search query is required").max(500, "Search query too long"),
  include_archived: z.boolean().optional(),
});

const GetDecisionSchema = z.object({
  id: z
    .string()
    .min(1, "ADR id is required")
    .max(100)
    .regex(/^[A-Za-z0-9._-]+$/, "Invalid decision ID format"),
});

const ListDecisionsSchema = z.object({
  status: z.enum(["active", "superseded", "proposed", "all"]).optional(),
});

const CheckDriftSchema = z.object({
  id: z
    .string()
    .max(100)
    .regex(/^[A-Za-z0-9._-]+$/)
    .optional(),
});

const ProposeDecisionSchema = z.object({
  title: z.string().min(1, "title is required").max(200, "title too long (max 200 characters)"),
  decision: z
    .string()
    .min(1, "decision is required")
    .max(10000, "decision too long (max 10000 characters)"),
  reason: z
    .string()
    .min(1, "reason is required")
    .max(10000, "reason too long (max 10000 characters)"),
  alternatives: z.array(z.string().max(1000)).max(20, "too many alternatives (max 20)").optional(),
  linked_files: z.array(z.string().max(500)).max(50, "too many linked files (max 50)").optional(),
});

const ProposeConstraintSchema = z.object({
  rule: z.string().min(1, "rule is required").max(2000, "rule too long (max 2000 characters)"),
  type: z.enum(["hard", "soft"]).optional(),
});

const UpdateTaskSchema = z.object({
  name: z
    .string()
    .min(1, "task name is required")
    .max(500, "task name too long (max 500 characters)"),
  action: z.enum(["add", "complete", "remove"]),
});

export const MCP_TOOLS = [
  {
    name: "get_context",
    description:
      "Get token-budgeted system prompt context payload from active memory with stale drift alerts.",
    inputSchema: {
      type: "object",
      properties: {
        task: {
          type: "string",
          description: "Optional current task or focus query to prioritize relevant decisions",
        },
        max_tokens: { type: "number", description: "Maximum token budget (default: 2000)" },
      },
    },
  },
  {
    name: "search_memory",
    description: "Perform BM25 search across indexed memory records, constraints, and decisions.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Keywords or terms to search for" },
        include_archived: {
          type: "boolean",
          description: "Whether to include superseded/archived records",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "get_decision",
    description:
      "Retrieve a complete Architectural Decision Record (ADR) including its full supersede chain.",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "ADR identifier or filename (e.g. '0001-database' or 'database')",
        },
      },
      required: ["id"],
    },
  },
  {
    name: "list_decisions",
    description:
      "List all architectural decisions with their active status, tags, and linked files.",
    inputSchema: {
      type: "object",
      properties: {
        status: {
          type: "string",
          enum: ["active", "superseded", "proposed", "all"],
          description: "Filter by status",
        },
      },
    },
  },
  {
    name: "check_drift",
    description: "Check live SHA-256 drift between codebase files and baselines recorded in ADRs.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Optional ADR id to check a specific decision record" },
      },
    },
  },
  {
    name: "propose_decision",
    description: "Propose a new architectural decision. Returns a proposal ID for human review.",
    inputSchema: {
      type: "object",
      properties: {
        title: { type: "string", description: "Short title of the architectural choice" },
        decision: { type: "string", description: "Concrete decision decided upon" },
        reason: { type: "string", description: "Rationale explaining why this choice was made" },
        alternatives: {
          type: "array",
          items: { type: "string" },
          description: "Alternatives considered",
        },
        linked_files: {
          type: "array",
          items: { type: "string" },
          description: "Code files implementing this decision",
        },
      },
      required: ["title", "decision", "reason"],
    },
  },
  {
    name: "propose_constraint",
    description:
      "Propose an architectural constraint or security rule (always flagged high-risk for review).",
    inputSchema: {
      type: "object",
      properties: {
        rule: { type: "string", description: "Constraint rule or guideline statement" },
        type: {
          type: "string",
          enum: ["hard", "soft"],
          description: "Constraint severity (hard or soft)",
        },
      },
      required: ["rule"],
    },
  },
  {
    name: "update_task",
    description: "Add, mark complete, or remove a project task in tasks.md.",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Task title or description" },
        action: {
          type: "string",
          enum: ["add", "complete", "remove"],
          description: "Action to perform",
        },
      },
      required: ["name", "action"],
    },
  },
];

/**
 * Executes an MCP tool call and returns a stringified result
 */
export async function handleMcpToolCall(
  name: string,
  args: Record<string, unknown> = {},
  rootDir: string = process.cwd()
): Promise<string> {
  switch (name) {
    case "get_context": {
      const parsed = GetContextSchema.safeParse(args);
      if (!parsed.success) {
        throw new VeeError(
          parsed.error.issues[0]?.message || "Invalid arguments for get_context",
          "ERR_INVALID_ARGS"
        );
      }
      const task = parsed.data.task;
      const maxTokens = parsed.data.max_tokens;
      const result = buildContext(rootDir, { request: task, maxTokens });
      return result.content;
    }

    case "search_memory": {
      const parsed = SearchMemorySchema.safeParse(args);
      if (!parsed.success) {
        throw new VeeError(
          parsed.error.issues[0]?.message || "Invalid arguments for search_memory",
          "ERR_INVALID_ARGS"
        );
      }
      const query = parsed.data.query;
      const includeArchived = Boolean(parsed.data.include_archived);
      const results = searchMemory(query, { includeArchived }, rootDir);
      return JSON.stringify(results, null, 2);
    }

    case "get_decision": {
      const parsed = GetDecisionSchema.safeParse(args);
      if (!parsed.success) {
        throw new VeeError(
          parsed.error.issues[0]?.message || "Invalid arguments for get_decision",
          "ERR_INVALID_ARGS"
        );
      }
      const id = parsed.data.id;
      const dirs = [
        path.join(rootDir, DECISIONS_DIR_REL),
        path.join(rootDir, ARCHIVE_DECISIONS_DIR_REL),
      ];

      for (const dir of dirs) {
        if (!fs.existsSync(dir)) continue;
        const files = fs.readdirSync(dir).filter((f) => f.endsWith(".md"));
        for (const f of files) {
          const fileId = path.basename(f, ".md");
          const fullPath = path.join(dir, f);
          const raw = fs.readFileSync(fullPath, "utf-8");
          const { data, content } = parseDecisionFrontmatter(raw);

          if (data.id === id || fileId === id || fileId.endsWith(`-${id}`)) {
            return JSON.stringify(
              {
                id: data.id || fileId,
                title: data.title,
                status: data.status || "active",
                tags: data.tags,
                linked_files: data.linked_files,
                supersedes: data.supersedes,
                superseded_by: data.superseded_by,
                content,
              },
              null,
              2
            );
          }
        }
      }
      throw new VeeError(`Decision '${id}' not found.`, "ERR_FILE_NOT_FOUND");
    }

    case "list_decisions": {
      const parsed = ListDecisionsSchema.safeParse(args);
      if (!parsed.success) {
        throw new VeeError(
          parsed.error.issues[0]?.message || "Invalid arguments for list_decisions",
          "ERR_INVALID_ARGS"
        );
      }
      const statusFilter = parsed.data.status || "all";
      const index = loadOrBuildIndex(rootDir);
      const docs = index.documents.filter((d) => {
        if (d.type !== "decision" && d.type !== "archived_decision") return false;
        if (statusFilter !== "all" && d.status !== statusFilter) return false;
        return true;
      });

      return JSON.stringify(
        docs.map((d) => ({
          id: d.id,
          title: d.title,
          status: d.status,
          path: d.path,
          tags: d.tags,
          linked_files: d.linked_files,
          stale: d.stale,
        })),
        null,
        2
      );
    }

    case "check_drift": {
      const parsed = CheckDriftSchema.safeParse(args);
      if (!parsed.success) {
        throw new VeeError(
          parsed.error.issues[0]?.message || "Invalid arguments for check_drift",
          "ERR_INVALID_ARGS"
        );
      }
      const specificId = parsed.data.id;
      const report = checkWorkspaceDrift(rootDir, specificId);
      return JSON.stringify(report, null, 2);
    }

    case "propose_decision": {
      const parsed = ProposeDecisionSchema.safeParse(args);
      if (!parsed.success) {
        throw new VeeError(
          parsed.error.issues[0]?.message || "Invalid arguments for propose_decision",
          "ERR_INVALID_ARGS"
        );
      }
      const title = parsed.data.title;
      const decision = parsed.data.decision;
      const reason = parsed.data.reason;
      const alternatives = parsed.data.alternatives ? parsed.data.alternatives.map(String) : [];
      const linkedFiles = parsed.data.linked_files
        ? parsed.data.linked_files.map((f) => sanitizeRelativePath(String(f)))
        : [];

      const proposal = createProposal(
        "mcp",
        {
          decisions: [
            {
              title,
              decision,
              reason,
              alternatives_considered: alternatives,
              linked_files: linkedFiles,
              status: "active",
              tags: ["architecture"],
            },
          ],
          current_state: {
            current_feature: "",
            completed_in_session: [],
            next_immediate_steps: [],
          },
          tasks: [],
          constraints: [],
          rejected_approaches: [],
          discoveries: [],
        },
        "mcp_agent",
        rootDir
      );

      return JSON.stringify(
        {
          proposal_id: proposal.id,
          risk: proposal.risk,
          status: proposal.status,
          message: `Decision proposal created. Human review required via 'vee accept ${proposal.id}'.`,
        },
        null,
        2
      );
    }

    case "propose_constraint": {
      const parsed = ProposeConstraintSchema.safeParse(args);
      if (!parsed.success) {
        throw new VeeError(
          parsed.error.issues[0]?.message || "Invalid arguments for propose_constraint",
          "ERR_INVALID_ARGS"
        );
      }
      const rule = parsed.data.rule;
      const type = parsed.data.type === "soft" ? "soft" : "hard";

      const proposal = createProposal(
        "mcp",
        {
          decisions: [],
          current_state: {
            current_feature: "",
            completed_in_session: [],
            next_immediate_steps: [],
          },
          tasks: [],
          constraints: [{ rule, type, source: "mcp" }],
          rejected_approaches: [],
          discoveries: [],
        },
        "mcp_agent",
        rootDir
      );

      return JSON.stringify(
        {
          proposal_id: proposal.id,
          risk: proposal.risk,
          status: proposal.status,
          message: `Constraint proposal created (HIGH RISK). Must be approved by a human: 'vee accept ${proposal.id}'.`,
        },
        null,
        2
      );
    }

    case "update_task": {
      const parsed = UpdateTaskSchema.safeParse(args);
      if (!parsed.success) {
        throw new VeeError(
          parsed.error.issues[0]?.message || "Invalid arguments for update_task",
          "ERR_INVALID_ARGS"
        );
      }
      const name = parsed.data.name;
      const action = parsed.data.action;

      const proposal = createProposal(
        "mcp",
        {
          decisions: [],
          current_state: {
            current_feature: "",
            completed_in_session: [],
            next_immediate_steps: [],
          },
          tasks: [{ task_name: name, action }],
          constraints: [],
          rejected_approaches: [],
          discoveries: [],
        },
        "mcp_agent",
        rootDir
      );

      const config = loadConfig(rootDir);
      if (config.proposals?.auto_apply_low_risk && proposal.risk === "low") {
        await acceptProposal(proposal.id, "mcp_auto", rootDir);
        return JSON.stringify(
          {
            proposal_id: proposal.id,
            risk: proposal.risk,
            status: "accepted",
            message: `Task ${action} applied automatically.`,
          },
          null,
          2
        );
      }

      return JSON.stringify(
        {
          proposal_id: proposal.id,
          risk: proposal.risk,
          status: proposal.status,
          message: `Task update proposal recorded (${proposal.id}).`,
        },
        null,
        2
      );
    }

    default:
      throw new VeeError(`Unknown tool '${name}'`, "ERR_INVALID_ARGS");
  }
}
