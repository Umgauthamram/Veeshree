"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export default function DocsPage() {
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black">
      <Navbar />

      {/* Edge-to-edge full width layout with comfortable lateral padding */}
      <div className="pt-20 pb-20 w-full px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Sticky Sidebar Navigation */}
        <aside className="lg:col-span-2 hidden lg:block sticky top-20 h-[calc(100vh-6rem)] overflow-y-auto pr-4 border-r border-neutral-800 text-xs font-mono">
          <div className="space-y-6">
            <div>
              <div className="font-bold uppercase tracking-wider text-neutral-500 mb-2">1. Overview</div>
              <ul className="space-y-1.5 text-neutral-300">
                <li><a href="#what-is-veeshree" className="hover:text-white transition">What is Veeshree?</a></li>
                <li><a href="#installation" className="hover:text-white transition">Installation</a></li>
                <li><a href="#storage-modes" className="hover:text-white transition">3 Ways to Save Data</a></li>
              </ul>
            </div>

            <div>
              <div className="font-bold uppercase tracking-wider text-neutral-500 mb-2">2. CLI Commands</div>
              <ul className="space-y-1.5 text-neutral-300 font-mono">
                <li><a href="#cmd-init" className="hover:text-white">vee init</a></li>
                <li><a href="#cmd-watch" className="hover:text-white">vee watch</a></li>
                <li><a href="#cmd-status" className="hover:text-white">vee status</a></li>
                <li><a href="#cmd-context" className="hover:text-white">vee context</a></li>
                <li><a href="#cmd-sync" className="hover:text-white">vee sync</a></li>
                <li><a href="#cmd-capture" className="hover:text-white">vee capture</a></li>
                <li><a href="#cmd-models" className="hover:text-white">vee models</a></li>
                <li><a href="#cmd-keys" className="hover:text-white">vee keys</a></li>
                <li><a href="#cmd-search" className="hover:text-white">vee search</a></li>
                <li><a href="#cmd-decisions" className="hover:text-white">vee decisions</a></li>
                <li><a href="#cmd-gc" className="hover:text-white">vee gc</a></li>
              </ul>
            </div>

            <div>
              <div className="font-bold uppercase tracking-wider text-neutral-500 mb-2">3. Storage & Architecture</div>
              <ul className="space-y-1.5 text-neutral-300">
                <li><a href="#memory-layout" className="hover:text-white transition">Memory Directory Layout</a></li>
                <li><a href="#token-budget" className="hover:text-white transition">Token Budget Engine</a></li>
                <li><a href="#drift-detection" className="hover:text-white transition">SHA-256 Drift Guard</a></li>
              </ul>
            </div>
          </div>
        </aside>

        {/* Main Content Area: Spans the remaining columns completely without lateral gaps */}
        <main className="lg:col-span-10 w-full space-y-16">
          
          {/* Section 1: Overview */}
          <section id="what-is-veeshree" className="space-y-4 w-full">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Veeshree Documentation
            </h1>
            <p className="text-base text-neutral-300 leading-relaxed">
              Veeshree is a local-first, model-independent context persistence layer for AI software engineering. It decouples architectural decisions, hard constraints, and task progress from temporary AI chat sessions and saves them as version-controlled Markdown in <code>docs/memory/</code>.
            </p>
            <div className="text-xs font-mono text-neutral-400">
              NPM Package:{" "}
              <a
                href="https://www.npmjs.com/package/veeshree"
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-white hover:text-neutral-300"
              >
                https://www.npmjs.com/package/veeshree
              </a>
            </div>
          </section>

          {/* Section 2: Installation */}
          <section id="installation" className="space-y-4 pt-6 border-t border-neutral-800 w-full">
            <h2 className="text-2xl font-bold text-white">Installation</h2>
            <p className="text-sm text-neutral-300">
              Install globally or per-project using npm:
            </p>

            <div className="w-full space-y-3 font-mono text-xs">
              <div className="rounded border border-neutral-800 bg-neutral-950 p-4 flex items-center justify-between">
                <span>npm i veeshree</span>
                <button
                  onClick={() => copyText("npm i veeshree", "inst-l")}
                  className="px-2.5 py-1 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 rounded border border-neutral-700 text-xs transition"
                >
                  {copiedCmd === "inst-l" ? "Copied" : "Copy"}
                </button>
              </div>

              <div className="rounded border border-neutral-800 bg-neutral-950 p-4 flex items-center justify-between">
                <span>npm install -g veeshree</span>
                <button
                  onClick={() => copyText("npm install -g veeshree", "inst-g")}
                  className="px-2.5 py-1 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 rounded border border-neutral-700 text-xs transition"
                >
                  {copiedCmd === "inst-g" ? "Copied" : "Copy"}
                </button>
              </div>
            </div>
          </section>

          {/* Section 3: The 3 Ways of Storing / Managing Data */}
          <section id="storage-modes" className="space-y-6 pt-6 border-t border-neutral-800 w-full">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">
                3 Ways of Saving and Managing Data
              </h2>
              <p className="text-sm text-neutral-300 leading-relaxed">
                Veeshree supports three distinct workflows for persisting project memory. You can use whichever method fits your coding environment, or mix them seamlessly.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
              {/* Mode 1 */}
              <div className="p-6 rounded border border-neutral-800 bg-neutral-950 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-400">
                    Mode 1: Ambient Watcher
                  </div>
                  <h3 className="text-xl font-bold text-white">vee watch</h3>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    Runs continuously in a background terminal. It monitors file changes and git diffs. When changes settle (default 5-second settle window), Veeshree automatically triggers diff extraction and writes memory into <code>docs/memory/</code> without any manual terminal commands.
                  </p>
                </div>
                <div className="pt-3 border-t border-neutral-900 text-xs font-mono text-neutral-400">
                  Best for: Hands-free coding where you want zero terminal interaction.
                </div>
              </div>

              {/* Mode 2 */}
              <div className="p-6 rounded border border-neutral-800 bg-neutral-950 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-400">
                    Mode 2: Native IDE Rules
                  </div>
                  <h3 className="text-xl font-bold text-white">Direct Agent Memory</h3>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    During <code>vee init</code>, Veeshree generates rule files: <code>GEMINI.md</code>, <code>.agents/rules/veeshree.md</code>, <code>.cursorrules</code>, and <code>CLAUDE.md</code>. Your IDE AI assistant (Google Antigravity, Cursor, Claude Code) reads <code>docs/memory/</code> on every prompt and writes completed milestones directly to disk.
                  </p>
                </div>
                <div className="pt-3 border-t border-neutral-900 text-xs font-mono text-neutral-400">
                  Best for: Modern AI IDEs with zero external API key requirements.
                </div>
              </div>

              {/* Mode 3 */}
              <div className="p-6 rounded border border-neutral-800 bg-neutral-950 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-400">
                    Mode 3: Manual CLI Pipeline
                  </div>
                  <h3 className="text-xl font-bold text-white">Command-Line & CI/CD</h3>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    Full programmatic control. Use <code>vee context &quot;&lt;task&gt;&quot;</code> to print prompt context, <code>git diff | vee capture</code> to record memory after a commit or milestone, and <code>vee sync</code> to verify SHA-256 integrity in CI/CD pipelines and git commit hooks.
                  </p>
                </div>
                <div className="pt-3 border-t border-neutral-900 text-xs font-mono text-neutral-400">
                  Best for: Terminal power users, automated scripts, and CI/CD validation.
                </div>
              </div>
            </div>

            {/* Comparison Table */}
            <div className="w-full border border-neutral-800 rounded bg-neutral-950 overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="border-b border-neutral-800 text-neutral-400 bg-neutral-900/60">
                  <tr>
                    <th className="p-3">Feature</th>
                    <th className="p-3">Mode 1: vee watch</th>
                    <th className="p-3">Mode 2: Native IDE Rules</th>
                    <th className="p-3">Mode 3: Manual CLI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-900 text-neutral-300">
                  <tr>
                    <td className="p-3 font-semibold text-white">Human Commands Needed</td>
                    <td className="p-3">None (runs in background)</td>
                    <td className="p-3">None (IDE assistant updates files)</td>
                    <td className="p-3">Explicit commands (capture, sync)</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-white">Extraction Model</td>
                    <td className="p-3">Local Ollama / LM Studio or Cloud Key</td>
                    <td className="p-3">IDE Assistant Native Model</td>
                    <td className="p-3">Local Ollama / LM Studio or Cloud Key</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-white">External API Key Needed?</td>
                    <td className="p-3">Only if using cloud model (Ollama is free)</td>
                    <td className="p-3">No (uses IDE internal context)</td>
                    <td className="p-3">Only if using cloud model</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-white">Storage Location</td>
                    <td className="p-3">docs/memory/</td>
                    <td className="p-3">docs/memory/</td>
                    <td className="p-3">docs/memory/</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-white">Git Version Controlled</td>
                    <td className="p-3">Yes</td>
                    <td className="p-3">Yes</td>
                    <td className="p-3">Yes</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 4: All CLI Commands Explained In-Depth */}
          <section id="commands" className="space-y-10 pt-6 border-t border-neutral-800 w-full">
            <div>
              <h2 className="text-2xl font-bold text-white">CLI Command Reference</h2>
              <p className="text-sm text-neutral-400 mt-1">
                Comprehensive explanation, usage examples, and real-world workflow for every command.
              </p>
            </div>

            {/* vee init */}
            <div id="cmd-init" className="p-6 rounded border border-neutral-800 bg-neutral-950 space-y-4 w-full">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-800 pb-3">
                <code className="text-lg font-bold font-mono text-white">vee init [options]</code>
                <span className="text-xs font-mono text-neutral-400">Scaffolding & IDE Rules</span>
              </div>
              <div className="space-y-3 text-sm text-neutral-300 leading-relaxed">
                <p>
                  <strong>Explanation:</strong> Analyzes the project structure, language, framework, database, and git history without spending any LLM tokens. It scaffolds <code>docs/memory/</code> with pre-populated templates (<code>constraints.md</code>, <code>current-state.md</code>, <code>tasks.md</code>, <code>discoveries.md</code>, <code>rejected.md</code>) and automatically injects IDE instructions (<code>GEMINI.md</code>, <code>.agents/rules/veeshree.md</code>, <code>.cursorrules</code>, <code>CLAUDE.md</code>).
                </p>
                <p>
                  <strong>How we used it:</strong> In a new project directory, we initialized Git and ran <code>vee init</code>. It scanned the workspace, detected the project type, generated all memory templates, and created the assistant rule files so Google Antigravity, Claude, and Cursor could immediately read and write memory without further setup.
                </p>
                <p>
                  <strong>Options & Flags:</strong> <code>-f, --force</code> Overwrites existing memory files and resets configuration.
                </p>
                <div className="font-mono text-xs bg-neutral-900 p-3 rounded border border-neutral-800 text-white">
                  vee init<br />
                  vee init --force
                </div>
              </div>
            </div>

            {/* vee watch */}
            <div id="cmd-watch" className="p-6 rounded border border-neutral-800 bg-neutral-950 space-y-4 w-full">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-800 pb-3">
                <code className="text-lg font-bold font-mono text-white">vee watch [options]</code>
                <span className="text-xs font-mono text-neutral-400">Ambient Background Engine</span>
              </div>
              <div className="space-y-3 text-sm text-neutral-300 leading-relaxed">
                <p>
                  <strong>Explanation:</strong> Starts a continuous background file watcher. Whenever you edit, add, or delete files, it waits for changes to settle (debounce window) and automatically runs memory extraction and file indexing.
                </p>
                <p>
                  <strong>How we used it:</strong> We opened a secondary terminal tab and launched <code>vee watch</code>. While building a calculator web application and styling UI components, we never had to touch the CLI. After each 5-second pause in typing, <code>vee watch</code> captured the diff and updated the tasks list automatically.
                </p>
                <p>
                  <strong>Options & Flags:</strong> <code>-d, --debounce &lt;seconds&gt;</code> Settle window in seconds (default: 5). <code>-p, --provider &lt;name&gt;</code> Force model provider.
                </p>
                <div className="font-mono text-xs bg-neutral-900 p-3 rounded border border-neutral-800 text-white">
                  vee watch<br />
                  vee watch --debounce 10
                </div>
              </div>
            </div>

            {/* vee status */}
            <div id="cmd-status" className="p-6 rounded border border-neutral-800 bg-neutral-950 space-y-4 w-full">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-800 pb-3">
                <code className="text-lg font-bold font-mono text-white">vee status [options]</code>
                <span className="text-xs font-mono text-neutral-400">Health & Integrity Dashboard</span>
              </div>
              <div className="space-y-3 text-sm text-neutral-300 leading-relaxed">
                <p>
                  <strong>Explanation:</strong> Prints a live terminal dashboard of current project focus, task completion progress percentage, active architectural decisions, active model engine, and SHA-256 code drift alerts.
                </p>
                <p>
                  <strong>How we used it:</strong> Before committing our code, we ran <code>vee status</code> to confirm that all 4 calculator milestone tasks were marked as completed (100% progress) and that no linked source files had unrecorded modifications.
                </p>
                <p>
                  <strong>Options & Flags:</strong> <code>-c, --check</code> Exits with a non-zero exit code if any decision is stale (useful for CI/CD checks).
                </p>
                <div className="font-mono text-xs bg-neutral-900 p-3 rounded border border-neutral-800 text-white">
                  vee status<br />
                  vee status --check
                </div>
              </div>
            </div>

            {/* vee context */}
            <div id="cmd-context" className="p-6 rounded border border-neutral-800 bg-neutral-950 space-y-4 w-full">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-800 pb-3">
                <code className="text-lg font-bold font-mono text-white">vee context [request] [options]</code>
                <span className="text-xs font-mono text-neutral-400">Token-Budgeted Context Injection</span>
              </div>
              <div className="space-y-3 text-sm text-neutral-300 leading-relaxed">
                <p>
                  <strong>Explanation:</strong> Assembles a strict token-budgeted prompt payload (~2,000 tokens max) prioritized by: System Context & Rules, Hard Constraints, Current Project Snapshot, and BM25 ranked Architectural Decision Records. If any linked code drifted, it automatically prepends a Stale Record Warning.
                </p>
                <p>
                  <strong>How we used it:</strong> When asking the AI to add keyboard event listeners to the calculator, we ran <code>vee context &quot;keyboard navigation&quot;</code>. Veeshree ranked all memory documents, included the active tasks, and provided a concise prompt payload ready to feed into any LLM without exceeding context limits.
                </p>
                <p>
                  <strong>Options & Flags:</strong> <code>-m, --max-tokens &lt;n&gt;</code> Maximum token budget (default: 2000). <code>-t, --tasks</code> Include task lists. <code>-r, --raw</code> Output raw text without decorative headers. <code>-j, --json</code> Output JSON format.
                </p>
                <div className="font-mono text-xs bg-neutral-900 p-3 rounded border border-neutral-800 text-white">
                  vee context &quot;Implement theme switcher&quot;<br />
                  vee context --max-tokens 1500 --raw
                </div>
              </div>
            </div>

            {/* vee sync */}
            <div id="cmd-sync" className="p-6 rounded border border-neutral-800 bg-neutral-950 space-y-4 w-full">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-800 pb-3">
                <code className="text-lg font-bold font-mono text-white">vee sync</code>
                <span className="text-xs font-mono text-neutral-400">SHA-256 Hash & Re-Indexing</span>
              </div>
              <div className="space-y-3 text-sm text-neutral-300 leading-relaxed">
                <p>
                  <strong>Explanation:</strong> Scans all Markdown memory documents in <code>docs/memory/</code>, calculates current SHA-256 hashes of all linked source code files, and rebuilds the BM25 search index in <code>.vee/index.json</code>.
                </p>
                <p>
                  <strong>How we used it:</strong> After manually editing <code>constraints.md</code> to specify a new architectural constraint, we ran <code>vee sync</code> to refresh the search index and re-link all hashes in under 50ms.
                </p>
                <div className="font-mono text-xs bg-neutral-900 p-3 rounded border border-neutral-800 text-white">
                  vee sync
                </div>
              </div>
            </div>

            {/* vee capture */}
            <div id="cmd-capture" className="p-6 rounded border border-neutral-800 bg-neutral-950 space-y-4 w-full">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-800 pb-3">
                <code className="text-lg font-bold font-mono text-white">vee capture [options]</code>
                <span className="text-xs font-mono text-neutral-400">Diff & Transcript Reconciliation</span>
              </div>
              <div className="space-y-3 text-sm text-neutral-300 leading-relaxed">
                <p>
                  <strong>Explanation:</strong> Takes a Git diff or conversation transcript, runs it through the extraction engine, parses architectural decisions, updates task statuses, and records milestones in <code>docs/memory/current-state.md</code>.
                </p>
                <p>
                  <strong>How we used it:</strong> After making a major code modification, we piped the git diff directly into Veeshree: <code>git diff | vee capture</code>. The engine recognized the newly added calculation functions, created a decision record, and marked the corresponding task as finished.
                </p>
                <p>
                  <strong>Options & Flags:</strong> <code>-d, --diff</code> Automatically capture current git diff. <code>-t, --transcript &lt;text&gt;</code> Pass raw conversation string. <code>-f, --file &lt;path&gt;</code> Read transcript from file.
                </p>
                <div className="font-mono text-xs bg-neutral-900 p-3 rounded border border-neutral-800 text-white">
                  vee capture --diff<br />
                  git diff | vee capture
                </div>
              </div>
            </div>

            {/* vee models */}
            <div id="cmd-models" className="p-6 rounded border border-neutral-800 bg-neutral-950 space-y-4 w-full">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-800 pb-3">
                <code className="text-lg font-bold font-mono text-white">vee models</code>
                <span className="text-xs font-mono text-neutral-400">Model Runtime Discovery</span>
              </div>
              <div className="space-y-3 text-sm text-neutral-300 leading-relaxed">
                <p>
                  <strong>Explanation:</strong> Probes local ports (Ollama on port 11434, LM Studio on port 1234) and checks configured cloud API keys (Gemini, OpenAI, Anthropic) to report all active and usable model engines.
                </p>
                <p>
                  <strong>How we used it:</strong> We ran <code>vee models</code> to check if our local Ollama instance or cloud Gemini key was ready to process background extractions.
                </p>
                <div className="font-mono text-xs bg-neutral-900 p-3 rounded border border-neutral-800 text-white">
                  vee models
                </div>
              </div>
            </div>

            {/* vee keys */}
            <div id="cmd-keys" className="p-6 rounded border border-neutral-800 bg-neutral-950 space-y-4 w-full">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-800 pb-3">
                <code className="text-lg font-bold font-mono text-white">vee keys &lt;subcommand&gt;</code>
                <span className="text-xs font-mono text-neutral-400">Local Credentials Management</span>
              </div>
              <div className="space-y-3 text-sm text-neutral-300 leading-relaxed">
                <p>
                  <strong>Explanation:</strong> Securely manages API keys locally in <code>.vee/config.json</code> with masking so keys are never accidentally logged or committed to version control.
                </p>
                <p>
                  <strong>How we used it:</strong> We set our Gemini key using <code>vee keys set gemini AIzaSy...</code> and verified it was configured using <code>vee keys list</code>.
                </p>
                <p>
                  <strong>Subcommands:</strong> <code>list</code>, <code>set &lt;provider&gt; &lt;key&gt;</code>, <code>remove &lt;provider&gt;</code>.
                </p>
                <div className="font-mono text-xs bg-neutral-900 p-3 rounded border border-neutral-800 text-white">
                  vee keys list<br />
                  vee keys set gemini &lt;your-api-key&gt;<br />
                  vee keys set openai &lt;your-api-key&gt;<br />
                  vee keys remove gemini
                </div>
              </div>
            </div>

            {/* vee search */}
            <div id="cmd-search" className="p-6 rounded border border-neutral-800 bg-neutral-950 space-y-4 w-full">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-800 pb-3">
                <code className="text-lg font-bold font-mono text-white">vee search &quot;&lt;query&gt;&quot; [options]</code>
                <span className="text-xs font-mono text-neutral-400">BM25 Full-Text Search</span>
              </div>
              <div className="space-y-3 text-sm text-neutral-300 leading-relaxed">
                <p>
                  <strong>Explanation:</strong> Performs BM25-ranked keyword and phrase search across all memory files including decisions, tasks, constraints, and discoveries.
                </p>
                <p>
                  <strong>How we used it:</strong> When reviewing why a specific CSS layout was chosen, we ran <code>vee search &quot;calculator layout&quot;</code> to instantly retrieve the relevant ADR and its trade-offs.
                </p>
                <p>
                  <strong>Options & Flags:</strong> <code>-a, --archived</code> Include historical archived documents in the search.
                </p>
                <div className="font-mono text-xs bg-neutral-900 p-3 rounded border border-neutral-800 text-white">
                  vee search &quot;layout&quot;<br />
                  vee search &quot;theme&quot; --archived
                </div>
              </div>
            </div>

            {/* vee decisions */}
            <div id="cmd-decisions" className="p-6 rounded border border-neutral-800 bg-neutral-950 space-y-4 w-full">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-800 pb-3">
                <code className="text-lg font-bold font-mono text-white">vee decisions [options]</code>
                <span className="text-xs font-mono text-neutral-400">Architectural Decision Records</span>
              </div>
              <div className="space-y-3 text-sm text-neutral-300 leading-relaxed">
                <p>
                  <strong>Explanation:</strong> Lists all Architectural Decision Records (ADRs) with their title, status (active, superseded, proposed), creation date, tags, and linked source code files.
                </p>
                <p>
                  <strong>How we used it:</strong> We ran <code>vee decisions</code> to get a clean overview of all technical decisions recorded in the repository.
                </p>
                <p>
                  <strong>Options & Flags:</strong> <code>-a, --all</code> Include archived and superseded decisions. <code>-s, --status &lt;status&gt;</code> Filter by status.
                </p>
                <div className="font-mono text-xs bg-neutral-900 p-3 rounded border border-neutral-800 text-white">
                  vee decisions<br />
                  vee decisions --all
                </div>
              </div>
            </div>

            {/* vee gc */}
            <div id="cmd-gc" className="p-6 rounded border border-neutral-800 bg-neutral-950 space-y-4 w-full">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-800 pb-3">
                <code className="text-lg font-bold font-mono text-white">vee gc [options]</code>
                <span className="text-xs font-mono text-neutral-400">Garbage Collection & Pruning</span>
              </div>
              <div className="space-y-3 text-sm text-neutral-300 leading-relaxed">
                <p>
                  <strong>Explanation:</strong> Keeps memory files compact to prevent token bloat. It moves completed tasks from <code>current-state.md</code> into <code>docs/memory/archive/completed-tasks.md</code> and archives superseded decisions.
                </p>
                <p>
                  <strong>How we used it:</strong> After completing our initial milestone, <code>current-state.md</code> had several finished items. Running <code>vee gc</code> cleaned the active snapshot, keeping prompt injection fast and under budget.
                </p>
                <p>
                  <strong>Options & Flags:</strong> <code>-d, --dry-run</code> Preview pruning actions without altering files.
                </p>
                <div className="font-mono text-xs bg-neutral-900 p-3 rounded border border-neutral-800 text-white">
                  vee gc<br />
                  vee gc --dry-run
                </div>
              </div>
            </div>
          </section>

          {/* Section 5: Directory Structure */}
          <section id="memory-layout" className="space-y-4 pt-6 border-t border-neutral-800 w-full">
            <h2 className="text-2xl font-bold text-white">Memory Directory Layout</h2>
            <p className="text-sm text-neutral-300 leading-relaxed">
              Every piece of memory is transparent and human-readable. All files live inside your codebase and are reviewed via normal Git Pull Requests.
            </p>
            <div className="p-4 rounded bg-neutral-950 border border-neutral-800 font-mono text-xs text-neutral-200 overflow-x-auto leading-relaxed w-full">
              <pre>{`your-codebase/
├── docs/
│   └── memory/                      <-- Version-controlled human-readable memory
│       ├── decisions/               <-- Active Architectural Decision Records (ADRs)
│       │   ├── database.md
│       │   └── framework.md
│       ├── current-state.md         <-- Active feature & rolling milestone snapshot (max 5)
│       ├── tasks.md                 <-- Pending and completed task lists
│       ├── constraints.md           <-- Locked architectural & security rules (Never violate)
│       ├── discoveries.md           <-- System behaviors & technical findings
│       ├── rejected.md              <-- Discarded alternatives & trade-offs
│       └── archive/                 <-- Pruned historical records
│           ├── completed-tasks.md
│           └── decisions/
├── .vee/                            <-- Local search cache & config (Git ignored)
│   ├── config.json                  <-- Preferences & local API key storage
│   └── index.json                   <-- Fast search index & SHA-256 code hashes
└── .agents/rules/veeshree.md        <-- Native IDE assistant instruction file`}</pre>
            </div>
          </section>

          {/* Section 6: Token Budget Pipeline */}
          <section id="token-budget" className="space-y-4 pt-6 border-t border-neutral-800 w-full">
            <h2 className="text-2xl font-bold text-white">Token Budget Pipeline (~2,000 Tokens Max)</h2>
            <p className="text-sm text-neutral-300 leading-relaxed">
              When injecting context into an AI model, Veeshree applies a strict token budget so that essential rules and constraints are never truncated:
            </p>
            <div className="p-4 rounded bg-neutral-950 border border-neutral-800 space-y-3 font-mono text-xs w-full">
              <div className="flex justify-between border-b border-neutral-800 pb-2">
                <span className="font-bold text-white">1. System Context & Rules</span>
                <span className="text-neutral-400">~300 Tokens [CRITICAL - NEVER TRUNCATED]</span>
              </div>
              <div className="flex justify-between border-b border-neutral-800 pb-2">
                <span className="font-bold text-white">2. Active Hard Constraints</span>
                <span className="text-neutral-400">~200 Tokens [CRITICAL - NEVER TRUNCATED]</span>
              </div>
              <div className="flex justify-between border-b border-neutral-800 pb-2">
                <span className="font-bold text-white">3. Current Project State Snapshot</span>
                <span className="text-neutral-400">~400 Tokens [HIGH PRIORITY]</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold text-white">4. Top Matching Decisions (BM25)</span>
                <span className="text-neutral-400">~1,100 Tokens [DYNAMICALLY ALLOCATED]</span>
              </div>
            </div>
          </section>

          {/* Section 7: SHA-256 Code Drift Guard */}
          <section id="drift-detection" className="space-y-4 pt-6 border-t border-neutral-800 w-full">
            <h2 className="text-2xl font-bold text-white">SHA-256 Code Drift Guard</h2>
            <p className="text-sm text-neutral-300 leading-relaxed">
              Every Architectural Decision Record (ADR) in <code>docs/memory/decisions/</code> tracks the exact SHA-256 checksums of the source code files it governs. If a developer or another AI changes those source files without updating the memory record, Veeshree detects the drift:
            </p>
            <div className="p-4 rounded bg-neutral-950 border border-neutral-800 font-mono text-xs text-neutral-300 space-y-2 w-full">
              <div className="text-neutral-400">Example: vee status drift detection</div>
              <div className="text-white">
                ! DRIFT DETECTED: docs/memory/decisions/auth.md<br />
                &nbsp;&nbsp;Linked file &apos;src/auth/jwt.ts&apos; hash mismatch (SHA-256 changed).<br />
                &nbsp;&nbsp;Run &apos;vee capture --diff&apos; or &apos;vee sync&apos; to reconcile.
              </div>
            </div>
          </section>

        </main>
      </div>

      <Footer />
    </div>
  );
}
