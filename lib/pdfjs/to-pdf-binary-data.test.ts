import { Buffer } from "node:buffer";

import { toPdfBinaryData } from "@/lib/pdfjs/load-document";

describe("toPdfBinaryData", () => {
  it("copies Node.js Buffer into a plain Uint8Array", () => {
    const buffer = Buffer.from([1, 2, 3]);
    const bytes = toPdfBinaryData(buffer);

    expect(bytes).toEqual(new Uint8Array([1, 2, 3]));
    expect(Buffer.isBuffer(bytes)).toBe(false);
  });

  it("returns Uint8Array input unchanged", () => {
    const input = new Uint8Array([4, 5, 6]);
    expect(toPdfBinaryData(input)).toBe(input);
  });
});
