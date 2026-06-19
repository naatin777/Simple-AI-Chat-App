import { setupTestDb } from "@/lib/db/vitest-mock";
import { seedConversation, seedMessage } from "@/lib/test/seed";

setupTestDb();

describe("GET /api/conversations/[id]/messages", () => {
  it("returns messages ordered by createdAt", async () => {
    const { id } = await seedConversation();
    await seedMessage(id, "First", "user");
    await seedMessage(id, "Second", "assistant");

    const { GET } = await import("./route");
    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ id }),
    });
    const body = (await response.json()) as {
      content: string;
      role: string;
    }[];

    expect(response.status).toBe(200);
    expect(body).toHaveLength(2);
    expect(body[0]?.content).toBe("First");
    expect(body[1]?.content).toBe("Second");
  });

  it("returns an empty list when the conversation has no messages", async () => {
    const { id } = await seedConversation();

    const { GET } = await import("./route");
    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ id }),
    });
    const body: unknown = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual([]);
  });
});
