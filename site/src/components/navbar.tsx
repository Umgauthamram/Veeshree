"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Terminal, BookOpen, Copy, Check, Sparkles } from "lucide-react";

export function Navbar() {

  const [copied, setCopied] = useState(false);

  const copyInstall = () => {
    navigator.clipboard.writeText("npm install -g veeshree");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-[#08090a]/80 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <span className="font-bold text-lg tracking-tight text-white group-hover:text-[#C2F84F] transition-colors">
            veeshree
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-white/70">
          <Link href="#features" className="hover:text-white transition-colors">
            Features
          </Link>
          <Link href="#architecture" className="hover:text-white transition-colors">
            Architecture
          </Link>
          <Link href="/docs" className="hover:text-white flex items-center gap-1.5 transition-colors">
            <BookOpen className="w-4 h-4" />
            Documentation
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={copyInstall}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-white/90 transition-all active:scale-95"
            title="Click to copy npm install command"
          >
            <Terminal className="w-3.5 h-3.5 text-[#C2F84F]" />
            <span>npm i -g veeshree</span>
            {copied ? (
              <Check className="w-3.5 h-3.5 text-[#C2F84F]" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-white/50" />
            )}
          </button>

          <a
            href="https://github.com/Umgauthamram/Veeshree"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#C2F84F] text-[#08090a] font-semibold text-xs hover:bg-[#b0e83f] transition-all hover:shadow-[0_0_20px_rgba(194,248,79,0.4)]"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            GitHub
          </a>

        </div>
      </div>
    </header>
  );
}
