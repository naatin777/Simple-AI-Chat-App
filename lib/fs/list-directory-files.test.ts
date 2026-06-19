import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { listAllFilesUnder } from "./list-directory-files";

function createFixtureDir() {
  const root = mkdtempSync(path.join(tmpdir(), "chat-app-files-test-"));
  mkdirSync(path.join(root, "src"));
  mkdirSync(path.join(root, "src", "nested"));
  writeFileSync(path.join(root, "readme.md"), "# readme");
  writeFileSync(path.join(root, "src", "index.ts"), "export {}");
  writeFileSync(path.join(root, "src", "nested", "deep.ts"), "export {}");
  writeFileSync(path.join(root, ".hidden"), "secret");

  return root;
}

describe("listAllFilesUnder", () => {
  let fixtureRoot = "";

  beforeEach(() => {
    fixtureRoot = createFixtureDir();
  });

  afterEach(() => {
    rmSync(fixtureRoot, { recursive: true, force: true });
  });

  it("lists all files recursively", async () => {
    const files = await listAllFilesUnder(fixtureRoot);

    expect(files.map((file) => file.path).sort()).toEqual([
      "readme.md",
      "src/index.ts",
      "src/nested/deep.ts",
    ]);
  });

  it("lists files under a subdirectory", async () => {
    const files = await listAllFilesUnder(fixtureRoot, "src");

    expect(files.map((file) => file.path).sort()).toEqual([
      "src/index.ts",
      "src/nested/deep.ts",
    ]);
  });

  it("throws when directory does not exist", async () => {
    await expect(listAllFilesUnder(fixtureRoot, "missing")).rejects.toThrow(
      "Directory not found",
    );
  });
});
