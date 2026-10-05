import React from "react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-[#edece7] bg-[#f7f7f5] py-16 px-6 sm:px-10 lg:px-16 text-[#444444]">
      <div className="w-full flex flex-col md:flex-row items-start justify-between gap-12">
        <div className="space-y-4 max-w-md">
          <div className="flex items-center gap-2">
            <span className="text-[#1b0624] text-lg font-bold">✱</span>
            <span className="font-semibold text-lg text-[#1b0624]">veeshree</span>
          </div>
          <p className="text-sm text-[#444444] leading-relaxed">
            Local-first, model-independent context persistence layer for AI software engineering. Version-controlled memory stored in <code>docs/memory/</code>.
          </p>
          <div className="text-xs font-mono text-[#898683]">
            Open Source under MIT License.
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-10 text-sm">
          <div>
            <div className="font-semibold text-[#1b0624] mb-3 text-xs uppercase tracking-wider font-mono">Documentation</div>
            <ul className="space-y-2.5 text-xs text-[#444444]">
              <li><Link href="/docs#what-is-veeshree" className="hover:text-[#1b0624] transition">Overview</Link></li>
              <li><Link href="/docs#storage-modes" className="hover:text-[#1b0624] transition">3 Ways to Save Data</Link></li>
              <li><Link href="/docs#commands" className="hover:text-[#1b0624] transition">Command Reference</Link></li>
              <li><Link href="/docs#memory-layout" className="hover:text-[#1b0624] transition">Memory Layout</Link></li>
            </ul>
          </div>

          <div>
            <div className="font-semibold text-[#1b0624] mb-3 text-xs uppercase tracking-wider font-mono">Commands</div>
            <ul className="space-y-2.5 text-xs font-mono text-[#444444]">
              <li><Link href="/docs#cmd-init" className="hover:text-[#1b0624]">vee init</Link></li>
              <li><Link href="/docs#cmd-watch" className="hover:text-[#1b0624]">vee watch</Link></li>
              <li><Link href="/docs#cmd-status" className="hover:text-[#1b0624]">vee status</Link></li>
              <li><Link href="/docs#cmd-context" className="hover:text-[#1b0624]">vee context</Link></li>
              <li><Link href="/docs#cmd-sync" className="hover:text-[#1b0624]">vee sync</Link></li>
              <li><Link href="/docs#cmd-capture" className="hover:text-[#1b0624]">vee capture</Link></li>
            </ul>
          </div>

          <div>
            <div className="font-semibold text-[#1b0624] mb-3 text-xs uppercase tracking-wider font-mono">Registry</div>
            <ul className="space-y-2.5 text-xs text-[#444444]">
              <li>
                <a
                  href="https://www.npmjs.com/package/veeshree"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#1b0624] transition font-mono font-medium underline underline-offset-4 text-[#1b0624]"
                >
                  npm i veeshree
                </a>
              </li>
              <li className="font-mono text-[#898683] text-[11px] pt-1 break-all">
                https://www.npmjs.com/package/veeshree
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="w-full mt-12 pt-8 border-t border-[#edece7] flex flex-col sm:flex-row items-center justify-between text-xs text-[#898683] gap-4">
        <div>✱ Veeshree</div>
        <div>veeshree@2026</div>
      </div>
    </footer>
  );
}


