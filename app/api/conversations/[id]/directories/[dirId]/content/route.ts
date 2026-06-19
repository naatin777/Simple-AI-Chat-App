import { and, eq } from "drizzle-orm";
import { getContentType } from "@/lib/fs/file-type";
import {
  ConversationFileReadError,
  readConversationFile,
} from "@/lib/fs/read-conversation-file";
import { db } from "@/lib/db";
import { conversationDirectories } from "@/lib/db/schema";

export const runtime = "nodejs";

function logContentError(
  message: string,
  context: Record<string, unknown>,
  error: unknown,
) {
  console.error(`[content] ${message}`, {
    ...context,
    error:
      error instanceof Error
        ? { name: error.name, message: error.message, stack: error.stack }
        : error,
  });
}

export async function GET(
  req: Request,
  {
    params,
  }: { params: Promise<{ id: string; dirId: string }> },
) {
  if (process.env.VERCEL === "1") {
    return Response.json(
      { error: "File preview is only available in local development" },
      { status: 501 },
    );
  }

  const { id, dirId } = await params;
  const relativePath = new URL(req.url).searchParams.get("relativePath");
  const context = { conversationId: id, directoryId: dirId, relativePath };

  if (!relativePath) {
    return Response.json({ error: "relativePath is required" }, { status: 400 });
  }

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
    logContentError("Directory not found", context, new Error("Directory not found"));
    return Response.json({ error: "Directory not found" }, { status: 404 });
  }

  try {
    const file = await readConversationFile(directory.path, relativePath);

    return new Response(new Uint8Array(file.buffer), {
      headers: {
        "Content-Type": getContentType(file.filename),
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    if (error instanceof ConversationFileReadError) {
      if (error.code === "PATH_TRAVERSAL") {
        logContentError("Path traversal detected", context, error);
        return Response.json({ error: error.message }, { status: 403 });
      }

      if (error.code === "NOT_FOUND") {
        logContentError("File not found", context, error);
        return Response.json({ error: error.message }, { status: 404 });
      }

      if (error.code === "PERMISSION_DENIED") {
        logContentError("Permission denied", context, error);
        return Response.json({ error: error.message }, { status: 403 });
      }

      if (error.code === "NOT_A_FILE") {
        logContentError("Requested path is not a file", context, error);
        return Response.json({ error: error.message }, { status: 400 });
      }
    }

    logContentError("Failed to read file", context, error);
    return Response.json({ error: "Failed to read file" }, { status: 500 });
  }
}
