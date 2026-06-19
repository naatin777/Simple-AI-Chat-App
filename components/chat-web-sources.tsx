"use client";

import { ExternalLink } from "lucide-react";
import { useTranslation } from "react-i18next";

import type { WebSearchSource } from "@/lib/tavily/types";

type ChatWebSourcesProps = {
  sources: WebSearchSource[];
  query?: string;
};

function formatScore(score: number): string | null {
  if (score >= 0.999) {
    return null;
  }

  return `${Math.round(score * 100)}%`;
}

export function ChatWebSources({ sources, query }: ChatWebSourcesProps) {
  const { t } = useTranslation();

  if (sources.length === 0) {
    return null;
  }

  return (
    <div className="mb-3 border-t border-border/60 pt-3">
      <p className="mb-2 text-xs font-medium text-muted-foreground">
        {query
          ? t("chat.webSourcesForQuery", { query })
          : t("chat.webSources")}
      </p>
      <ul className="space-y-2">
        {sources.map((source) => {
          const scoreLabel =
            source.score === undefined ? null : formatScore(source.score);

          return (
            <li key={`${source.url}-${source.id}`}>
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-md border border-border/60 bg-background/60 px-3 py-2 text-left text-xs transition-colors hover:bg-muted/60"
              >
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="font-medium text-foreground">
                    [{source.id}] {source.title}
                  </span>
                  {scoreLabel ? (
                    <span className="text-muted-foreground">
                      {t("chat.sourceScore", { score: scoreLabel })}
                    </span>
                  ) : null}
                  <ExternalLink className="size-3 text-muted-foreground" />
                </div>
                <p className="mt-1 truncate text-muted-foreground">
                  {source.url}
                </p>
                {source.excerpt ? (
                  <p className="mt-1 line-clamp-2 text-muted-foreground">
                    {source.excerpt}
                  </p>
                ) : null}
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
