"use client";

import { Globe } from "lucide-react";
import { useTranslation } from "react-i18next";

import { ChatWebSources } from "@/components/chat-web-sources";
import { parseTavilySearchOutput } from "@/lib/tavily/parse-search-results";

type WebSearchToolPart = {
  type: "tool-webSearch";
  toolCallId: string;
  state: string;
  input?: { query?: string };
  output?: unknown;
  errorText?: string;
};

export function isWebSearchToolPart(
  part: { type: string },
): part is WebSearchToolPart {
  return part.type === "tool-webSearch";
}

export function ChatWebSearchStatus({ part }: { part: WebSearchToolPart }) {
  const { t } = useTranslation();
  const query =
    typeof part.input?.query === "string" ? part.input.query : undefined;

  if (part.state === "output-error") {
    return (
      <p className="mb-2 text-xs text-destructive">
        {part.errorText ?? t("chat.webSearchError")}
      </p>
    );
  }

  if (
    part.state === "input-streaming" ||
    part.state === "input-available" ||
    part.state === "approval-requested"
  ) {
    return (
      <p className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Globe className="size-3.5 shrink-0 animate-pulse" />
        {query
          ? t("chat.webSearching", { query })
          : t("chat.webSearchPending")}
      </p>
    );
  }

  if (part.state === "output-available") {
    const sources = parseTavilySearchOutput(part.output);

    return (
      <div className="mb-2">
        <p className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Globe className="size-3.5 shrink-0" />
          {query
            ? t("chat.webSearchDone", { query })
            : t("chat.webSearchComplete")}
        </p>
        <ChatWebSources sources={sources} />
      </div>
    );
  }

  return null;
}
