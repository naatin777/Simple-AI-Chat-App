import { eq } from "drizzle-orm";

import { setupTestDb, getTestDb } from "@/lib/db/vitest-mock";
import { conversationDirectories } from "@/lib/db/schema";
import { seedConversation, seedDirectory } from "@/lib/test/seed";

setupTestDb();

describe("POST /api/conversations/[id]/duplicate-directories", () => {
  it("duplicates a conversation with its directories but not messages", async () => {
    const { id } = await seedConversation("With dirs");
    await seedDirectory(id, "/tmp/dir-one", "dir-one");
    await seedDirectory(id, "/tmp/dir-two", "dir-two");

    const { POST } = await import("./route");
    const response = await POST(
      new Request("http://localhost", {
        headers: { "X-Locale": "ja" },
      }),
      { params: Promise.resolve({ id }) },
    );
    const body = (await response.json()) as { id: string; title: string };

    expect(response.status).toBe(200);
    expect(body.id).not.toBe(id);

    const { db } = getTestDb();
    const directories = await db
      .select()
      .from(conversationDirectories)
      .where(eq(conversationDirectories.conversationId, body.id));

    expect(directories).toHaveLength(2);
    expect(directories.map((directory) => directory.name).sort()).toEqual([
      "dir-one",
      "dir-two",
    ]);
  });

  it("returns 404 when the source conversation does not exist", async () => {
    const { POST } = await import("./route");
    const response = await POST(new Request("http://localhost"), {
      params: Promise.resolve({ id: "missing" }),
    });

    expect(response.status).toBe(404);
  });
});
