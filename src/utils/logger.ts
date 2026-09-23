import pc from "picocolors";

export const logger = {
  info: (msg: string) => console.log(pc.cyan("ℹ ") + msg),
  success: (msg: string) => console.log(pc.green("✔ ") + pc.bold(msg)),
  warn: (msg: string) => console.log(pc.yellow("⚠ ") + msg),
  error: (msg: string) => console.error(pc.red("✖ ") + pc.bold(msg)),
  log: (msg: string) => console.log(msg),
  title: (msg: string) => console.log("\n" + pc.bold(pc.magenta(`=== ${msg} ===`)) + "\n"),
  dim: (msg: string) => pc.dim(msg),
  bold: (msg: string) => pc.bold(msg),
  cyan: (msg: string) => pc.cyan(msg),
};
