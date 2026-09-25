"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import React, { useRef, useState } from "react";
import Link from "next/link";
import { Terminal, Copy, Check, ArrowRight, Shield, Zap, RefreshCw, Cpu, Database, GitBranch, Layers } from "lucide-react";

export function HeroScroll() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
  });

  const [copied, setCopied] = useState(false);

  const copyInstall = () => {
    navigator.clipboard.writeText("npm install -g veeshree");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section
      ref={ref}
      className="relative mx-auto flex h-[350vh] w-screen flex-col items-center overflow-hidden bg-[#08090a] px-4 text-white"
    >
      {/* Background radial glow */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#C2F84F]/10 blur-[140px] pointer-events-none -z-10 rounded-full" />

      {/* Hero Title and Interactive Scroll Path */}
      <div className="mt-32 relative flex w-fit max-w-5xl flex-col items-center justify-center gap-6 text-center z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-[#C2F84F]">
          <span className="w-2 h-2 rounded-full bg-[#C2F84F] animate-pulse" />
          Local-First • Model-Independent Context Layer
        </div>

        <h1 className="text-5xl sm:text-7xl lg:text-8xl font-extrabold tracking-tight leading-[1.05] text-white">
          The Memory Layer <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/90 to-[#C2F84F]">
            For AI Software Engineering
          </span>
        </h1>

        <p className="max-w-2xl text-lg sm:text-xl font-normal text-white/70 leading-relaxed">
          Decouple project architecture from ephemeral LLM chats. Persist decisions, constraints, and state as version-controlled Markdown in <code className="text-[#C2F84F] bg-white/5 px-2 py-0.5 rounded font-mono text-sm">/docs/memory/</code>.
        </p>

        {/* NPM Install & Quick Links CTA */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
          <div className="flex items-center bg-[#111418] border border-white/10 rounded-xl p-1.5 shadow-2xl">
            <span className="px-3 font-mono text-xs text-white/50 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[#C2F84F]" />
              $
            </span>
            <code className="font-mono text-sm text-white pr-4">npm i -g veeshree</code>
            <button
              onClick={copyInstall}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition active:scale-95"
              title="Copy to clipboard"
            >
              {copied ? <Check className="w-4 h-4 text-[#C2F84F]" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <Link
            href="/docs"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#C2F84F] text-[#08090a] font-bold text-sm hover:bg-[#b0e83f] transition-all hover:shadow-[0_0_25px_rgba(194,248,79,0.35)]"
          >
            Explore Documentation
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <p className="text-xs font-mono text-white/40 tracking-wider uppercase mt-4">
          Scroll down to explore architecture & features
        </p>

        {/* Dynamic Animated Path */}
        <LinePath
          className="absolute -right-[45%] top-10 pointer-events-none -z-10 opacity-70"
          scrollYProgress={scrollYProgress}
        />
      </div>

      {/* Feature & Architecture Reveal Card (Scroll Triggered) */}
      <div className="rounded-3xl w-full max-w-6xl translate-y-[150vh] bg-[#101317] border border-white/10 p-8 sm:p-12 text-white shadow-[0_20px_80px_rgba(0,0,0,0.8)] z-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-8">
          <div>
            <span className="text-xs font-mono text-[#C2F84F] uppercase tracking-wider">Zero Token Bloat • Zero Native Dependencies</span>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mt-2">
              Persistent Memory. <br />
              Deterministic AI.
            </h2>
          </div>
          <Link
            href="/docs"
            className="flex items-center gap-2 text-sm font-semibold text-[#C2F84F] hover:underline"
          >
            Read Technical Spec & Roadmap &rarr;
          </Link>
        </div>

        {/* 3 Core Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="p-6 rounded-2xl bg-[#161a20] border border-white/5 hover:border-[#C2F84F]/30 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-[#C2F84F]/10 flex items-center justify-center text-[#C2F84F] mb-4 group-hover:scale-110 transition-transform">
              <GitBranch className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg text-white mb-2">Git-Native Versioning</h3>
            <p className="text-sm text-white/70 leading-relaxed">
              No opaque vector DB lock-in. Architectural Decision Records (ADRs) live as Markdown directly in your Git repository.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#161a20] border border-white/5 hover:border-[#C2F84F]/30 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-[#C2F84F]/10 flex items-center justify-center text-[#C2F84F] mb-4 group-hover:scale-110 transition-transform">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg text-white mb-2">SHA-256 Drift Protection</h3>
            <p className="text-sm text-white/70 leading-relaxed">
              Hooks verify SHA-256 hashes of linked source files to alert AI agents when implementation diverges from recorded decisions.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#161a20] border border-white/5 hover:border-[#C2F84F]/30 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-[#C2F84F]/10 flex items-center justify-center text-[#C2F84F] mb-4 group-hover:scale-110 transition-transform">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg text-white mb-2">Strict Token Capping</h3>
            <p className="text-sm text-white/70 leading-relaxed">
              Dynamically packs ~2,000 tokens maximum with strict prioritization: Rules &rarr; Constraints &rarr; State &rarr; BM25 Decision matches.
            </p>
          </div>
        </div>

        {/* Footer info bar */}
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-white/50 gap-4">
          <div>npm package: <span className="text-[#C2F84F]">veeshree@0.1.0</span></div>
          <div>MIT Licensed • Model Agnostic (Claude, GPT-4o, Gemini, Ollama)</div>
        </div>
      </div>
    </section>
  );
}

const LinePath = ({
  className,
  scrollYProgress,
}: {
  className: string;
  scrollYProgress: any;
}) => {
  const pathLength = useTransform(scrollYProgress, [0, 1], [0.3, 1]);

  return (
    <svg
      width="1278"
      height="2319"
      viewBox="0 0 1278 2319"
      fill="none"
      overflow="visible"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <motion.path
        d="M876.605 394.131C788.982 335.917 696.198 358.139 691.836 416.303C685.453 501.424 853.722 498.43 941.95 409.714C1016.1 335.156 1008.64 186.907 906.167 142.846C807.014 100.212 712.699 198.494 789.049 245.127C889.053 306.207 986.062 116.979 840.548 43.3233C743.932 -5.58141 678.027 57.1682 672.279 112.188C666.53 167.208 712.538 172.943 736.353 163.088C760.167 153.234 764.14 120.924 746.651 93.3868C717.461 47.4252 638.894 77.8642 601.018 116.979C568.164 150.908 557 201.079 576.467 246.924C593.342 286.664 630.24 310.55 671.68 302.614C756.114 286.446 729.747 206.546 681.86 186.442C630.54 164.898 492 209.318 495.026 287.644C496.837 334.494 518.402 366.466 582.455 367.287C680.013 368.538 771.538 299.456 898.634 292.434C1007.02 286.446 1192.67 309.384 1242.36 382.258C1266.99 418.39 1273.65 443.108 1247.75 474.477C1217.32 511.33 1149.4 511.259 1096.84 466.093C1044.29 420.928 1029.14 380.576 1033.97 324.172C1038.31 273.428 1069.55 228.986 1117.2 216.384C1152.2 207.128 1188.29 213.629 1194.45 245.127C1201.49 281.062 1132.22 280.104 1100.44 272.673C1065.32 264.464 1044.22 234.837 1032.77 201.413C1019.29 162.061 1029.71 131.126 1056.44 100.965C1086.19 67.4032 1143.96 54.5526 1175.78 86.1513C1207.02 117.17 1186.81 143.379 1156.22 166.691C1112.57 199.959 1052.57 186.238 999.784 155.164C957.312 130.164 899.171 63.7054 931.284 26.3214C952.068 2.12513 996.288 3.87363 1007.22 43.58C1018.15 83.2749 1003.56 122.644 975.969 163.376C948.377 204.107 907.272 255.122 913.558 321.045C919.727 385.734 990.968 497.068 1063.84 503.35C1111.46 507.456 1166.79 511.984 1175.68 464.527C1191.52 379.956 1101.26 334.985 1030.29 377.017C971.109 412.064 956.297 483.647 953.797 561.655C947.587 755.413 1197.56 941.828 936.039 1140.66C745.771 1285.32 321.926 950.737 134.536 1202.19C-6.68295 1391.68 -53.4837 1655.38 131.935 1760.5C478.381 1956.91 1124.19 1515 1201.28 1997.83C1273.66 2451.23 100.805 1864.7 303.794 2668.89"
        stroke="#C2F84F"
        strokeWidth="14"
        style={{
          pathLength,
          strokeDashoffset: useTransform(pathLength, (value) => 1 - value),
        }}
      />
    </svg>
  );
};
