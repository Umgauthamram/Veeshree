import { detectAvailableModels } from "../core/models.js";
import { loadConfig, saveConfig } from "../core/config.js";
import { logger } from "../utils/logger.js";
import { validateModelName, runCommandInteractive } from "../utils/process.js";
import { VeeError } from "../utils/errors.js";
import type { VeeshreeConfig } from "../schemas/config.schema.js";

type ProviderType = VeeshreeConfig["extractor"]["provider"];

export async function handleModelsCommand(rootDir: string = process.cwd()): Promise<void> {
  logger.title("Veeshree Model Runtimes & Providers");
  logger.info("Probing local LLM engines and cloud credentials...\n");
  const runtimes = await detectAvailableModels(rootDir);

  for (const r of runtimes) {
    let statusBadge: string;
    if (r.status === "available") {
      const lat = r.latencyMs ? ` (${r.latencyMs}ms)` : "";
      statusBadge = logger.green(`READY${lat}`);
    } else if (r.status === "missing_key") {
      statusBadge = logger.dim("Missing API Key (run: vee keys set)");
    } else {
      statusBadge = logger.dim("Engine Offline");
    }

    logger.log(`${logger.bold(r.name.padEnd(28))} [${statusBadge}]`);
    if (r.endpoint) {
      logger.log(`  Endpoint: ${logger.dim(r.endpoint)}`);
    }
    if (r.models.length > 0) {
      logger.log(`  Models:   ${logger.dim(r.models.slice(0, 4).join(", "))}`);
    }
    logger.log("");
  }
}

export function handleModelsUseCommand(
  provider: string,
  model: string,
  rootDir: string = process.cwd()
): void {
  const validProviders: ProviderType[] = [
    "gemini",
    "openai",
    "anthropic",
    "groq",
    "nvidia",
    "ollama",
    "lmstudio",
  ];
  const p = provider.toLowerCase() as ProviderType;

  if (!validProviders.includes(p)) {
    throw new VeeError(
      `Invalid provider '${provider}'. Supported: ${validProviders.join(", ")}`,
      "ERR_INVALID_ARGS"
    );
  }

  const safeModel = validateModelName(model);
  const config = loadConfig(rootDir);
  if (!config.extractor) {
    config.extractor = { provider: p, model: safeModel };
  } else {
    config.extractor.provider = p;
    config.extractor.model = safeModel;
  }

  // Backward compatibility
  config.default_extractor = {
    provider: p,
    model: safeModel,
  };

  saveConfig(config, rootDir);

  logger.success(`Default extraction model updated: ${logger.bold(p)} (${logger.bold(safeModel)})`);
  logger.info("Ambient watcher ('vee watch') and manual capture will now use this model.");
}

export function handleModelsPullCommand(modelName: string): void {
  if (!modelName || !modelName.trim()) {
    throw new VeeError(
      "Usage: vee models pull <model> (e.g. vee models pull llama3.2)",
      "ERR_INVALID_ARGS"
    );
  }

  // SEC-4: Validate against shell injection
  const safeModel = validateModelName(modelName);

  logger.title(`Pulling Model via Ollama: ${safeModel}`);
  logger.info("Connecting to local Ollama runtime to download/update model weights...");

  // SEC-4: Safe execution with argument array, no shell interpolation
  runCommandInteractive("ollama", ["pull", safeModel]);

  logger.success(`Successfully pulled model '${safeModel}' into local Ollama runtime!`);
  logger.info(`To activate: run 'vee models use ollama ${safeModel}'`);
}
