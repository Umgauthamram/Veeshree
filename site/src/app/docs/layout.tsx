"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

const docsScreens = [
  { href: "/docs", label: "1. Overview & Quickstart", short: "Overview" },
  { href: "/docs/saving-data", label: "2. 3 Ways of Saving Data", short: "Saving Data" },
  { href: "/docs/commands", label: "3. CLI Command Reference", short: "Commands" },
  { href: "/docs/architecture", label: "4. Memory Layout & Drift Guard", short: "Architecture" },
];

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-white text-black font-sans antialiased selection:bg-[#160f0c] selection:text-white">
      <Navbar />

      {/* Full-width container: Edge to edge without lateral gaps */}
      <div className="pt-20 pb-20 w-full px-4 sm:px-8 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Sticky Sidebar Navigation */}
        <aside className="lg:col-span-3 hidden lg:block sticky top-22 h-[calc(100vh-7rem)] overflow-y-auto pr-6 border-r border-[#edece7] text-xs font-mono">
          <div className="space-y-6">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#898683] mb-3">
                Documentation Screens
              </div>
              <ul className="space-y-2">
                {docsScreens.map((screen) => {
                  const isActive = pathname === screen.href;
                  return (
                    <li key={screen.href}>
                      <Link
                        href={screen.href}
                        className={`block px-3.5 py-2 rounded-full transition-all text-xs font-mono ${
                          isActive
                            ? "bg-[#160f0c] text-white font-medium"
                            : "text-[#444444] hover:bg-[#f7f7f5] hover:text-black"
                        }`}
                      >
                        {screen.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="pt-6 border-t border-[#edece7] space-y-3">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#898683]">
                Package & Source
              </div>
              <div className="space-y-2 text-xs text-[#444444]">
                <div>Version: <span className="font-mono font-medium text-black">0.2.1</span></div>
                <div>
                  <a
                    href="https://www.npmjs.com/package/veeshree"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-black underline underline-offset-4 hover:text-[#444444] font-mono"
                  >
                    npm i veeshree
                  </a>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile Screen Switcher Bar */}
        <div className="lg:hidden col-span-1 border-b border-[#edece7] pb-4 overflow-x-auto flex gap-2">
          {docsScreens.map((screen) => {
            const isActive = pathname === screen.href;
            return (
              <Link
                key={screen.href}
                href={screen.href}
                className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-mono transition-all ${
                  isActive
                    ? "bg-[#160f0c] text-white font-medium"
                    : "bg-[#f7f7f5] text-[#444444] hover:text-black"
                }`}
              >
                {screen.short}
              </Link>
            );
          })}
        </div>

        {/* Main Content Area: Takes up remaining width */}
        <main className="lg:col-span-9 w-full">
          {children}
        </main>
      </div>

      <Footer />
    </div>
  );
}
