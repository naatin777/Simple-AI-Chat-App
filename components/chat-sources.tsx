"use client";

import { useTranslation } from "react-i18next";

import type { RagSource } from "@/lib/rag/types";
import { useFilePreviewStore } from "@/stores/file-preview-store";

type ChatSourcesProps = {
  sources: RagSource[];
};

function formatScore(score: number): string | null {
  if (score >= 0.999) {
    return null;
  }

  return `${Math.round(score * 100)}%`;
}

export function ChatSources({ sources }: ChatSourcesProps) {
  const { t } = useTranslation();
  const openFile = useFilePreviewStore((state) => state.openFile);

  return (
    <div className="mt-3 border-t border-border/60 pt-3">
      <p className="mb-2 text-xs font-medium text-muted-foreground">
        {t("chat.sources")}
      </p>
      <ul className="space-y-2">
        {sources.map((source) => {
          const scoreLabel = formatScore(source.score);

          return (
            <li key={source.id}>
              <button
                type="button"
                className="w-full rounded-md border border-border/60 bg-background/60 px-3 py-2 text-left text-xs transition-colors hover:bg-muted/60"
                onClick={() => {
                  if (!source.directoryId) {
                    return;
                  }

                  openFile({
                    directoryId: source.directoryId,
                    relativePath: source.relativePath,
                    name: source.relativePath.split("/").pop() ?? source.relativePath,
                  });
                }}
              >
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="font-medium text-foreground">
                    [{source.id}] {source.relativePath}
                  </span>
                  <span className="text-muted-foreground">
                    {t("chat.sourceChunk", {
                      current: source.chunkIndex + 1,
                      total: source.chunkTotal,
                    })}
                  </span>
                  {scoreLabel ? (
                    <span className="text-muted-foreground">
                      {t("chat.sourceScore", { score: scoreLabel })}
                    </span>
                  ) : null}
                </div>
                {source.excerpt ? (
                  <p className="mt-1 line-clamp-2 text-muted-foreground">
                    {source.excerpt}
                  </p>
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
