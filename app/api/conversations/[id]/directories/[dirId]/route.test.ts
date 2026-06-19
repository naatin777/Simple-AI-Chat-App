import { eq } from "drizzle-orm";

import { setupTestDb, getTestDb } from "@/lib/db/vitest-mock";
import { conversationDirectories } from "@/lib/db/schema";
import { seedConversation, seedDirectory } from "@/lib/test/seed";

setupTestDb();

describe("DELETE /api/conversations/[id]/directories/[dirId]", () => {
  it("removes a directory from the conversation", async () => {
    const { id } = await seedConversation();
    const { id: dirId } = await seedDirectory(id, "/tmp/remove-me");

    const { DELETE } = await import("./route");
    const response = await DELETE(new Request("http://localhost"), {
      params: Promise.resolve({ id, dirId }),
    });
    const body = (await response.json()) as { success: boolean };

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);

    const { db } = getTestDb();
    const rows = await db
      .select()
      .from(conversationDirectories)
      .where(eq(conversationDirectories.id, dirId));

    expect(rows).toHaveLength(0);
  });

  it("returns 404 when the directory does not exist", async () => {
    const { id } = await seedConversation();
    const { DELETE } = await import("./route");
    const response = await DELETE(new Request("http://localhost"), {
      params: Promise.resolve({ id, dirId: "missing-dir" }),
    });

    expect(response.status).toBe(404);
  });
});
