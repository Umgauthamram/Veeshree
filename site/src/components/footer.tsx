import React from "react";
import Link from "next/link";
import { Terminal, BookOpen, ExternalLink } from "lucide-react";


export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#060708] py-16 px-6 text-white/70">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start justify-between gap-10">
        <div className="space-y-4 max-w-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#C2F84F] flex items-center justify-center font-bold text-[#08090a]">
              V
            </div>
            <span className="font-bold text-lg text-white">veeshree</span>
          </div>
          <p className="text-xs text-white/60 leading-relaxed">
            Local-first, model-independent context persistence layer for multi-model AI software development.
          </p>
          <div className="text-xs font-mono text-white/40">
            Open Source under MIT License.
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-10 text-sm">
          <div>
            <h4 className="font-semibold text-white mb-3 text-xs uppercase tracking-wider font-mono">Product</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="#features" className="hover:text-white transition">Features</Link></li>
              <li><Link href="#architecture" className="hover:text-white transition">Architecture</Link></li>
              <li><Link href="/docs" className="hover:text-white transition">Documentation</Link></li>
              <li><a href="https://www.npmjs.com/package/veeshree" target="_blank" rel="noopener noreferrer" className="hover:text-white transition flex items-center gap-1">npm Package <ExternalLink className="w-3 h-3" /></a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-3 text-xs uppercase tracking-wider font-mono">CLI Commands</h4>
            <ul className="space-y-2 text-xs font-mono text-white/60">
              <li><Link href="/docs#vee-init" className="hover:text-[#C2F84F]">vee init</Link></li>
              <li><Link href="/docs#vee-context" className="hover:text-[#C2F84F]">vee context</Link></li>
              <li><Link href="/docs#vee-sync" className="hover:text-[#C2F84F]">vee sync</Link></li>
              <li><Link href="/docs#vee-capture" className="hover:text-[#C2F84F]">vee capture</Link></li>
              <li><Link href="/docs#vee-status" className="hover:text-[#C2F84F]">vee status</Link></li>
              <li><Link href="/docs#vee-gc" className="hover:text-[#C2F84F]">vee gc</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-3 text-xs uppercase tracking-wider font-mono">Community</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="https://github.com/Umgauthamram/Veeshree" target="_blank" rel="noopener noreferrer" className="hover:text-white transition flex items-center gap-1">GitHub Repo <ExternalLink className="w-3 h-3" /></a></li>
              <li><a href="https://github.com/Umgauthamram/Veeshree/issues" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">Report Issue</a></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-white/40 gap-4">
        <div>© 2026 Veeshree. Built for high-velocity AI engineering.</div>
        <div className="flex items-center gap-6">
          <span>Pure JavaScript • Zero Native C++</span>
        </div>
      </div>
    </footer>
  );
}
