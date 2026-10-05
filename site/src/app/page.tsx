"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export default function Home() {
  const [copiedHero, setCopiedHero] = useState(false);
  const [activeTab, setActiveTab] = useState<"watch" | "context" | "status" | "drift">("watch");

  const copyInstall = () => {
    navigator.clipboard.writeText("npm i veeshree");
    setCopiedHero(true);
    setTimeout(() => setCopiedHero(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#f7f7f5] text-[#1b0624] font-sans antialiased selection:bg-[#160f0c] selection:text-white">
      <Navbar />

      {/* Hero Section with Illustrated Watercolor Landscape */}
      <section className="relative w-full pt-20 pb-16 sm:pb-24 overflow-hidden">
        {/* Watercolor Landscape Frame */}
        <div className="w-full px-4 sm:px-8 lg:px-12 max-w-[1340px] mx-auto">
          <div className="relative w-full h-[380px] sm:h-[480px] md:h-[540px] rounded-[24px] sm:rounded-[32px] overflow-hidden border border-[#edece7] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.04)]">
            <Image
              src="/duna-hero-sunset.jpg"
              alt="Sunset watercolor painting over a quiet editorial canvas"
              fill
              priority
              className="object-cover object-center"
            />
            {/* Soft gradient bleeding into the Linen canvas */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#f7f7f5] via-[#f7f7f5]/40 to-transparent" />
            
            {/* Hero Content Overlay (Positioned within and bleeding over the artwork) */}
            <div className="absolute inset-0 flex flex-col items-center justify-end pb-8 sm:pb-12 px-6 text-center z-10">
              {/* Compressed GT America Display Headline */}
              <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-[76px] font-normal tracking-[-0.06em] leading-[1.02] text-[#1b0624] max-w-4xl">
                Local memory for AI software engineering.
              </h1>
            </div>
          </div>
        </div>

        {/* Hero Copy & Pill CTAs */}
        <div className="w-full max-w-3xl mx-auto px-6 mt-8 sm:mt-10 text-center space-y-6">
          <p className="text-base sm:text-lg text-[#444444] leading-relaxed font-normal">
            Decouple architectural decisions, hard constraints, and task progress from temporary chat sessions. Stored as version-controlled Markdown in <code className="text-[#1b0624] bg-[#edece7] px-2 py-0.5 rounded font-mono text-sm">docs/memory/</code>.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 pt-2">
            <button
              onClick={copyInstall}
              className="px-7 py-3.5 rounded-full bg-[#160f0c] hover:bg-[#292421] text-white text-sm font-medium transition-all active:scale-[0.98] font-mono"
            >
              {copiedHero ? "Copied to clipboard!" : "npm i veeshree"}
            </button>

            <Link
              href="/docs"
              className="px-7 py-3.5 rounded-full border border-[#898683]/50 bg-white hover:bg-[#edece7] text-[#1b0624] text-sm font-medium transition-all"
            >
              Explore Documentation
            </Link>
          </div>

          <div className="text-xs font-mono text-[#898683] pt-1">
            Package Registry:{" "}
            <a
              href="https://www.npmjs.com/package/veeshree"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#1b0624] underline hover:text-[#444444]"
            >
              https://www.npmjs.com/package/veeshree
            </a>
          </div>
        </div>
      </section>

      {/* Customer & Ecosystem Monochrome Bar */}
      <section className="w-full py-10 border-y border-[#edece7] bg-[#f7f7f5]">
        <div className="w-full max-w-[1200px] mx-auto px-6">
          <div className="text-center text-xs uppercase font-mono tracking-widest text-[#898683] mb-6">
            Compatible with modern AI engineering environments
          </div>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 text-sm font-mono text-[#766a7c]">
            <span className="hover:text-[#1b0624] transition-colors">Google Antigravity</span>
            <span className="text-[#edece7]">•</span>
            <span className="hover:text-[#1b0624] transition-colors">Claude Code</span>
            <span className="text-[#edece7]">•</span>
            <span className="hover:text-[#1b0624] transition-colors">Cursor</span>
            <span className="text-[#edece7]">•</span>
              <span className="hover:text-[#1b0624] transition-colors">Copilot</span>
            <span className="text-[#edece7]">•</span>
            <span className="hover:text-[#1b0624] transition-colors">Ollama</span>
            <span className="text-[#edece7]">•</span>
            <span className="hover:text-[#1b0624] transition-colors">LM Studio</span>
          </div>
        </div>
      </section>

      {/* Stat Display Section (Three-Up Metrics in Duna Style) */}
      <section className="w-full py-20 px-6 sm:px-10 lg:px-16 max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-left">
          <div className="space-y-2">
            <div className="text-5xl sm:text-6xl font-normal tracking-[-0.06em] text-[#1b0624]">
              2,000
            </div>
            <div className="text-sm font-medium text-[#1b0624]">Max Token Budget</div>
            <p className="text-xs text-[#766a7c] leading-relaxed">
              Prioritized context pipeline guarantees hard constraints and active task progress are never truncated by model limits.
            </p>
          </div>

          <div className="space-y-2">
            <div className="text-5xl sm:text-6xl font-normal tracking-[-0.06em] text-[#1b0624]">
              0ms
            </div>
            <div className="text-sm font-medium text-[#1b0624]">Cold Start Latency</div>
            <p className="text-xs text-[#766a7c] leading-relaxed">
              Pure JavaScript with zero native C++ build toolchains. Runs instantly across any Node.js terminal or container.
            </p>
          </div>

          <div className="space-y-2">
            <div className="text-5xl sm:text-6xl font-normal tracking-[-0.06em] text-[#1b0624]">
              100%
            </div>
            <div className="text-sm font-medium text-[#1b0624]">Human-Readable Markdown</div>
            <p className="text-xs text-[#766a7c] leading-relaxed">
              Zero opaque database lock-in. Project memory resides in <code>docs/memory/</code> and is reviewed via standard Git Pull Requests.
            </p>
          </div>
        </div>
      </section>

      {/* The 3 Ways of Saving Data Section */}
      <section id="saving-data" className="w-full py-20 px-6 sm:px-10 lg:px-16 max-w-[1200px] mx-auto border-t border-[#edece7]">
        <div className="space-y-4 mb-12">
          <div className="text-xs font-mono uppercase tracking-wider text-[#898683]">
            Memory Synchronization
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal tracking-[-0.05em] text-[#1b0624]">
            Three ways to persist project memory.
          </h2>
          <p className="text-sm sm:text-base text-[#444444] max-w-2xl leading-relaxed">
            Veeshree adapts to how you code. Whether you want ambient background tracking, native IDE integration, or strict terminal commands.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Ambient Watcher */}
          <div className="p-8 rounded-[24px] bg-white border border-[#edece7] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.03)] flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="inline-flex -mb-22 items-center rounded-full text-[11px]  text-[#1b0624]">
                Mode 1: Ambient Watcher
              </div>
              <h3 className="text-xl font-normal text-[#1b0624] tracking-tight">
                vee watch
              </h3>
              <p className="text-xs text-[#444444] leading-relaxed">
                Runs silently in the background. It continuously monitors files and git diffs. When changes settle (after a 5-second typing pause), Veeshree automatically runs the background extractor and updates <code>docs/memory/</code> without typing a single terminal command.
              </p>
            </div>
            <div className="pt-4 border-t border-[#edece7] text-[11px] font-mono text-[#898683]">
              Best for: Hands-free coding sessions.
            </div>
          </div>

          {/* Card 2: Native IDE Rules */}
          <div className="p-8 rounded-[24px] bg-white border border-[#edece7] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.03)] flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="inline-flex -mb-22 items-center rounded-full text-[11px]  text-[#1b0624]">
                Mode 2: Native IDE Rules
              </div>
              <h3 className="text-xl font-normal text-[#1b0624] tracking-tight">
                Direct Agent Memory
              </h3>
              <p className="text-xs text-[#444444] leading-relaxed">
                During <code>vee init</code>, Veeshree generates rule files for your assistant: <code>GEMINI.md</code>, <code>.agents/rules/veeshree.md</code>, <code>.cursorrules</code>, and <code>CLAUDE.md</code>. The IDE assistant reads memory on every prompt and updates completed tasks directly. No external terminal keys required.
              </p>
            </div>
            <div className="pt-4 border-t border-[#edece7] text-[11px] font-mono text-[#898683]">
              Best for: Antigravity, Cursor, and Claude Code.
            </div>
          </div>

          {/* Card 3: Manual CLI Pipeline */}
          <div className="p-8 rounded-[24px] bg-white border border-[#edece7] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.03)] flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="inline-flex -mb-22 items-center rounded-full text-[11px]  text-[#1b0624]">
                Mode 3: Manual CLI
              </div>
              <h3 className="text-xl font-normal text-[#1b0624] tracking-tight">
                CLI & CI/CD Pipeline
              </h3>
              <p className="text-xs text-[#444444] leading-relaxed">
                Full programmatic control. Use <code>vee context &quot;&lt;task&gt;&quot;</code> to generate clean token-budgeted prompt payloads, <code>git diff | vee capture</code> to record memory after a commit, and <code>vee sync</code> to verify SHA-256 integrity in pre-commit hooks and CI pipelines.
              </p>
            </div>
            <div className="pt-4 border-t border-[#edece7] text-[11px] font-mono text-[#898683]">
              Best for: CI/CD checks & git commit hooks.
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Workflow Card */}
      <section className="w-full py-16 px-6 sm:px-10 lg:px-16 max-w-[1200px] mx-auto">
        <div className="rounded-[24px] bg-white border border-[#edece7] overflow-hidden shadow-[inset_0_0_0_1px_rgba(0,0,0,0.04)]">
          {/* Tab Navigation */}
          <div className="flex flex-wrap items-center justify-between border-b border-[#edece7] bg-[#f7f7f5] px-6 py-3.5 text-xs font-mono gap-3">
            <div className="flex items-center gap-2">
              <span className="text-[#1b0624] font-bold text-sm">✱</span>
              <span className="text-[#1b0624] font-medium">Interactive Workflow Demonstration</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setActiveTab("watch")}
                className={`px-3.5 py-1.5 rounded-full transition-all text-xs font-mono ${
                  activeTab === "watch"
                    ? "bg-[#160f0c] text-white shadow-sm"
                    : "bg-[#edece7]/80 hover:bg-[#edece7] text-[#444444] hover:text-[#1b0624]"
                }`}
              >
                1. vee watch
              </button>
              <button
                onClick={() => setActiveTab("context")}
                className={`px-3.5 py-1.5 rounded-full transition-all text-xs font-mono ${
                  activeTab === "context"
                    ? "bg-[#160f0c] text-white shadow-sm"
                    : "bg-[#edece7]/80 hover:bg-[#edece7] text-[#444444] hover:text-[#1b0624]"
                }`}
              >
                2. vee context
              </button>
              <button
                onClick={() => setActiveTab("status")}
                className={`px-3.5 py-1.5 rounded-full transition-all text-xs font-mono ${
                  activeTab === "status"
                    ? "bg-[#160f0c] text-white shadow-sm"
                    : "bg-[#edece7]/80 hover:bg-[#edece7] text-[#444444] hover:text-[#1b0624]"
                }`}
              >
                3. vee status
              </button>
              <button
                onClick={() => setActiveTab("drift")}
                className={`px-3.5 py-1.5 rounded-full transition-all text-xs font-mono ${
                  activeTab === "drift"
                    ? "bg-[#160f0c] text-white shadow-sm"
                    : "bg-[#edece7]/80 hover:bg-[#edece7] text-[#444444] hover:text-[#1b0624]"
                }`}
              >
                4. Drift Guard
              </button>
            </div>
          </div>


          {/* Tab Content Display */}
          <div className="p-6 sm:p-8 font-mono text-xs leading-relaxed overflow-x-auto bg-white text-[#1b0624]">
            {activeTab === "watch" && (
              <div className="space-y-3">
                <div className="text-[#898683]">// Run ambient watcher during development</div>
                <div className="text-[#160f0c] font-bold">$ vee watch --debounce 5</div>
                <div className="text-[#444444]">
                  [vee] Watching workspace for file modifications...<br />
                  [vee] Detected changes in src/components/button.tsx and src/theme.css<br />
                  [vee] Waiting 5s for edits to settle... settled.<br />
                  [vee] Extracting diff delta via active engine...<br />
                  [vee] Updated: docs/memory/tasks.md (Marked [x] Button theme styling complete)<br />
                  [vee] Updated: docs/memory/current-state.md (Milestone progress updated: 100%)<br />
                  [vee] Re-indexed 5 memory documents in 14ms.
                </div>
              </div>
            )}

            {activeTab === "context" && (
              <div className="space-y-3">
                <div className="text-[#898683]">// Generate prompt payload under strict token budget</div>
                <div className="text-[#160f0c] font-bold">$ vee context &quot;Implement user authentication&quot; --max-tokens 2000</div>
                <div className="text-[#444444]">
                  =======================================================<br />
                  VEESHREE CONTEXT PAYLOAD (Budget: 1,840 / 2,000 Tokens)<br />
                  =======================================================<br />
                  [1] SYSTEM CONTEXT: Zero Opaque Lock-in • Token Budget Discipline<br />
                  [2] HARD CONSTRAINTS: Must use pure JS, no native C++ modules<br />
                  [3] CURRENT SNAPSHOT: Active Milestone: Auth Module (2/3 tasks finished)<br />
                  [4] BM25 MATCHED ADRs: docs/memory/decisions/session-storage.md (Score: 4.82)<br />
                  [5] LINKED FILE HASHES: SHA-256 verified (0 drift detected)
                </div>
              </div>
            )}

            {activeTab === "status" && (
              <div className="space-y-3">
                <div className="text-[#898683]">// Inspect project health and progress percentage</div>
                <div className="text-[#160f0c] font-bold">$ vee status</div>
                <div className="text-[#444444]">
                  ┌─ Veeshree Project Status ────────────────────────────┐<br />
                  │ Current Focus: Polish calculator UI and documentation│<br />
                  │ Task Progress: [██████████] 100% (4/4 Completed)     │<br />
                  │ Decisions:     2 Active ADRs logged                  │<br />
                  │ Code Drift:    0 stale records detected (Clean)      │<br />
                  │ Active Engine: Local-first / IDE Agent Rules         │<br />
                  └──────────────────────────────────────────────────────┘
                </div>
              </div>
            )}

            {activeTab === "drift" && (
              <div className="space-y-3">
                <div className="text-[#898683]">// Detect code changes made without updating architecture records</div>
                <div className="text-[#160f0c] font-bold">$ vee status --check</div>
                <div className="text-[#444444]">
                  Checking SHA-256 hashes of all linked source code files...<br />
                  ! DRIFT DETECTED: docs/memory/decisions/database.md<br />
                  &nbsp;&nbsp;Linked file &apos;src/db/client.ts&apos; hash mismatch (SHA-256 changed).<br />
                  &nbsp;&nbsp;Explanation: Code modified without updating architectural decision record.<br />
                  &nbsp;&nbsp;Action required: Run &apos;vee capture --diff&apos; or &apos;vee sync&apos; to reconcile.
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Architecture & Memory Standard Section */}
      <section id="architecture" className="w-full py-20 px-6 sm:px-10 lg:px-16 max-w-[1200px] mx-auto border-t border-[#edece7]">
        <div className="space-y-4 mb-12">
          <div className="text-xs font-mono uppercase tracking-wider text-[#898683]">
            Editorial Compliance Architecture
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal tracking-[-0.05em] text-[#1b0624]">
            The docs/memory/ directory standard.
          </h2>
          <p className="text-sm sm:text-base text-[#444444] max-w-2xl leading-relaxed">
            Every piece of institutional memory is structured, versioned, and stored directly in your Git repository.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-8 rounded-[24px] bg-white border border-[#edece7] space-y-3">
            <div className="text-xs font-mono font-medium text-[#1b0624]">
              docs/memory/constraints.md
            </div>
            <h3 className="text-lg font-normal text-[#1b0624]">Hard Architectural Constraints</h3>
            <p className="text-xs text-[#444444] leading-relaxed">
              Rules that AI assistants must never violate (e.g. security boundaries, zero native C++ dependencies, pure client-side requirements). Given highest priority in context generation.
            </p>
          </div>

          <div className="p-8 rounded-[24px] bg-white border border-[#edece7] space-y-3">
            <div className="text-xs font-mono font-medium text-[#1b0624]">
              docs/memory/current-state.md
            </div>
            <h3 className="text-lg font-normal text-[#1b0624]">Rolling Project Snapshot</h3>
            <p className="text-xs text-[#444444] leading-relaxed">
              Contains the active feature, immediate next steps, and a rolling list of the last 5 completed items. Automatically pruned via <code>vee gc</code> to keep tokens low.
            </p>
          </div>

          <div className="p-8 rounded-[24px] bg-white border border-[#edece7] space-y-3">
            <div className="text-xs font-mono font-medium text-[#1b0624]">
              docs/memory/decisions/
            </div>
            <h3 className="text-lg font-normal text-[#1b0624]">Architectural Decision Records</h3>
            <p className="text-xs text-[#444444] leading-relaxed">
              Lightweight Markdown ADRs recording chosen technologies, alternatives considered, and linked source code file SHA-256 hashes for drift detection.
            </p>
          </div>

          <div className="p-8 rounded-[24px] bg-white border border-[#edece7] space-y-3">
            <div className="text-xs font-mono font-medium text-[#1b0624]">
              docs/memory/tasks.md
            </div>
            <h3 className="text-lg font-normal text-[#1b0624]">Living Task Checklist</h3>
            <p className="text-xs text-[#444444] leading-relaxed">
              Task checklist tracking completed and pending milestones. Updated automatically by the ambient watcher or directly by your AI assistant.
            </p>
          </div>
        </div>
      </section>

      {/* Quiet, Confident Final CTA */}
      <section className="w-full py-24 px-6 sm:px-10 lg:px-16 max-w-[1200px] mx-auto border-t border-[#edece7] text-center">
        <div className="p-12 sm:p-16 rounded-[32px] bg-white border border-[#edece7] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.04)] space-y-6">
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#898683]">
            <span>✱</span>
            <span>Get Started with Veeshree</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-normal tracking-[-0.05em] text-[#1b0624] max-w-2xl mx-auto">
            Give your AI assistants persistent memory today.
          </h2>

          <p className="text-sm sm:text-base text-[#444444] max-w-xl mx-auto leading-relaxed">
            Install globally or per-project. Pure JavaScript. Zero native C++. Runs immediately across all Node.js environments.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={copyInstall}
              className="px-8 py-4 rounded-full bg-[#160f0c] hover:bg-[#292421] text-white text-sm font-medium transition-all active:scale-[0.98] font-mono"
            >
              {copiedHero ? "Copied: npm i veeshree" : "npm i veeshree"}
            </button>

            <Link
              href="/docs"
              className="px-8 py-4 rounded-full border border-[#898683]/50 bg-white hover:bg-[#edece7] text-[#1b0624] text-sm font-medium transition-all"
            >
              Read the Documentation
            </Link>
          </div>

          <div className="text-xs font-mono text-[#898683] pt-2">
            https://www.npmjs.com/package/veeshree
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
