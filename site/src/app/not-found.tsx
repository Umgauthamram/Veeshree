"use client";

import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ArrowLeft, Terminal, Home, BookOpen } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#08090a] text-white flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 pt-24 pb-16 relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-[#C2F84F]/10 blur-[130px] pointer-events-none rounded-full" />

        <div className="relative z-10 max-w-lg space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-[#C2F84F]">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            Error 404 • Memory Fragment Missing
          </div>

          <h1 className="text-7xl sm:text-9xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/20">
            404
          </h1>

          <h2 className="text-xl sm:text-2xl font-bold text-white">
            Context Not Found in Repository
          </h2>

          <p className="text-sm text-white/60 leading-relaxed">
            The page or decision record you are looking for has been pruned, relocated to <code className="text-[#C2F84F] bg-white/5 px-1.5 py-0.5 rounded font-mono text-xs">/docs/memory/archive/</code>, or never existed.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C2F84F] text-[#08090a] font-bold text-xs hover:bg-[#b0e83f] transition-all hover:shadow-[0_0_20px_rgba(194,248,79,0.35)]"
            >
              <Home className="w-3.5 h-3.5" />
              Return Home
            </Link>

            <Link
              href="/docs"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-medium text-xs hover:bg-white/10 transition-all"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#C2F84F]" />
              View Documentation
            </Link>
          </div>

          <div className="pt-8 border-t border-white/5 font-mono text-xs text-white/40">
            Hint: Run <code className="text-white/70">vee search &lt;query&gt;</code> in your terminal to locate records.
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
