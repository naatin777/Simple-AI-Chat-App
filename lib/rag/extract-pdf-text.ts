import { extractText, getDocumentProxy } from "unpdf";

import { toPdfBinaryData } from "@/lib/pdfjs/load-document";
import { getPdfCMapUrl } from "@/lib/pdfjs/pdf-cmap-url";

function getPdfProxyOptions():
  | {
      cMapUrl: string;
      cMapPacked: true;
    }
  | undefined {
  // file:// cMap paths break inside Next.js production server bundles.
  if (process.env.NODE_ENV === "production") {
    return undefined;
  }

  return {
    cMapUrl: getPdfCMapUrl(),
    cMapPacked: true,
  };
}

export async function extractPdfText(data: ArrayBuffer | Uint8Array): Promise<string> {
  const bytes = toPdfBinaryData(data);
  const pdfOptions = getPdfProxyOptions();
  const pdf = await getDocumentProxy(
    bytes,
    pdfOptions ? pdfOptions : undefined,
  );
  const { text } = await extractText(pdf, { mergePages: true });

  return text.trim();
}
