import { createRequire } from "node:module";
import path from "node:path";
import { pathToFileURL } from "node:url";

const require = createRequire(import.meta.url);

export function getPdfCMapUrl(): string {
  const pdfjsRoot = path.dirname(require.resolve("pdfjs-dist/package.json"));
  const cMapDirectory = path.join(pdfjsRoot, "cmaps");

  return `${pathToFileURL(cMapDirectory).href}/`;
}
