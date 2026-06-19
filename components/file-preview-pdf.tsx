"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { loadPdfDocumentFromUrl } from "@/lib/pdfjs/load-document";

type FilePreviewPdfProps = {
  url: string;
};

export function FilePreviewPdf({ url }: FilePreviewPdfProps) {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const container = containerRef.current;
    if (!container) return;

    container.replaceChildren();
    setError(null);

    async function renderPdf() {
      try {
        const pdf = await loadPdfDocumentFromUrl(url);

        if (cancelled) return;

        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
          const page = await pdf.getPage(pageNumber);
          if (cancelled) return;

          const viewport = page.getViewport({ scale: 1.25 });
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");

          if (!context) {
            throw new Error("Canvas context unavailable");
          }

          canvas.width = viewport.width;
          canvas.height = viewport.height;
          canvas.className = "mx-auto mb-4 block max-w-full";

          await page.render({ canvasContext: context, viewport, canvas }).promise;

          if (cancelled || !container) return;
          container.appendChild(canvas);
        }
      } catch (caughtError) {
        if (!cancelled) {
          console.error("[FilePreviewPdf] Render failed:", caughtError);
          setError(t("filePreview.error"));
        }
      }
    }

    void renderPdf();

    return () => {
      cancelled = true;
      container.replaceChildren();
    };
  }, [t, url]);

  if (error) {
    return <p className="text-sm text-destructive">{error}</p>;
  }

  return <div ref={containerRef} className="overflow-auto" />;
}
