"use client";

import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#f7f7f5] text-[#1b0624] flex flex-col justify-between selection:bg-[#160f0c] selection:text-white">
      <Navbar />

      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 pt-32 pb-24 relative">
        <div className="w-full max-w-2xl space-y-8">
          {/* Big Editorial 404 Display */}
          <h1 className="text-8xl sm:text-[140px] md:text-[180px] font-normal tracking-[-0.06em] leading-none text-[#1b0624] select-none">
            404
          </h1>

          <div className="space-y-4">
            <h2 className="text-2xl sm:text-4xl font-normal tracking-[-0.05em] text-[#1b0624]">
              Context Not Found in Repository
            </h2>

            <p className="text-base sm:text-lg text-[#444444] leading-relaxed max-w-xl mx-auto">
              The page or decision record you are looking for has been pruned, relocated to <code className="text-[#1b0624] bg-[#edece7] px-2 py-0.5 rounded font-mono text-sm">docs/memory/archive/</code>, or never existed.
            </p>
          </div>

          {/* Action Pill Buttons */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/"
              className="px-8 py-3.5 rounded-full bg-[#160f0c] hover:bg-[#292421] text-white text-sm font-medium transition-all active:scale-[0.98]"
            >
              Return Home
            </Link>

            <Link
              href="/docs"
              className="px-8 py-3.5 rounded-full border border-[#898683]/50 bg-white hover:bg-[#edece7] text-[#1b0624] text-sm font-medium transition-all"
            >
              View Documentation
            </Link>
          </div>

          <div className="pt-10 border-t border-[#edece7] font-mono text-xs text-[#898683]">
            Hint: Run <code className="text-[#1b0624] font-medium">vee search &lt;query&gt;</code> in your terminal to locate records.
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
