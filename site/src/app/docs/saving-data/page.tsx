"use client";

import React from "react";
import Link from "next/link";

export default function SavingDataPage() {
  return (
    <div className="w-full space-y-12 bg-white text-black">
      {/* Breadcrumb */}
      <div className="text-xs font-mono text-[#898683] flex items-center gap-2">
        <Link href="/" className="hover:text-black">Home</Link>
        <span>/</span>
        <Link href="/docs" className="hover:text-black">Docs</Link>
        <span>/</span>
        <span className="text-black font-medium">2. 3 Ways of Saving Data</span>
      </div>

      {/* Screen Title */}
      <div className="space-y-4 border-b border-[#edece7] pb-8">
        <div className="text-xs font-mono uppercase tracking-wider text-[#898683]">
          Screen 2 of 4
        </div>
        <h1 className="text-4xl sm:text-5xl font-normal tracking-[-0.05em] text-black">
          3 Ways of Saving & Managing Data
        </h1>
        <p className="text-base text-[#444444] leading-relaxed max-w-4xl">
          Veeshree provides three distinct modes for capturing and persisting project memory. You can use whichever method best fits your team workflow or seamlessly combine them.
        </p>
      </div>

      {/* Mode 1: Ambient Watcher */}
      <section className="space-y-4">
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#f7f7f5] border border-[#edece7] text-xs font-mono text-black">
          Mode 1: Ambient Watcher (Zero Human Effort)
        </div>
        <h2 className="text-2xl font-normal tracking-tight text-black">
          vee watch
        </h2>
        <p className="text-sm text-[#444444] leading-relaxed">
          The ambient watcher runs silently in a secondary terminal tab or background daemon. It monitors your workspace using an intelligent debounced file watcher.
        </p>
        <div className="p-5 rounded-[16px] bg-[#f7f7f5] border border-[#edece7] space-y-3 text-xs leading-relaxed">
          <div className="font-mono font-bold text-black">How it works:</div>
          <ol className="list-decimal list-inside space-y-1.5 text-[#444444]">
            <li>You write code normally in your editor.</li>
            <li>When you stop typing for 5 seconds (configurable via <code>--debounce</code>), changes settle.</li>
            <li>Veeshree captures the git diff and runs the extraction engine in the background.</li>
            <li>New architectural decisions are parsed into <code>docs/memory/decisions/</code>, task checkboxes in <code>tasks.md</code> are updated, and rolling milestones are recorded in <code>current-state.md</code>.</li>
            <li>SHA-256 hashes of all linked files are re-calculated instantly.</li>
          </ol>
          <div className="pt-2 font-mono text-[11px] text-[#898683]">
            Best for: Developers who want persistent memory without ever having to type terminal commands.
          </div>
        </div>
      </section>

      {/* Mode 2: Native IDE Rules */}
      <section className="space-y-4 pt-6 border-t border-[#edece7]">
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#f7f7f5] border border-[#edece7] text-xs font-mono text-black">
          Mode 2: Native IDE Rule Injection
        </div>
        <h2 className="text-2xl font-normal tracking-tight text-black">
          Direct Agent Memory Writing
        </h2>
        <p className="text-sm text-[#444444] leading-relaxed">
          During <code>vee init</code>, Veeshree automatically creates instruction files for major AI IDE environments:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
          <div className="p-3 rounded-[12px] bg-[#f7f7f5] border border-[#edece7]">
            <strong>GEMINI.md</strong> & <strong>.agents/rules/veeshree.md</strong> (Google Antigravity & Gemini CLI)
          </div>
          <div className="p-3 rounded-[12px] bg-[#f7f7f5] border border-[#edece7]">
            <strong>CLAUDE.md</strong> (Claude Code & Anthropic Workspaces)
          </div>
          <div className="p-3 rounded-[12px] bg-[#f7f7f5] border border-[#edece7]">
            <strong>.cursorrules</strong> (Cursor IDE)
          </div>
          <div className="p-3 rounded-[12px] bg-[#f7f7f5] border border-[#edece7]">
            <strong>.github/copilot-instructions.md</strong> (GitHub Copilot)
          </div>
        </div>
        <p className="text-sm text-[#444444] leading-relaxed">
          Because these files instruct the assistant to read <code>docs/memory/</code> before planning and update it when finishing tasks, the assistant itself maintains your project memory directly inside your codebase.
        </p>
        <div className="p-4 rounded-[12px] bg-[#f7f7f5] border border-[#edece7] text-xs font-mono text-[#1b0624]">
          Key Advantage: Requires zero external API keys inside Veeshree CLI! The IDE's built-in assistant does all the reading and writing.
        </div>
      </section>

      {/* Mode 3: Traditional CLI Pipeline */}
      <section className="space-y-4 pt-6 border-t border-[#edece7]">
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#f7f7f5] border border-[#edece7] text-xs font-mono text-black">
          Mode 3: Manual CLI & Git Pipeline
        </div>
        <h2 className="text-2xl font-normal tracking-tight text-black">
          Explicit Programmatic Control
        </h2>
        <p className="text-sm text-[#444444] leading-relaxed">
          For developers who prefer explicit commands, automated bash scripts, git hooks, or CI/CD pipelines:
        </p>
        <div className="p-5 rounded-[16px] bg-[#f7f7f5] border border-[#edece7] space-y-3 font-mono text-xs text-black">
          <div>
            <div className="text-[#898683]">// 1. Generate token-budgeted prompt payload for a task</div>
            <div>$ vee context &quot;Implement database migrations&quot;</div>
          </div>
          <div className="pt-2 border-t border-[#edece7]">
            <div className="text-[#898683]">// 2. Capture git diff and extract decisions manually</div>
            <div>$ git diff | vee capture</div>
          </div>
          <div className="pt-2 border-t border-[#edece7]">
            <div className="text-[#898683]">// 3. Verify SHA-256 integrity and re-index memory</div>
            <div>$ vee sync</div>
          </div>
        </div>
      </section>

      {/* Comparison Matrix Table */}
      <section className="space-y-4 pt-6 border-t border-[#edece7]">
        <h2 className="text-2xl font-normal tracking-tight text-black">
          Modes Comparison
        </h2>
        <div className="w-full border border-[#edece7] rounded-[16px] overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="border-b border-[#edece7] text-[#898683] bg-[#f7f7f5]">
              <tr>
                <th className="p-3.5">Feature</th>
                <th className="p-3.5">Mode 1: Ambient Watcher</th>
                <th className="p-3.5">Mode 2: Native IDE Rules</th>
                <th className="p-3.5">Mode 3: Manual CLI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#edece7] text-[#444444]">
              <tr>
                <td className="p-3.5 font-medium text-black">Manual Commands</td>
                <td className="p-3.5">None (runs in background)</td>
                <td className="p-3.5">None (AI assistant writes files)</td>
                <td className="p-3.5">Explicit (context, capture, sync)</td>
              </tr>
              <tr>
                <td className="p-3.5 font-medium text-black">Model Runtime</td>
                <td className="p-3.5">Local Ollama / LM Studio or Cloud Key</td>
                <td className="p-3.5">IDE Assistant Internal Model</td>
                <td className="p-3.5">Local Ollama / LM Studio or Cloud Key</td>
              </tr>
              <tr>
                <td className="p-3.5 font-medium text-black">External API Key</td>
                <td className="p-3.5">Optional (Local Ollama is 100% free)</td>
                <td className="p-3.5">Not required</td>
                <td className="p-3.5">Optional</td>
              </tr>
              <tr>
                <td className="p-3.5 font-medium text-black">Storage Location</td>
                <td className="p-3.5"><code>docs/memory/</code></td>
                <td className="p-3.5"><code>docs/memory/</code></td>
                <td className="p-3.5"><code>docs/memory/</code></td>
              </tr>
              <tr>
                <td className="p-3.5 font-medium text-black">Git Version Controlled</td>
                <td className="p-3.5">Yes</td>
                <td className="p-3.5">Yes</td>
                <td className="p-3.5">Yes</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Back & Forth Screen Routing Footer */}
      <div className="pt-8 border-t border-[#edece7] flex flex-col sm:flex-row items-center justify-between gap-4">
        <Link
          href="/docs"
          className="px-6 py-2.5 rounded-full border border-[#898683]/50 text-xs font-medium text-black hover:bg-[#f7f7f5] transition flex items-center gap-2"
        >
          <span>←</span>
          <span>Previous: 1. Overview & Quickstart</span>
        </Link>

        <Link
          href="/docs/commands"
          className="px-6 py-2.5 rounded-full bg-[#160f0c] text-white text-xs font-medium hover:bg-[#292421] transition flex items-center gap-2"
        >
          <span>Next: 3. CLI Command Reference</span>
          <span>→</span>
        </Link>
      </div>
    </div>
  );
}
