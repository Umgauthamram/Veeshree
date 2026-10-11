import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://veeshree.dev"),
  title: {
    default: "Veeshree | The Shared Memory Layer for AI Coding Agents & Developers",
    template: "%s | Veeshree - Shared Memory for AI",
  },
  description:
    "Veeshree is the open-source shared memory persistence layer for AI software engineering. Connect Cursor, Claude Code, Copilot, and Gemini with persistent shared memory, architectural decision records, and SHA-256 code drift detection in Git-native Markdown.",
  keywords: [
    "shared memory",
    "shared memory for AI",
    "shared memory for AI agents",
    "shared memory AI development",
    "AI shared memory layer",
    "cross-agent shared memory",
    "AI coding agent shared memory",
    "developer shared memory",
    "AI context persistence",
    "Cursor shared memory",
    "Claude Code shared memory",
    "Copilot shared memory",
    "Gemini shared memory",
    "architectural decision records",
    "local AI memory",
    "BM25 prompt context injection",
    "multi-agent coding context",
    "Git-native AI memory",
    "Veeshree",
  ],
  authors: [{ name: "Veeshree Team", url: "https://veeshree.dev" }],
  creator: "Veeshree",
  publisher: "Veeshree",
  applicationName: "Veeshree",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://veeshree.dev",
    siteName: "Veeshree",
    title: "Veeshree | The Shared Memory Layer for AI Coding Agents",
    description:
      "Unified, persistent shared memory for Cursor, Claude Code, Copilot, and Gemini. Version-controlled Markdown in docs/memory/ with zero vendor lock-in.",
    images: [
      {
        url: "/duna-hero-sunset.jpg",
        width: 1200,
        height: 630,
        alt: "Veeshree - The Shared Memory Layer for AI Coding Agents",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Veeshree | The Shared Memory Layer for AI Coding Agents",
    description:
      "Decouple architectural decisions, hard constraints, and task progress from temporary chat sessions. Shared memory stored as version-controlled Markdown.",
    images: ["/duna-hero-sunset.jpg"],
    creator: "@veeshree",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "@id": "https://veeshree.dev/#software",
      name: "Veeshree",
      url: "https://veeshree.dev",
      applicationCategory: "DeveloperApplication",
      operatingSystem: "macOS, Linux, Windows",
      description:
        "The open-source shared memory persistence layer for AI software engineering. Connects Cursor, Claude Code, Copilot, and Gemini through Git-native Markdown memory.",
      softwareVersion: "0.3.1",
      license: "https://opensource.org/licenses/MIT",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      featureList: [
        "Shared Memory for AI Coding Agents",
        "Cross-IDE Shared Context Persistence",
        "SHA-256 Cryptographic Drift Detection",
        "Token-Budgeted Context Injection (~2000 tokens)",
        "Ambient Diff Extractor with Zero CLI Friction",
        "Multi-Provider LLM Integration (Gemini, Groq, NVIDIA, OpenAI, Ollama)",
      ],
      keywords:
        "shared memory, shared memory AI, shared memory for AI agents, developer shared memory, AI context persistence",
    },
    {
      "@type": "WebSite",
      "@id": "https://veeshree.dev/#website",
      url: "https://veeshree.dev",
      name: "Veeshree",
      description: "The Shared Memory Layer for AI Coding Agents & Developers",
      publisher: {
        "@type": "Organization",
        name: "Veeshree",
        url: "https://veeshree.dev",
      },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: "https://veeshree.dev/docs/commands/search?q={search_term_string}",
        },
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${poppins.variable} font-sans h-full antialiased`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
