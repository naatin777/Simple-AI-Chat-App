import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { setupTestDb } from "@/lib/db/vitest-mock";
import { seedConversation, seedDirectory } from "@/lib/test/seed";

setupTestDb();

function createFixtureDir() {
  const root = mkdtempSync(path.join(tmpdir(), "chat-app-files-route-test-"));
  mkdirSync(path.join(root, "src"));
  writeFileSync(path.join(root, "readme.md"), "# readme");
  writeFileSync(path.join(root, "src", "index.ts"), "export {}");

  return root;
}

describe("GET /api/conversations/[id]/directories/[dirId]/files", () => {
  let fixtureRoot = "";

  beforeEach(() => {
    fixtureRoot = createFixtureDir();
  });

  afterEach(() => {
    rmSync(fixtureRoot, { recursive: true, force: true });
  });

  it("returns all files under the directory root", async () => {
    const { id } = await seedConversation();
    const { id: dirId } = await seedDirectory(id, fixtureRoot);

    const { GET } = await import("./route");
    const response = await GET(
      new Request("http://localhost?relativePath="),
      { params: Promise.resolve({ id, dirId }) },
    );
    const body = (await response.json()) as {
      files: { path: string }[];
    };

    expect(response.status).toBe(200);
    expect(body.files.map((file) => file.path).sort()).toEqual([
      "readme.md",
      "src/index.ts",
    ]);
  });

  it("returns 404 when the directory record does not exist", async () => {
    const { id } = await seedConversation();

    const { GET } = await import("./route");
    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ id, dirId: "missing" }),
    });

    expect(response.status).toBe(404);
  });
});
