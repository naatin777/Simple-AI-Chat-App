import { eq } from "drizzle-orm";

import { conversations } from "@/lib/db/schema";
import { getTestDb, setupTestDb } from "@/lib/db/vitest-mock";

setupTestDb();

async function seedConversation(title = "Original title") {
  const { db } = getTestDb();
  const id = crypto.randomUUID();

  await db.insert(conversations).values({
    id,
    title,
    pinned: false,
  });

  return id;
}

describe("PATCH /api/conversations/[id]", () => {
  it("updates the conversation title", async () => {
    const id = await seedConversation();
    const { PATCH } = await import("./route");
    const request = new Request(`http://localhost/api/conversations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Renamed" }),
    });

    const response = await PATCH(request, {
      params: Promise.resolve({ id }),
    });
    const body = (await response.json()) as { title: string };

    expect(response.status).toBe(200);
    expect(body.title).toBe("Renamed");
  });

  it("pins a conversation", async () => {
    const id = await seedConversation();
    const { PATCH } = await import("./route");
    const request = new Request(`http://localhost/api/conversations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pinned: true }),
    });

    const response = await PATCH(request, {
      params: Promise.resolve({ id }),
    });
    const body = (await response.json()) as { pinned: boolean };

    expect(response.status).toBe(200);
    expect(body.pinned).toBe(true);
  });

  it("returns 400 when title is blank", async () => {
    const id = await seedConversation();
    const { PATCH } = await import("./route");
    const request = new Request(`http://localhost/api/conversations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "   " }),
    });

    const response = await PATCH(request, {
      params: Promise.resolve({ id }),
    });

    expect(response.status).toBe(400);
  });
});

describe("DELETE /api/conversations/[id]", () => {
  it("deletes an existing conversation", async () => {
    const id = await seedConversation();
    const { DELETE } = await import("./route");
    const response = await DELETE(new Request("http://localhost"), {
      params: Promise.resolve({ id }),
    });
    const body = (await response.json()) as { success: boolean };

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);

    const { db } = getTestDb();
    const rows = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, id));

    expect(rows).toHaveLength(0);
  });

  it("returns 404 when the conversation does not exist", async () => {
    const { DELETE } = await import("./route");
    const response = await DELETE(new Request("http://localhost"), {
      params: Promise.resolve({ id: "missing-id" }),
    });

    expect(response.status).toBe(404);
  });
});
