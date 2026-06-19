import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import type { ConversationFileReadError } from "@/lib/fs/read-conversation-file";
import {
  extractTextFromConversationFile,
  readConversationFile,
} from "@/lib/fs/read-conversation-file";

function createFixtureDir() {
  const root = mkdtempSync(path.join(tmpdir(), "chat-app-read-file-test-"));
  writeFileSync(path.join(root, "notes.md"), "# Notes");
  writeFileSync(path.join(root, "binary.bin"), Buffer.from([0, 1, 2, 3, 4]));

  return root;
}

describe("readConversationFile", () => {
  let fixtureRoot = "";

  beforeEach(() => {
    fixtureRoot = createFixtureDir();
  });

  afterEach(() => {
    rmSync(fixtureRoot, { recursive: true, force: true });
  });

  it("reads a text file with metadata", async () => {
    const file = await readConversationFile(fixtureRoot, "notes.md");

    expect(file.filename).toBe("notes.md");
    expect(file.previewKind).toBe("text");
    expect(file.contentHash).toHaveLength(64);
  });

  it("throws when the path is a directory", async () => {
    mkdirSync(path.join(fixtureRoot, "folder"));

    await expect(readConversationFile(fixtureRoot, "folder")).rejects.toMatchObject({
      code: "NOT_A_FILE",
    } satisfies Partial<ConversationFileReadError>);
  });

  it("extracts text from markdown files", async () => {
    const file = await readConversationFile(fixtureRoot, "notes.md");
    const text = await extractTextFromConversationFile(file);

    expect(text).toBe("# Notes");
  });

  it("skips likely binary files", async () => {
    const file = await readConversationFile(fixtureRoot, "binary.bin");
    const text = await extractTextFromConversationFile(file);

    expect(text).toBeNull();
  });
});
