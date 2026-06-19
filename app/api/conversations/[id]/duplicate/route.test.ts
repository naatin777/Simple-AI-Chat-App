import { eq } from "drizzle-orm";

import { setupTestDb, getTestDb } from "@/lib/db/vitest-mock";
import { messages } from "@/lib/db/schema";
import { seedConversation, seedMessage } from "@/lib/test/seed";

setupTestDb();

describe("POST /api/conversations/[id]/duplicate", () => {
  it("duplicates a conversation and its messages", async () => {
    const { id } = await seedConversation("Original");
    await seedMessage(id, "Hello", "user");
    await seedMessage(id, "Hi there", "assistant");

    const { POST } = await import("./route");
    const response = await POST(
      new Request("http://localhost", {
        headers: { "X-Locale": "en" },
      }),
      { params: Promise.resolve({ id }) },
    );
    const body = (await response.json()) as {
      id: string;
      title: string;
    };

    expect(response.status).toBe(200);
    expect(body.id).not.toBe(id);
    expect(body.title).toContain("Original");

    const { db } = getTestDb();
    const duplicatedMessages = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, body.id));

    expect(duplicatedMessages).toHaveLength(2);
    expect(duplicatedMessages.map((message) => message.content)).toEqual([
      "Hello",
      "Hi there",
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
