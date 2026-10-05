import React from "react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-neutral-800 bg-black py-12 px-4 sm:px-8 lg:px-10 text-neutral-400">
      <div className="w-full flex flex-col md:flex-row items-start justify-between gap-10">
        <div className="space-y-3 max-w-md">
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg text-white">veeshree</span>
          </div>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Local-first, model-independent context persistence layer for AI software engineering. Version-controlled memory stored in docs/memory/.
          </p>
          <div className="text-xs font-mono text-neutral-500">
            Open Source under MIT License.
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 text-sm">
          <div>
            <div className="font-semibold text-white mb-3 text-xs uppercase tracking-wider font-mono">Documentation</div>
            <ul className="space-y-2 text-xs">
              <li><Link href="/docs#what-is-veeshree" className="hover:text-white transition">Overview</Link></li>
              <li><Link href="/docs#storage-modes" className="hover:text-white transition">3 Ways to Save Data</Link></li>
              <li><Link href="/docs#commands" className="hover:text-white transition">Command Reference</Link></li>
              <li><Link href="/docs#memory-layout" className="hover:text-white transition">Memory Layout</Link></li>
            </ul>
          </div>

          <div>
            <div className="font-semibold text-white mb-3 text-xs uppercase tracking-wider font-mono">Commands</div>
            <ul className="space-y-2 text-xs font-mono text-neutral-400">
              <li><Link href="/docs#cmd-init" className="hover:text-white">vee init</Link></li>
              <li><Link href="/docs#cmd-watch" className="hover:text-white">vee watch</Link></li>
              <li><Link href="/docs#cmd-status" className="hover:text-white">vee status</Link></li>
              <li><Link href="/docs#cmd-context" className="hover:text-white">vee context</Link></li>
              <li><Link href="/docs#cmd-sync" className="hover:text-white">vee sync</Link></li>
              <li><Link href="/docs#cmd-capture" className="hover:text-white">vee capture</Link></li>
            </ul>
          </div>

          <div>
            <div className="font-semibold text-white mb-3 text-xs uppercase tracking-wider font-mono">Package</div>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="https://www.npmjs.com/package/veeshree"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition font-mono text-white underline underline-offset-4"
                >
                  npm i veeshree
                </a>
              </li>
              <li className="font-mono text-neutral-500 text-[11px] pt-1">
                https://www.npmjs.com/package/veeshree
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="w-full mt-10 pt-6 border-t border-neutral-900 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 gap-4">
        <div>Veeshree — Local-first AI Memory Architecture.</div>
        <div>Pure JavaScript • Zero Native C++</div>
      </div>
    </footer>
  );
}

