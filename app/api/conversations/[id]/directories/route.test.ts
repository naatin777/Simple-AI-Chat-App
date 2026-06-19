import path from "node:path";

import { setupTestDb } from "@/lib/db/vitest-mock";
import { seedConversation, seedDirectory } from "@/lib/test/seed";

setupTestDb();

describe("GET /api/conversations/[id]/directories", () => {
  it("returns directories for an existing conversation", async () => {
    const { id } = await seedConversation();
    await seedDirectory(id, "/tmp/project-a", "project-a");

    const { GET } = await import("./route");
    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ id }),
    });
    const body = (await response.json()) as { name: string }[];

    expect(response.status).toBe(200);
    expect(body).toHaveLength(1);
    expect(body[0]?.name).toBe("project-a");
  });

  it("returns 404 when the conversation does not exist", async () => {
    const { GET } = await import("./route");
    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ id: "missing" }),
    });

    expect(response.status).toBe(404);
  });
});

describe("POST /api/conversations/[id]/directories", () => {
  it("adds a directory to the conversation", async () => {
    const { id } = await seedConversation();
    const { POST } = await import("./route");
    const request = new Request("http://localhost", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: "/tmp/new-project" }),
    });

    const response = await POST(request, {
      params: Promise.resolve({ id }),
    });
    const body = (await response.json()) as { name: string; path: string };

    expect(response.status).toBe(200);
    expect(body.name).toBe("new-project");
    expect(body.path).toBe(path.resolve("/tmp/new-project"));
  });

  it("returns 409 when the same directory is added twice", async () => {
    const { id } = await seedConversation();
    await seedDirectory(id, "/tmp/duplicate-project");

    const { POST } = await import("./route");
    const request = new Request("http://localhost", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: "/tmp/duplicate-project" }),
    });

    const response = await POST(request, {
      params: Promise.resolve({ id }),
    });

    expect(response.status).toBe(409);
  });

  it("returns 400 when path is empty", async () => {
    const { id } = await seedConversation();
    const { POST } = await import("./route");
    const request = new Request("http://localhost", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: "   " }),
    });

    const response = await POST(request, {
      params: Promise.resolve({ id }),
    });

    expect(response.status).toBe(400);
  });
});
