"use client";

import React from "react";
import Link from "next/link";

export default function TheProblemPage() {
  return (
    <div className="w-full space-y-12 bg-white text-black font-sans pb-16">
      {/* Breadcrumb */}
      <div className="text-xs text-[#898683] flex items-center gap-2">
        <Link href="/" className="hover:text-black">Home</Link>
        <span>/</span>
        <Link href="/docs" className="hover:text-black">Docs</Link>
        <span>/</span>
        <Link href="/docs" className="hover:text-black">Overview</Link>
        <span>/</span>
        <span className="text-black font-semibold">The Problem</span>
      </div>

      {/* Screen Title */}
      <div className="space-y-4 border-b border-[#edece7] pb-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-4xl sm:text-6xl font-normal tracking-[-0.04em] text-black">
            The Problem
          </h1>
          <span className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#898683]">
            Memory Amnesia
          </span>
        </div>
        <p className="text-lg sm:text-xl text-[#333333] leading-relaxed max-w-4xl font-normal">
          Why ephemeral AI chat sessions cause architectural drift, conflicting code, and repeated mistakes across engineering projects.
        </p>
      </div>

      {/* Editorial Content */}
      <div className="space-y-10 text-base sm:text-[17px] leading-relaxed text-[#444444]">
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-black tracking-tight">
            The Transient Nature of Modern AI Assistants
          </h2>
          <p className="text-[#333333] leading-relaxed">
            When developers write code alongside modern AI assistants (such as Google Antigravity, Claude Code, Cursor, or GitHub Copilot), the AI accumulates critical context about the codebase: which database driver was chosen, why a popular authentication library was rejected due to bundle size constraints, and which security practices must strictly be upheld.
          </p>
          <p className="text-[#333333] leading-relaxed">
            However, this context is tied exclusively to the temporary chat thread. The moment the token limit is reached, context compaction triggers, or a new session is launched, that accumulated institutional knowledge vanishes completely.
          </p>
        </section>

        <section className="space-y-4 pt-6 border-t border-[#edece7]">
          <h2 className="text-2xl font-semibold text-black tracking-tight">
            Common Failures Caused by Chat Amnesia
          </h2>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="text-black font-semibold">•</span>
              <div>
                <strong className="text-black font-medium">Contradictory Implementations:</strong> The AI re-implements a feature using an incompatible library that was explicitly rejected three days earlier.
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-black font-semibold">•</span>
              <div>
                <strong className="text-black font-medium">Silent Architectural Drift:</strong> Source files are modified without updating corresponding architectural assumptions or data models.
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-black font-semibold">•</span>
              <div>
                <strong className="text-black font-medium">Repeated Explanations:</strong> The engineer is forced to repeatedly copy and paste constraints, project guidelines, and status summaries into every new prompt.
              </div>
            </li>
          </ul>
        </section>

        <section className="space-y-4 pt-6 border-t border-[#edece7]">
          <h2 className="text-2xl font-semibold text-black tracking-tight">
            The Veeshree Resolution
          </h2>
          <p className="text-[#333333] leading-relaxed">
            Veeshree moves memory out of the ephemeral chat UI and anchors it directly in your Git repository under <code>docs/memory/</code>. Because memory is version-controlled Markdown, it travels with the code across every branch, every pull request, and every AI assistant without vendor lock-in.
          </p>
        </section>
      </div>

      {/* Prev / Next Pagination */}
      <div className="pt-10 border-t border-[#edece7] flex flex-col sm:flex-row items-center justify-between gap-4">
        <Link
          href="/docs"
          className="px-6 py-3 rounded-full border border-[#898683]/50 text-sm font-medium text-black hover:bg-[#f7f7f5] transition flex items-center gap-2"
        >
          <span>←</span>
          <span>Overview</span>
        </Link>

        <Link
          href="/docs/installation"
          className="px-7 py-3 rounded-full bg-[#160f0c] text-white text-sm font-medium hover:bg-[#292421] transition flex items-center gap-2"
        >
          <span>Installation</span>
          <span>→</span>
        </Link>
      </div>
    </div>
  );
}
