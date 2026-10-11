import http from "node:http";
import type { ModelRuntimeInfo } from "../types/index.js";
import { getApiKey } from "./auth.js";

async function probeHttpJson(url: string, timeoutMs: number = 800): Promise<{ ok: boolean; data?: any; latencyMs?: number }> {
  return new Promise((resolve) => {
    const startTime = Date.now();
    try {
      const u = new URL(url);
      const req = http.request(
        {
          hostname: u.hostname,
          port: u.port,
          path: u.pathname + (u.search || ""),
          method: "GET",
          timeout: timeoutMs,
        },
        (res) => {
          let data = "";
          res.on("data", (chunk) => (data += chunk));
          res.on("end", () => {
            const latencyMs = Date.now() - startTime;
            if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
              try {
                resolve({ ok: true, data: JSON.parse(data), latencyMs });
              } catch {
                resolve({ ok: true, data, latencyMs });
              }
            } else {
              resolve({ ok: false, latencyMs });
            }
          });
        }
      );

      req.on("error", () => resolve({ ok: false }));
      req.on("timeout", () => {
        req.destroy();
        resolve({ ok: false });
      });
      req.end();
    } catch {
      resolve({ ok: false });
    }
  });
}

export async function detectAvailableModels(rootDir: string = process.cwd()): Promise<ModelRuntimeInfo[]> {
  const runtimes: ModelRuntimeInfo[] = [];

  // 1. Probe Local Ollama (port 11434)
  const ollamaProbe = await probeHttpJson("http://127.0.0.1:11434/api/tags");
  if (ollamaProbe.ok && ollamaProbe.data && Array.isArray(ollamaProbe.data.models)) {
    const modelNames = ollamaProbe.data.models.map((m: any) => m.name || m.model);
    runtimes.push({
      name: "Ollama (Local Engine)",
      provider: "ollama",
      status: "available",
      endpoint: "http://127.0.0.1:11434",
      models: modelNames.length > 0 ? modelNames : ["default"],
      latencyMs: ollamaProbe.latencyMs,
    });
  } else {
    runtimes.push({
      name: "Ollama (Local Engine)",
      provider: "ollama",
      status: "unavailable",
      endpoint: "http://127.0.0.1:11434",
      models: [],
    });
  }

  // 2. Probe Local LM Studio (port 1234)
  const lmStudioProbe = await probeHttpJson("http://127.0.0.1:1234/v1/models");
  if (lmStudioProbe.ok && lmStudioProbe.data && Array.isArray(lmStudioProbe.data.data)) {
    const modelNames = lmStudioProbe.data.data.map((m: any) => m.id);
    runtimes.push({
      name: "LM Studio (Local Engine)",
      provider: "lmstudio",
      status: "available",
      endpoint: "http://127.0.0.1:1234",
      models: modelNames.length > 0 ? modelNames : ["local-model"],
      latencyMs: lmStudioProbe.latencyMs,
    });
  } else {
    runtimes.push({
      name: "LM Studio (Local Engine)",
      provider: "lmstudio",
      status: "unavailable",
      endpoint: "http://127.0.0.1:1234",
      models: [],
    });
  }

  // 3. Gemini Cloud Provider
  const geminiKey = getApiKey("gemini", rootDir);
  runtimes.push({
    name: "Google Gemini Cloud",
    provider: "gemini",
    status: geminiKey ? "available" : "missing_key",
    models: ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-pro"],
  });

  // 4. OpenAI Cloud Provider
  const openaiKey = getApiKey("openai", rootDir);
  runtimes.push({
    name: "OpenAI Cloud",
    provider: "openai",
    status: openaiKey ? "available" : "missing_key",
    models: ["gpt-4o", "gpt-4o-mini", "o1-preview", "o3-mini"],
  });

  // 5. Anthropic Cloud Provider
  const anthropicKey = getApiKey("anthropic", rootDir);
  runtimes.push({
    name: "Anthropic Claude Cloud",
    provider: "anthropic",
    status: anthropicKey ? "available" : "missing_key",
    models: ["claude-3-5-sonnet", "claude-3-5-haiku", "claude-3-opus"],
  });

  return runtimes;
}
