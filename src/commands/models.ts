import { execSync } from "node:child_process";
import { detectAvailableModels } from "../core/models.js";
import { loadConfig, saveConfig } from "../core/config.js";
import { logger } from "../utils/logger.js";

export async function handleModelsCommand(rootDir: string = process.cwd()): Promise<void> {
  logger.title("Veeshree Model Runtimes & Providers");

  logger.info("Probing local LLM engines and cloud credentials...\n");
  const runtimes = await detectAvailableModels(rootDir);

  for (const r of runtimes) {
    let statusBadge = "";
    if (r.status === "available") {
      const lat = r.latencyMs ? ` (${r.latencyMs}ms)` : "";
      statusBadge = logger.green(`READY${lat}`);
    } else if (r.status === "missing_key") {
      statusBadge = logger.dim("Missing API Key (run: vee keys set)");
    } else {
      statusBadge = logger.dim("Engine Offline");
    }

    console.log(`${logger.bold(r.name.padEnd(28))} [${statusBadge}]`);
    if (r.endpoint) {
      console.log(`  Endpoint: ${logger.dim(r.endpoint)}`);
    }
    if (r.models.length > 0) {
      console.log(`  Models:   ${logger.dim(r.models.slice(0, 4).join(", "))}`);
    }
    console.log("");
  }
}

export function handleModelsUseCommand(provider: string, model: string, rootDir: string = process.cwd()): void {
  const validProviders = ["gemini", "groq", "nvidia", "openai", "ollama", "lmstudio"];
  const p = provider.toLowerCase();

  if (!validProviders.includes(p)) {
    logger.error(`Invalid provider '${provider}'. Supported: ${validProviders.join(", ")}`);
    process.exit(1);
  }

  const config = loadConfig(rootDir);
  config.default_extractor = {
    provider: p as any,
    model: model.trim(),
  };
  saveConfig(config, rootDir);

  logger.success(`Default extraction model updated: ${logger.bold(p)} (${logger.bold(model)})`);
  logger.info("Ambient watcher ('vee watch') and manual capture will now use this model.");
}

export function handleModelsPullCommand(modelName: string): void {
  if (!modelName || !modelName.trim()) {
    logger.error("Usage: vee models pull <model> (e.g. vee models pull llama3.2)");
    process.exit(1);
  }

  logger.title(`Pulling Model via Ollama: ${modelName}`);
  logger.info("Connecting to local Ollama runtime to download/update model weights...");

  try {
    execSync(`ollama pull ${modelName.trim()}`, {
      stdio: "inherit",
    });
    logger.success(`Successfully pulled model '${modelName}' into local Ollama runtime!`);
    logger.info(`To activate: run 'vee models use ollama ${modelName}'`);
  } catch (err: any) {
    logger.error(`Failed to pull model via Ollama. Make sure Ollama is installed and running: ${err?.message || err}`);
    process.exit(1);
  }
}
