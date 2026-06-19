import { copyFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.join(
  rootDir,
  "node_modules/pdfjs-dist/build/pdf.worker.min.mjs",
);
const destinationDir = path.join(rootDir, "public");
const destination = path.join(destinationDir, "pdf.worker.min.mjs");

mkdirSync(destinationDir, { recursive: true });
copyFileSync(source, destination);

console.log(`Copied PDF worker to ${destination}`);
