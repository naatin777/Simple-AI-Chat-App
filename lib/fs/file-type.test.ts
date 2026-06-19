import {
  getContentType,
  getFileExtension,
  getFilePreviewKind,
} from "./file-type";

describe("getFileExtension", () => {
  it("returns lowercase extension", () => {
    expect(getFileExtension("README.MD")).toBe("md");
    expect(getFileExtension("no-extension")).toBe("");
  });
});

describe("getFilePreviewKind", () => {
  it("classifies image files", () => {
    expect(getFilePreviewKind("photo.png")).toBe("image");
    expect(getFilePreviewKind("icon.svg")).toBe("image");
  });

  it("classifies pdf files", () => {
    expect(getFilePreviewKind("document.pdf")).toBe("pdf");
  });

  it("classifies video files", () => {
    expect(getFilePreviewKind("clip.mp4")).toBe("video");
    expect(getFilePreviewKind("clip.webm")).toBe("video");
  });

  it("defaults to text", () => {
    expect(getFilePreviewKind("index.ts")).toBe("text");
    expect(getFilePreviewKind("README")).toBe("text");
  });
});

describe("getContentType", () => {
  it("returns known mime types", () => {
    expect(getContentType("index.ts")).toBe("text/typescript");
    expect(getContentType("photo.png")).toBe("image/png");
  });

  it("falls back to plain text", () => {
    expect(getContentType("unknown")).toBe("text/plain; charset=utf-8");
  });
});
