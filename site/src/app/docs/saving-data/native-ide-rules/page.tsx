"use client";

import React from "react";
import Link from "next/link";

export default function NativeIdeRulesPage() {
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
        <span className="text-black font-semibold">Native IDE Rules</span>
      </div>

      {/* Screen Title */}
      <div className="space-y-4 border-b border-[#edece7] pb-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-4xl sm:text-6xl font-normal tracking-[-0.04em] text-black">
            Native IDE Rules
          </h1>
          <span className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#898683]">
            Mode 2 • Direct Agent Memory
          </span>
        </div>
        <p className="text-lg sm:text-xl text-[#333333] leading-relaxed max-w-4xl font-normal">
          Empowers your IDE&apos;s built-in AI assistant to directly read from and write to <code>docs/memory/</code> without any external CLI API keys.
        </p>
      </div>

      {/* Content */}
      <div className="space-y-10 text-base sm:text-[17px] leading-relaxed text-[#444444]">
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-black tracking-tight">
            How Native IDE Rule Injection Works
          </h2>
          <p className="text-[#333333]">
            When you run <code>vee init</code>, Veeshree automatically generates instruction files customized for every popular AI coding assistant:
          </p>
          <ul className="space-y-2 text-[#333333]">
            <li className="flex items-start gap-3">
              <span className="text-black font-semibold">•</span>
              <span><strong>GEMINI.md</strong> & <strong>.agents/rules/veeshree.md:</strong> Instructs Google Antigravity & Gemini CLI.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-black font-semibold">•</span>
              <span><strong>CLAUDE.md:</strong> Instructs Anthropic Claude Code and workspace projects.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-black font-semibold">•</span>
              <span><strong>.cursorrules:</strong> Configures Cursor AI Composer and chat.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-black font-semibold">•</span>
              <span><strong>.github/copilot-instructions.md:</strong> Instructs GitHub Copilot chat.</span>
            </li>
          </ul>
        </section>

        <section className="space-y-4 pt-6 border-t border-[#edece7]">
          <h2 className="text-2xl font-semibold text-black tracking-tight">
            Zero API Keys Required
          </h2>
          <p className="text-[#333333]">
            Because the IDE assistant natively processes instructions to inspect <code>docs/memory/constraints.md</code> before writing code and updates <code>tasks.md</code> upon finishing tasks, you don&apos;t need to configure any external LLM keys or run background processes.
          </p>
          <div className="bg-[#f7f7f5] p-5 rounded-xl border border-[#edece7] text-sm sm:text-base text-black font-medium">
            Your IDE assistant manages your repository memory directly using its existing subscription.
          </div>
        </section>

        <section className="space-y-3 pt-6 border-t border-[#edece7]">
          <h2 className="text-2xl font-semibold text-black tracking-tight">
            Who This Is Best For
          </h2>
          <p className="text-[#333333]">
            Developers working within powerful AI IDE environments (Antigravity, Cursor, Claude Code) who prefer zero background services.
          </p>
        </section>
      </div>

      {/* Prev / Next Pagination */}
      <div className="pt-10 border-t border-[#edece7] flex flex-col sm:flex-row items-center justify-between gap-4">
        <Link
          href="/docs/saving-data/ambient-watcher"
          className="px-6 py-3 rounded-full border border-[#898683]/50 text-sm font-medium text-black hover:bg-[#f7f7f5] transition flex items-center gap-2"
        >
          <span>←</span>
          <span>Ambient Watcher</span>
        </Link>

        <Link
          href="/docs/saving-data/manual-cli-pipeline"
          className="px-7 py-3 rounded-full bg-[#160f0c] text-white text-sm font-medium hover:bg-[#292421] transition flex items-center gap-2"
        >
          <span>Manual CLI Pipeline</span>
          <span>→</span>
        </Link>
      </div>
    </div>
  );
}
