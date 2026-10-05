"use client";

import React, { useState } from "react";
import Link from "next/link";

export function Navbar() {
  const [copied, setCopied] = useState(false);

  const copyInstall = () => {
    navigator.clipboard.writeText("npm i veeshree");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#f7f7f5]/90 backdrop-blur-md border-b border-[#edece7]">
      <div className="w-full px-6 sm:px-10 lg:px-16 h-18 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-[#1b0624] text-lg font-bold">✱</span>
            <span className="font-semibold text-lg tracking-tight text-[#1b0624]">
              veeshree
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-7 text-sm font-normal text-[#444444]">
            <Link href="/docs" className="hover:text-[#1b0624] transition-colors">
              Docs
            </Link>
            <Link href="/docs/saving-data" className="hover:text-[#1b0624] transition-colors">
              Saving Data
            </Link>
            <Link href="/docs/commands" className="hover:text-[#1b0624] transition-colors">
              Commands
            </Link>
            <Link href="/docs/architecture" className="hover:text-[#1b0624] transition-colors">
              Architecture
            </Link>
          </nav>

        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={copyInstall}
            className="hidden sm:flex items-center px-4 py-2 rounded-full border border-[#898683]/40 bg-white/80 hover:bg-white text-xs font-mono text-[#1b0624] transition-all"
            title="Click to copy npm install command"
          >
            {copied ? "Copied: npm i veeshree" : "npm i veeshree"}
          </button>

          <Link
            href="/docs"
            className="flex items-center px-5 py-2 rounded-full bg-[#160f0c] text-white text-xs font-medium hover:bg-[#292421] transition-all"
          >
            Documentation
          </Link>
        </div>
      </div>
    </header>
  );
}


