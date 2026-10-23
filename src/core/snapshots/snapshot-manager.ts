import fs from "node:fs";
import path from "node:path";
import { SNAPSHOTS_DIR_REL, MEMORY_DIR_REL } from "../../utils/constants.js";
import { VeeError, isEnoent } from "../../utils/errors.js";
import { logger } from "../../utils/logger.js";

const MAX_SNAPSHOTS = 20;

export interface SnapshotMeta {
  id: string;
  timestamp: string;
  description: string;
  path: string;
}

/**
 * Copies a directory recursively
 */
function copyDirSync(src: string, dest: string): void {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else if (entry.isFile()) {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

let snapshotCounter = 0;

/**
 * Creates a pre-apply backup snapshot of docs/memory to support vee undo
 */
export function createMemorySnapshot(
  rootDir: string = process.cwd(),
  description: string = "Pre-apply snapshot"
): SnapshotMeta {
  const memoryDir = path.join(rootDir, MEMORY_DIR_REL);
  if (!fs.existsSync(memoryDir)) {
    throw new VeeError("Cannot create snapshot: docs/memory does not exist", "ERR_FILE_NOT_FOUND");
  }

  const snapshotsDir = path.join(rootDir, SNAPSHOTS_DIR_REL);
  if (!fs.existsSync(snapshotsDir)) {
    fs.mkdirSync(snapshotsDir, { recursive: true });
  }

  snapshotCounter++;
  const now = Date.now();
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const id = `snap_${now}_${String(snapshotCounter).padStart(4, "0")}`;
  const targetDir = path.join(snapshotsDir, `${timestamp}_${id}`);

  copyDirSync(memoryDir, path.join(targetDir, "memory"));

  const meta: SnapshotMeta = {
    id,
    timestamp: new Date().toISOString(),
    description,
    path: targetDir,
  };

  fs.writeFileSync(path.join(targetDir, "meta.json"), JSON.stringify(meta, null, 2), "utf-8");

  // Enforce max 20 snapshots retention
  pruneOldSnapshots(snapshotsDir);

  return meta;
}

/**
 * Lists available snapshots in chronological order (newest first)
 */
export function listSnapshots(rootDir: string = process.cwd()): SnapshotMeta[] {
  const snapshotsDir = path.join(rootDir, SNAPSHOTS_DIR_REL);
  if (!fs.existsSync(snapshotsDir)) return [];

  const dirs = fs
    .readdirSync(snapshotsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => path.join(snapshotsDir, d.name));

  const list: SnapshotMeta[] = [];
  for (const dir of dirs) {
    const metaPath = path.join(dir, "meta.json");
    if (fs.existsSync(metaPath)) {
      try {
        const meta: SnapshotMeta = JSON.parse(fs.readFileSync(metaPath, "utf-8"));
        list.push(meta);
      } catch (err: unknown) {
        if (!isEnoent(err)) {
          logger.debug(
            `Failed to read snapshot meta at ${metaPath}: ${err instanceof Error ? err.message : String(err)}`
          );
        }
      }
    }
  }

  return list.sort((a, b) => {
    const timeDiff = new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    if (timeDiff !== 0) return timeDiff;
    return b.id.localeCompare(a.id);
  });
}

/**
 * Restores memory from the Nth recent snapshot (1 = most recent)
 */
export function restoreSnapshot(
  step: number = 1,
  rootDir: string = process.cwd()
): { restoredId: string; timestamp: string } {
  const snapshots = listSnapshots(rootDir);
  if (snapshots.length === 0) {
    throw new VeeError(
      "No snapshots found in .vee/snapshots/. Nothing to undo.",
      "ERR_FILE_NOT_FOUND"
    );
  }

  const index = Math.max(0, step - 1);
  if (index >= snapshots.length) {
    throw new VeeError(
      `Invalid undo step ${step}. Only ${snapshots.length} snapshot(s) exist.`,
      "ERR_INVALID_ARGS"
    );
  }

  const targetSnapshot = snapshots[index];
  if (!targetSnapshot) {
    throw new VeeError(`Snapshot at index ${index} not found.`, "ERR_FILE_NOT_FOUND");
  }
  const snapMemoryDir = path.join(targetSnapshot.path, "memory");
  const memoryDir = path.join(rootDir, MEMORY_DIR_REL);

  if (!fs.existsSync(snapMemoryDir)) {
    throw new VeeError("Snapshot content is corrupted or missing.", "ERR_FILE_NOT_FOUND");
  }

  // Clear current memory dir and restore
  if (fs.existsSync(memoryDir)) {
    fs.rmSync(memoryDir, { recursive: true, force: true });
  }
  copyDirSync(snapMemoryDir, memoryDir);

  return {
    restoredId: targetSnapshot.id,
    timestamp: targetSnapshot.timestamp,
  };
}

/**
 * Restores memory snapshot by snapshot ID, or step 1 if not specified
 */
export function restoreMemorySnapshot(
  rootDir: string = process.cwd(),
  snapshotId?: string
): boolean {
  try {
    if (!snapshotId) {
      restoreSnapshot(1, rootDir);
      return true;
    }
    const snapshots = listSnapshots(rootDir);
    const target = snapshots.find((s) => s.id === snapshotId);
    if (!target) return false;

    const memoryDir = path.join(rootDir, MEMORY_DIR_REL);
    fs.rmSync(memoryDir, { recursive: true, force: true });
    copyDirSync(path.join(target.path, "memory"), memoryDir);
    return true;
  } catch (err: unknown) {
    logger.debug(
      `restoreMemorySnapshot failed: ${err instanceof Error ? err.message : String(err)}`
    );
    return false;
  }
}

function pruneOldSnapshots(snapshotsDir: string): void {
  try {
    const dirs = fs
      .readdirSync(snapshotsDir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => ({
        path: path.join(snapshotsDir, d.name),
        name: d.name,
        mtime: fs.statSync(path.join(snapshotsDir, d.name)).mtimeMs,
      }))
      .sort((a, b) => {
        if (b.mtime !== a.mtime) return b.mtime - a.mtime;
        return b.name.localeCompare(a.name);
      });

    if (dirs.length > MAX_SNAPSHOTS) {
      for (const old of dirs.slice(MAX_SNAPSHOTS)) {
        fs.rmSync(old.path, { recursive: true, force: true });
      }
    }
  } catch (err: unknown) {
    if (!isEnoent(err)) {
      logger.debug(`pruneOldSnapshots failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
}
