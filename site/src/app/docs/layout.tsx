"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

interface SubItem {
  label: string;
  href: string;
}

interface DocSection {
  href: string;
  title: string;
  short: string;
  subItems: SubItem[];
}

const docSections: DocSection[] = [
  {
    href: "/docs",
    title: "Overview",
    short: "Overview",
    subItems: [
      { label: "The Problem", href: "/docs/the-problem" },
      { label: "Installation", href: "/docs/installation" },
      { label: "Quickstart", href: "/docs/quickstart" },
    ],
  },
  {
    href: "/docs/saving-data",
    title: "Saving Data",
    short: "Saving Data",
    subItems: [
      { label: "Ambient Watcher", href: "/docs/saving-data/ambient-watcher" },
      { label: "Native IDE Rules", href: "/docs/saving-data/native-ide-rules" },
      { label: "Manual CLI Pipeline", href: "/docs/saving-data/manual-cli-pipeline" },
      { label: "Comparison Matrix", href: "/docs/saving-data/comparison-matrix" },
    ],
  },
  {
    href: "/docs/commands",
    title: "CLI Commands",
    short: "Commands",
    subItems: [
      { label: "vee init", href: "/docs/commands/init" },
      { label: "vee doctor", href: "/docs/commands/doctor" },
      { label: "vee watch", href: "/docs/commands/watch" },
      { label: "vee status", href: "/docs/commands/status" },
      { label: "vee context", href: "/docs/commands/context" },
      { label: "vee sync", href: "/docs/commands/sync" },
      { label: "vee capture", href: "/docs/commands/capture" },
      { label: "vee models", href: "/docs/commands/models" },
      { label: "vee keys", href: "/docs/commands/keys" },
      { label: "vee search", href: "/docs/commands/search" },
      { label: "vee decisions", href: "/docs/commands/decisions" },
      { label: "vee gc", href: "/docs/commands/gc" },
    ],
  },
  {
    href: "/docs/architecture",
    title: "Architecture",
    short: "Architecture",
    subItems: [
      { label: "Shared Memory Layer", href: "/docs/architecture/shared-memory" },
      { label: "Directory Layout", href: "/docs/architecture/directory-structure" },
      { label: "Token Budget Engine", href: "/docs/architecture/token-budget" },
      { label: "SHA-256 Drift Guard", href: "/docs/architecture/drift-guard" },
    ],
  },
];

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // State to track which dropdown sections are expanded
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    "/docs": true,
    "/docs/saving-data": true,
    "/docs/commands": true,
    "/docs/architecture": true,
  });

  // Automatically expand the section that matches current pathname or any of its sub-items
  useEffect(() => {
    if (pathname) {
      const activeSection = docSections.find(
        (sec) => pathname === sec.href || sec.subItems.some((sub) => sub.href === pathname)
      );
      if (activeSection) {
        setExpanded((prev) => ({ ...prev, [activeSection.href]: true }));
      }
    }
  }, [pathname]);

  const toggleSection = (href: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setExpanded((prev) => ({ ...prev, [href]: !prev[href] }));
  };

  return (
    <div className="min-h-screen bg-white text-black antialiased font-sans selection:bg-[#160f0c] selection:text-white">
      <Navbar />

      {/* Full-width container: flush left padding to utilize empty space on the left */}
      <div className="pt-20 pb-24 w-full pl-2 sm:pl-4 lg:pl-5 pr-4 sm:pr-8 lg:pr-12 flex flex-col lg:flex-row gap-6 lg:gap-8">
        
        {/* Left Sidebar Navigation: positioned flush left to maximize screen space */}
        <aside className="w-60 shrink-0 hidden lg:block sticky top-20 h-[calc(100vh-6rem)] overflow-y-auto pr-3 border-r border-[#edece7]">
          <div className="space-y-6">
            <div className="text-xs font-semibold uppercase tracking-wider text-[#898683] px-1">
              Documentation
            </div>

            <nav className="space-y-1.5">
              {docSections.map((section) => {
                const isExactActive = pathname === section.href;
                const isChildActive = section.subItems.some((sub) => pathname === sub.href);
                const isSectionActive = isExactActive || isChildActive;
                const isExpanded = !!expanded[section.href];

                return (
                  <div key={section.href} className="space-y-1">
                    {/* Main Section Heading */}
                    <div
                      className={`flex items-center justify-between rounded-xl px-3 py-2 transition-all text-sm ${
                        isSectionActive
                          ? "bg-[#160f0c] text-white font-medium shadow-sm"
                          : "text-[#333333] hover:bg-[#f7f7f5] hover:text-black font-medium"
                      }`}
                    >
                      <Link
                        href={section.href}
                        className="flex-1 text-left truncate"
                      >
                        {section.title}
                      </Link>

                      <button
                        onClick={(e) => toggleSection(section.href, e)}
                        className={`p-1 rounded hover:bg-black/10 transition-transform ${
                          isSectionActive ? "text-white" : "text-[#898683]"
                        }`}
                        title="Toggle subheadings"
                      >
                        <span className="text-xs inline-block font-bold">
                          {isExpanded ? "▾" : "▸"}
                        </span>
                      </button>
                    </div>

                    {/* Collapsible Subheadings Dropdown */}
                    {isExpanded && (
                      <ul className="pl-3 pr-1 py-1 space-y-1 border-l-2 border-[#edece7] ml-2.5 my-1">
                        {section.subItems.map((sub) => {
                          const isSubActive = pathname === sub.href;

                          return (
                            <li key={sub.href}>
                              <Link
                                href={sub.href}
                                className={`block py-1.5 px-2 rounded-lg text-xs sm:text-[13px] transition-all truncate ${
                                  isSubActive
                                    ? "font-semibold text-black"
                                    : "font-normal text-[#666666] hover:text-black hover:bg-[#f7f7f5]"
                                }`}
                              >
                                {sub.label}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                );
              })}
            </nav>

            <div className="pt-6 border-t border-[#edece7] px-1 space-y-2 text-xs text-[#898683]">
              <div>Veeshree 0.3.1</div>
              <a
                href="https://www.npmjs.com/package/veeshree"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-black underline underline-offset-4 hover:text-[#444444]"
              >
                npm i veeshree
              </a>
            </div>
          </div>
        </aside>

        {/* Mobile Horizontal Section Switcher */}
        <div className="lg:hidden w-full border-b border-[#edece7] pb-4 overflow-x-auto flex gap-2">
          {docSections.map((section) => {
            const isActive =
              pathname === section.href ||
              section.subItems.some((sub) => sub.href === pathname);
            return (
              <Link
                key={section.href}
                href={section.href}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-medium transition-all ${
                  isActive
                    ? "bg-[#160f0c] text-white"
                    : "bg-[#f7f7f5] text-[#444444] hover:text-black"
                }`}
              >
                {section.short}
              </Link>
            );
          })}
        </div>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 w-full pl-1 lg:pl-3">
          {children}
        </main>
      </div>

      <Footer />
    </div>
  );
}
