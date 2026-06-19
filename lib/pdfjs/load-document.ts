import "@/lib/pdfjs/polyfills";

export const PDF_WORKER_SRC = "/pdf.worker.min.mjs";

export interface PDFPageProxy {
  getTextContent: () => Promise<{ items: { str?: string }[] }>;
  getViewport: (params: { scale: number }) => { width: number; height: number };
  render: (params: unknown) => { promise: Promise<void> };
}

export interface PDFDocumentProxy {
  numPages: number;
  getPage: (pageNumber: number) => Promise<PDFPageProxy>;
}

interface PdfJsModule {
  getDocument: (params: {
    data: Uint8Array;
    verbosity: number;
    useWorkerFetch: boolean;
  }) => { promise: Promise<PDFDocumentProxy> };
  GlobalWorkerOptions: {
    workerSrc: string;
  };
}

function isPdfJsModule(value: unknown): value is PdfJsModule {
  return (
    typeof value === "object" &&
    value !== null &&
    "getDocument" in value &&
    typeof value.getDocument === "function" &&
    "GlobalWorkerOptions" in value
  );
}

async function loadPdfJsModule(): Promise<PdfJsModule> {
  const pdfModule = await import("pdfjs-dist");

  if (!isPdfJsModule(pdfModule)) {
    throw new Error("Failed to load pdf.js module");
  }

  return pdfModule;
}

export function toPdfBinaryData(data: ArrayBuffer | Uint8Array): Uint8Array {
  // Node.js Buffer extends Uint8Array, but pdf.js rejects Buffer explicitly.
  if (typeof Buffer !== "undefined" && Buffer.isBuffer(data)) {
    return new Uint8Array(data);
  }

  if (data instanceof Uint8Array) {
    return data;
  }

  return new Uint8Array(data);
}

export async function loadPdfDocumentFromData(
  data: ArrayBuffer | Uint8Array,
  options?: { useWorker?: boolean },
): Promise<PDFDocumentProxy> {
  const pdfjs = await loadPdfJsModule();
  const bytes = toPdfBinaryData(data);
  const useWorker = options?.useWorker !== false;

  if (useWorker) {
    pdfjs.GlobalWorkerOptions.workerSrc = PDF_WORKER_SRC;
  }

  return pdfjs.getDocument({
    data: bytes,
    verbosity: 0,
    useWorkerFetch: useWorker,
  }).promise;
}

export async function loadPdfDocumentFromUrl(
  url: string,
  options?: { useWorker?: boolean },
): Promise<PDFDocumentProxy> {
  const response = await fetch(url);

  if (!response.ok) {
    let message = `HTTP ${String(response.status)}`;

    try {
      const body: unknown = await response.json();

      if (
        typeof body === "object" &&
        body !== null &&
        "error" in body &&
        typeof body.error === "string"
      ) {
        message = body.error;
      }
    } catch {
      // Response body is not JSON.
    }

    throw new Error(message);
  }

  const data = await response.arrayBuffer();
  return loadPdfDocumentFromData(data, options);
}
