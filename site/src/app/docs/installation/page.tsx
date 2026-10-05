"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function InstallationPage() {
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
        <span className="text-black font-semibold">Installation</span>
      </div>

      {/* Screen Title */}
      <div className="space-y-4 border-b border-[#edece7] pb-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-4xl sm:text-6xl font-normal tracking-[-0.04em] text-black">
            Installation
          </h1>
          <span className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#898683]">
            NPM Package
          </span>
        </div>
        <p className="text-lg sm:text-xl text-[#333333] leading-relaxed max-w-4xl font-normal">
          How to install Veeshree locally in your project or globally across your development environment.
        </p>
      </div>

      {/* Content */}
      <div className="space-y-10 text-base sm:text-[17px] leading-relaxed text-[#444444]">
        {/* Local Installation */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-black tracking-tight">
            Per-Project Installation (Recommended)
          </h2>
          <p className="text-[#333333]">
            Installing Veeshree as a project dependency ensures all team members and CI pipelines execute the exact same version:
          </p>
          <div className="flex items-center justify-between bg-[#f7f7f5] px-4 py-3.5 rounded-xl border border-[#edece7] text-base text-black">
            <code>npm i veeshree</code>
            <button
              onClick={() => copyText("npm i veeshree", "local")}
              className="px-4 py-1.5 bg-[#160f0c] hover:bg-[#292421] text-white rounded-full text-xs sm:text-sm font-medium transition cursor-pointer"
            >
              {copiedCmd === "local" ? "Copied" : "Copy"}
            </button>
          </div>
        </section>

        {/* Global Installation */}
        <section className="space-y-4 pt-6 border-t border-[#edece7]">
          <h2 className="text-2xl font-semibold text-black tracking-tight">
            Global CLI Installation
          </h2>
          <p className="text-[#333333]">
            Install globally to run the <code>vee</code> command in any terminal directory without prefixing with npx:
          </p>
          <div className="flex items-center justify-between bg-[#f7f7f5] px-4 py-3.5 rounded-xl border border-[#edece7] text-base text-black">
            <code>npm install -g veeshree</code>
            <button
              onClick={() => copyText("npm install -g veeshree", "global")}
              className="px-4 py-1.5 bg-[#160f0c] hover:bg-[#292421] text-white rounded-full text-xs sm:text-sm font-medium transition cursor-pointer"
            >
              {copiedCmd === "global" ? "Copied" : "Copy"}
            </button>
          </div>
        </section>

        {/* Requirements */}
        <section className="space-y-4 pt-6 border-t border-[#edece7]">
          <h2 className="text-2xl font-semibold text-black tracking-tight">
            System Requirements
          </h2>
          <ul className="space-y-2 text-[#333333]">
            <li className="flex items-start gap-3">
              <span className="text-black font-semibold">•</span>
              <span><strong>Node.js:</strong> Version 18.0.0 or higher</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-black font-semibold">•</span>
              <span><strong>Platform:</strong> macOS, Linux, Windows (WSL and native PowerShell)</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-black font-semibold">•</span>
              <span><strong>Dependencies:</strong> Zero native C++ compilation; installs in seconds</span>
            </li>
          </ul>

          <div className="pt-2 text-sm text-[#898683]">
            Package Registry:{" "}
            <a
              href="https://www.npmjs.com/package/veeshree"
              target="_blank"
              rel="noopener noreferrer"
              className="text-black underline underline-offset-4"
            >
              https://www.npmjs.com/package/veeshree
            </a>
          </div>
        </section>
      </div>

      {/* Prev / Next Pagination */}
      <div className="pt-10 border-t border-[#edece7] flex flex-col sm:flex-row items-center justify-between gap-4">
        <Link
          href="/docs/the-problem"
          className="px-6 py-3 rounded-full border border-[#898683]/50 text-sm font-medium text-black hover:bg-[#f7f7f5] transition flex items-center gap-2"
        >
          <span>←</span>
          <span>The Problem</span>
        </Link>

        <Link
          href="/docs/quickstart"
          className="px-7 py-3 rounded-full bg-[#160f0c] text-white text-sm font-medium hover:bg-[#292421] transition flex items-center gap-2"
        >
          <span>Quickstart</span>
          <span>→</span>
        </Link>
      </div>
    </div>
  );
}
