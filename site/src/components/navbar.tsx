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
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/95 border-b border-neutral-800 backdrop-blur-sm">
      <div className="w-full px-4 sm:px-8 lg:px-10 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-bold text-lg tracking-tight text-white hover:text-neutral-300 transition-colors">
            veeshree
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-neutral-400">
            <Link href="/docs" className="text-white hover:text-neutral-300 transition-colors font-medium">
              Documentation
            </Link>
            <Link href="/docs#storage-modes" className="hover:text-white transition-colors">
              Saving Data
            </Link>
            <Link href="/docs#commands" className="hover:text-white transition-colors">
              CLI Commands
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={copyInstall}
            className="flex items-center px-3 py-1.5 rounded border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-xs font-mono text-neutral-200 transition-colors"
            title="Click to copy npm install command"
          >
            {copied ? "Copied: npm i veeshree" : "npm i veeshree"}
          </button>

          <a
            href="https://www.npmjs.com/package/veeshree"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center px-3.5 py-1.5 rounded bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition-colors font-mono"
          >
            npm package
          </a>
        </div>
      </div>
    </header>
  );
}

