import { detectAvailableModels } from "../core/models.js";
import { logger } from "../utils/logger.js";

export async function handleModelsCommand(rootDir: string = process.cwd()): Promise<void> {
  logger.title("Veeshree Model Runtimes & Providers");

  logger.info("Probing local LLM engines and cloud credentials...\n");
  const runtimes = await detectAvailableModels(rootDir);

  for (const r of runtimes) {
    let statusBadge = "";
    if (r.status === "available") {
      const lat = r.latencyMs ? ` (${r.latencyMs}ms)` : "";
      statusBadge = logger.cyan(`✔ READY${lat}`);
    } else if (r.status === "missing_key") {
      statusBadge = logger.dim("✖ Missing API Key (run: vee keys set)");
    } else {
      statusBadge = logger.dim("✖ Engine Offline");
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
