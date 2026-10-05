"use client";

import React, { useState } from "react";
import Link from "next/link";

const overviewSubPages = [
  {
    href: "/docs/the-problem",
    title: "The Problem with Ephemeral AI Chats",
    badge: "Memory Loss",
    description:
      "Why temporary chat sessions lead to architectural drift, contradictory implementations, and forgotten technical constraints across development cycles.",
  },
  {
    href: "/docs/installation",
    title: "Installation",
    badge: "NPM Package",
    description:
      "Install Veeshree locally in your project repository or globally across your machine. Zero native C++ compilation; pure JavaScript.",
  },
  {
    href: "/docs/quickstart",
    title: "3-Minute Quickstart",
    badge: "Getting Started",
    description:
      "Run vee init, launch the ambient background watcher, and verify milestone progress and SHA-256 drift integrity in three simple steps.",
  },
];

export default function DocsOverviewPage() {
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  return (
    <div className="w-full space-y-14 bg-white text-black font-sans pb-16">
      {/* Breadcrumb */}
      <div className="text-xs text-[#898683] flex items-center gap-2">
        <Link href="/" className="hover:text-black">Home</Link>
        <span>/</span>
        <span className="text-black font-semibold">Docs: Overview</span>
      </div>

      {/* Screen Title */}
      <div className="space-y-4 border-b border-[#edece7] pb-8">
        <h1 className="text-4xl sm:text-6xl font-normal tracking-[-0.04em] text-black">
          Overview & Quickstart
        </h1>
        <p className="text-lg sm:text-xl text-[#333333] leading-relaxed max-w-4xl font-normal">
          Veeshree is a local-first, model-independent context persistence layer for AI software engineering. It decouples architectural decisions, hard constraints, and task progress from temporary AI chat sessions and saves them as version-controlled Markdown in <code>docs/memory/</code>.
        </p>
      </div>

      {/* Overview Sub-pages Directory */}
      <div className="space-y-8">
        {overviewSubPages.map((item) => (
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

      {/* Back & Forth Sequential Sub-heading Navigation */}
      <div className="pt-10 border-t border-[#edece7] flex flex-col sm:flex-row items-center justify-between gap-4">
        <Link
          href="/"
          className="px-6 py-3 rounded-full border border-[#898683]/50 text-sm font-medium text-black hover:bg-[#f7f7f5] transition flex items-center gap-2"
        >
          <span>←</span>
          <span>Back to Home</span>
        </Link>

        <Link
          href="/docs/the-problem"
          className="px-7 py-3 rounded-full bg-[#160f0c] text-white text-sm font-medium hover:bg-[#292421] transition flex items-center gap-2"
        >
          <span>Next: The Problem</span>
          <span>→</span>
        </Link>
      </div>
    </div>
  );
}
