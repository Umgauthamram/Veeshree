"use client";

import React from "react";
import Link from "next/link";

const subPages = [
  {
    href: "/docs/saving-data/ambient-watcher",
    title: "Ambient Watcher",
    badge: "Mode 1 • Zero Human Effort",
    description:
      "Runs in the background, debounces your file edits, parses diffs, and updates memory automatically without touching the CLI.",
  },
  {
    href: "/docs/saving-data/native-ide-rules",
    title: "Native IDE Rules",
    badge: "Mode 2 • Direct Agent Memory",
    description:
      "Instructs Antigravity, Cursor, and Claude Code to read and write docs/memory/ directly using built-in model subscriptions.",
  },
  {
    href: "/docs/saving-data/manual-cli-pipeline",
    title: "Manual CLI Pipeline",
    badge: "Mode 3 • Explicit Control",
    description:
      "Run vee context, vee capture, and vee sync manually via bash commands, shell aliases, git hooks, or CI/CD pipelines.",
  },
  {
    href: "/docs/saving-data/comparison-matrix",
    title: "Comparison Matrix",
    badge: "Side-by-Side Evaluation",
    description:
      "Compare command requirements, model engine options, API key needs, and offline capabilities across all three modes.",
  },
];

export default function SavingDataPage() {
  return (
    <div className="w-full space-y-14 bg-white text-black font-sans pb-16">
      {/* Breadcrumb */}
      <div className="text-xs text-[#898683] flex items-center gap-2">
        <Link href="/" className="hover:text-black">Home</Link>
        <span>/</span>
        <Link href="/docs" className="hover:text-black">Docs</Link>
        <span>/</span>
        <span className="text-black font-semibold">Saving Data</span>
      </div>

      {/* Screen Title */}
      <div className="space-y-4 border-b border-[#edece7] pb-8">
        <h1 className="text-4xl sm:text-6xl font-normal tracking-[-0.04em] text-black">
          Saving & Managing Data
        </h1>
        <p className="text-lg sm:text-xl text-[#333333] leading-relaxed max-w-4xl font-normal">
          Veeshree provides three distinct modes for capturing and persisting project memory. Explore each method in its dedicated sub-page below:
        </p>
      </div>

      {/* Sub-heading Directory Links */}
      <div className="space-y-8">
        {subPages.map((item, idx) => (
          <div
            key={item.href}
            className="space-y-2 pb-8 border-b border-[#edece7] last:border-b-0"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Link
                href={item.href}
                className="group flex items-center gap-3 text-2xl sm:text-3xl font-semibold text-black tracking-tight hover:underline underline-offset-4"
              >
                <span>{item.title}</span>
                <span className="text-base text-[#898683] group-hover:text-black transition-colors">↗</span>
              </Link>
              <span className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#898683]">
                {item.badge}
              </span>
            </div>

            <p className="text-base sm:text-lg text-[#444444] leading-relaxed">
              {item.description}
            </p>

            <div className="pt-2">
              <Link
                href={item.href}
                className="inline-flex items-center gap-2 text-sm font-medium text-black hover:text-[#555555] underline underline-offset-4"
              >
                <span>Open {item.title} sub-page</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Back & Forth Sequential Routing to Sub-headings */}
      <div className="pt-10 border-t border-[#edece7] flex flex-col sm:flex-row items-center justify-between gap-4">
        <Link
          href="/docs/quickstart"
          className="px-6 py-3 rounded-full border border-[#898683]/50 text-sm font-medium text-black hover:bg-[#f7f7f5] transition flex items-center gap-2"
        >
          <span>←</span>
          <span>Previous: Quickstart</span>
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
