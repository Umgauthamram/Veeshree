"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function AmbientWatcherPage() {
  const [copied, setCopied] = useState(false);

  const copyCmd = () => {
    navigator.clipboard.writeText("vee watch");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
        <span className="text-black font-semibold">Ambient Watcher</span>
      </div>

      {/* Screen Title */}
      <div className="space-y-4 border-b border-[#edece7] pb-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-4xl sm:text-6xl font-normal tracking-[-0.04em] text-black">
            Ambient Watcher
          </h1>
          <span className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#898683]">
            Mode 1 • Zero Human Effort
          </span>
        </div>
        <p className="text-lg sm:text-xl text-[#333333] leading-relaxed max-w-4xl font-normal">
          Runs quietly in a secondary terminal tab or background daemon, automatically detecting file changes, extracting decisions from diffs, and keeping memory up to date.
        </p>
      </div>

      {/* Content */}
      <div className="space-y-10 text-base sm:text-[17px] leading-relaxed text-[#444444]">
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-black tracking-tight">
            How the Ambient Engine Works
          </h2>
          <p className="text-[#333333]">
            When you develop features, you shouldn&apos;t have to stop your flow to manually write Architectural Decision Records or update task checkboxes. The ambient watcher automates the entire loop:
          </p>
          <ol className="list-decimal list-inside space-y-3 pl-1 text-[#333333]">
            <li><strong>File System Monitor:</strong> Tracks file changes across source and test directories while ignoring node_modules, build artifacts, and hidden caches.</li>
            <li><strong>Intelligent Debounce:</strong> Waits for a configurable settle window (default 5s) after you stop typing.</li>
            <li><strong>Diff Extraction:</strong> Computes the git diff against the working tree and runs it through the local or cloud extraction engine.</li>
            <li><strong>Memory Updates:</strong> Automatically writes new decisions into <code>docs/memory/decisions/</code>, marks completed tasks in <code>tasks.md</code>, and updates milestone status in <code>current-state.md</code>.</li>
            <li><strong>Integrity Check:</strong> Recalculates SHA-256 hashes of all linked source files to keep drift guards green.</li>
          </ol>
        </section>

        <section className="space-y-3 pt-6 border-t border-[#edece7]">
          <h2 className="text-2xl font-semibold text-black tracking-tight">
            Terminal Command
          </h2>
          <div className="flex items-center justify-between bg-[#f7f7f5] px-5 py-4 rounded-xl border border-[#edece7] text-base text-black">
            <code>vee watch</code>
            <button
              onClick={copyCmd}
              className="px-5 py-2 bg-[#160f0c] hover:bg-[#292421] text-white rounded-full text-xs sm:text-sm font-medium transition cursor-pointer"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <div className="text-xs sm:text-sm text-[#898683]">
            Options: <code>--debounce &lt;seconds&gt;</code> (default: 5) • <code>--provider &lt;name&gt;</code> (force specific model engine).
          </div>
        </section>

        <section className="space-y-3 pt-6 border-t border-[#edece7]">
          <h2 className="text-2xl font-semibold text-black tracking-tight">
            Who This Is Best For
          </h2>
          <p className="text-[#333333]">
            Engineers who want complete context persistence without ever thinking about running CLI commands or manually drafting markdown status updates.
          </p>
        </section>
      </div>

      {/* Prev / Next Pagination */}
      <div className="pt-10 border-t border-[#edece7] flex flex-col sm:flex-row items-center justify-between gap-4">
        <Link
          href="/docs/quickstart"
          className="px-6 py-3 rounded-full border border-[#898683]/50 text-sm font-medium text-black hover:bg-[#f7f7f5] transition flex items-center gap-2"
        >
          <span>←</span>
          <span>Previous: Quickstart</span>
        </Link>

        <Link
          href="/docs/saving-data/native-ide-rules"
          className="px-7 py-3 rounded-full bg-[#160f0c] text-white text-sm font-medium hover:bg-[#292421] transition flex items-center gap-2"
        >
          <span>Native IDE Rules</span>
          <span>→</span>
        </Link>
      </div>
    </div>
  );
}
