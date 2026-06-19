export type FilePreviewKind = "image" | "pdf" | "video" | "text";

const IMAGE_EXTENSIONS = new Set([
  "jpg",
  "jpeg",
  "png",
  "gif",
  "webp",
  "svg",
  "avif",
]);

const VIDEO_EXTENSIONS = new Set(["mp4", "webm", "mov", "ogg"]);

const MIME_BY_EXTENSION: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
  svg: "image/svg+xml",
  avif: "image/avif",
  pdf: "application/pdf",
  mp4: "video/mp4",
  webm: "video/webm",
  mov: "video/quicktime",
  ogg: "video/ogg",
  json: "application/json",
  js: "text/javascript",
  ts: "text/typescript",
  tsx: "text/typescript",
  jsx: "text/javascript",
  css: "text/css",
  html: "text/html",
  md: "text/markdown",
  txt: "text/plain",
};

export function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf(".");
  if (lastDot === -1) {return "";}
  return filename.slice(lastDot + 1).toLowerCase();
}

export function getFilePreviewKind(filename: string): FilePreviewKind {
  const extension = getFileExtension(filename);

  if (IMAGE_EXTENSIONS.has(extension)) {
    return "image";
  }

  if (extension === "pdf") {
    return "pdf";
  }

  if (VIDEO_EXTENSIONS.has(extension)) {
    return "video";
  }

  return "text";
}

export function getContentType(filename: string): string {
  const extension = getFileExtension(filename);
  return MIME_BY_EXTENSION[extension] ?? "text/plain; charset=utf-8";
}
