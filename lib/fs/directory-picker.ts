import { execFile } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export interface PickedDirectory {
  path: string;
  name: string;
}

export function isDirectoryPickerSupported(): boolean {
  return process.platform === "darwin";
}

export async function pickDirectory(): Promise<PickedDirectory | null> {
  if (!isDirectoryPickerSupported()) {
    throw new Error("Directory picker is not supported on this platform");
  }

  try {
    const { stdout } = await execFileAsync("osascript", [
      "-e",
      'POSIX path of (choose folder with prompt "Select a directory")',
    ]);

    const pickedPath = stdout.trim();

    if (!pickedPath) {
      return null;
    }

    return {
      path: pickedPath,
      name: path.basename(pickedPath),
    };
  } catch (error) {
    if (
      error instanceof Error &&
      "code" in error &&
      (error.code === 1 || error.code === "1")
    ) {
      const stderr =
        "stderr" in error && typeof error.stderr === "string"
          ? error.stderr
          : "";

      if (stderr.includes("User canceled") || stderr.includes("-128")) {
        return null;
      }
    }

    throw error;
  }
}
