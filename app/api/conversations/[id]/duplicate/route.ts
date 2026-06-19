import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { conversations, messages } from "@/lib/db/schema";
import { getDuplicateTitle, getRequestLocale } from "@/lib/i18n/server";
import { errorResponse, jsonResponse } from "@/lib/openapi/parse";
import { ConversationSchema } from "@/lib/openapi/schemas/conversation";

export const runtime = "nodejs";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const locale = getRequestLocale(req);

  const sourceRows = await db
    .select()
    .from(conversations)
    .where(eq(conversations.id, id));

  const sourceConversation = sourceRows.at(0);
  if (!sourceConversation) {
    return errorResponse("Conversation not found", 404);
  }

  const sourceMessages = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, id))
    .orderBy(asc(messages.createdAt));

  const newId = crypto.randomUUID();

  await db.insert(conversations).values({
    id: newId,
    title: getDuplicateTitle(sourceConversation.title, locale),
    pinned: false,
  });

  if (sourceMessages.length > 0) {
    await db.insert(messages).values(
      sourceMessages.map((message) => ({
        id: crypto.randomUUID(),
        conversationId: newId,
        role: message.role,
        content: message.content,
        createdAt: message.createdAt,
      })),
    );
  }

  const createdRows = await db
    .select()
    .from(conversations)
    .where(eq(conversations.id, newId));

  const conversation = createdRows.at(0);
  if (!conversation) {
    return errorResponse("Failed to duplicate conversation", 500);
  }

  return jsonResponse(ConversationSchema, conversation);
}
