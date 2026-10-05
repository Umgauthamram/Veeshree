"use client";

import React from "react";
import Link from "next/link";

export default function ArchitectureDocsPage() {
  return (
    <div className="w-full space-y-12 bg-white text-black">
      {/* Breadcrumb */}
      <div className="text-xs font-mono text-[#898683] flex items-center gap-2">
        <Link href="/" className="hover:text-black">Home</Link>
        <span>/</span>
        <Link href="/docs" className="hover:text-black">Docs</Link>
        <span>/</span>
        <span className="text-black font-medium">4. Memory Layout & Drift Guard</span>
      </div>

      {/* Screen Title */}
      <div className="space-y-4 border-b border-[#edece7] pb-8">
        <div className="text-xs font-mono uppercase tracking-wider text-[#898683]">
          Screen 4 of 4
        </div>
        <h1 className="text-4xl sm:text-5xl font-normal tracking-[-0.05em] text-black">
          Memory Layout & Drift Guard
        </h1>
        <p className="text-base text-[#444444] leading-relaxed max-w-4xl">
          Zero opaque lock-in. Project memory is stored as human-readable, version-controlled Markdown directly inside your Git repository.
        </p>
      </div>

      {/* Directory Layout */}
      <section className="space-y-4">
        <h2 className="text-2xl font-normal tracking-tight text-black">
          Directory Structure
        </h2>
        <p className="text-sm text-[#444444] leading-relaxed">
          Every file is plain Markdown and is reviewed via normal Git Pull Requests:
        </p>

        <div className="p-5 rounded-[16px] bg-[#f7f7f5] border border-[#edece7] font-mono text-xs text-[#1b0624] overflow-x-auto leading-relaxed">
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

      {/* Token Budget Pipeline */}
      <section className="space-y-4 pt-6 border-t border-[#edece7]">
        <h2 className="text-2xl font-normal tracking-tight text-black">
          Token Budget Pipeline (~2,000 Tokens Max)
        </h2>
        <p className="text-sm text-[#444444] leading-relaxed">
          When injecting context into an AI model, Veeshree applies a strict token budget so that essential rules and constraints are never truncated:
        </p>

        <div className="p-5 rounded-[16px] bg-[#f7f7f5] border border-[#edece7] space-y-3 font-mono text-xs text-black">
          <div className="flex justify-between border-b border-[#edece7] pb-2.5">
            <span className="font-bold">1. System Context & Rules</span>
            <span className="text-[#898683]">~300 Tokens [CRITICAL - NEVER TRUNCATED]</span>
          </div>
          <div className="flex justify-between border-b border-[#edece7] pb-2.5">
            <span className="font-bold">2. Active Hard Constraints</span>
            <span className="text-[#898683]">~200 Tokens [CRITICAL - NEVER TRUNCATED]</span>
          </div>
          <div className="flex justify-between border-b border-[#edece7] pb-2.5">
            <span className="font-bold">3. Current Project State Snapshot</span>
            <span className="text-[#898683]">~400 Tokens [HIGH PRIORITY]</span>
          </div>
          <div className="flex justify-between">
            <span className="font-bold">4. Top Matching Decisions (BM25)</span>
            <span className="text-[#898683]">~1,100 Tokens [DYNAMICALLY ALLOCATED]</span>
          </div>
        </div>
      </section>

      {/* SHA-256 Code Drift Guard */}
      <section className="space-y-4 pt-6 border-t border-[#edece7]">
        <h2 className="text-2xl font-normal tracking-tight text-black">
          SHA-256 Code Drift Guard
        </h2>
        <p className="text-sm text-[#444444] leading-relaxed">
          Every Architectural Decision Record (ADR) in <code>docs/memory/decisions/</code> tracks the exact SHA-256 checksums of the source code files it governs. If a developer or another AI changes those source files without updating the memory record, Veeshree detects the drift:
        </p>

        <div className="p-5 rounded-[16px] bg-[#f7f7f5] border border-[#edece7] font-mono text-xs text-black space-y-2">
          <div className="text-[#898683]">// Example: vee status drift detection</div>
          <div className="text-black">
            ! DRIFT DETECTED: docs/memory/decisions/auth.md<br />
            &nbsp;&nbsp;Linked file &apos;src/auth/jwt.ts&apos; hash mismatch (SHA-256 changed).<br />
            &nbsp;&nbsp;Run &apos;vee capture --diff&apos; or &apos;vee sync&apos; to reconcile.
          </div>
        </div>
      </section>

      {/* Back & Forth Screen Routing Footer */}
      <div className="pt-8 border-t border-[#edece7] flex flex-col sm:flex-row items-center justify-between gap-4">
        <Link
          href="/docs/commands"
          className="px-6 py-2.5 rounded-full border border-[#898683]/50 text-xs font-medium text-black hover:bg-[#f7f7f5] transition flex items-center gap-2"
        >
          <span>←</span>
          <span>Previous: 3. CLI Command Reference</span>
        </Link>

        <Link
          href="/"
          className="px-6 py-2.5 rounded-full bg-[#160f0c] text-white text-xs font-medium hover:bg-[#292421] transition flex items-center gap-2"
        >
          <span>Back to Home ✱</span>
        </Link>
      </div>
    </div>
  );
}
