import { vi } from "vitest";

const { getDocumentProxy, extractText } = vi.hoisted(() => ({
  getDocumentProxy: vi.fn(),
  extractText: vi.fn(),
}));

vi.mock("unpdf", () => ({
  getDocumentProxy,
  extractText,
}));

import { extractPdfText } from "@/lib/rag/extract-pdf-text";

describe("extractPdfText", () => {
  beforeEach(() => {
    getDocumentProxy.mockReset();
    extractText.mockReset();
    getDocumentProxy.mockResolvedValue({ id: "pdf-proxy" });
    extractText.mockResolvedValue({ totalPages: 1, text: "Hello PDF" });
  });

  it("extracts merged text via unpdf", async () => {
    await expect(extractPdfText(new Uint8Array([1, 2, 3]))).resolves.toBe("Hello PDF");

    expect(getDocumentProxy).toHaveBeenCalledWith(
      new Uint8Array([1, 2, 3]),
      expect.objectContaining({
        cMapPacked: true,
        cMapUrl: expect.stringContaining("cmaps"),
      }),
    );
    expect(extractText).toHaveBeenCalledWith({ id: "pdf-proxy" }, { mergePages: true });
  });

  it("converts Node.js Buffer before extraction", async () => {
    const { Buffer } = await import("node:buffer");

    await extractPdfText(Buffer.from([1, 2, 3]));

    expect(getDocumentProxy).toHaveBeenCalledWith(
      new Uint8Array([1, 2, 3]),
      expect.objectContaining({
        cMapPacked: true,
        cMapUrl: expect.stringContaining("cmaps"),
      }),
    );
  });

  it("skips cMap options in production builds", async () => {
    vi.stubEnv("NODE_ENV", "production");

    await extractPdfText(new Uint8Array([1, 2, 3]));

    expect(getDocumentProxy).toHaveBeenCalledWith(
      new Uint8Array([1, 2, 3]),
      undefined,
    );

    vi.unstubAllEnvs();
  });
});
