import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { initializeVeeshree } from "../src/commands/init.js";
import { ensureGitIgnoreProtection } from "../src/core/moderator.js";
import { setApiKey, getApiKey, listApiKeys } from "../src/core/auth.js";
import { handleModelsUseCommand } from "../src/commands/models.js";
import { loadConfig } from "../src/core/config.js";

describe("Doctor, Security & Keystore Protection", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "vee-doctor-test-"));
    initializeVeeshree(tempDir);
  });

  afterEach(() => {
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch {
      // ignore
    }
  });

  it("automatically protects .vee/config.json in .gitignore during initialization", () => {
    const gitignorePath = path.join(tempDir, ".gitignore");
    expect(fs.existsSync(gitignorePath)).toBe(true);

    const content = fs.readFileSync(gitignorePath, "utf-8");
    expect(content).toContain("/.vee/config.json");
    expect(content).toContain("/.vee/index.json");

    // Idempotent test
    const updated = ensureGitIgnoreProtection(tempDir);
    expect(updated).toBe(false);
  });

  it("reads API keys from local .env files when present", () => {
    const envPath = path.join(tempDir, ".env");
    fs.writeFileSync(envPath, 'GEMINI_API_KEY="AIzaSyLocalEnvKey987654"\n', "utf-8");

    const key = getApiKey("gemini", tempDir);
    expect(key).toBe("AIzaSyLocalEnvKey987654");

    const list = listApiKeys(tempDir);
    expect(list.gemini.configured).toBe(true);
    expect(list.gemini.source).toContain("local .env");
  });

  it("updates extractor model version with handleModelsUseCommand", () => {
    handleModelsUseCommand("gemini", "gemini-2.0-flash", tempDir);
    const config = loadConfig(tempDir);
    expect(config.default_extractor.provider).toBe("gemini");
    expect(config.default_extractor.model).toBe("gemini-2.0-flash");
  });

  it("resolves active engine for gemini, groq, nvidia, and openai providers", async () => {
    const { resolveActiveEngine } = await import("../src/core/models.js");

    setApiKey("gemini", "mock-gemini-key", tempDir, false);
    setApiKey("groq", "mock-groq-key", tempDir, false);
    setApiKey("nvidia", "mock-nvidia-key", tempDir, false);
    setApiKey("openai", "mock-openai-key", tempDir, false);

    const geminiEngine = await resolveActiveEngine(tempDir, "gemini");
    expect(geminiEngine.provider).toBe("gemini");
    expect(geminiEngine.model).toBe("gemini-2.0-flash");
    expect(geminiEngine.apiKey).toBe("mock-gemini-key");

    const groqEngine = await resolveActiveEngine(tempDir, "groq");
    expect(groqEngine.provider).toBe("groq");
    expect(groqEngine.model).toBe("llama-3.3-70b-versatile");
    expect(groqEngine.endpoint).toBe("https://api.groq.com/openai/v1/chat/completions");

    const nvidiaEngine = await resolveActiveEngine(tempDir, "nvidia");
    expect(nvidiaEngine.provider).toBe("nvidia");
    expect(nvidiaEngine.model).toBe("meta/llama-3.1-70b-instruct");
    expect(nvidiaEngine.endpoint).toBe("https://integrate.api.nvidia.com/v1/chat/completions");

    const openaiEngine = await resolveActiveEngine(tempDir, "openai");
    expect(openaiEngine.provider).toBe("openai");
    expect(openaiEngine.model).toBe("gpt-4o-mini");
    expect(openaiEngine.endpoint).toBe("https://api.openai.com/v1/chat/completions");
  });
});
