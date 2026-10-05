"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function QuickstartPage() {
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
        <Link href="/docs" className="hover:text-black">Overview</Link>
        <span>/</span>
        <span className="text-black font-semibold">Quickstart</span>
      </div>

      {/* Screen Title */}
      <div className="space-y-4 border-b border-[#edece7] pb-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-4xl sm:text-6xl font-normal tracking-[-0.04em] text-black">
            3-Minute Quickstart
          </h1>
          <span className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#898683]">
            Getting Started
          </span>
        </div>
        <p className="text-lg sm:text-xl text-[#333333] leading-relaxed max-w-4xl font-normal">
          Get Veeshree configured in any existing repository in under three minutes with zero LLM API costs.
        </p>
      </div>

      {/* Steps */}
      <div className="space-y-10 text-base sm:text-[17px] leading-relaxed text-[#444444]">
        {/* Step 1 */}
        <section className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="w-7 h-7 rounded-full bg-[#160f0c] text-white flex items-center justify-center text-xs font-semibold">
              1
            </span>
            <h2 className="text-2xl font-semibold text-black tracking-tight">
              Scaffold Your Repository Memory
            </h2>
          </div>
          <p className="text-[#333333]">
            Run <code>vee init</code> inside the root of your project. Veeshree detects your frameworks and creates the <code>docs/memory/</code> folder alongside IDE instruction files:
          </p>
          <div className="flex items-center justify-between bg-[#f7f7f5] px-4 py-3.5 rounded-xl border border-[#edece7] text-base text-black">
            <code>vee init</code>
            <button
              onClick={() => copyText("vee init", "s1")}
              className="px-4 py-1.5 bg-[#160f0c] hover:bg-[#292421] text-white rounded-full text-xs sm:text-sm font-medium transition cursor-pointer"
            >
              {copiedCmd === "s1" ? "Copied" : "Copy"}
            </button>
          </div>
        </section>

        {/* Step 2 */}
        <section className="space-y-3 pt-6 border-t border-[#edece7]">
          <div className="flex items-center gap-3">
            <span className="w-7 h-7 rounded-full bg-[#160f0c] text-white flex items-center justify-center text-xs font-semibold">
              2
            </span>
            <h2 className="text-2xl font-semibold text-black tracking-tight">
              Start the Ambient Watcher
            </h2>
          </div>
          <p className="text-[#333333]">
            Open a background terminal tab and run <code>vee watch</code>. As you edit code and pause, Veeshree automatically reconciles git diffs and records your architectural decisions:
          </p>
          <div className="flex items-center justify-between bg-[#f7f7f5] px-4 py-3.5 rounded-xl border border-[#edece7] text-base text-black">
            <code>vee watch</code>
            <button
              onClick={() => copyText("vee watch", "s2")}
              className="px-4 py-1.5 bg-[#160f0c] hover:bg-[#292421] text-white rounded-full text-xs sm:text-sm font-medium transition cursor-pointer"
            >
              {copiedCmd === "s2" ? "Copied" : "Copy"}
            </button>
          </div>
        </section>

        {/* Step 3 */}
        <section className="space-y-3 pt-6 border-t border-[#edece7]">
          <div className="flex items-center gap-3">
            <span className="w-7 h-7 rounded-full bg-[#160f0c] text-white flex items-center justify-center text-xs font-semibold">
              3
            </span>
            <h2 className="text-2xl font-semibold text-black tracking-tight">
              Inspect Milestones & Code Drift
            </h2>
          </div>
          <p className="text-[#333333]">
            Check your task completion progress, active decisions, and verify that no linked source files have drifted:
          </p>
          <div className="flex items-center justify-between bg-[#f7f7f5] px-4 py-3.5 rounded-xl border border-[#edece7] text-base text-black">
            <code>vee status</code>
            <button
              onClick={() => copyText("vee status", "s3")}
              className="px-4 py-1.5 bg-[#160f0c] hover:bg-[#292421] text-white rounded-full text-xs sm:text-sm font-medium transition cursor-pointer"
            >
              {copiedCmd === "s3" ? "Copied" : "Copy"}
            </button>
          </div>
        </section>
      </div>

      {/* Prev / Next Sequential Sub-heading Navigation */}
      <div className="pt-10 border-t border-[#edece7] flex flex-col sm:flex-row items-center justify-between gap-4">
        <Link
          href="/docs/installation"
          className="px-6 py-3 rounded-full border border-[#898683]/50 text-sm font-medium text-black hover:bg-[#f7f7f5] transition flex items-center gap-2"
        >
          <span>←</span>
          <span>Previous: Installation</span>
        </Link>

        <Link
          href="/docs/saving-data/ambient-watcher"
          className="px-7 py-3 rounded-full bg-[#160f0c] text-white text-sm font-medium hover:bg-[#292421] transition flex items-center gap-2"
        >
          <span>Next: Ambient Watcher</span>
          <span>→</span>
        </Link>
      </div>
    </div>
  );
}
