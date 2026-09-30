import pc from "picocolors";

export const logger = {
  info: (msg: string) => console.log(pc.cyan("[INFO] ") + msg),
  success: (msg: string) => console.log(pc.green("[OK] ") + pc.bold(msg)),
  warn: (msg: string) => console.log(pc.yellow("[WARN] ") + msg),
  error: (msg: string) => console.error(pc.red("[ERROR] ") + pc.bold(msg)),
  log: (msg: string) => console.log(msg),
  title: (msg: string) => console.log("\n" + pc.bold(pc.magenta(`=== ${msg} ===`)) + "\n"),
  dim: (msg: string) => pc.dim(msg),
  bold: (msg: string) => pc.bold(msg),
  cyan: (msg: string) => pc.cyan(msg),
  yellow: (msg: string) => pc.yellow(msg),
  red: (msg: string) => pc.red(msg),
  green: (msg: string) => pc.green(msg),
};
