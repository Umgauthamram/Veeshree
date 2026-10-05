"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CommandDoc } from "@/data/commands-data";

export function CommandDetail({ doc }: { doc: CommandDoc }) {
  const [copiedExample, setCopiedExample] = useState(false);

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedExample(true);
    setTimeout(() => setCopiedExample(false), 2000);
  };

  return (
    <div className="w-full space-y-12 bg-white text-black font-sans pb-16">
      {/* Breadcrumb */}
      <div className="text-xs text-[#898683] flex items-center gap-2">
        <Link href="/" className="hover:text-black">
          Home
        </Link>
        <span>/</span>
        <Link href="/docs" className="hover:text-black">
          Docs
        </Link>
        <span>/</span>
        <Link href="/docs/commands" className="hover:text-black">
          CLI Commands
        </Link>
        <span>/</span>
        <span className="text-black font-semibold">{doc.cmd}</span>
      </div>

      {/* Screen Title & Badge */}
      <div className="space-y-4 border-b border-[#edece7] pb-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-4xl sm:text-6xl font-normal tracking-[-0.04em] text-black">
            {doc.cmd}
          </h1>
          <span className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#898683]">
            {doc.badge}
          </span>
        </div>
        <p className="text-lg sm:text-xl text-[#333333] leading-relaxed max-w-4xl font-normal">
          {doc.summary}
        </p>
      </div>

      {/* Unboxed Content Sections */}
      <div className="space-y-10 text-base sm:text-[17px] leading-relaxed text-[#444444]">
        {/* Explanation */}
        <section className="space-y-2">
          <h2 className="text-2xl font-semibold text-black tracking-tight">
            Explanation
          </h2>
          <p className="text-[#333333] leading-relaxed">
            {doc.explanation}
          </p>
        </section>

        {/* How We Used It */}
        <section className="space-y-2 pt-6 border-t border-[#edece7]">
          <h2 className="text-2xl font-semibold text-black tracking-tight">
            How We Used It
          </h2>
          <p className="text-[#333333] leading-relaxed">
            {doc.howUsed}
          </p>
        </section>

        {/* Flags & Options */}
        {doc.flags !== "None" && (
          <section className="space-y-3 pt-6 border-t border-[#edece7]">
            <h2 className="text-2xl font-semibold text-black tracking-tight">
              Flags & Options
            </h2>
            <div className="bg-[#f7f7f5] p-5 rounded-xl border border-[#edece7] text-sm sm:text-base text-[#333333] whitespace-pre-wrap leading-relaxed font-sans">
              {doc.flags}
            </div>
          </section>
        )}

        {/* Command Syntax & Copy */}
        <section className="space-y-3 pt-6 border-t border-[#edece7]">
          <h2 className="text-2xl font-semibold text-black tracking-tight">
            Command Usage
          </h2>
          <div className="flex items-center justify-between bg-[#f7f7f5] px-5 py-4 rounded-xl border border-[#edece7] text-base text-black">
            <pre className="whitespace-pre-wrap font-sans">{doc.example}</pre>
            <button
              onClick={() => copyText(doc.example)}
              className="px-5 py-2 bg-[#160f0c] hover:bg-[#292421] text-white rounded-full text-xs sm:text-sm font-medium transition cursor-pointer"
            >
              {copiedExample ? "Copied" : "Copy"}
            </button>
          </div>
        </section>

        {/* Example Output */}
        {doc.outputExample && (
          <section className="space-y-3 pt-6 border-t border-[#edece7]">
            <h2 className="text-2xl font-semibold text-black tracking-tight">
              Expected Output
            </h2>
            <div className="bg-[#f7f7f5] p-5 rounded-xl border border-[#edece7] text-xs sm:text-sm text-[#222222] whitespace-pre-wrap leading-relaxed font-sans">
              {doc.outputExample}
            </div>
          </section>
        )}
      </div>

      {/* Prev / Next Pagination */}
      <div className="pt-10 border-t border-[#edece7] flex flex-col sm:flex-row items-center justify-between gap-4">
        {doc.prev ? (
          <Link
            href={doc.prev.href}
            className="px-6 py-3 rounded-full border border-[#898683]/50 text-sm font-medium text-black hover:bg-[#f7f7f5] transition flex items-center gap-2"
          >
            <span>←</span>
            <span>{doc.prev.title}</span>
          </Link>
        ) : (
          <div />
        )}

        {doc.next ? (
          <Link
            href={doc.next.href}
            className="px-7 py-3 rounded-full bg-[#160f0c] text-white text-sm font-medium hover:bg-[#292421] transition flex items-center gap-2"
          >
            <span>{doc.next.title}</span>
            <span>→</span>
          </Link>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}
