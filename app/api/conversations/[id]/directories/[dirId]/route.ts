import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { conversationDirectories } from "@/lib/db/schema";
import { errorResponse, jsonResponse } from "@/lib/openapi/parse";
import { SuccessResponseSchema } from "@/lib/openapi/schemas/common";

export const runtime = "nodejs";

export async function DELETE(
  _req: Request,
  {
    params,
  }: { params: Promise<{ id: string; dirId: string }> },
) {
  const { id, dirId } = await params;

  const existingRows = await db
    .select()
    .from(conversationDirectories)
    .where(
      and(
        eq(conversationDirectories.id, dirId),
        eq(conversationDirectories.conversationId, id),
      ),
    );

  if (existingRows.length === 0) {
    return errorResponse("Directory not found", 404);
  }

  await db
    .delete(conversationDirectories)
    .where(eq(conversationDirectories.id, dirId));

  return jsonResponse(SuccessResponseSchema, { success: true });
}
