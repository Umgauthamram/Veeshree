import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { WATCH_STATE_FILE_REL, VEE_DIR_REL } from "../../utils/constants.js";
import { writeAtomic } from "../memory/atomic.js";

export interface WatchState {
  lastDiffFingerprint: string;
  processedHunkHashes?: string[];
  callsThisHour: number;
  hourWindowStart: number;
  lastProcessedAt?: string;
}

/**
 * Splits a git diff into distinct file hunks
 */
export function splitDiffIntoHunks(diff: string): string[] {
  if (!diff || !diff.trim()) return [];
  if (diff.includes("diff --git ")) {
    return diff.split(/(?=^diff --git )/m).map((h) => h.trim()).filter((h) => h.length > 0);
  }
  return diff.split(/(?=^--- )/m).map((h) => h.trim()).filter((h) => h.length > 0);
}

/**
 * Filters out hunks that were already processed in earlier watch cycles
 */
export function filterOutProcessedHunks(
  diff: string,
  processedHashes: string[] | Set<string> = []
): { filteredDiff: string; newHashes: string[] } {
  const hashSet = processedHashes instanceof Set ? processedHashes : new Set(processedHashes);
  const hunks = splitDiffIntoHunks(diff);
  const newHunkTexts: string[] = [];
  const newHashes: string[] = [];

  for (const hunk of hunks) {
    const hash = crypto.createHash("sha256").update(hunk).digest("hex");
    if (!hashSet.has(hash)) {
      newHunkTexts.push(hunk);
      newHashes.push(hash);
    }
  }

  return {
    filteredDiff: newHunkTexts.join("\n\n"),
    newHashes,
  };
}

/**
 * Loads watch state from .vee/watch-state.json
 */
export function loadWatchState(rootDir: string = process.cwd()): WatchState {
  const statePath = path.join(rootDir, WATCH_STATE_FILE_REL);
  if (!fs.existsSync(statePath)) {
    return {
      lastDiffFingerprint: "",
      processedHunkHashes: [],
      callsThisHour: 0,
      hourWindowStart: Date.now(),
    };
  }

  try {
    const raw = fs.readFileSync(statePath, "utf-8");
    const parsed = JSON.parse(raw);
    return {
      lastDiffFingerprint: parsed.lastDiffFingerprint || "",
      processedHunkHashes: Array.isArray(parsed.processedHunkHashes) ? parsed.processedHunkHashes : [],
      callsThisHour: typeof parsed.callsThisHour === "number" ? parsed.callsThisHour : 0,
      hourWindowStart: typeof parsed.hourWindowStart === "number" ? parsed.hourWindowStart : Date.now(),
      lastProcessedAt: parsed.lastProcessedAt,
    };
  } catch {
    return {
      lastDiffFingerprint: "",
      processedHunkHashes: [],
      callsThisHour: 0,
      hourWindowStart: Date.now(),
    };
  }
}

/**
 * Saves watch state to .vee/watch-state.json
 */
export function saveWatchState(state: WatchState, rootDir: string = process.cwd()): void {
  const veeDir = path.join(rootDir, VEE_DIR_REL);
  if (!fs.existsSync(veeDir)) {
    fs.mkdirSync(veeDir, { recursive: true });
  }
  const statePath = path.join(rootDir, WATCH_STATE_FILE_REL);
  writeAtomic(statePath, JSON.stringify(state, null, 2));
}

/**
 * Calculates SHA-256 fingerprint of a diff string
 */
export function computeDiffFingerprint(diff: string): string {
  return crypto.createHash("sha256").update(diff.trim()).digest("hex");
}

/**
 * Verifies if rate limit of max calls per hour is reached
 */
export function canMakeWatchCall(maxCallsPerHour: number, state: WatchState): boolean {
  const now = Date.now();
  const ONE_HOUR = 3600 * 1000;

  if (now - state.hourWindowStart > ONE_HOUR) {
    // Reset window
    state.callsThisHour = 0;
    state.hourWindowStart = now;
    return true;
  }

  return state.callsThisHour < maxCallsPerHour;
}

/**
 * Checks if a diff has changed since last processed
 */
export function shouldProcessDiff(
  diff: string,
  rootDir: string = process.cwd()
): { shouldProcess: boolean; fingerprint: string } {
  const fingerprint = computeDiffFingerprint(diff);
  const state = loadWatchState(rootDir);
  return {
    shouldProcess: state.lastDiffFingerprint !== fingerprint,
    fingerprint,
  };
}

/**
 * Updates last processed diff fingerprint in .vee/watch-state.json
 */
export function updateDiffFingerprint(
  diff: string,
  rootDir: string = process.cwd()
): void {
  const state = loadWatchState(rootDir);
  state.lastDiffFingerprint = computeDiffFingerprint(diff);
  state.lastProcessedAt = new Date().toISOString();
  saveWatchState(state, rootDir);
}
