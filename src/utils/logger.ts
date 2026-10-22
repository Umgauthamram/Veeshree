import pc from "picocolors";

export type LogLevel = "debug" | "info" | "warn" | "error" | "silent";

export interface LoggerConfig {
  quiet: boolean;
  json: boolean;
  level: LogLevel;
}

class Logger {
  private config: LoggerConfig = {
    quiet: false,
    json: false,
    level: "info",
  };

  public setQuiet(quiet: boolean): void {
    this.config.quiet = quiet;
    if (quiet) {
      this.config.level = "silent";
    }
  }

  public setJson(json: boolean): void {
    this.config.json = json;
  }

  public setLevel(level: LogLevel): void {
    this.config.level = level;
  }

  public isQuiet(): boolean {
    return this.config.quiet;
  }

  public isJson(): boolean {
    return this.config.json;
  }

  public debug(msg: string, meta?: unknown): void {
    if (this.config.quiet) return;
    if (this.config.level !== "debug") return;
    if (this.config.json) {
      console.error(JSON.stringify({ level: "debug", message: msg, meta }));
    } else {
      console.log(pc.dim("[DEBUG] ") + msg);
    }
  }

  public info(msg: string, meta?: unknown): void {
    if (this.config.quiet) return;
    if (this.config.json) {
      console.error(JSON.stringify({ level: "info", message: msg, meta }));
    } else {
      console.log(pc.cyan("[INFO] ") + msg);
    }
  }

  public success(msg: string, meta?: unknown): void {
    if (this.config.quiet) return;
    if (this.config.json) {
      console.error(JSON.stringify({ level: "success", message: msg, meta }));
    } else {
      console.log(pc.green("[OK] ") + pc.bold(msg));
    }
  }

  public warn(msg: string, meta?: unknown): void {
    if (this.config.quiet) return;
    if (this.config.json) {
      console.error(JSON.stringify({ level: "warn", message: msg, meta }));
    } else {
      console.error(pc.yellow("[WARN] ") + msg);
    }
  }

  public error(msg: string, meta?: unknown): void {
    if (this.config.json) {
      console.error(JSON.stringify({ level: "error", message: msg, meta }));
    } else {
      console.error(pc.red("[ERROR] ") + pc.bold(msg));
    }
  }

  public log(msg: string): void {
    if (this.config.quiet || this.config.json) return;
    console.log(msg);
  }

  public raw(msg: string): void {
    console.log(msg);
  }

  public json(data: unknown): void {
    console.log(JSON.stringify(data, null, 2));
  }

  public title(msg: string): void {
    if (this.config.quiet || this.config.json) return;
    console.log("\n" + pc.bold(pc.magenta(`=== ${msg} ===`)) + "\n");
  }

  // Formatting helpers
  public dim(msg: string): string {
    return pc.dim(msg);
  }

  public bold(msg: string): string {
    return pc.bold(msg);
  }

  public cyan(msg: string): string {
    return pc.cyan(msg);
  }

  public yellow(msg: string): string {
    return pc.yellow(msg);
  }

  public red(msg: string): string {
    return pc.red(msg);
  }

  public green(msg: string): string {
    return pc.green(msg);
  }

  public magenta(msg: string): string {
    return pc.magenta(msg);
  }
}

export const logger = new Logger();
