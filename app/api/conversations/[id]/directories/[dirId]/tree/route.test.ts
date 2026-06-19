import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { setupTestDb } from "@/lib/db/vitest-mock";
import { seedConversation, seedDirectory } from "@/lib/test/seed";

setupTestDb();

function createFixtureDir() {
  const root = mkdtempSync(path.join(tmpdir(), "chat-app-tree-test-"));
  mkdirSync(path.join(root, "src"));
  writeFileSync(path.join(root, "readme.md"), "# readme");
  writeFileSync(path.join(root, "src", "index.ts"), "export {}");

  return root;
}

describe("GET /api/conversations/[id]/directories/[dirId]/tree", () => {
  let fixtureRoot = "";

  beforeEach(() => {
    fixtureRoot = createFixtureDir();
  });

  afterEach(() => {
    rmSync(fixtureRoot, { recursive: true, force: true });
  });

  it("lists children at the directory root", async () => {
    const { id } = await seedConversation();
    const { id: dirId } = await seedDirectory(id, fixtureRoot);

    const { GET } = await import("./route");
    const response = await GET(
      new Request(`http://localhost?relativePath=`),
      { params: Promise.resolve({ id, dirId }) },
    );
    const body = (await response.json()) as {
      nodes: { name: string; type: string }[];
    };

    expect(response.status).toBe(200);
    expect(body.nodes.map((node) => node.name).sort()).toEqual([
      "readme.md",
      "src",
    ]);
    expect(body.nodes.find((node) => node.name === "src")?.type).toBe(
      "directory",
    );
  });

  it("returns 404 when the directory record does not exist", async () => {
    const { id } = await seedConversation();

    const { GET } = await import("./route");
    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ id, dirId: "missing" }),
    });

    expect(response.status).toBe(404);
  });

  it("returns 404 for a missing relative path", async () => {
    const { id } = await seedConversation();
    const { id: dirId } = await seedDirectory(id, fixtureRoot);

    const { GET } = await import("./route");
    const response = await GET(
      new Request("http://localhost?relativePath=missing"),
      { params: Promise.resolve({ id, dirId }) },
    );

    expect(response.status).toBe(404);
  });
});
