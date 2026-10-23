import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { AnthropicExtractor } from "../src/providers/anthropic.js";
import { OpenAIExtractor } from "../src/providers/openai.js";
import { GeminiExtractor } from "../src/providers/gemini.js";
import { OllamaExtractor } from "../src/providers/ollama.js";
import { LmStudioExtractor } from "../src/providers/lmstudio.js";
import { resolveEngine } from "../src/providers/resolver.js";
import {
  loadModelsConfig,
  getDefaultModels,
  validateModel,
  verifyModelEndpoint,
} from "../src/providers/models.js";
import { detectAvailableModels } from "../src/core/models.js";
import { cleanJsonText, validateExtractionJson } from "../src/providers/common.js";
import { VeeError } from "../src/utils/errors.js";

const sampleExtractionJson = JSON.stringify({
  decisions: [
    {
      title: "Sample Decision",
      decision: "Adopt TypeScript",
      reason: "Type safety",
      alternatives_considered: ["JavaScript"],
      linked_files: ["src/index.ts"],
      status: "active",
      tags: ["architecture"],
    },
  ],
  current_state: {
    current_feature: "Phase D",
    completed_in_session: ["E2E tests"],
    next_immediate_steps: ["Release"],
  },
  tasks: [{ task_name: "Phase D Task", action: "complete" }],
  constraints: [{ rule: "Strict typechecking", type: "hard", source: "cli" }],
  rejected_approaches: [{ approach: "Disable TS", reason: "Unsafe" }],
  discoveries: ["V8 coverage works"],
});

