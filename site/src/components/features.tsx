"use client";

import React, { useState } from "react";
import { Copy, Check, Terminal, Cpu, Database, RefreshCw, GitBranch, ShieldCheck, Zap } from "lucide-react";

export function FeaturesSection() {
  const [activeTab, setActiveTab] = useState<"init" | "context" | "sync" | "capture">("context");
  const [copied, setCopied] = useState(false);

  const codeSnippets = {
    init: `$ vee init
ℹ Creating directory hierarchies...
ℹ Running zero-token heuristic scanner...
ℹ Detected languages: JavaScript / TypeScript, Python
ℹ Detected frameworks: Next.js, FastAPI
ℹ Detected databases: PostgreSQL, Prisma ORM
✔ Generated config at .vee/config.json
✔ Seeded docs/memory/current-state.md
✔ Installed Git pre-commit & post-checkout hooks
✔ Veeshree initialized successfully!`,
    context: `$ vee context "Implement Redis Rate Limiter"
==================================================
## VEESHREE PERSISTENCE LAYER: SYSTEM CONTEXT & RULES
You are operating within a project utilizing Veeshree for model-independent memory persistence.
1. All architectural decisions, constraints, and current milestones are persistent across AI sessions.
2. You must respect all Hard Constraints listed below. Do not propose architectures that contradict recorded decisions.

==================================================
## ACTIVE ARCHITECTURAL CONSTRAINTS
- **Hard Rule**: Zero native C++ compilation dependencies.
- **Hard Rule**: All rate limiter middleware must support Redis clustered key tags.

==================================================
## RELEVANT ARCHITECTURAL DECISION RECORDS (ADRs)
### Decision: Redis Caching Strategy (docs/memory/decisions/caching.md)
We use Redis in-memory cache for distributed state and token bucket rate limits.
Linked Source Files: src/lib/redis.ts, src/middleware/rateLimiter.ts`,
    sync: `$ vee sync
ℹ Indexed 8 memory documents.
✔ All memory records are in sync with codebase hashes.
✔ Saved updated index to .vee/index.json`,
    capture: `$ vee capture --file session.log
ℹ Extracting structural memory delta via background LLM...
✔ Structured extraction completed successfully.
✔ Created new ADR: docs/memory/decisions/redis-rate-limiter.md
✔ Updated memory files: docs/memory/current-state.md, docs/memory/tasks.md
✔ Veeshree memory synchronized with codebase!`,
  };

  const copyCode = () => {
    navigator.clipboard.writeText(codeSnippets[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="features" className="py-24 px-6 max-w-7xl mx-auto border-t border-white/10">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="text-xs font-mono text-[#C2F84F] uppercase tracking-widest">
          Developer Workflow
        </span>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-white mt-3 tracking-tight">
          How Veeshree Powers AI Engineering
        </h2>
        <p className="text-white/70 text-base sm:text-lg mt-4 leading-relaxed">
          From zero-token cold start initialization to real-time hash drift protection and automated background memory capture.
        </p>
      </div>

      {/* Terminal Interactive Showcase */}
      <div className="rounded-2xl bg-[#0c0f12] border border-white/10 overflow-hidden shadow-2xl">
        {/* Terminal Header */}
        <div className="bg-[#14181d] px-4 py-3 border-b border-white/10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
            <span className="text-xs font-mono text-white/50 ml-2">veeshree-cli</span>
          </div>

          <div className="flex items-center gap-1 bg-[#08090a] p-1 rounded-lg border border-white/10">
            {(["init", "context", "sync", "capture"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 rounded text-xs font-mono transition-all ${
                  activeTab === tab
                    ? "bg-[#C2F84F] text-[#08090a] font-bold shadow"
                    : "text-white/60 hover:text-white"
                }`}
              >
                vee {tab}
              </button>
            ))}
          </div>

          <button
            onClick={copyCode}
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-white/5 hover:bg-white/10 text-xs font-mono text-white/80 transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#C2F84F]" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Copy Output</span>
          </button>
        </div>

        {/* Terminal Body */}
        <div className="p-6 font-mono text-xs sm:text-sm overflow-x-auto text-white/90 bg-[#08090a] min-h-[300px]">
          <pre className="leading-relaxed whitespace-pre-wrap">{codeSnippets[activeTab]}</pre>
        </div>
      </div>

      {/* 4 Feature Pillars */}
      <div id="architecture" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
        <div className="p-6 rounded-2xl bg-[#101317] border border-white/5 hover:border-[#C2F84F]/30 transition-all">
          <Cpu className="w-8 h-8 text-[#C2F84F] mb-4" />
          <h3 className="font-bold text-white text-base mb-2">Zero-Token Scanner</h3>
          <p className="text-xs text-white/70 leading-relaxed">
            Parses manifests, Prisma schemas, Docker configs, and Git histories in milliseconds without sending code to LLMs.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-[#101317] border border-white/5 hover:border-[#C2F84F]/30 transition-all">
          <Zap className="w-8 h-8 text-[#C2F84F] mb-4" />
          <h3 className="font-bold text-white text-base mb-2">Pure JS BM25 Search</h3>
          <p className="text-xs text-white/70 leading-relaxed">
            Zero native compilation dependencies. Uses lightweight MiniSearch serialized locally to <code className="text-[#C2F84F]">.vee/index.json</code>.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-[#101317] border border-white/5 hover:border-[#C2F84F]/30 transition-all">
          <ShieldCheck className="w-8 h-8 text-[#C2F84F] mb-4" />
          <h3 className="font-bold text-white text-base mb-2">Code Drift Integrity</h3>
          <p className="text-xs text-white/70 leading-relaxed">
            Git hooks compute SHA-256 hashes of linked source files to alert AI agents whenever code changes without memory updates.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-[#101317] border border-white/5 hover:border-[#C2F84F]/30 transition-all">
          <RefreshCw className="w-8 h-8 text-[#C2F84F] mb-4" />
          <h3 className="font-bold text-white text-base mb-2">Rolling GC & Archival</h3>
          <p className="text-xs text-white/70 leading-relaxed">
            Capped rolling progress buffers. Superseded decisions are automatically moved to <code className="text-[#C2F84F]">archive/</code> to prevent bloat.
          </p>
        </div>
      </div>
    </section>
  );
}
