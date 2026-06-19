"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { Globe } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDirectorySelection } from "@/hooks/use-directory-selection";
import { useDirectorySelectionStore } from "@/stores/directory-selection-store";
import { ChatMessageContent } from "@/components/chat-message";
import { ChatSources } from "@/components/chat-sources";
import {
  ChatWebSearchStatus,
  isWebSearchToolPart,
} from "@/components/chat-web-search-status";
import { getRagSources } from "@/lib/chat/message-metadata";
import { FileReferenceAutocomplete } from "@/components/file-reference-autocomplete";
import { Button } from "@/components/ui/button";
import { getClientLocale } from "@/lib/i18n/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { filterSlashCommandSuggestions } from "@/lib/directory-selection/slash-commands";
import {
  filterReferenceSuggestions,
  getActiveAutocompleteTrigger,
  getRegisteredReferencePaths,
  removeReferenceTrigger,
} from "@/lib/directory-selection/reference-path";

type ChatProps = {
  conversationId: string;
  initialMessages: UIMessage[];
  onConversationUpdated?: () => void;
  webSearchAvailable?: boolean;
};

export function Chat({
  conversationId,
  initialMessages,
  onConversationUpdated,
  webSearchAvailable = false,
}: ChatProps) {
  const { t } = useTranslation();
  const {
    applyInputReferences,
    applyAutocompleteSelection,
    applySlashCommand,
    items,
  } = useDirectorySelection();
  const [input, setInput] = useState("");
  const [webSearchEnabled, setWebSearchEnabled] = useState(true);
  const [cursor, setCursor] = useState(0);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: () => ({
          conversationId,
          checkedFileKeys: [
            ...useDirectorySelectionStore.getState().checkedFileKeys,
          ],
          webSearch: webSearchAvailable ? webSearchEnabled : false,
        }),
        headers: { "X-Locale": getClientLocale() },
      }),
    [conversationId, webSearchAvailable, webSearchEnabled],
  );

  const { messages, sendMessage, status } = useChat({
    id: conversationId,
    messages: initialMessages,
    transport,
    onFinish: () => {
      onConversationUpdated?.();
    },
  });

  const isLoading = status === "submitted" || status === "streaming";
  const activeReferenceTrigger = getActiveAutocompleteTrigger(input, cursor);
  const referenceSuggestions = useMemo(() => {
    if (!activeReferenceTrigger) return [];

    if (activeReferenceTrigger.trigger === "/") {
      return filterSlashCommandSuggestions(activeReferenceTrigger.query).map(
        (command) => command.id,
      );
    }

    return filterReferenceSuggestions(
      getRegisteredReferencePaths(items),
      activeReferenceTrigger.query,
    );
  }, [activeReferenceTrigger, items]);

  function updateInput(value: string, nextCursor = value.length) {
    setInput(value);
    setCursor(nextCursor);
    setSelectedSuggestionIndex(0);
    applyInputReferences(value);
  }

  function applySuggestion(suggestion: string) {
    if (!activeReferenceTrigger) return;

    const { value, cursor: nextCursor } = removeReferenceTrigger(
      input,
      activeReferenceTrigger,
    );

    setInput(value);
    setCursor(nextCursor);
    setSelectedSuggestionIndex(0);

    if (activeReferenceTrigger.trigger === "/") {
      applySlashCommand(suggestion);
    } else {
      applyAutocompleteSelection(
        suggestion,
        activeReferenceTrigger.trigger === "@" ? "include" : "exclude",
      );
    }

    requestAnimationFrame(() => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      textarea.focus();
      textarea.setSelectionRange(nextCursor, nextCursor);
    });
  }

  function submitMessage() {
    if (!input.trim() || isLoading) return;

    sendMessage({ text: input });
    setInput("");
    setCursor(0);
    setSelectedSuggestionIndex(0);
    applyInputReferences("");
  }

  return (
    <div className="mx-auto flex h-full min-h-0 w-full max-w-3xl flex-1 flex-col overflow-hidden">
      <ScrollArea className="h-0 min-h-0 flex-1 pr-4">
        <div className="space-y-4 pb-4">
          {messages.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {t("chat.emptyState")}
            </p>
          ) : null}
          {messages.map((message) => {
            const ragSources =
              message.role === "assistant"
                ? getRagSources(message.metadata)
                : undefined;

            return (
              <div
                key={message.id}
                className={
                  message.role === "user"
                    ? "ml-auto max-w-[85%] rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground"
                    : "max-w-[85%] rounded-lg bg-muted px-4 py-2 text-sm"
                }
              >
                <p className="mb-1 text-xs font-medium opacity-70">
                  {message.role === "user" ? t("chat.you") : t("chat.assistant")}
                </p>
                {message.parts.map((part) => {
                  if (part.type === "text") {
                    return (
                      <ChatMessageContent
                        key={`${message.id}-${part.text.slice(0, 32)}`}
                        role={message.role}
                        text={part.text}
                      />
                    );
                  }

                  if (isWebSearchToolPart(part)) {
                    return (
                      <ChatWebSearchStatus
                        key={`${message.id}-${part.toolCallId}`}
                        part={part}
                      />
                    );
                  }

                  return null;
                })}
                {ragSources ? <ChatSources sources={ragSources} /> : null}
              </div>
            );
          })}
        </div>
      </ScrollArea>
      <form
        className="relative mt-4 flex w-full shrink-0 gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          submitMessage();
        }}
      >
        {activeReferenceTrigger ? (
          <FileReferenceAutocomplete
            trigger={activeReferenceTrigger}
            selectedIndex={selectedSuggestionIndex}
            onSelect={applySuggestion}
          />
        ) : null}
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={(event) => {
            updateInput(event.target.value, event.target.selectionStart ?? 0);
          }}
          onSelect={(event) => {
            setCursor(event.currentTarget.selectionStart ?? 0);
          }}
          onClick={(event) => {
            setCursor(event.currentTarget.selectionStart ?? 0);
          }}
          onKeyUp={(event) => {
            setCursor(event.currentTarget.selectionStart ?? 0);
          }}
          placeholder={t("chat.inputPlaceholder")}
          disabled={isLoading}
          rows={3}
          className="min-h-0 resize-none"
          onKeyDown={(event) => {
            if (activeReferenceTrigger && referenceSuggestions.length > 0) {
              if (event.key === "ArrowDown") {
                event.preventDefault();
                setSelectedSuggestionIndex(
                  (current) => (current + 1) % referenceSuggestions.length,
                );
                return;
              }

              if (event.key === "ArrowUp") {
                event.preventDefault();
                setSelectedSuggestionIndex((current) =>
                  current === 0
                    ? referenceSuggestions.length - 1
                    : current - 1,
                );
                return;
              }

              const shouldComplete =
                event.key === "Tab" ||
                (event.key === "Enter" &&
                  !event.nativeEvent.isComposing &&
                  !event.metaKey &&
                  !event.ctrlKey &&
                  !event.shiftKey);

              if (shouldComplete) {
                event.preventDefault();
                const suggestion =
                  referenceSuggestions[
                    selectedSuggestionIndex % referenceSuggestions.length
                  ];
                if (suggestion) {
                  applySuggestion(suggestion);
                }
                return;
              }
            }

            if (event.key !== "Enter" || event.nativeEvent.isComposing) return;

            const shouldSend =
              event.metaKey || event.ctrlKey || event.shiftKey;

            if (shouldSend) {
              event.preventDefault();
              submitMessage();
            }
          }}
        />
        {webSearchAvailable ? (
          <Button
            type="button"
            variant={webSearchEnabled ? "default" : "outline"}
            size="icon"
            className="shrink-0"
            aria-pressed={webSearchEnabled}
            aria-label={
              webSearchEnabled
                ? t("chat.webSearchOn")
                : t("chat.webSearchOff")
            }
            title={
              webSearchEnabled
                ? t("chat.webSearchOn")
                : t("chat.webSearchOff")
            }
            onClick={() => {
              setWebSearchEnabled((current) => !current);
            }}
          >
            <Globe className="size-4" />
          </Button>
        ) : null}
        <Button type="submit" disabled={isLoading || !input.trim()}>
          {t("chat.send")}
        </Button>
      </form>
    </div>
  );
}
