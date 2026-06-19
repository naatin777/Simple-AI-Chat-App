import { asc, eq } from "drizzle-orm";
import path from "node:path";
import { db } from "@/lib/db";
import { conversationDirectories, conversations } from "@/lib/db/schema";
import {
  errorResponse,
  jsonResponse,
  parseJsonBody,
} from "@/lib/openapi/parse";
import {
  AddDirectoryBodySchema,
  ConversationDirectoryListSchema,
  ConversationDirectorySchema,
} from "@/lib/openapi/schemas/directory";

export const runtime = "nodejs";

async function getConversation(id: string) {
  const rows = await db
    .select()
    .from(conversations)
    .where(eq(conversations.id, id));

  return rows.at(0);
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const conversation = await getConversation(id);
  if (!conversation) {
    return errorResponse("Conversation not found", 404);
  }

  const rows = await db
    .select()
    .from(conversationDirectories)
    .where(eq(conversationDirectories.conversationId, id))
    .orderBy(asc(conversationDirectories.createdAt));

  return jsonResponse(ConversationDirectoryListSchema, rows);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await parseJsonBody(req, AddDirectoryBodySchema);
  if (!body.success) {
    return body.response;
  }

  const trimmedPath = body.data.path.trim();
  if (!trimmedPath) {
    return errorResponse("Path is required", 400);
  }

  const conversation = await getConversation(id);
  if (!conversation) {
    return errorResponse("Conversation not found", 404);
  }

  const resolvedPath = path.resolve(trimmedPath);

  const existing = await db
    .select()
    .from(conversationDirectories)
    .where(eq(conversationDirectories.conversationId, id));

  if (
    existing.some(
      (directory) => path.resolve(directory.path) === resolvedPath,
    )
  ) {
    return errorResponse(
      "Directory already added to this conversation",
      409,
    );
  }

  const directoryId = crypto.randomUUID();

  await db.insert(conversationDirectories).values({
    id: directoryId,
    conversationId: id,
    path: resolvedPath,
    name: path.basename(resolvedPath),
  });

  const createdRows = await db
    .select()
    .from(conversationDirectories)
    .where(eq(conversationDirectories.id, directoryId));

  const directory = createdRows.at(0);
  if (!directory) {
    return errorResponse("Failed to add directory", 500);
  }

  return jsonResponse(ConversationDirectorySchema, directory);
}
