import {
  initializeVeeshree,
  logger
} from "./chunk-UIRF5AEJ.js";

// src/cli.ts
import { Command } from "commander";
var nodeVersion = process.versions.node.split(".");
var majorVersion = parseInt(nodeVersion[0], 10);
if (majorVersion < 18) {
  logger.error(`Veeshree requires Node.js v18.0.0 or higher. Current version: ${process.version}`);
  process.exit(1);
}
var program = new Command();
program.name("vee").description("Veeshree: Local-first context persistence layer for multi-model AI software development").version("0.1.0");
program.command("init").description("Bootstrap Veeshree project memory, heuristic scanner, and Git hooks").option("-f, --force", "Overwrite existing memory scaffolds and hooks", false).action((options) => {
  try {
    initializeVeeshree(process.cwd(), { force: options.force });
  } catch (err) {
    logger.error(`Initialization failed: ${err?.message || err}`);
    process.exit(1);
  }
});
program.parse(process.argv);
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
//# sourceMappingURL=cli.js.map