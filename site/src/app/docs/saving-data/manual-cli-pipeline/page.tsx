"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function ManualCliPipelinePage() {
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  return (
    <div className="w-full space-y-12 bg-white text-black font-sans pb-16">
      {/* Breadcrumb */}
      <div className="text-xs text-[#898683] flex items-center gap-2">
        <Link href="/" className="hover:text-black">Home</Link>
        <span>/</span>
        <Link href="/docs" className="hover:text-black">Docs</Link>
        <span>/</span>
        <Link href="/docs/saving-data" className="hover:text-black">Saving Data</Link>
        <span>/</span>
        <span className="text-black font-semibold">Manual CLI Pipeline</span>
      </div>

      {/* Screen Title */}
      <div className="space-y-4 border-b border-[#edece7] pb-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-4xl sm:text-6xl font-normal tracking-[-0.04em] text-black">
            Manual CLI Pipeline
          </h1>
          <span className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#898683]">
            Mode 3 • Explicit Control
          </span>
        </div>
        <p className="text-lg sm:text-xl text-[#333333] leading-relaxed max-w-4xl font-normal">
          Explicit terminal commands for developers who prefer full control, git hooks, shell aliases, or CI/CD pipelines.
        </p>
      </div>

      {/* Content */}
      <div className="space-y-10 text-base sm:text-[17px] leading-relaxed text-[#444444]">
        {/* Step 1: Context Injection */}
        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-black tracking-tight">
            1. Token-Budgeted Context Injection
          </h2>
          <p className="text-[#333333]">
            Generate a concise, token-budgeted prompt payload (~2,000 tokens) before starting work on a feature:
          </p>
          <div className="flex items-center justify-between bg-[#f7f7f5] px-4 py-3.5 rounded-xl border border-[#edece7] text-base text-black">
            <code>vee context &quot;Implement authentication&quot;</code>
            <button
              onClick={() => copyText('vee context "Implement authentication"', "ctx")}
              className="px-4 py-1.5 bg-[#160f0c] hover:bg-[#292421] text-white rounded-full text-xs sm:text-sm font-medium transition cursor-pointer"
            >
              {copiedCmd === "ctx" ? "Copied" : "Copy"}
            </button>
          </div>
        </section>

        {/* Step 2: Capture Diff */}
        <section className="space-y-3 pt-6 border-t border-[#edece7]">
          <h2 className="text-2xl font-semibold text-black tracking-tight">
            2. Capture Git Diff & Extract Decisions
          </h2>
          <p className="text-[#333333]">
            Pipe your staged or unstaged changes directly into Veeshree to parse decisions and update tasks:
          </p>
          <div className="flex items-center justify-between bg-[#f7f7f5] px-4 py-3.5 rounded-xl border border-[#edece7] text-base text-black">
            <code>git diff | vee capture</code>
            <button
              onClick={() => copyText("git diff | vee capture", "cap")}
              className="px-4 py-1.5 bg-[#160f0c] hover:bg-[#292421] text-white rounded-full text-xs sm:text-sm font-medium transition cursor-pointer"
            >
              {copiedCmd === "cap" ? "Copied" : "Copy"}
            </button>
          </div>
        </section>

        {/* Step 3: Sync Hashes */}
        <section className="space-y-3 pt-6 border-t border-[#edece7]">
          <h2 className="text-2xl font-semibold text-black tracking-tight">
            3. Synchronize SHA-256 Hashes & Search Index
          </h2>
          <p className="text-[#333333]">
            Recompute hashes of all linked source code files and refresh BM25 search indices in milliseconds:
          </p>
          <div className="flex items-center justify-between bg-[#f7f7f5] px-4 py-3.5 rounded-xl border border-[#edece7] text-base text-black">
            <code>vee sync</code>
            <button
              onClick={() => copyText("vee sync", "sync")}
              className="px-4 py-1.5 bg-[#160f0c] hover:bg-[#292421] text-white rounded-full text-xs sm:text-sm font-medium transition cursor-pointer"
            >
              {copiedCmd === "sync" ? "Copied" : "Copy"}
            </button>
          </div>
        </section>
      </div>

      {/* Prev / Next Pagination */}
      <div className="pt-10 border-t border-[#edece7] flex flex-col sm:flex-row items-center justify-between gap-4">
        <Link
          href="/docs/saving-data/native-ide-rules"
          className="px-6 py-3 rounded-full border border-[#898683]/50 text-sm font-medium text-black hover:bg-[#f7f7f5] transition flex items-center gap-2"
        >
          <span>←</span>
          <span>Native IDE Rules</span>
        </Link>

        <Link
          href="/docs/saving-data/comparison-matrix"
          className="px-7 py-3 rounded-full bg-[#160f0c] text-white text-sm font-medium hover:bg-[#292421] transition flex items-center gap-2"
        >
          <span>Comparison Matrix</span>
          <span>→</span>
        </Link>
      </div>
    </div>
  );
}
