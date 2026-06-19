import { db } from "@/lib/db";
import { resetDatabase } from "@/lib/db/reset";
import { errorResponse, jsonResponse } from "@/lib/openapi/parse";
import { SuccessResponseSchema } from "@/lib/openapi/schemas/common";

export const runtime = "nodejs";

export async function POST() {
  if (process.env.NODE_ENV !== "development" || process.env.VERCEL === "1") {
    return errorResponse("Database reset is only available in local development", 403);
  }

  await resetDatabase(db);

  return jsonResponse(SuccessResponseSchema, { success: true });
}
