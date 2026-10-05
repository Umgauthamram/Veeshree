"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArchitectureTopic } from "@/data/architecture-data";

export function ArchitectureDetail({ topic }: { topic: ArchitectureTopic }) {
  const [copied, setCopied] = useState(false);

  const copyDiagram = () => {
    navigator.clipboard.writeText(topic.diagramOrCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
        <Link href="/docs/architecture" className="hover:text-black">
          Architecture
        </Link>
        <span>/</span>
        <span className="text-black font-semibold">{topic.title}</span>
      </div>

      {/* Screen Title & Badge */}
      <div className="space-y-4 border-b border-[#edece7] pb-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-4xl sm:text-6xl font-normal tracking-[-0.04em] text-black">
            {topic.title}
          </h1>
          <span className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#898683]">
            {topic.badge}
          </span>
        </div>
        <p className="text-lg sm:text-xl text-[#333333] leading-relaxed max-w-4xl font-normal">
          {topic.summary}
        </p>
      </div>

      {/* Overview & Content */}
      <div className="space-y-10 text-base sm:text-[17px] leading-relaxed text-[#444444]">
        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-black tracking-tight">
            Overview
          </h2>
          <p className="text-[#333333] leading-relaxed">
            {topic.content}
          </p>
        </section>

        {/* Specification Diagram or Layout */}
        <section className="space-y-3 pt-6 border-t border-[#edece7]">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-black tracking-tight">
              Specification & Schema
            </h2>
            <button
              onClick={copyDiagram}
              className="px-4 py-1.5 bg-[#160f0c] hover:bg-[#292421] text-white rounded-full text-xs sm:text-sm font-medium transition cursor-pointer"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <div className="bg-[#f7f7f5] p-5 sm:p-6 rounded-xl border border-[#edece7] text-sm sm:text-base text-[#1b0624] overflow-x-auto leading-relaxed font-sans whitespace-pre">
            {topic.diagramOrCode}
          </div>
        </section>

        {/* How It Operates */}
        <section className="space-y-4 pt-6 border-t border-[#edece7]">
          <h2 className="text-2xl font-semibold text-black tracking-tight">
            How It Works Under the Hood
          </h2>
          <ul className="space-y-3">
            {topic.howItWorks.map((item, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <span className="text-black font-semibold">•</span>
                <span className="text-[#333333]">{item}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Prev / Next Pagination */}
      <div className="pt-10 border-t border-[#edece7] flex flex-col sm:flex-row items-center justify-between gap-4">
        {topic.prev ? (
          <Link
            href={topic.prev.href}
            className="px-6 py-3 rounded-full border border-[#898683]/50 text-sm font-medium text-black hover:bg-[#f7f7f5] transition flex items-center gap-2"
          >
            <span>←</span>
            <span>{topic.prev.title}</span>
          </Link>
        ) : (
          <div />
        )}

        {topic.next ? (
          <Link
            href={topic.next.href}
            className="px-7 py-3 rounded-full bg-[#160f0c] text-white text-sm font-medium hover:bg-[#292421] transition flex items-center gap-2"
          >
            <span>{topic.next.title}</span>
            <span>→</span>
          </Link>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}
