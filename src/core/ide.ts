import { installAgentRules, uninstallAgentRules, updateAgentRules } from "./rules/manager.js";

export function installIdeRules(rootDir: string = process.cwd()): string[] {
  return installAgentRules(rootDir);
}

export { installAgentRules, uninstallAgentRules, updateAgentRules };
