import fs from "node:fs";
import path from "node:path";
import { RULE_START_MARKER, RULE_END_MARKER, generateVeeshreeAgentRuleBlock } from "./templates.js";
import { writeAtomic } from "../memory/atomic.js";

export interface AgentRuleTarget {
  name: string;
  relPath: string;
}

export const KNOWN_AGENT_TARGETS: AgentRuleTarget[] = [
  { name: "cursor", relPath: ".cursorrules" },
  { name: "claude", relPath: "CLAUDE.md" },
  { name: "gemini", relPath: "GEMINI.md" },
  { name: "antigravity", relPath: path.join(".agents", "rules", "veeshree.md") },
  { name: "agents", relPath: "AGENTS.md" },
  { name: "copilot", relPath: path.join(".github", "copilot-instructions.md") },
];

/**
 * Installs or appends marker block into agent rule files without overwriting existing content.
 */
export function installAgentRules(
  rootDir: string = process.cwd(),
  selectedAgentNames?: string[]
): string[] {
  const targets =
    selectedAgentNames && selectedAgentNames.length > 0
      ? KNOWN_AGENT_TARGETS.filter((t) => selectedAgentNames.includes(t.name))
      : KNOWN_AGENT_TARGETS;

  const ruleBlock = generateVeeshreeAgentRuleBlock();
  const modifiedFiles: string[] = [];

  for (const t of targets) {
    const fullPath = path.join(rootDir, t.relPath);
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (fs.existsSync(fullPath)) {
      const existing = fs.readFileSync(fullPath, "utf-8");
      if (existing.includes(RULE_START_MARKER)) {
        // Update existing marker block
        const regex = new RegExp(`${RULE_START_MARKER}[\\s\\S]*?${RULE_END_MARKER}`, "g");
        const updated = existing.replace(regex, ruleBlock);
        writeAtomic(fullPath, updated);
      } else {
        // Append marker block cleanly to existing content
        const updated = `${existing.trim()}\n\n${ruleBlock}\n`;
        writeAtomic(fullPath, updated);
      }
    } else {
      writeAtomic(fullPath, `${ruleBlock}\n`);
    }

    modifiedFiles.push(t.relPath);
  }

  return modifiedFiles;
}

/**
 * Removes only Veeshree marker blocks from agent rule files.
 */
export function uninstallAgentRules(
  rootDir: string = process.cwd(),
  selectedAgentNames?: string[]
): string[] {
  const targets =
    selectedAgentNames && selectedAgentNames.length > 0
      ? KNOWN_AGENT_TARGETS.filter((t) => selectedAgentNames.includes(t.name))
      : KNOWN_AGENT_TARGETS;

  const modifiedFiles: string[] = [];

  for (const t of targets) {
    const fullPath = path.join(rootDir, t.relPath);
    if (fs.existsSync(fullPath)) {
      const existing = fs.readFileSync(fullPath, "utf-8");
      if (existing.includes(RULE_START_MARKER)) {
        const regex = new RegExp(`\\n?${RULE_START_MARKER}[\\s\\S]*?${RULE_END_MARKER}\\n?`, "g");
        const cleaned = existing.replace(regex, "").trim();

        if (!cleaned) {
          fs.unlinkSync(fullPath);
        } else {
          writeAtomic(fullPath, cleaned + "\n");
        }
        modifiedFiles.push(t.relPath);
      }
    }
  }

  return modifiedFiles;
}

/**
 * Refreshes all existing agent rule marker blocks
 */
export function updateAgentRules(rootDir: string = process.cwd()): string[] {
  return installAgentRules(rootDir);
}

/**
 * Injects Veeshree agent rule marker block into a single file idempotently.
 * Returns true if modified, false if already present.
 */
export function injectAgentRuleBlock(filePath: string): boolean {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const ruleBlock = generateVeeshreeAgentRuleBlock();

  if (fs.existsSync(filePath)) {
    const existing = fs.readFileSync(filePath, "utf-8");
    if (existing.includes(RULE_START_MARKER)) {
      return false;
    }
    const updated = `${existing.trim()}\n\n${ruleBlock}\n`;
    writeAtomic(filePath, updated);
    return true;
  }

  writeAtomic(filePath, `${ruleBlock}\n`);
  return true;
}

/**
 * Removes Veeshree agent rule marker block from a single file.
 */
export function removeAgentRuleBlock(filePath: string): boolean {
  if (!fs.existsSync(filePath)) return false;
  const existing = fs.readFileSync(filePath, "utf-8");
  if (!existing.includes(RULE_START_MARKER)) return false;

  const regex = new RegExp(`\\n?${RULE_START_MARKER}[\\s\\S]*?${RULE_END_MARKER}\\n?`, "g");
  const cleaned = existing.replace(regex, "").trim();

  if (!cleaned) {
    fs.unlinkSync(filePath);
  } else {
    writeAtomic(filePath, cleaned + "\n");
  }
  return true;
}