describe("Providers and Engine Coverage Suite", () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  describe("common.ts", () => {
    it("cleans markdown fences and parses valid extraction JSON", () => {
      const fenced = "```json\n" + sampleExtractionJson + "\n```";
      const cleaned = cleanJsonText(fenced);
      expect(cleaned).toContain("Sample Decision");

      const parsed = validateExtractionJson(fenced);
      expect(parsed.decisions[0].title).toBe("Sample Decision");

      expect(() => validateExtractionJson("invalid json text")).toThrow(VeeError);
    });
  });

  describe("AnthropicExtractor", () => {
    const extractor = new AnthropicExtractor();

    it("requires an API key", async () => {
      await expect(extractor.extract("diff", "claude-3-5-sonnet", {})).rejects.toThrow("API key is required");
    });

    it("successfully parses Anthropic messages response", async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          content: [{ text: sampleExtractionJson }],
        }),
      } as any);

      const res = await extractor.extract("payload", "claude-3-5-sonnet", {
        apiKey: "sk-ant-test12345",
      });
      expect(res.decisions[0].title).toBe("Sample Decision");
    });

    it("handles Anthropic API errors and empty content", async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        text: async () => "Unauthorized",
      } as any);

      await expect(
        extractor.extract("payload", "claude-3-5-sonnet", { apiKey: "sk-ant-bad" })
      ).rejects.toThrow("Anthropic API returned status 401");

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ content: [] }),
      } as any);

      await expect(
        extractor.extract("payload", "claude-3-5-sonnet", { apiKey: "sk-ant-ok" })
      ).rejects.toThrow("empty completion content");
    });
  });

  describe("OpenAIExtractor", () => {
    const extractor = new OpenAIExtractor();

    it("requires an API key for OpenAI", async () => {
      await expect(extractor.extract("diff", "gpt-4o", {})).rejects.toThrow("API key is required");
    });

    it("successfully parses OpenAI chat completions response", async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: sampleExtractionJson } }],
        }),
      } as any);

      const res = await extractor.extract("payload", "gpt-4o", { apiKey: "sk-test12345" });
      expect(res.decisions[0].title).toBe("Sample Decision");
    });

    it("handles OpenAI API error responses", async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 429,
        text: async () => "Rate limit exceeded",
      } as any);

      await expect(
        extractor.extract("payload", "gpt-4o", { apiKey: "sk-test" })
      ).rejects.toThrow(/OpenAI API returned status 429/i);
    });
  });

  describe("GeminiExtractor", () => {
    const extractor = new GeminiExtractor();

    it("requires an API key for Gemini", async () => {
      await expect(extractor.extract("diff", "gemini-2.0-flash", {})).rejects.toThrow("API key is required");
    });

    it("successfully parses Google Gemini response", async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          candidates: [{ content: { parts: [{ text: sampleExtractionJson }] } }],
        }),
      } as any);

      const res = await extractor.extract("payload", "gemini-2.0-flash", { apiKey: "AIzaTestKey" });
      expect(res.decisions[0].title).toBe("Sample Decision");
    });

    it("handles Gemini error responses", async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        text: async () => "Internal server error",
      } as any);

      await expect(
        extractor.extract("payload", "gemini-2.0-flash", { apiKey: "AIzaTest" })
      ).rejects.toThrow("Gemini API returned status 500");
    });
  });

  describe("OllamaExtractor and LmStudioExtractor", () => {
    it("handles Ollama extract and listModels", async () => {
      const ollama = new OllamaExtractor();
      expect(ollama.isLocal).toBe(true);

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ response: sampleExtractionJson }),
      } as any);

      const res = await ollama.extract("diff", "llama3.2", { baseUrl: "http://localhost:11434" });
      expect(res.decisions[0].title).toBe("Sample Decision");

      // Test fallback to default model selection when activeModel is 'default'
      globalThis.fetch = vi.fn().mockImplementation((url: string) => {
        if (url.includes("/api/tags")) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ models: [{ name: "llama3.2:latest" }] }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ response: sampleExtractionJson }),
        });
      });

      const resDefault = await ollama.extract("diff", "default", { baseUrl: "http://localhost:11434" });
      expect(resDefault.decisions[0].title).toBe("Sample Decision");
    });

    it("handles LmStudio chat completions extract", async () => {
      const lmstudio = new LmStudioExtractor();
      expect(lmstudio.isLocal).toBe(true);

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: sampleExtractionJson } }],
        }),
      } as any);

      const res = await lmstudio.extract("diff", "qwen2.5-coder", { baseUrl: "http://localhost:1234" });
      expect(res.decisions[0].title).toBe("Sample Decision");
    });
  });

  describe("models and resolver", () => {
    it("loads models config and defaults", () => {
      const config = loadModelsConfig();
      expect(config.defaults).toBeDefined();
      expect(config.known_models).toBeDefined();

      const defaults = getDefaultModels();
      expect(defaults.anthropic).toBeDefined();
      expect(defaults.gemini).toBeDefined();
    });

    it("validates known and unknown models with suggestions", () => {
      const valid = validateModel("anthropic", "claude-3-5-sonnet-20241022");
      expect(valid.valid).toBe(true);

      const invalid = validateModel("anthropic", "claude-retired-model");
      expect(invalid.valid).toBe(false);
      expect(invalid.suggested).toBeDefined();
    });

    it("verifies model endpoints", async () => {
      const check = await verifyModelEndpoint("gemini", "gemini-2.0-flash");
      expect(check.ok).toBe(true);

      const checkUnknown = await verifyModelEndpoint("gemini", "gemini-nonexistent-123");
      expect(checkUnknown.ok).toBe(false);
    });

    it("resolves all supported providers in resolveEngine", async () => {
      // Local or mock cloud consent
      const testDir = process.cwd();
      const origCloud = process.env.VEE_ALLOW_CLOUD;
      process.env.VEE_ALLOW_CLOUD = "true";

      try {
        const geminiRes = await resolveEngine(testDir, "gemini", "gemini-2.0-flash");
        expect(geminiRes.provider).toBe("gemini");

        const openaiRes = await resolveEngine(testDir, "openai", "gpt-4o-mini");
        expect(openaiRes.provider).toBe("openai");

        const anthropicRes = await resolveEngine(testDir, "anthropic", "claude-3-5-sonnet-20241022");
        expect(anthropicRes.provider).toBe("anthropic");

        const groqRes = await resolveEngine(testDir, "groq", "llama-3.3-70b-versatile");
        expect(groqRes.provider).toBe("groq");

        const nvidiaRes = await resolveEngine(testDir, "nvidia", "meta/llama-3.1-70b-instruct");
        expect(nvidiaRes.provider).toBe("nvidia");

        const lmstudioRes = await resolveEngine(testDir, "lmstudio", "default");
        expect(lmstudioRes.provider).toBe("lmstudio");

        await expect(resolveEngine(testDir, "unsupported-provider")).rejects.toThrow(VeeError);
        const resolvedUnlisted = await resolveEngine(testDir, "openai", "non-existent-gpt-999");
        expect(resolvedUnlisted.model).toBe("non-existent-gpt-999");
      } finally {
        if (origCloud) process.env.VEE_ALLOW_CLOUD = origCloud;
        else delete process.env.VEE_ALLOW_CLOUD;
      }
    });

    it("handles HTTP error status codes across extractors", async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        text: async () => "Internal server error occurred",
      } as any);

      const gemini = new GeminiExtractor();
      await expect(gemini.extract("diff", "gemini-2.0-flash", { apiKey: "key" })).rejects.toThrow(VeeError);

      const openai = new OpenAIExtractor();
      await expect(openai.extract("diff", "gpt-4o-mini", { apiKey: "key" })).rejects.toThrow(VeeError);

      const anthropic = new AnthropicExtractor();
      await expect(anthropic.extract("diff", "claude-3-5-sonnet-20241022", { apiKey: "key" })).rejects.toThrow(VeeError);

      const ollama = new OllamaExtractor();
      await expect(ollama.extract("diff", "llama3.2")).rejects.toThrow(VeeError);

      const lmstudio = new LmStudioExtractor();
      await expect(lmstudio.extract("diff", "default")).rejects.toThrow(VeeError);
    });
  });
});

