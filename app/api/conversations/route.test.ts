import { setupTestDb } from "@/lib/db/vitest-mock";

setupTestDb();

describe("GET /api/conversations", () => {
  it("returns an empty list when no conversations exist", async () => {
    const { GET } = await import("./route");
    const response = await GET();
    const body: unknown = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual([]);
  });
});

describe("POST /api/conversations", () => {
  it("creates a conversation with the provided title", async () => {
    const { POST } = await import("./route");
    const request = new Request("http://localhost/api/conversations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Locale": "en",
      },
      body: JSON.stringify({ title: "Test conversation" }),
    });

    const response = await POST(request);
    const body = (await response.json()) as {
      id: string;
      title: string;
      pinned: boolean;
      createdAt: string;
    };

    expect(response.status).toBe(200);
    expect(body.title).toBe("Test conversation");
    expect(body.pinned).toBe(false);
    expect(body.id).toBeTruthy();
  });

  it("returns 400 for invalid JSON", async () => {
    const { POST } = await import("./route");
    const request = new Request("http://localhost/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{",
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
  });

  it("uses the default title when none is provided", async () => {
    const { POST } = await import("./route");
    const request = new Request("http://localhost/api/conversations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Locale": "ja",
      },
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    const body = (await response.json()) as { title: string };

    expect(response.status).toBe(200);
    expect(body.title).toBe("新しい会話");
  });
});
