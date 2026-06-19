import { afterEach, vi } from "vitest";

import { conversations } from "@/lib/db/schema";
import { getTestDb, setupTestDb } from "@/lib/db/vitest-mock";
import { seedConversation } from "@/lib/test/seed";

setupTestDb();

describe("POST /api/admin/reset", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("clears all conversations in development", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("VERCEL", "");

    await seedConversation();
    const { POST } = await import("./route");
    const response = await POST();
    const body = (await response.json()) as { success: boolean };

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);

    const { db } = getTestDb();
    const rows = await db.select().from(conversations);

    expect(rows).toHaveLength(0);
  });

  it("returns 403 outside local development", async () => {
    vi.stubEnv("NODE_ENV", "production");

    const { POST } = await import("./route");
    const response = await POST();

    expect(response.status).toBe(403);
  });
});
