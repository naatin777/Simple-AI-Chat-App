import { createHash } from "node:crypto";
import { readFile, stat } from "node:fs/promises";

import { extractPdfText } from "@/lib/rag/extract-pdf-text";
import { getFilePreviewKind, type FilePreviewKind } from "@/lib/fs/file-type";
import { resolveSafePath } from "@/lib/fs/path-guard";

export type ConversationFileReadErrorCode =
  | "NOT_A_FILE"
  | "PATH_TRAVERSAL"
  | "NOT_FOUND"
  | "PERMISSION_DENIED"
  | "READ_FAILED";

export class ConversationFileReadError extends Error {
  readonly code: ConversationFileReadErrorCode;

  constructor(code: ConversationFileReadErrorCode, message: string) {
    super(message);
    this.name = "ConversationFileReadError";
    this.code = code;
  }
}

export interface ConversationFileContent {
  relativePath: string;
  filename: string;
  previewKind: FilePreviewKind;
  buffer: Buffer;
  contentHash: string;
}

function toConversationFileReadError(error: unknown): ConversationFileReadError {
  if (error instanceof ConversationFileReadError) {
    return error;
  }

  if (error instanceof Error) {
    if (error.message === "Path traversal detected") {
      return new ConversationFileReadError("PATH_TRAVERSAL", error.message);
    }

    if ("code" in error) {
      if (error.code === "ENOENT") {
        return new ConversationFileReadError("NOT_FOUND", "File not found");
      }

      if (error.code === "EACCES") {
        return new ConversationFileReadError("PERMISSION_DENIED", "Permission denied");
      }
    }
  }

  return new ConversationFileReadError("READ_FAILED", "Failed to read file");
}

export async function readConversationFile(
  directoryRootPath: string,
  relativePath: string,
): Promise<ConversationFileContent> {
  try {
    const absolutePath = resolveSafePath(directoryRootPath, relativePath);
    const fileStat = await stat(absolutePath);

    if (!fileStat.isFile()) {
      throw new ConversationFileReadError("NOT_A_FILE", "Path is not a file");
    }

    const buffer = await readFile(absolutePath);
    const filename = relativePath.split("/").pop() ?? relativePath;
    const contentHash = createHash("sha256").update(buffer).digest("hex");

    return {
      relativePath,
      filename,
      previewKind: getFilePreviewKind(filename),
      buffer,
      contentHash,
    };
  } catch (error) {
    throw toConversationFileReadError(error);
  }
}

function isLikelyText(buffer: Buffer): boolean {
  if (buffer.length === 0) {
    return true;
  }

  const sample = buffer.subarray(0, Math.min(buffer.length, 4096));
  let suspiciousBytes = 0;

  for (const byte of sample) {
    if (byte === 0) {
      return false;
    }

    if (byte < 9 || (byte > 13 && byte < 32 && byte !== 27)) {
      suspiciousBytes += 1;
    }
  }

  return suspiciousBytes / sample.length < 0.1;
}

export async function extractTextFromConversationFile(
  file: ConversationFileContent,
): Promise<string | null> {
  if (file.previewKind === "image" || file.previewKind === "video") {
    return null;
  }

  if (file.previewKind === "pdf") {
    return extractPdfText(file.buffer);
  }

  if (!isLikelyText(file.buffer)) {
    return null;
  }

  return file.buffer.toString("utf8");
}
