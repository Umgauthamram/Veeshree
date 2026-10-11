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
            Run <code>vee init</code> inside the root of your project. Veeshree detects your frameworks, creates the <code>docs/memory/</code> folder alongside IDE instruction files, and protects local config in <code>.gitignore</code>:
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
              Configure Your AI Model Credentials
            </h2>
          </div>
          <p className="text-[#333333]">
            Choose your AI provider and store your key in your machine&apos;s global user keystore (<code>~/.veeshree/credentials.json</code>). Keys are never committed to Git or exposed on GitHub:
          </p>
          <div className="flex items-center justify-between bg-[#f7f7f5] px-4 py-3.5 rounded-xl border border-[#edece7] text-base text-black">
            <code>vee keys set &lt;provider&gt; &lt;KEY&gt;</code>
            <button
              onClick={() => copyText("vee keys set gemini YOUR_API_KEY", "s2")}
              className="px-4 py-1.5 bg-[#160f0c] hover:bg-[#292421] text-white rounded-full text-xs sm:text-sm font-medium transition cursor-pointer"
            >
              {copiedCmd === "s2" ? "Copied" : "Copy"}
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#555555] font-mono bg-[#fbfbf9] p-3.5 rounded-xl border border-[#edece7]">
            <div>• <strong className="text-black">gemini</strong> : Google Gemini (2.0 Flash)</div>
            <div>• <strong className="text-black">groq</strong> : Groq LPU (llama-3.3-70b)</div>
            <div>• <strong className="text-black">nvidia</strong> : NVIDIA NIM (llama-3.1-70b)</div>
            <div>• <strong className="text-black">openai</strong> : OpenAI (gpt-4o-mini)</div>
            <div>• <strong className="text-black">ollama</strong> : 100% Free local models</div>
            <div>• <strong className="text-black">lmstudio</strong> : Local port 1234</div>
          </div>
        </section>

        {/* Step 3 */}
        <section className="space-y-3 pt-6 border-t border-[#edece7]">
          <div className="flex items-center gap-3">
            <span className="w-7 h-7 rounded-full bg-[#160f0c] text-white flex items-center justify-center text-xs font-semibold">
              3
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
              onClick={() => copyText("vee watch", "s3")}
              className="px-4 py-1.5 bg-[#160f0c] hover:bg-[#292421] text-white rounded-full text-xs sm:text-sm font-medium transition cursor-pointer"
            >
              {copiedCmd === "s3" ? "Copied" : "Copy"}
            </button>
          </div>
        </section>

        {/* Step 4 */}
        <section className="space-y-3 pt-6 border-t border-[#edece7]">
          <div className="flex items-center gap-3">
            <span className="w-7 h-7 rounded-full bg-[#160f0c] text-white flex items-center justify-center text-xs font-semibold">
              4
            </span>
            <h2 className="text-2xl font-semibold text-black tracking-tight">
              Run Diagnostics & Security Checks
            </h2>
          </div>
          <p className="text-[#333333]">
            Validate memory scaffolding, verify that no secret keys are tracked in Git, and test connection to your AI extraction engine:
          </p>
          <div className="flex items-center justify-between bg-[#f7f7f5] px-4 py-3.5 rounded-xl border border-[#edece7] text-base text-black">
            <code>vee doctor</code>
            <button
              onClick={() => copyText("vee doctor", "s4")}
              className="px-4 py-1.5 bg-[#160f0c] hover:bg-[#292421] text-white rounded-full text-xs sm:text-sm font-medium transition cursor-pointer"
            >
              {copiedCmd === "s4" ? "Copied" : "Copy"}
            </button>
          </div>
        </section>

        {/* Step 5 */}
        <section className="space-y-3 pt-6 border-t border-[#edece7]">
          <div className="flex items-center gap-3">
            <span className="w-7 h-7 rounded-full bg-[#160f0c] text-white flex items-center justify-center text-xs font-semibold">
              5
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
              onClick={() => copyText("vee status", "s5")}
              className="px-4 py-1.5 bg-[#160f0c] hover:bg-[#292421] text-white rounded-full text-xs sm:text-sm font-medium transition cursor-pointer"
            >
              {copiedCmd === "s5" ? "Copied" : "Copy"}
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
