import fs from "node:fs";
import { extractMemoryFromContent } from "../core/extractor.js";
import { reconcileExtraction } from "../core/reconciler.js";
import { logger } from "../utils/logger.js";

export interface CaptureOptions {
  file?: string;
  provider?: string;
  model?: string;
}

export async function handleCaptureCommand(options: CaptureOptions, rootDir: string = process.cwd()): Promise<void> {
  logger.title("Capturing & Extracting Architectural Memory");

  let content = "";
  if (options.file) {
    if (!fs.existsSync(options.file)) {
      logger.error(`File not found: ${options.file}`);
      process.exit(1);
    }
    content = fs.readFileSync(options.file, "utf-8");
  } else {
    // Read from standard input if piped
    content = await readStdin();
  }

  if (!content.trim()) {
    logger.error("No conversation log or diff content provided. Pass via --file or standard input.");
    process.exit(1);
  }

  logger.info("Extracting structural memory delta via background LLM...");
  try {
    const delta = await extractMemoryFromContent(content, rootDir, options.provider, options.model);
    logger.success("Structured extraction completed successfully.");

    logger.info("Reconciling changes with /docs/memory/ files...");
    const result = reconcileExtraction(delta, rootDir);

    if (result.newDecisions.length > 0) {
      for (const dec of result.newDecisions) {
        logger.success(`Created new ADR: ${logger.bold(dec)}`);
      }
    }

    logger.info(`Updated memory files: ${result.updatedFiles.join(", ")}`);
    logger.success("Veeshree memory synchronized with codebase!");
  } catch (err: any) {
    logger.error(`Capture extraction failed: ${err?.message || err}`);
    process.exit(1);
  }
}

async function readStdin(): Promise<string> {
  return new Promise((resolve) => {
    let data = "";
    if (process.stdin.isTTY) {
      resolve("");
      return;
    }
    process.stdin.setEncoding("utf-8");
    process.stdin.on("data", (chunk) => (data += chunk));
    process.stdin.on("end", () => resolve(data));
  });
}
