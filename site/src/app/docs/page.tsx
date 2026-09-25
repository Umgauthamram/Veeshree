"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Terminal, Copy, Check, ArrowLeft, BookOpen, Layers, ShieldCheck, Cpu, GitBranch, RefreshCw, Key, Search, Trash2 } from "lucide-react";

export default function DocsPage() {
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#08090a] text-white">
      <Navbar />

      <div className="pt-24 pb-20 max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Sidebar Nav */}
        <aside className="lg:col-span-3 hidden lg:block sticky top-24 h-[calc(100vh-8rem)] overflow-y-auto pr-4 border-r border-white/10">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-mono text-[#C2F84F] hover:underline mb-6">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
          </Link>

          <h3 className="font-bold text-xs uppercase tracking-wider text-white/50 mb-3 font-mono">
            Getting Started
          </h3>
          <ul className="space-y-2 text-sm text-white/70 mb-8">
            <li><a href="#overview" className="hover:text-white transition">Overview & Why Veeshree</a></li>
            <li><a href="#installation" className="hover:text-white transition">Installation</a></li>
            <li><a href="#quickstart" className="hover:text-white transition">Quickstart Guide</a></li>
          </ul>

          <h3 className="font-bold text-xs uppercase tracking-wider text-white/50 mb-3 font-mono">
            Core CLI Commands
          </h3>
          <ul className="space-y-2 text-sm font-mono text-white/70 mb-8">
            <li><a href="#vee-init" className="hover:text-[#C2F84F] transition">vee init</a></li>
            <li><a href="#vee-context" className="hover:text-[#C2F84F] transition">vee context</a></li>
            <li><a href="#vee-sync" className="hover:text-[#C2F84F] transition">vee sync</a></li>
            <li><a href="#vee-capture" className="hover:text-[#C2F84F] transition">vee capture</a></li>
            <li><a href="#vee-keys" className="hover:text-[#C2F84F] transition">vee keys</a></li>
            <li><a href="#vee-models" className="hover:text-[#C2F84F] transition">vee models</a></li>
            <li><a href="#vee-status" className="hover:text-[#C2F84F] transition">vee status</a></li>
            <li><a href="#vee-search" className="hover:text-[#C2F84F] transition">vee search</a></li>
            <li><a href="#vee-decisions" className="hover:text-[#C2F84F] transition">vee decisions</a></li>
            <li><a href="#vee-gc" className="hover:text-[#C2F84F] transition">vee gc</a></li>
          </ul>

          <h3 className="font-bold text-xs uppercase tracking-wider text-white/50 mb-3 font-mono">
            Architecture
          </h3>
          <ul className="space-y-2 text-sm text-white/70">
            <li><a href="#repo-layout" className="hover:text-white transition">Directory Structure</a></li>
            <li><a href="#token-budgeting" className="hover:text-white transition">Token Budget Pipeline</a></li>
            <li><a href="#drift-detection" className="hover:text-white transition">SHA-256 Drift Detection</a></li>
          </ul>
        </aside>

        {/* Main Content */}
        <main className="lg:col-span-9 max-w-4xl space-y-16">
          {/* Section 1: Overview */}
          <section id="overview" className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C2F84F]/10 text-[#C2F84F] text-xs font-mono">
              Veeshree v0.1.0 • Technical Documentation
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
              Veeshree Technical Guide
            </h1>
            <p className="text-lg text-white/70 leading-relaxed">
              Veeshree (<code className="text-[#C2F84F] bg-white/5 px-2 py-0.5 rounded font-mono">vee</code>) is a local-first, model-independent context persistence layer designed to solve state loss, architectural regression, and context degradation across multi-model AI software development.
            </p>
            <div className="p-4 rounded-xl bg-[#101317] border border-white/10 text-sm text-white/80 space-y-2">
              <p className="font-semibold text-white">The Core Philosophy:</p>
              <p className="text-white/70">
                AI coding models (Claude 3.5 Sonnet, GPT-4o, Gemini 1.5/2.0, Ollama) are temporary, interchangeable workers. Project memory (decisions, constraints, tasks, rejected approaches) must live as <strong>human-readable, version-controlled Markdown in your repository</strong> (<code className="text-[#C2F84F]">/docs/memory/</code>).
              </p>
            </div>
          </section>

          {/* Section 2: Installation */}
          <section id="installation" className="space-y-4 pt-6 border-t border-white/10">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Terminal className="w-6 h-6 text-[#C2F84F]" />
              Installation
            </h2>
            <p className="text-sm text-white/70">
              Install the Veeshree CLI globally via npm or run it on-demand with npx:
            </p>

            <div className="rounded-xl bg-[#111418] border border-white/10 p-4 font-mono text-sm flex items-center justify-between">
              <code>npm install -g veeshree</code>
              <button
                onClick={() => copyText("npm install -g veeshree", "install-npm")}
                className="p-1.5 rounded hover:bg-white/10 transition"
              >
                {copiedCmd === "install-npm" ? <Check className="w-4 h-4 text-[#C2F84F]" /> : <Copy className="w-4 h-4 text-white/60" />}
              </button>
            </div>
          </section>

          {/* Section 3: Quickstart */}
          <section id="quickstart" className="space-y-6 pt-6 border-t border-white/10">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-[#C2F84F]" />
              Quickstart Workflow
            </h2>

            <ol className="space-y-6 text-sm text-white/80">
              <li className="space-y-2">
                <p className="font-bold text-white">1. Initialize Veeshree in your project</p>
                <p className="text-white/60">
                  Scans your frameworks, Prisma/database models, API endpoints, and Git history without spending any LLM tokens.
                </p>
                <div className="bg-[#111418] p-3 rounded-lg border border-white/10 font-mono text-xs">
                  vee init
                </div>
              </li>

              <li className="space-y-2">
                <p className="font-bold text-white">2. Generate prompt context before coding</p>
                <p className="text-white/60">
                  Generates a pre-formatted ~2,000 token system prompt payload containing active constraints, state, and relevant decisions.
                </p>
                <div className="bg-[#111418] p-3 rounded-lg border border-white/10 font-mono text-xs">
                  vee context "Implement Redis Rate Limiter"
                </div>
              </li>

              <li className="space-y-2">
                <p className="font-bold text-white">3. Capture new decisions after an AI session</p>
                <p className="text-white/60">
                  Feeds session transcripts or diffs into the background extractor to update markdown memory automatically.
                </p>
                <div className="bg-[#111418] p-3 rounded-lg border border-white/10 font-mono text-xs">
                  vee capture --file session.log
                </div>
              </li>

              <li className="space-y-2">
                <p className="font-bold text-white">4. Synchronize & verify code integrity</p>
                <p className="text-white/60">
                  Checks SHA-256 hashes of linked source files and reports drift alerts.
                </p>
                <div className="bg-[#111418] p-3 rounded-lg border border-white/10 font-mono text-xs">
                  vee sync
                </div>
              </li>
            </ol>
          </section>

          {/* Section 4: Detailed Command Reference */}
          <section id="commands" className="space-y-12 pt-6 border-t border-white/10">
            <h2 className="text-2xl font-bold text-white">
              Complete CLI Reference
            </h2>

            {/* Command: vee init */}
            <div id="vee-init" className="p-6 rounded-2xl bg-[#101317] border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <code className="text-base font-bold font-mono text-[#C2F84F]">vee init [-f, --force]</code>
                <span className="text-xs font-mono text-white/50">0 Tokens</span>
              </div>
              <p className="text-xs text-white/70 leading-relaxed">
                Bootstraps the <code className="text-[#C2F84F]">/docs/memory/</code> and <code className="text-[#C2F84F]">/.vee/</code> folder hierarchies, runs the zero-token heuristic scanner to detect your app stack and domain models, seeds initial Markdown records, and installs Git pre-commit & post-checkout hooks.
              </p>
            </div>

            {/* Command: vee context */}
            <div id="vee-context" className="p-6 rounded-2xl bg-[#101317] border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <code className="text-base font-bold font-mono text-[#C2F84F]">vee context [request] [options]</code>
                <span className="text-xs font-mono text-white/50">0 Tokens</span>
              </div>
              <p className="text-xs text-white/70 leading-relaxed">
                Generates a token-budgeted system prompt payload from active memory. If no request is passed, it automatically infers active focus from your current Git branch and recent commits.
              </p>
              <div className="text-xs font-mono text-white/60 bg-[#08090a] p-3 rounded-lg border border-white/5 space-y-1">
                <div>Options:</div>
                <div>-m, --max-tokens &lt;n&gt;   Max token budget (default: 2000)</div>
                <div>-t, --tasks              Include current tasks list</div>
                <div>-j, --json               Output structured JSON</div>
                <div>-r, --raw                Output raw prompt text</div>
              </div>
            </div>

            {/* Command: vee sync */}
            <div id="vee-sync" className="p-6 rounded-2xl bg-[#101317] border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <code className="text-base font-bold font-mono text-[#C2F84F]">vee sync</code>
                <span className="text-xs font-mono text-white/50">0 Tokens</span>
              </div>
              <p className="text-xs text-white/70 leading-relaxed">
                Re-scans <code className="text-[#C2F84F]">/docs/memory/</code>, recalculates SHA-256 hashes of all source code files referenced in ADR <code className="text-[#C2F84F]">linked_files</code> frontmatter, and updates <code className="text-[#C2F84F]">/.vee/index.json</code>.
              </p>
            </div>

            {/* Command: vee capture */}
            <div id="vee-capture" className="p-6 rounded-2xl bg-[#101317] border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <code className="text-base font-bold font-mono text-[#C2F84F]">vee capture [--file &lt;path&gt;] [--provider &lt;p&gt;]</code>
                <span className="text-xs font-mono text-white/50">Low (~2k Tokens)</span>
              </div>
              <p className="text-xs text-white/70 leading-relaxed">
                Sends conversation transcripts or Git diff streams to background LLMs (Gemini, OpenAI, Ollama) to extract architectural decisions, completed tasks, constraints, and rejected approaches into Markdown files.
              </p>
            </div>

            {/* Command: vee status */}
            <div id="vee-status" className="p-6 rounded-2xl bg-[#101317] border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <code className="text-base font-bold font-mono text-[#C2F84F]">vee status [-c, --check]</code>
                <span className="text-xs font-mono text-white/50">0 Tokens</span>
              </div>
              <p className="text-xs text-white/70 leading-relaxed">
                Renders a terminal dashboard with task progress percentage, active decision counts, and stale hash alerts. The <code className="text-[#C2F84F]">--check</code> flag exits with error code 1 if drift exists (ideal for CI/CD).
              </p>
            </div>

            {/* Command: vee gc */}
            <div id="vee-gc" className="p-6 rounded-2xl bg-[#101317] border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <code className="text-base font-bold font-mono text-[#C2F84F]">vee gc</code>
                <span className="text-xs font-mono text-white/50">0 Tokens</span>
              </div>
              <p className="text-xs text-white/70 leading-relaxed">
                Executes garbage collection: caps rolling progress items in <code className="text-[#C2F84F]">current-state.md</code> to 5 items (archiving excess to <code className="text-[#C2F84F]">completed-tasks.md</code>) and shifts superseded decisions into <code className="text-[#C2F84F]">archive/decisions/</code>.
              </p>
            </div>
          </section>

          {/* Section 5: Directory Structure */}
          <section id="repo-layout" className="space-y-4 pt-6 border-t border-white/10">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Layers className="w-6 h-6 text-[#C2F84F]" />
              Repository Layout
            </h2>
            <div className="rounded-xl bg-[#08090a] border border-white/10 p-6 font-mono text-xs text-white/80 overflow-x-auto leading-relaxed">
              <pre>{`my-project/
├── docs/
│   └── memory/                      <-- Version-controlled human-readable memory
│       ├── decisions/               <-- Architectural Decision Records (ADRs)
│       │   ├── database.md
│       │   └── caching.md
│       ├── current-state.md         <-- Active feature & milestone snapshot
│       ├── tasks.md                 <-- Pending and completed task lists
│       ├── constraints.md           <-- Locked architectural & security rules
│       ├── discoveries.md           <-- System behaviors & technical findings
│       ├── rejected.md              <-- Discarded alternatives & trade-offs
│       └── archive/                 <-- Pruned historical records
│           ├── completed-tasks.md
│           └── decisions/
├── .vee/                            <-- Local system state & index cache
│   ├── config.json                  <-- System preferences & API key storage
│   └── index.json                   <-- Fast keyword search index & file SHA-256 hashes
└── .git/hooks/                      <-- Automated Git synchronization`}</pre>
            </div>
          </section>
        </main>
      </div>

      <Footer />
    </div>
  );
}
