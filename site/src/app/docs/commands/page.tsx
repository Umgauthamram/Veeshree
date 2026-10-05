"use client";

import React, { useState } from "react";
import Link from "next/link";

const commands = [
  {
    id: "init",
    cmd: "vee init [options]",
    badge: "Scaffolding & IDE Rules",
    explanation: "Analyzes project structure, language, framework, database, and git history without spending any LLM tokens. Scaffolds docs/memory/ with pre-populated templates (constraints.md, current-state.md, tasks.md, discoveries.md, rejected.md) and automatically injects IDE instructions (GEMINI.md, .agents/rules/veeshree.md, .cursorrules, CLAUDE.md).",
    howUsed: "In a new or existing repository, run 'vee init'. It scans the project, creates memory templates, and writes IDE rules so Antigravity, Claude, and Cursor can immediately read and write memory without further setup.",
    flags: "-f, --force : Overwrite existing memory files and reset configuration.",
    example: "vee init\nvee init --force",
  },
  {
    id: "watch",
    cmd: "vee watch [options]",
    badge: "Ambient Background Engine",
    explanation: "Starts an ambient background file watcher. Whenever you edit, add, or delete files, it waits for changes to settle (debounce window) and automatically runs memory extraction and file indexing.",
    howUsed: "Leave 'vee watch' running in a secondary terminal tab. While building features, you never have to touch the CLI. After each pause in typing, vee watch captures the diff and updates the tasks list automatically.",
    flags: "-d, --debounce <seconds> : Settle window in seconds (default: 5).\n-p, --provider <name> : Force specific model provider.",
    example: "vee watch\nvee watch --debounce 10",
  },
  {
    id: "status",
    cmd: "vee status [options]",
    badge: "Health & Integrity Dashboard",
    explanation: "Displays a live terminal dashboard of current project focus, task completion progress percentage, active architectural decisions, active model engine, and SHA-256 code drift alerts.",
    howUsed: "Run before committing code or starting a coding session to confirm milestone progress and verify that no linked source code files have unrecorded modifications.",
    flags: "-c, --check : Exits with a non-zero exit code if any decision is stale (ideal for CI/CD checks).",
    example: "vee status\nvee status --check",
  },
  {
    id: "context",
    cmd: "vee context [request] [options]",
    badge: "Token-Budgeted Context Injection",
    explanation: "Assembles a strict token-budgeted prompt payload (~2,000 tokens max) prioritized by: System Context & Rules, Hard Constraints, Current Project Snapshot, and BM25 ranked Architectural Decision Records. Automatically prepends Stale Record Warnings if code drifted.",
    howUsed: "When asking an AI model to work on a feature, pipe or pass 'vee context \"feature description\"' into the prompt to provide full project context without blowing context windows.",
    flags: "-m, --max-tokens <n> : Maximum token budget (default: 2000).\n-t, --tasks : Include task lists.\n-r, --raw : Output raw text without decorative headers.\n-j, --json : Output structured JSON.",
    example: "vee context \"Implement authentication\"\nvee context --max-tokens 1500 --raw",
  },
  {
    id: "sync",
    cmd: "vee sync",
    badge: "SHA-256 Hash & Re-Indexing",
    explanation: "Scans all Markdown documents in docs/memory/, recalculates current SHA-256 hashes of all linked source code files, and rebuilds the BM25 search index in .vee/index.json in milliseconds.",
    howUsed: "Run after manually editing markdown memory files, pulling changes from git, or switching git branches to refresh indexes instantly.",
    flags: "None",
    example: "vee sync",
  },
  {
    id: "capture",
    cmd: "vee capture [options]",
    badge: "Diff & Transcript Reconciliation",
    explanation: "Takes a Git diff or conversation transcript, runs it through the extraction engine, parses architectural decisions, updates task statuses, and records milestones in docs/memory/current-state.md.",
    howUsed: "After completing a manual coding session, pipe git diff into Veeshree: 'git diff | vee capture'. The engine recognizes newly added functions, creates decision records, and updates tasks.",
    flags: "-d, --diff : Automatically capture current git diff.\n-t, --transcript <text> : Pass raw conversation string.\n-f, --file <path> : Read transcript from file.",
    example: "vee capture --diff\ngit diff | vee capture",
  },
  {
    id: "models",
    cmd: "vee models",
    badge: "Model Runtime Discovery",
    explanation: "Probes local ports (Ollama on 11434, LM Studio on 1234) and checks configured cloud API keys (Gemini, OpenAI, Anthropic) to report all active and usable model engines.",
    howUsed: "Run 'vee models' to check if your local Ollama instance or cloud Gemini key is recognized and ready for background extractions.",
    flags: "None",
    example: "vee models",
  },
  {
    id: "keys",
    cmd: "vee keys <subcommand>",
    badge: "Local Credentials Management",
    explanation: "Securely manages API keys locally in .vee/config.json with masking so keys are never accidentally logged or committed to version control.",
    howUsed: "Set your API key with 'vee keys set gemini AIzaSy...' and verify with 'vee keys list'.",
    flags: "Subcommands: list, set <provider> <key>, remove <provider>",
    example: "vee keys list\nvee keys set gemini <your-key>\nvee keys remove gemini",
  },
  {
    id: "search",
    cmd: "vee search \"<query>\" [options]",
    badge: "BM25 Full-Text Search",
    explanation: "Performs BM25-ranked keyword and phrase search across all memory files including decisions, tasks, constraints, and discoveries.",
    howUsed: "When reviewing why a specific library or architecture was chosen, run 'vee search \"auth library\"' to instantly view the relevant decision record.",
    flags: "-a, --archived : Include historical archived documents in the search.",
    example: "vee search \"database\"\nvee search \"jwt\" --archived",
  },
  {
    id: "decisions",
    cmd: "vee decisions [options]",
    badge: "Architectural Decision Records",
    explanation: "Lists all Architectural Decision Records (ADRs) with their title, status (active, superseded, proposed), creation date, tags, and linked source code files.",
    howUsed: "Run 'vee decisions' to view an index of all architectural decisions recorded in the repository.",
    flags: "-a, --all : Include archived and superseded decisions.\n-s, --status <status> : Filter by status.",
    example: "vee decisions\nvee decisions --all",
  },
  {
    id: "gc",
    cmd: "vee gc [options]",
    badge: "Garbage Collection & Pruning",
    explanation: "Keeps memory files compact to prevent token bloat. Moves completed tasks from current-state.md into docs/memory/archive/completed-tasks.md and archives superseded decisions.",
    howUsed: "After completing a milestone, run 'vee gc' to archive completed tasks, keeping prompt context lightweight and fast.",
    flags: "-d, --dry-run : Preview pruning actions without altering files.",
    example: "vee gc\nvee gc --dry-run",
  },
];

