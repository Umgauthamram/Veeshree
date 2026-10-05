"use client";

import React, { useState } from "react";
import Link from "next/link";
import { commandsData } from "@/data/commands-data";

export default function CommandsOverviewPage() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="w-full space-y-16 bg-white text-black font-sans pb-16">
      {/* Breadcrumb */}
      <div className="text-xs text-[#898683] flex items-center gap-2">
        <Link href="/" className="hover:text-black">Home</Link>
        <span>/</span>
        <Link href="/docs" className="hover:text-black">Docs</Link>
        <span>/</span>
        <span className="text-black font-semibold">CLI Commands</span>
      </div>

      {/* Screen Title */}
      <div className="space-y-4 border-b border-[#edece7] pb-8">
        <h1 className="text-4xl sm:text-6xl font-normal tracking-[-0.04em] text-black">
          CLI Command Reference
        </h1>
        <p className="text-lg sm:text-xl text-[#333333] leading-relaxed max-w-4xl font-normal">
          Explore all 11 Veeshree commands. Each command has a dedicated sub-page with comprehensive explanations, usage walkthroughs, flags, and copyable bash snippets.
        </p>
      </div>

      {/* Commands Catalog */}
      <div className="space-y-10">
        {commandsData.map((cmd) => (
          <div
            key={cmd.id}
            id={cmd.id}
            className="space-y-3 pb-8 border-b border-[#edece7] scroll-mt-24 last:border-b-0"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Link
                href={`/docs/commands/${cmd.id}`}
                className="group flex items-center gap-3 text-2xl sm:text-3xl font-semibold text-black tracking-tight hover:underline underline-offset-4"
              >
                <span>{cmd.cmd}</span>
                <span className="text-base text-[#898683] group-hover:text-black transition-colors">↗</span>
              </Link>
              <span className="text-xs sm:text-sm font-semibold text-[#898683] uppercase tracking-wider">
                {cmd.badge}
              </span>
            </div>

            <p className="text-base sm:text-lg text-[#444444] leading-relaxed">
              {cmd.summary}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <div className="flex-1 min-w-[240px] flex items-center justify-between bg-[#f7f7f5] px-4 py-3 rounded-xl border border-[#edece7] text-base text-black">
                <pre className="whitespace-pre-wrap font-sans">{cmd.example}</pre>
                <button
                  onClick={() => copyText(cmd.example, cmd.id)}
                  className="px-4 py-1.5 bg-[#160f0c] hover:bg-[#292421] text-white rounded-full text-xs sm:text-sm font-medium transition cursor-pointer"
                >
                  {copiedId === cmd.id ? "Copied" : "Copy"}
                </button>
              </div>

              <Link
                href={`/docs/commands/${cmd.id}`}
                className="px-5 py-3 rounded-xl border border-[#edece7] bg-[#f7f7f5] hover:bg-black hover:text-white text-sm font-medium text-black transition flex items-center gap-1.5"
              >
                <span>View {cmd.cmd} sub-page</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Back & Forth Sequential Sub-heading Navigation */}
      <div className="pt-10 border-t border-[#edece7] flex flex-col sm:flex-row items-center justify-between gap-4">
        <Link
          href="/docs/saving-data/comparison-matrix"
          className="px-6 py-3 rounded-full border border-[#898683]/50 text-sm font-medium text-black hover:bg-[#f7f7f5] transition flex items-center gap-2"
        >
          <span>←</span>
          <span>Previous: Comparison Matrix</span>
        </Link>

        <Link
          href="/docs/commands/init"
          className="px-7 py-3 rounded-full bg-[#160f0c] text-white text-sm font-medium hover:bg-[#292421] transition flex items-center gap-2"
        >
          <span>Next: vee init</span>
          <span>→</span>
        </Link>
      </div>
    </div>
  );
}
