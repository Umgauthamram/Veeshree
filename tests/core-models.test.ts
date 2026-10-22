import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import http from "node:http";
import { detectAvailableModels, resolveActiveEngine } from "../src/core/models.js";
import {
  handleModelsCommand,
  handleModelsUseCommand,
  handleModelsPullCommand,
} from "../src/commands/models.js";
import { initializeVeeshree } from "../src/commands/init.js";
import { setApiKey } from "../src/core/auth.js";
import { saveConfig, loadConfig } from "../src/core/config.js";
import { VeeError } from "../src/utils/errors.js";
import * as processUtils from "../src/utils/process.js";

describe("core/models.ts and commands/models.ts Suite", () => {
  let tempDir: string;
  const envBackup = { ...process.env };

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "vee-models-test-"));
    initializeVeeshree(tempDir);
    delete process.env.GEMINI_API_KEY;
    delete process.env.GROQ_API_KEY;
    delete process.env.NVIDIA_API_KEY;
    delete process.env.OPENAI_API_KEY;
  });

  afterEach(() => {
    process.env = { ...envBackup };
    vi.restoreAllMocks();
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch {
      // ignore
    }
  });

  describe("resolveActiveEngine with explicit overrides", () => {
    it("resolves explicit ollama override", async () => {
      const res = await resolveActiveEngine(tempDir, "ollama", "qwen2.5");
      expect(res.provider).toBe("ollama");
      expect(res.model).toBe("qwen2.5");
      expect(res.isLocal).toBe(true);
    });

    it("resolves explicit lmstudio override", async () => {
      const res = await resolveActiveEngine(tempDir, "lmstudio", "deepseek-r1");
      expect(res.provider).toBe("lmstudio");
      expect(res.model).toBe("deepseek-r1");
      expect(res.isLocal).toBe(true);
    });

    it("throws when explicit cloud provider has no API key", async () => {
      await expect(resolveActiveEngine(tempDir, "gemini")).rejects.toThrow(/API key for 'gemini' not found/);
    });

    it("resolves explicit gemini with keystore key", async () => {
      setApiKey("gemini", "test-gemini-key", tempDir, false);
      const res = await resolveActiveEngine(tempDir, "gemini", "gemini-2.0-flash");
      expect(res.provider).toBe("gemini");
      expect(res.apiKey).toBe("test-gemini-key");
    });

    it("resolves explicit groq with keystore key", async () => {
      setApiKey("groq", "test-groq-key", tempDir, false);
      const res = await resolveActiveEngine(tempDir, "groq");
      expect(res.provider).toBe("groq");
      expect(res.model).toBe("llama-3.3-70b-versatile");
      expect(res.apiKey).toBe("test-groq-key");
    });

    it("resolves explicit nvidia with keystore key", async () => {
      setApiKey("nvidia", "test-nvidia-key", tempDir, false);
      const res = await resolveActiveEngine(tempDir, "nvidia");
      expect(res.provider).toBe("nvidia");
      expect(res.model).toBe("meta/llama-3.1-70b-instruct");
      expect(res.apiKey).toBe("test-nvidia-key");
    });

    it("resolves explicit openai with keystore key", async () => {
      setApiKey("openai", "test-openai-key", tempDir, false);
      const res = await resolveActiveEngine(tempDir, "openai");
      expect(res.provider).toBe("openai");
      expect(res.model).toBe("gpt-4o-mini");
      expect(res.apiKey).toBe("test-openai-key");
    });

    it("throws on unsupported custom provider", async () => {
      await expect(resolveActiveEngine(tempDir, "unsupported-provider")).rejects.toThrow(
        /API key for 'unsupported-provider' not found/
      );

      setApiKey("unsupported" as any, "dummy-key", tempDir, false);
      await expect(resolveActiveEngine(tempDir, "unsupported")).rejects.toThrow(
        /Unsupported provider 'unsupported'/
      );
    });
  });

  describe("resolveActiveEngine fallback cascade", () => {
    beforeEach(() => {
      vi.spyOn(http, "request").mockImplementation((_options: any, _callback: any) => {
        const req = new (require("node:events").EventEmitter)();
        (req as any).end = () => {
          setTimeout(() => req.emit("error", new Error("ECONNREFUSED")), 1);
        };
        (req as any).destroy = vi.fn();
        return req as any;
      });
    });

    it("falls back to configured default_extractor when key exists", async () => {
      const cfg = loadConfig(tempDir);
      cfg.default_extractor = { provider: "groq", model: "llama-3.1-8b-instant" };
      saveConfig(cfg, tempDir);
      setApiKey("groq", "test-groq-key", tempDir, false);

      const res = await resolveActiveEngine(tempDir);
      expect(res.provider).toBe("groq");
      expect(res.model).toBe("llama-3.1-8b-instant");
    });

    it("falls back to configured default_extractor for nvidia and openai", async () => {
      const cfg = loadConfig(tempDir);
      cfg.default_extractor = { provider: "nvidia", model: "custom-nvidia" };
      saveConfig(cfg, tempDir);
      setApiKey("nvidia", "test-nvidia-key", tempDir, false);

      const resNvidia = await resolveActiveEngine(tempDir);
      expect(resNvidia.provider).toBe("nvidia");
      expect(resNvidia.model).toBe("custom-nvidia");

      cfg.default_extractor = { provider: "openai", model: "custom-openai" };
      saveConfig(cfg, tempDir);
      setApiKey("openai", "test-openai-key", tempDir, false);

      const resOpenai = await resolveActiveEngine(tempDir);
      expect(resOpenai.provider).toBe("openai");
      expect(resOpenai.model).toBe("custom-openai");
    });

    it("falls back to Gemini via environment variable", async () => {
      process.env.GEMINI_API_KEY = "env-gemini-key";
      const res = await resolveActiveEngine(tempDir);
      expect(res.provider).toBe("gemini");
      expect(res.source).toContain("$GEMINI_API_KEY");
      expect(res.apiKey).toBe("env-gemini-key");
    });

    it("falls back to Groq via environment variable", async () => {
      process.env.GROQ_API_KEY = "env-groq-key";
      const res = await resolveActiveEngine(tempDir);
      expect(res.provider).toBe("groq");
      expect(res.source).toContain("$GROQ_API_KEY");
    });

    it("falls back to NVIDIA via environment variable", async () => {
      process.env.NVIDIA_API_KEY = "env-nvidia-key";
      const res = await resolveActiveEngine(tempDir);
      expect(res.provider).toBe("nvidia");
      expect(res.source).toContain("$NVIDIA_API_KEY");
    });

    it("falls back to OpenAI via environment variable", async () => {
      process.env.OPENAI_API_KEY = "env-openai-key";
      const res = await resolveActiveEngine(tempDir);
      expect(res.provider).toBe("openai");
      expect(res.source).toContain("$OPENAI_API_KEY");
    });

    it("throws error when no engines or keys are detected", async () => {
      await expect(resolveActiveEngine(tempDir)).rejects.toThrow(
        /No active AI engine or API key detected/
      );
    });
  });

  describe("detectAvailableModels with mocked local HTTP services", () => {
    it("detects local Ollama and LM Studio when ports respond", async () => {
      const originalRequest = http.request;
      vi.spyOn(http, "request").mockImplementation((options: any, callback: any) => {
        const port = Number(options.port);
        const req = new (require("node:events").EventEmitter)();
        (req as any).end = () => {
          const res = new (require("node:events").EventEmitter)();
          (res as any).statusCode = 200;
          if (callback) callback(res);

          setTimeout(() => {
            if (port === 11434) {
              res.emit("data", JSON.stringify({ models: [{ name: "llama3:latest" }] }));
            } else if (port === 1234) {
              res.emit("data", JSON.stringify({ data: [{ id: "qwen2.5-coder" }] }));
            } else {
              res.emit("data", "{}");
            }
            res.emit("end");
          }, 5);
        };
        (req as any).destroy = vi.fn();
        return req as any;
      });

      const models = await detectAvailableModels(tempDir);
      const ollama = models.find((m) => m.provider === "ollama");
      expect(ollama?.status).toBe("available");
      expect(ollama?.models).toContain("llama3:latest");

      const lmstudio = models.find((m) => m.provider === "lmstudio");
      expect(lmstudio?.status).toBe("available");
      expect(lmstudio?.models).toContain("qwen2.5-coder");

      // Now resolveActiveEngine should pick ollama first!
      const resolved = await resolveActiveEngine(tempDir);
      expect(resolved.provider).toBe("ollama");
      expect(resolved.model).toBe("llama3:latest");

      vi.restoreAllMocks();
    });
  });

  describe("commands/models.ts", () => {
    it("handles vee models listing command", async () => {
      await expect(handleModelsCommand(tempDir)).resolves.not.toThrow();
    });

    it("handles vee models use command", () => {
      expect(() => handleModelsUseCommand("invalid-provider", "model-1", tempDir)).toThrow(VeeError);

      handleModelsUseCommand("ollama", "llama3.2", tempDir);
      const cfg = loadConfig(tempDir);
      expect(cfg.extractor?.provider).toBe("ollama");
      expect(cfg.extractor?.model).toBe("llama3.2");
      expect(cfg.default_extractor?.provider).toBe("ollama");
    });

    it("handles vee models pull command with validation", () => {
      expect(() => handleModelsPullCommand("")).toThrow(VeeError);
      expect(() => handleModelsPullCommand("bad;command")).toThrow(VeeError);

      const runSpy = vi.spyOn(processUtils, "runCommandInteractive").mockReturnValue(undefined);
      handleModelsPullCommand("llama3.2");
      expect(runSpy).toHaveBeenCalledWith("ollama", ["pull", "llama3.2"]);
    });
  });
});
