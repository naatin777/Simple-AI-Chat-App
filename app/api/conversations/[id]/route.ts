import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { conversations } from "@/lib/db/schema";
import {
  errorResponse,
  jsonResponse,
  parseJsonBody,
} from "@/lib/openapi/parse";
import {
  ConversationSchema,
  UpdateConversationBodySchema,
} from "@/lib/openapi/schemas/conversation";
import { SuccessResponseSchema } from "@/lib/openapi/schemas/common";

export const runtime = "nodejs";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await parseJsonBody(req, UpdateConversationBodySchema);
  if (!body.success) {
    return body.response;
  }

  const { title, pinned } = body.data;
  const updates: Partial<typeof conversations.$inferInsert> = {};

  if (title !== undefined) {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      return errorResponse("Title is required", 400);
    }
    updates.title = trimmedTitle;
  }

  if (pinned !== undefined) {
    updates.pinned = pinned;
  }

  if (Object.keys(updates).length === 0) {
    return errorResponse("No updates provided", 400);
  }

  await db.update(conversations).set(updates).where(eq(conversations.id, id));

  const updatedRows = await db
    .select()
    .from(conversations)
    .where(eq(conversations.id, id));

  const conversation = updatedRows.at(0);
  if (!conversation) {
    return errorResponse("Conversation not found", 404);
  }

  return jsonResponse(ConversationSchema, conversation);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const existingRows = await db
    .select()
    .from(conversations)
    .where(eq(conversations.id, id));

  if (existingRows.length === 0) {
    return errorResponse("Conversation not found", 404);
  }

  await db.delete(conversations).where(eq(conversations.id, id));

  return jsonResponse(SuccessResponseSchema, { success: true });
}
