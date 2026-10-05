"use client";

import React from "react";
import Link from "next/link";
import { architectureTopics } from "@/data/architecture-data";

export default function ArchitectureOverviewPage() {
  return (
    <div className="w-full space-y-16 bg-white text-black font-sans pb-16">
      {/* Breadcrumb */}
      <div className="text-xs text-[#898683] flex items-center gap-2">
        <Link href="/" className="hover:text-black">Home</Link>
        <span>/</span>
        <Link href="/docs" className="hover:text-black">Docs</Link>
        <span>/</span>
        <span className="text-black font-semibold">Architecture</span>
      </div>

      {/* Screen Title */}
      <div className="space-y-4 border-b border-[#edece7] pb-8">
        <h1 className="text-4xl sm:text-6xl font-normal tracking-[-0.04em] text-black">
          Architecture & Integrity
        </h1>
        <p className="text-lg sm:text-xl text-[#333333] leading-relaxed max-w-4xl font-normal">
          Zero opaque lock-in. Project memory is stored as human-readable, version-controlled Markdown directly inside your Git repository. Explore each core architecture component in its dedicated sub-page.
        </p>
      </div>

      {/* Sub-pages overview */}
      <div className="space-y-10">
        {architectureTopics.map((topic) => (
          <div
            key={topic.id}
            id={topic.id}
            className="space-y-3 pb-8 border-b border-[#edece7] scroll-mt-24 last:border-b-0"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Link
                href={`/docs/architecture/${topic.slug}`}
                className="group flex items-center gap-3 text-2xl sm:text-3xl font-semibold text-black tracking-tight hover:underline underline-offset-4"
              >
                <span>{topic.title}</span>
                <span className="text-base text-[#898683] group-hover:text-black transition-colors">↗</span>
              </Link>
              <span className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#898683]">
                {topic.badge}
              </span>
            </div>

            <p className="text-base sm:text-lg text-[#333333] leading-relaxed">
              {topic.summary}
            </p>

            <div className="pt-2">
              <Link
                href={`/docs/architecture/${topic.slug}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#160f0c] text-white text-xs sm:text-sm font-medium hover:bg-[#292421] transition"
              >
                <span>Explore {topic.title} details</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Back & Forth Sequential Sub-heading Navigation */}
      <div className="pt-10 border-t border-[#edece7] flex flex-col sm:flex-row items-center justify-between gap-4">
        <Link
          href="/docs/commands/gc"
          className="px-6 py-3 rounded-full border border-[#898683]/50 text-sm font-medium text-black hover:bg-[#f7f7f5] transition flex items-center gap-2"
        >
          <span>←</span>
          <span>Previous: vee gc</span>
        </Link>

        <Link
          href="/docs/architecture/directory-structure"
          className="px-7 py-3 rounded-full bg-[#160f0c] text-white text-sm font-medium hover:bg-[#292421] transition flex items-center gap-2"
        >
          <span>Next: Directory Structure</span>
          <span>→</span>
        </Link>
      </div>
    </div>
  );
}
