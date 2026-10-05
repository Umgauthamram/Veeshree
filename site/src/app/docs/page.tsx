"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function DocsOverviewPage() {
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  return (
    <div className="w-full space-y-12 bg-white text-black">
      {/* Breadcrumb */}
      <div className="text-xs font-mono text-[#898683] flex items-center gap-2">
        <Link href="/" className="hover:text-black">Home</Link>
        <span>/</span>
        <span className="text-black font-medium">Docs: 1. Overview & Quickstart</span>
      </div>

      {/* Screen Title */}
      <div className="space-y-4 border-b border-[#edece7] pb-8">
        <div className="text-xs font-mono uppercase tracking-wider text-[#898683]">
          Screen 1 of 4
        </div>
        <h1 className="text-4xl sm:text-5xl font-normal tracking-[-0.05em] text-black">
          Overview & Quickstart
        </h1>
        <p className="text-base text-[#444444] leading-relaxed max-w-4xl">
          Veeshree is a local-first, model-independent context persistence layer for AI software engineering. It decouples architectural decisions, hard constraints, and task progress from temporary AI chat sessions and saves them as version-controlled Markdown in <code>docs/memory/</code>.
        </p>
      </div>

      {/* Why Veeshree? */}
      <section className="space-y-4">
        <h2 className="text-2xl font-normal tracking-tight text-black">
          The Problem with Ephemeral AI Chats
        </h2>
        <p className="text-sm text-[#444444] leading-relaxed">
          When developers write software with AI assistants (Antigravity, Cursor, Claude Code, Copilot), the AI accumulates deep context about the system: which database was chosen, why a specific library was rejected, and what security constraints must never be violated.
        </p>
        <p className="text-sm text-[#444444] leading-relaxed">
          However, as soon as that chat context compacts or a new session begins, that institutional memory is lost. The AI forgets architectural decisions, suggests contradictory patterns, and hallucinates rejected code.
        </p>
        <div className="p-5 rounded-[16px] bg-[#f7f7f5] border border-[#edece7] space-y-2 text-xs font-mono text-[#1b0624]">
          <div className="font-bold">The Veeshree Solution:</div>
          <div>• Zero Opaque Lock-in: Project memory lives in human-readable Markdown inside <code>docs/memory/</code>.</div>
          <div>• Token Budget Discipline: Injected context strictly respects a ~2,000 token maximum allocation.</div>
          <div>• Pure JavaScript / Zero Native C++: Runs across any Node.js terminal or container with 0ms cold start.</div>
          <div>• Code Drift Detection: Links source file SHA-256 hashes to Architectural Decision Records.</div>
        </div>
      </section>

      {/* Installation */}
      <section className="space-y-4 pt-6 border-t border-[#edece7]">
        <h2 className="text-2xl font-normal tracking-tight text-black">
          Installation
        </h2>
        <p className="text-sm text-[#444444]">
          Install globally or per-project via npm:
        </p>

        <div className="w-full space-y-3 font-mono text-xs">
          <div className="rounded-[16px] border border-[#edece7] bg-[#f7f7f5] p-4 flex items-center justify-between">
            <span className="font-medium text-black">npm i veeshree</span>
            <button
              onClick={() => copyText("npm i veeshree", "inst-l")}
              className="px-3 py-1.5 bg-[#160f0c] hover:bg-[#292421] text-white rounded-full text-xs transition"
            >
              {copiedCmd === "inst-l" ? "Copied" : "Copy"}
            </button>
          </div>

          <div className="rounded-[16px] border border-[#edece7] bg-[#f7f7f5] p-4 flex items-center justify-between">
            <span className="font-medium text-black">npm install -g veeshree</span>
            <button
              onClick={() => copyText("npm install -g veeshree", "inst-g")}
              className="px-3 py-1.5 bg-[#160f0c] hover:bg-[#292421] text-white rounded-full text-xs transition"
            >
              {copiedCmd === "inst-g" ? "Copied" : "Copy"}
            </button>
          </div>
        </div>

        <div className="text-xs font-mono text-[#898683]">
          Official NPM Package:{" "}
          <a
            href="https://www.npmjs.com/package/veeshree"
            target="_blank"
            rel="noopener noreferrer"
            className="text-black underline underline-offset-4"
          >
            https://www.npmjs.com/package/veeshree
          </a>
        </div>
      </section>

      {/* 3-Minute Quickstart */}
      <section className="space-y-6 pt-6 border-t border-[#edece7]">
        <h2 className="text-2xl font-normal tracking-tight text-black">
          3-Minute Quickstart
        </h2>

        <div className="space-y-4">
          <div className="p-5 rounded-[16px] bg-[#f7f7f5] border border-[#edece7] space-y-2">
            <div className="text-xs font-mono font-bold text-black">Step 1: Initialize Veeshree in your repository</div>
            <p className="text-xs text-[#444444]">
              Scaffolds <code>docs/memory/</code> and creates assistant instruction files (<code>GEMINI.md</code>, <code>CLAUDE.md</code>, <code>.cursorrules</code>, <code>.agents/rules/veeshree.md</code>).
            </p>
            <div className="font-mono text-xs bg-white p-3 rounded-[8px] border border-[#edece7] text-black">
              vee init
            </div>
          </div>

          <div className="p-5 rounded-[16px] bg-[#f7f7f5] border border-[#edece7] space-y-2">
            <div className="text-xs font-mono font-bold text-black">Step 2: Choose how to save data</div>
            <p className="text-xs text-[#444444]">
              You can start the background watcher with <code>vee watch</code>, or simply prompt your IDE assistant to update <code>docs/memory/</code>, or run manual CLI captures.
            </p>
            <div className="font-mono text-xs bg-white p-3 rounded-[8px] border border-[#edece7] text-black">
              vee watch
            </div>
          </div>

          <div className="p-5 rounded-[16px] bg-[#f7f7f5] border border-[#edece7] space-y-2">
            <div className="text-xs font-mono font-bold text-black">Step 3: Check project health & drift</div>
            <p className="text-xs text-[#444444]">
              Displays task completion progress and verifies that no source files have drifted from their architectural records.
            </p>
            <div className="font-mono text-xs bg-white p-3 rounded-[8px] border border-[#edece7] text-black">
              vee status
            </div>
          </div>
        </div>
      </section>

      {/* Back & Forth Screen Routing Footer */}
      <div className="pt-8 border-t border-[#edece7] flex flex-col sm:flex-row items-center justify-between gap-4">
        <Link
          href="/"
          className="px-5 py-2.5 rounded-full border border-[#898683]/50 text-xs font-medium text-black hover:bg-[#f7f7f5] transition"
        >
          ← Back to Home
        </Link>

        <Link
          href="/docs/saving-data"
          className="px-6 py-2.5 rounded-full bg-[#160f0c] text-white text-xs font-medium hover:bg-[#292421] transition flex items-center gap-2"
        >
          <span>Next: 2. 3 Ways of Saving Data</span>
          <span>→</span>
        </Link>
      </div>
    </div>
  );
}
