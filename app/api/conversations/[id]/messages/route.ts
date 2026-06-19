import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { messages } from "@/lib/db/schema";
import { jsonResponse } from "@/lib/openapi/parse";
import { StoredMessageListSchema } from "@/lib/openapi/schemas/message";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const rows = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, id))
    .orderBy(asc(messages.createdAt));

  return jsonResponse(StoredMessageListSchema, rows);
}
