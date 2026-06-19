import { vi } from "vitest";

vi.mock("@/lib/rag/load-selected-file-text", () => ({
  loadSelectedFileTexts: vi.fn(),
}));

import { loadSelectedFileTexts } from "@/lib/rag/load-selected-file-text";
import { prepareStuffContext } from "@/lib/rag/prepare-stuff-context";

describe("prepareStuffContext", () => {
  beforeEach(() => {
    vi.mocked(loadSelectedFileTexts).mockReset();
  });

  it("builds context from selected file text without embeddings", async () => {
    vi.mocked(loadSelectedFileTexts).mockResolvedValue([
      {
        fileKey: "file:dir-1:notes.md",
        relativePath: "notes.md",
        text: "Hello from notes",
      },
    ]);

    await expect(
      prepareStuffContext({
        conversationId: "conv-1",
        checkedFileKeys: ["file:dir-1:notes.md"],
      }),
    ).resolves.toEqual({
      context: "--- [1] path: notes.md (chunk 1/1) ---\nHello from notes",
      sources: [
        expect.objectContaining({
          id: 1,
          relativePath: "notes.md",
          chunkIndex: 0,
          chunkTotal: 1,
        }),
      ],
    });
  });
});