export default function CommandsPage() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="w-full space-y-12 bg-white text-black">
      {/* Breadcrumb */}
      <div className="text-xs font-mono text-[#898683] flex items-center gap-2">
        <Link href="/" className="hover:text-black">Home</Link>
        <span>/</span>
        <Link href="/docs" className="hover:text-black">Docs</Link>
        <span>/</span>
        <span className="text-black font-medium">3. CLI Command Reference</span>
      </div>

      {/* Screen Title */}
      <div className="space-y-4 border-b border-[#edece7] pb-8">
        <div className="text-xs font-mono uppercase tracking-wider text-[#898683]">
          Screen 3 of 4
        </div>
        <h1 className="text-4xl sm:text-5xl font-normal tracking-[-0.05em] text-black">
          CLI Command Reference
        </h1>
        <p className="text-base text-[#444444] leading-relaxed max-w-4xl">
          Comprehensive explanation, practical usage walkthroughs, options, and copyable bash snippets for all 11 Veeshree commands.
        </p>
      </div>

      {/* Commands List */}
      <div className="space-y-8">
        {commands.map((cmd) => (
          <div
            key={cmd.id}
            id={cmd.id}
            className="p-6 rounded-[20px] bg-white border border-[#edece7] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.03)] space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#edece7] pb-3.5">
              <div className="font-mono text-base font-bold text-black">
                {cmd.cmd}
              </div>
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-[#f7f7f5] border border-[#edece7] text-[#444444]">
                {cmd.badge}
              </span>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-[#444444]">
              <div>
                <strong className="text-black">Explanation:</strong> {cmd.explanation}
              </div>

              <div>
                <strong className="text-black">How we used it:</strong> {cmd.howUsed}
              </div>

              {cmd.flags !== "None" && (
                <div>
                  <strong className="text-black">Flags & Options:</strong>
                  <pre className="mt-1 font-mono text-[11px] text-[#444444] bg-[#f7f7f5] p-2.5 rounded-[8px] border border-[#edece7] whitespace-pre-wrap">
                    {cmd.flags}
                  </pre>
                </div>
              )}

              <div className="pt-2">
                <div className="flex items-center justify-between font-mono text-xs bg-[#f7f7f5] p-3 rounded-[12px] border border-[#edece7] text-black">
                  <pre className="whitespace-pre-wrap">{cmd.example}</pre>
                  <button
                    onClick={() => copyText(cmd.example, cmd.id)}
                    className="px-3 py-1 bg-[#160f0c] hover:bg-[#292421] text-white rounded-full text-[11px] font-mono transition"
                  >
                    {copiedId === cmd.id ? "Copied" : "Copy"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Back & Forth Screen Routing Footer */}
      <div className="pt-8 border-t border-[#edece7] flex flex-col sm:flex-row items-center justify-between gap-4">
        <Link
          href="/docs/saving-data"
          className="px-6 py-2.5 rounded-full border border-[#898683]/50 text-xs font-medium text-black hover:bg-[#f7f7f5] transition flex items-center gap-2"
        >
          <span>←</span>
          <span>Previous: 2. 3 Ways of Saving Data</span>
        </Link>

        <Link
          href="/docs/architecture"
          className="px-6 py-2.5 rounded-full bg-[#160f0c] text-white text-xs font-medium hover:bg-[#292421] transition flex items-center gap-2"
        >
          <span>Next: 4. Memory Layout & Drift Guard</span>
          <span>→</span>
        </Link>
      </div>
    </div>
  );
}
