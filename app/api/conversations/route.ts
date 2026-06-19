import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { conversations } from "@/lib/db/schema";
import { getRequestLocale, getTranslation } from "@/lib/i18n/server";
import {
  errorResponse,
  jsonResponse,
  parseJsonBody,
} from "@/lib/openapi/parse";
import {
  ConversationListSchema,
  ConversationSchema,
  CreateConversationBodySchema,
} from "@/lib/openapi/schemas/conversation";

export const runtime = "nodejs";

export async function GET() {
  const rows = await db
    .select()
    .from(conversations)
    .orderBy(desc(conversations.pinned), desc(conversations.createdAt));

  return jsonResponse(ConversationListSchema, rows);
}

export async function POST(req: Request) {
  const body = await parseJsonBody(req, CreateConversationBodySchema);
  if (!body.success) {
    return body.response;
  }

  const locale = getRequestLocale(req);
  const id = crypto.randomUUID();

  await db.insert(conversations).values({
    id,
    title:
      body.data.title?.trim() ??
      getTranslation(locale, "conversation.defaultTitle"),
  });

  const createdRows = await db
    .select()
    .from(conversations)
    .where(eq(conversations.id, id));

  const conversation = createdRows.at(0);
  if (!conversation) {
    return errorResponse("Failed to create conversation", 500);
  }

  return jsonResponse(ConversationSchema, conversation);
}
