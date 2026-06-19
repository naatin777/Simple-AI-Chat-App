import { and, eq } from "drizzle-orm";

import { listAllFilesUnder } from "@/lib/fs/list-directory-files";
import { db } from "@/lib/db";
import { conversationDirectories } from "@/lib/db/schema";
import { errorResponse, jsonResponse } from "@/lib/openapi/parse";
import { DirectoryFilesResponseSchema } from "@/lib/openapi/schemas/directory";

export const runtime = "nodejs";

export async function GET(
  req: Request,
  {
    params,
  }: { params: Promise<{ id: string; dirId: string }> },
) {
  const { id, dirId } = await params;
  const relativePath = new URL(req.url).searchParams.get("relativePath") ?? "";

  const directoryRows = await db
    .select()
    .from(conversationDirectories)
    .where(
      and(
        eq(conversationDirectories.id, dirId),
        eq(conversationDirectories.conversationId, id),
      ),
    );

  const directory = directoryRows.at(0);
  if (!directory) {
    return errorResponse("Directory not found", 404);
  }

  try {
    const files = await listAllFilesUnder(directory.path, relativePath);

    return jsonResponse(DirectoryFilesResponseSchema, {
      rootPath: directory.path,
      relativePath,
      files,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Directory not found") {
        return errorResponse(error.message, 404);
      }

      if (
        error.message === "Permission denied" ||
        error.message === "Path traversal detected" ||
        error.message === "Path is outside root"
      ) {
        return errorResponse(error.message, 403);
      }
    }

    return errorResponse("Failed to read directory", 500);
  }
}
