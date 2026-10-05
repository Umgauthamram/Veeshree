"use client";

import React from "react";
import Link from "next/link";

export default function ComparisonMatrixPage() {
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
        <span className="text-black font-semibold">Comparison Matrix</span>
      </div>

      {/* Screen Title */}
      <div className="space-y-4 border-b border-[#edece7] pb-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-4xl sm:text-6xl font-normal tracking-[-0.04em] text-black">
            Comparison Matrix
          </h1>
          <span className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#898683]">
            Modes Side-by-Side
          </span>
        </div>
        <p className="text-lg sm:text-xl text-[#333333] leading-relaxed max-w-4xl font-normal">
          Side-by-side technical evaluation of Ambient Watcher, Native IDE Rules, and Manual CLI Pipeline.
        </p>
      </div>

      {/* Table */}
      <div className="space-y-6 text-base sm:text-[17px] leading-relaxed text-[#444444]">
        <div className="w-full border border-[#edece7] rounded-xl overflow-x-auto">
          <table className="w-full text-left text-sm sm:text-base">
            <thead className="border-b border-[#edece7] text-[#898683] bg-[#f7f7f5]">
              <tr>
                <th className="p-4 sm:p-5 font-semibold">Criteria</th>
                <th className="p-4 sm:p-5 font-semibold">Mode 1: Ambient Watcher</th>
                <th className="p-4 sm:p-5 font-semibold">Mode 2: Native IDE Rules</th>
                <th className="p-4 sm:p-5 font-semibold">Mode 3: Manual CLI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#edece7] text-[#444444]">
              <tr>
                <td className="p-4 sm:p-5 font-medium text-black">Manual Commands</td>
                <td className="p-4 sm:p-5">Zero (runs in background)</td>
                <td className="p-4 sm:p-5">Zero (assistant updates files)</td>
                <td className="p-4 sm:p-5">Explicit (context, capture, sync)</td>
              </tr>
              <tr>
                <td className="p-4 sm:p-5 font-medium text-black">Model Runtime</td>
                <td className="p-4 sm:p-5">Local Ollama / LM Studio or Cloud Key</td>
                <td className="p-4 sm:p-5">IDE Assistant Internal Model</td>
                <td className="p-4 sm:p-5">Local Ollama / LM Studio or Cloud Key</td>
              </tr>
              <tr>
                <td className="p-4 sm:p-5 font-medium text-black">External API Key</td>
                <td className="p-4 sm:p-5">Optional (Local Ollama is 100% free)</td>
                <td className="p-4 sm:p-5">Not required</td>
                <td className="p-4 sm:p-5">Optional</td>
              </tr>
              <tr>
                <td className="p-4 sm:p-5 font-medium text-black">Storage Location</td>
                <td className="p-4 sm:p-5"><code>docs/memory/</code></td>
                <td className="p-4 sm:p-5"><code>docs/memory/</code></td>
                <td className="p-4 sm:p-5"><code>docs/memory/</code></td>
              </tr>
              <tr>
                <td className="p-4 sm:p-5 font-medium text-black">Git Version Controlled</td>
                <td className="p-4 sm:p-5">Yes</td>
                <td className="p-4 sm:p-5">Yes</td>
                <td className="p-4 sm:p-5">Yes</td>
              </tr>
              <tr>
                <td className="p-4 sm:p-5 font-medium text-black">Offline Capable</td>
                <td className="p-4 sm:p-5">Yes (with Ollama)</td>
                <td className="p-4 sm:p-5">Depends on IDE assistant</td>
                <td className="p-4 sm:p-5">Yes (with Ollama)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Prev / Next Sequential Sub-heading Navigation */}
      <div className="pt-10 border-t border-[#edece7] flex flex-col sm:flex-row items-center justify-between gap-4">
        <Link
          href="/docs/saving-data/manual-cli-pipeline"
          className="px-6 py-3 rounded-full border border-[#898683]/50 text-sm font-medium text-black hover:bg-[#f7f7f5] transition flex items-center gap-2"
        >
          <span>←</span>
          <span>Previous: Manual CLI Pipeline</span>
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
