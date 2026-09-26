"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import {
  Terminal,
  Copy,
  Check,
  ArrowLeft,
  BookOpen,
  Layers,
  ShieldCheck,
  Cpu,
  GitBranch,
  RefreshCw,
  Search,
  Key,
  Database,
  HelpCircle,
  Lightbulb,
  PlayCircle,
  Sparkles,
  AlertTriangle,
  FileText
} from "lucide-react";

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
        {/* Sticky Sidebar Navigation */}
        <aside className="lg:col-span-3 hidden lg:block sticky top-24 h-[calc(100vh-8rem)] overflow-y-auto pr-4 border-r border-white/10 text-xs font-mono">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-[#C2F84F] hover:underline mb-6 font-sans">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
          </Link>

          <div className="space-y-6">
            <div>
              <h3 className="font-bold uppercase tracking-wider text-white/40 mb-3">1. Fundamentals</h3>
              <ul className="space-y-2 text-white/70 font-sans text-xs">
                <li><a href="#what-is-veeshree" className="hover:text-white transition">What is Veeshree?</a></li>
                <li><a href="#the-problem" className="hover:text-white transition">The Multi-Model Problem (Why)</a></li>
                <li><a href="#design-principles" className="hover:text-white transition">Core Design Principles</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold uppercase tracking-wider text-white/40 mb-3">2. Getting Started</h3>
              <ul className="space-y-2 text-white/70 font-sans text-xs">
                <li><a href="#installation" className="hover:text-white transition">Installation</a></li>
                <li><a href="#step-by-step" className="hover:text-white transition">Step-by-Step Practical Guide</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold uppercase tracking-wider text-white/40 mb-3">3. Command Deep-Dive</h3>
              <ul className="space-y-2 text-white/60">
                <li><a href="#cmd-init" className="hover:text-[#C2F84F]">vee init (Cold Start)</a></li>
                <li><a href="#cmd-context" className="hover:text-[#C2F84F]">vee context (Prompt Assembly)</a></li>
                <li><a href="#cmd-capture" className="hover:text-[#C2F84F]">vee capture (AI Memory Update)</a></li>
                <li><a href="#cmd-sync" className="hover:text-[#C2F84F]">vee sync (Hash & Drift Check)</a></li>
                <li><a href="#cmd-status" className="hover:text-[#C2F84F]">vee status (Health Dashboard)</a></li>
                <li><a href="#cmd-search" className="hover:text-[#C2F84F]">vee search (Memory Lookup)</a></li>
                <li><a href="#cmd-decisions" className="hover:text-[#C2F84F]">vee decisions (ADR Catalog)</a></li>
                <li><a href="#cmd-gc" className="hover:text-[#C2F84F]">vee gc (State Archiving)</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold uppercase tracking-wider text-white/40 mb-3">4. Architecture</h3>
              <ul className="space-y-2 text-white/70 font-sans text-xs">
                <li><a href="#memory-layout" className="hover:text-white transition">Memory Directory Layout</a></li>
                <li><a href="#token-budget" className="hover:text-white transition">2,000 Token Budget Allocation</a></li>
                <li><a href="#drift-detection" className="hover:text-white transition">SHA-256 Code Drift Detection</a></li>
              </ul>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="lg:col-span-9 max-w-4xl space-y-16">
          {/* 1. Header & Overview */}
          <section id="what-is-veeshree" className="space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C2F84F]/10 text-[#C2F84F] text-xs font-mono">
              Complete Documentation & Reference Guide
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
              What is Veeshree?
            </h1>

            <p className="text-base sm:text-lg text-white/80 leading-relaxed">
              <strong>Veeshree (<code className="text-[#C2F84F]">vee</code>)</strong> is a local-first, model-independent context persistence layer for software engineering. It decouples long-term architectural memory from ephemeral AI chat sessions (Cursor, Claude Code, ChatGPT, Ollama) and persists it directly inside your codebase (<code className="text-[#C2F84F]">/docs/memory/</code>) as version-controlled Markdown.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-[#101317] border border-white/10 space-y-1">
                <span className="text-xs font-mono text-[#C2F84F] uppercase font-bold">1. What is there?</span>
                <p className="text-xs text-white/70">A structured memory file system + pure JS BM25 search index + CLI suite.</p>
              </div>
              <div className="p-4 rounded-xl bg-[#101317] border border-white/10 space-y-1">
                <span className="text-xs font-mono text-[#C2F84F] uppercase font-bold">2. Why is it there?</span>
                <p className="text-xs text-white/70">Prevents context loss, silent architectural overwrites, and token waste when switching AI models.</p>
              </div>
              <div className="p-4 rounded-xl bg-[#101317] border border-white/10 space-y-1">
                <span className="text-xs font-mono text-[#C2F84F] uppercase font-bold">3. What to do?</span>
                <p className="text-xs text-white/70">Run <code className="text-[#C2F84F]">vee init</code> once, inject with <code className="text-[#C2F84F]">vee context</code>, and capture state with <code className="text-[#C2F84F]">vee capture</code>.</p>
              </div>
            </div>
          </section>

          {/* 2. The Multi-Model Problem (WHY) */}
          <section id="the-problem" className="space-y-6 pt-6 border-t border-white/10">
            <h2 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2.5">
              <AlertTriangle className="w-6 h-6 text-[#C2F84F]" />
              The Multi-Model Problem (Why Veeshree Was Built)
            </h2>

            <p className="text-sm text-white/70 leading-relaxed">
              Modern software engineering teams frequently switch between different AI models (Claude 3.5 Sonnet, GPT-4o, Gemini 2.0, Ollama) across different editors. However, AI chat histories do not provide structured memory:
            </p>

            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-[#111418] border border-white/10 space-y-2">
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-400" />
                  Problem 1: Silent Architectural Overwrites
                </h3>
                <p className="text-xs text-white/70 leading-relaxed">
                  <strong>Scenario:</strong> Model A decides to use PostgreSQL over MongoDB for ACID transactional integrity. That decision and rationale live only inside Model A&apos;s ephemeral chat window. When you open a new session in Model B, Model B only sees the code. Lacking the rationale, Model B suggests MongoDB, undoing previous work and introducing architectural regression.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#111418] border border-white/10 space-y-2">
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-yellow-400" />
                  Problem 2: Context Window Degradation & Token Waste
                </h3>
                <p className="text-xs text-white/70 leading-relaxed">
                  As conversation histories exceed 50,000+ tokens, processing entire chat logs increases token costs, creates higher latency, and causes the LLM to forget earlier system constraints (needle-in-a-haystack degradation).
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#111418] border border-white/10 space-y-2">
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-400" />
                  Problem 3: Opaque Vector DB Lock-In
                </h3>
                <p className="text-xs text-white/70 leading-relaxed">
                  External vector memory tools store embeddings in opaque, unreviewable databases. Human developers cannot audit, verify, or review what the AI remembered during Git Pull Request reviews.
                </p>
              </div>
            </div>
          </section>

          {/* 3. Core Design Principles */}
          <section id="design-principles" className="space-y-6 pt-6 border-t border-white/10">
            <h2 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2.5">
              <Lightbulb className="w-6 h-6 text-[#C2F84F]" />
              Core Design Principles
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-5 rounded-2xl bg-[#101317] border border-white/10 space-y-2">
                <h3 className="font-bold text-sm text-white">1. Human-Readable Markdown</h3>
                <p className="text-white/70 leading-relaxed">
                  Project memory is written in standard Markdown (<code className="text-[#C2F84F]">docs/memory/</code>). Developers can review, edit, and track memory changes directly through Git commits and Pull Requests.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#101317] border border-white/10 space-y-2">
                <h3 className="font-bold text-sm text-white">2. Rationale-First Memory</h3>
                <p className="text-white/70 leading-relaxed">
                  Code shows <em>what</em> was implemented. Memory captures <em>why</em> it was implemented and records explicitly rejected approaches (<code className="text-[#C2F84F]">rejected.md</code>) to prevent AI from re-proposing discarded ideas.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#101317] border border-white/10 space-y-2">
                <h3 className="font-bold text-sm text-white">3. Zero-Token Cold Start</h3>
                <p className="text-white/70 leading-relaxed">
                  Initial codebase scanning runs locally via pure heuristics in milliseconds. It discovers frameworks, Prisma schemas, API endpoints, and Git history without sending your code to any LLM.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#101317] border border-white/10 space-y-2">
                <h3 className="font-bold text-sm text-white">4. Zero Native C++ Dependencies</h3>
                <p className="text-white/70 leading-relaxed">
                  Built with pure JavaScript in-memory indexing (<code className="text-[#C2F84F]">minisearch</code>) serialized locally. No native compilation tools (Python, C++, node-gyp) needed.
                </p>
              </div>
            </div>
          </section>

          {/* 4. Installation */}
          <section id="installation" className="space-y-4 pt-6 border-t border-white/10">
            <h2 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2.5">
              <Terminal className="w-6 h-6 text-[#C2F84F]" />
              Installation
            </h2>
            <p className="text-sm text-white/70">
              Install the Veeshree CLI globally or use it with <code className="text-[#C2F84F]">npx</code>:
            </p>

            <div className="space-y-3 font-mono text-xs">
              <div className="rounded-xl bg-[#111418] border border-white/10 p-3.5 flex items-center justify-between">
                <span>npm install -g veeshree</span>
                <button
                  onClick={() => copyText("npm install -g veeshree", "npm-inst")}
                  className="p-1 rounded hover:bg-white/10 transition"
                >
                  {copiedCmd === "npm-inst" ? <Check className="w-4 h-4 text-[#C2F84F]" /> : <Copy className="w-4 h-4 text-white/50" />}
                </button>
              </div>
            </div>
          </section>

          {/* 5. Step-by-Step Guide (WHAT TO DO) */}
          <section id="step-by-step" className="space-y-8 pt-6 border-t border-white/10">
            <h2 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2.5">
              <PlayCircle className="w-6 h-6 text-[#C2F84F]" />
              Step-by-Step Practical Guide (What To Do)
            </h2>

            <div className="space-y-6 text-sm text-white/80">
              {/* Step 1 */}
              <div className="p-6 rounded-2xl bg-[#101317] border border-white/10 space-y-3">
                <div className="flex items-center gap-2 font-bold text-white">
                  <span className="w-6 h-6 rounded-full bg-[#C2F84F] text-[#08090a] flex items-center justify-center text-xs font-mono">1</span>
                  Initialize your repository
                </div>
                <p className="text-xs text-white/70 leading-relaxed">
                  Open your project terminal and run <code className="text-[#C2F84F]">vee init</code>. Veeshree automatically scans your dependencies, databases, API routes, and Git history to scaffold <code className="text-[#C2F84F]">docs/memory/</code> and register Git hooks.
                </p>
                <div className="bg-[#08090a] p-3 rounded-lg border border-white/5 font-mono text-xs text-white/90">
                  $ vee init
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-6 rounded-2xl bg-[#101317] border border-white/10 space-y-3">
                <div className="flex items-center gap-2 font-bold text-white">
                  <span className="w-6 h-6 rounded-full bg-[#C2F84F] text-[#08090a] flex items-center justify-center text-xs font-mono">2</span>
                  Generate context before asking an AI model to write code
                </div>
                <p className="text-xs text-white/70 leading-relaxed">
                  Before starting a task in Cursor, Claude Code, or ChatGPT, run <code className="text-[#C2F84F]">vee context &quot;&lt;task&gt;&quot;</code>. It assembles a tight ~2,000 token payload containing hard constraints, active milestones, and relevant architectural decisions.
                </p>
                <div className="bg-[#08090a] p-3 rounded-lg border border-white/5 font-mono text-xs text-white/90">
                  $ vee context &quot;Implement rate limiter middleware&quot;
                </div>
                <p className="text-xs text-white/50 italic">
                  Tip: If you omit the prompt, running simply <code className="text-[#C2F84F]">vee context</code> will auto-detect your active Git branch and recent commits!
                </p>
              </div>

              {/* Step 3 */}
              <div className="p-6 rounded-2xl bg-[#101317] border border-white/10 space-y-3">
                <div className="flex items-center gap-2 font-bold text-white">
                  <span className="w-6 h-6 rounded-full bg-[#C2F84F] text-[#08090a] flex items-center justify-center text-xs font-mono">3</span>
                  Capture memory updates after finishing code
                </div>
                <p className="text-xs text-white/70 leading-relaxed">
                  When the AI finishes or you complete a milestone, pass the transcript log or Git diff to <code className="text-[#C2F84F]">vee capture</code>. The background extractor reconciles decisions, marks tasks complete, and logs rejected approaches.
                </p>
                <div className="bg-[#08090a] p-3 rounded-lg border border-white/5 font-mono text-xs text-white/90">
                  $ git diff | vee capture
                </div>
              </div>

              {/* Step 4 */}
              <div className="p-6 rounded-2xl bg-[#101317] border border-white/10 space-y-3">
                <div className="flex items-center gap-2 font-bold text-white">
                  <span className="w-6 h-6 rounded-full bg-[#C2F84F] text-[#08090a] flex items-center justify-center text-xs font-mono">4</span>
                  Commit normally — Git hooks do the rest!
                </div>
                <p className="text-xs text-white/70 leading-relaxed">
                  On every commit or branch switch, the installed Git hooks automatically run <code className="text-[#C2F84F]">vee sync</code> in under 10ms to verify SHA-256 hashes of linked source files and prevent cross-branch state pollution.
                </p>
              </div>
            </div>
          </section>

          {/* 6. Command Deep-Dive */}
          <section id="command-reference" className="space-y-12 pt-6 border-t border-white/10">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                Detailed Command Deep-Dive
              </h2>
              <p className="text-sm text-white/60 mt-1">
                Explanation of what each command does, why it exists, and how to use it.
              </p>
            </div>

            {/* CMD: init */}
            <div id="cmd-init" className="p-6 rounded-2xl bg-[#101317] border border-white/10 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                <code className="text-lg font-bold font-mono text-[#C2F84F]">vee init [-f, --force]</code>
                <span className="text-xs font-mono text-white/40">Category: Lifecycle • 0 Tokens</span>
              </div>
              <div className="space-y-2 text-xs text-white/80">
                <p><strong>What is there:</strong> Creates <code className="text-[#C2F84F]">docs/memory/</code>, <code className="text-[#C2F84F]">.vee/</code>, seeds templates, and installs Git hooks.</p>
                <p><strong>Why it is implemented:</strong> Provides an instant, zero-cost foundation for new or existing codebases without needing to send code to expensive cloud LLMs.</p>
                <p><strong>What to do:</strong> Run in the root directory of any project when starting with Veeshree.</p>
              </div>
            </div>

            {/* CMD: context */}
            <div id="cmd-context" className="p-6 rounded-2xl bg-[#101317] border border-white/10 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                <code className="text-lg font-bold font-mono text-[#C2F84F]">vee context [request] [options]</code>
                <span className="text-xs font-mono text-white/40">Category: Core Engine • 0 Tokens</span>
              </div>
              <div className="space-y-2 text-xs text-white/80">
                <p><strong>What is there:</strong> Strict token-capped prompt assembler (~2,000 tokens) with BM25 decision relevance ranking and code drift warnings.</p>
                <p><strong>Why it is implemented:</strong> Prevents AI models from proposing architectures that violate locked constraints or duplicate rejected approaches.</p>
                <p><strong>Options:</strong></p>
                <div className="font-mono text-xs bg-[#08090a] p-3 rounded-lg text-white/70 space-y-1">
                  <div>-m, --max-tokens &lt;n&gt;   (default: 2000)</div>
                  <div>-t, --tasks              (include task list in context)</div>
                  <div>-j, --json               (structured JSON output)</div>
                  <div>-r, --raw                (clean stdout for piping into agents)</div>
                </div>
              </div>
            </div>

            {/* CMD: capture */}
            <div id="cmd-capture" className="p-6 rounded-2xl bg-[#101317] border border-white/10 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                <code className="text-lg font-bold font-mono text-[#C2F84F]">vee capture [--file &lt;path&gt;] [--provider &lt;p&gt;]</code>
                <span className="text-xs font-mono text-white/40">Category: AI Extraction • Low (~2k Tokens)</span>
              </div>
              <div className="space-y-2 text-xs text-white/80">
                <p><strong>What is there:</strong> Multi-provider AI extractor (Gemini, OpenAI, Ollama) that parses logs/diffs into structured JSON and writes Markdown records.</p>
                <p><strong>Why it is implemented:</strong> Automates documentation upkeep so developers do not need to manually write ADRs or update task checklists.</p>
                <p><strong>What to do:</strong> Pipe git diffs or conversation logs after coding sessions: <code className="text-[#C2F84F]">git diff | vee capture</code>.</p>
              </div>
            </div>

            {/* CMD: sync */}
            <div id="cmd-sync" className="p-6 rounded-2xl bg-[#101317] border border-white/10 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                <code className="text-lg font-bold font-mono text-[#C2F84F]">vee sync</code>
                <span className="text-xs font-mono text-white/40">Category: Maintenance • 0 Tokens</span>
              </div>
              <div className="space-y-2 text-xs text-white/80">
                <p><strong>What is there:</strong> Calculates SHA-256 hashes of all source files in <code className="text-[#C2F84F]">linked_files</code> and updates <code className="text-[#C2F84F]">.vee/index.json</code>.</p>
                <p><strong>Why it is implemented:</strong> Detects code drift if someone refactors code without updating the corresponding decision record, injecting a warning in subsequent prompts.</p>
              </div>
            </div>

            {/* CMD: status */}
            <div id="cmd-status" className="p-6 rounded-2xl bg-[#101317] border border-white/10 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                <code className="text-lg font-bold font-mono text-[#C2F84F]">vee status [-c, --check]</code>
                <span className="text-xs font-mono text-white/40">Category: Inspection • 0 Tokens</span>
              </div>
              <div className="space-y-2 text-xs text-white/80">
                <p><strong>What is there:</strong> Terminal health dashboard showing active task completion percentage, active ADR counts, and stale hash alerts.</p>
                <p><strong>What to do:</strong> Run in CI or pre-commit scripts with <code className="text-[#C2F84F]">--check</code> to block commits that contain stale code drift.</p>
              </div>
            </div>

            {/* CMD: search */}
            <div id="cmd-search" className="p-6 rounded-2xl bg-[#101317] border border-white/10 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                <code className="text-lg font-bold font-mono text-[#C2F84F]">vee search &quot;&lt;query&gt;&quot; [-a, --archived]</code>
                <span className="text-xs font-mono text-white/40">Category: Inspection • 0 Tokens</span>
              </div>
              <div className="space-y-2 text-xs text-white/80">
                <p><strong>What is there:</strong> Fast BM25 keyword search across all indexed decisions, tasks, and constraints with snippet highlighting.</p>
                <p><strong>What to do:</strong> Quickly inspect why a decision was made (e.g. <code className="text-[#C2F84F]">vee search &quot;redis&quot;</code>) without browsing files manually.</p>
              </div>
            </div>

            {/* CMD: decisions */}
            <div id="cmd-decisions" className="p-6 rounded-2xl bg-[#101317] border border-white/10 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                <code className="text-lg font-bold font-mono text-[#C2F84F]">vee decisions [-a, --all] [-s, --status &lt;status&gt;]</code>
                <span className="text-xs font-mono text-white/40">Category: Inspection • 0 Tokens</span>
              </div>
              <div className="space-y-2 text-xs text-white/80">
                <p><strong>What is there:</strong> Formatted catalog of Architectural Decision Records with active status, tags, and linked source paths.</p>
              </div>
            </div>

            {/* CMD: gc */}
            <div id="cmd-gc" className="p-6 rounded-2xl bg-[#101317] border border-white/10 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                <code className="text-lg font-bold font-mono text-[#C2F84F]">vee gc</code>
                <span className="text-xs font-mono text-white/40">Category: Maintenance • 0 Tokens</span>
              </div>
              <div className="space-y-2 text-xs text-white/80">
                <p><strong>What is there:</strong> Trims completed items in <code className="text-[#C2F84F]">current-state.md</code> to 5 items (moves excess to <code className="text-[#C2F84F]">completed-tasks.md</code>) and relocates superseded decisions to <code className="text-[#C2F84F]">archive/decisions/</code>.</p>
                <p><strong>Why it is implemented:</strong> Keeps active prompt context small and fast over long development cycles.</p>
              </div>
            </div>
          </section>

          {/* 7. Memory Directory Layout */}
          <section id="memory-layout" className="space-y-4 pt-6 border-t border-white/10">
            <h2 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2.5">
              <Layers className="w-6 h-6 text-[#C2F84F]" />
              Memory Directory Layout
            </h2>
            <p className="text-sm text-white/70">
              All memory files are human-readable Markdown files designed to be checked into version control:
            </p>

            <div className="rounded-2xl bg-[#08090a] border border-white/10 p-6 font-mono text-xs text-white/80 overflow-x-auto leading-relaxed">
              <pre>{`my-project/
├── docs/
│   └── memory/                      <-- Version-controlled human-readable memory
│       ├── decisions/               <-- Active Architectural Decision Records (ADRs)
│       │   ├── database.md
│       │   └── caching.md
│       ├── current-state.md         <-- Active feature & rolling milestone snapshot (max 5)
│       ├── tasks.md                 <-- Pending and completed task lists
│       ├── constraints.md           <-- Locked architectural & security rules (Never violate)
│       ├── discoveries.md           <-- System behaviors & technical findings
│       ├── rejected.md              <-- Discarded alternatives & trade-offs
│       └── archive/                 <-- Historical records pruned by 'vee gc'
│           ├── completed-tasks.md
│           └── decisions/
├── .vee/                            <-- Local search cache & config (Git ignored)
│   ├── config.json                  <-- Preferences & local API key storage
│   └── index.json                   <-- Fast MiniSearch index & SHA-256 code hashes
└── .git/hooks/                      <-- Automated Git synchronization
    ├── pre-commit                   <-- Code drift validator
    └── post-checkout                <-- Cross-branch re-indexing trigger`}</pre>
            </div>
          </section>

          {/* 8. Token Budget Allocation */}
          <section id="token-budget" className="space-y-4 pt-6 border-t border-white/10">
            <h2 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2.5">
              <Cpu className="w-6 h-6 text-[#C2F84F]" />
              Strict Token Budget Pipeline (~2,000 Tokens Max)
            </h2>
            <p className="text-sm text-white/70 leading-relaxed">
              When preparing prompt injections for an AI model, Veeshree applies a strict token budget with hierarchical prioritization so critical rules are never truncated:
            </p>

            <div className="p-6 rounded-2xl bg-[#101317] border border-white/10 space-y-4 text-xs font-mono">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-[#C2F84F] font-bold">1. System Context & Rules</span>
                <span>~300 Tokens [CRITICAL - NEVER TRUNCATED]</span>
              </div>
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-[#C2F84F] font-bold">2. Active Hard Constraints</span>
                <span>~200 Tokens [CRITICAL - NEVER TRUNCATED]</span>
              </div>
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-[#C2F84F] font-bold">3. Current Project State Snapshot</span>
                <span>~400 Tokens [HIGH PRIORITY]</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#C2F84F] font-bold">4. Top Matching Decisions (BM25)</span>
                <span>~1,100 Tokens [DYNAMICALLY ALLOCATED]</span>
              </div>
            </div>
          </section>
        </main>
      </div>

      <Footer />
    </div>
  );
}
