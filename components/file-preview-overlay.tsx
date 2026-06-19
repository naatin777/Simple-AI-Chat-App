"use client";

import { XIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { FilePreviewPdf } from "@/components/file-preview-pdf";
import { useFilePreview } from "@/hooks/use-file-preview";
import { Button } from "@/components/ui/button";
import { getFilePreviewKind } from "@/lib/fs/file-type";

type FilePreviewOverlayProps = {
  conversationId: string;
};

export function FilePreviewOverlay({ conversationId }: FilePreviewOverlayProps) {
  const { t } = useTranslation();
  const { activeFile, closeFile } = useFilePreview();
  const [textContent, setTextContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const contentUrl = useMemo(() => {
    if (!activeFile) return null;

    const params = new URLSearchParams({
      relativePath: activeFile.relativePath,
    });

    return `/api/conversations/${conversationId}/directories/${activeFile.directoryId}/content?${params.toString()}`;
  }, [activeFile, conversationId]);

  const previewKind = activeFile ? getFilePreviewKind(activeFile.name) : null;

  useEffect(() => {
    if (!activeFile || !contentUrl || previewKind !== "text") {
      setTextContent(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);
    setTextContent(null);

    void fetch(contentUrl)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Failed to load file");
        }

        return response.text();
      })
      .then((text) => {
        if (!cancelled) {
          setTextContent(text);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError(t("filePreview.error"));
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [activeFile, contentUrl, previewKind, t]);

  if (!activeFile || !contentUrl || !previewKind) {
    return null;
  }

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-background/70 backdrop-blur-sm"
        onClick={closeFile}
        aria-label={t("filePreview.close")}
      />
      <div className="relative z-10 flex max-h-full w-full max-w-4xl flex-col overflow-hidden rounded-lg border bg-background shadow-lg">
        <div className="flex items-center gap-2 border-b px-3 py-2">
          <span className="min-w-0 flex-1 truncate text-sm font-medium">
            {activeFile.name}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={closeFile}
            aria-label={t("filePreview.close")}
          >
            <XIcon className="size-4" />
          </Button>
        </div>
        <div className="min-h-0 flex-1 overflow-auto p-4">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">
              {t("filePreview.loading")}
            </p>
          ) : error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : previewKind === "image" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={contentUrl}
              alt={activeFile.name}
              className="mx-auto max-h-[70vh] max-w-full object-contain"
            />
          ) : previewKind === "video" ? (
            <video
              src={contentUrl}
              controls
              className="mx-auto max-h-[70vh] max-w-full"
            >
              <track kind="captions" />
            </video>
          ) : previewKind === "pdf" ? (
            <FilePreviewPdf url={contentUrl} />
          ) : (
            <pre className="overflow-auto whitespace-pre-wrap break-words text-sm">
              {textContent}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
