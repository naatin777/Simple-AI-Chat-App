"use client";

import { PencilIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type ConversationTitleProps = {
  conversationId: string | null;
  title: string;
  onTitleChange: (conversationId: string, title: string) => void;
};

export function ConversationTitle({
  conversationId,
  title,
  onTitleChange,
}: ConversationTitleProps) {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(title);
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDraft(title);
  }, [title]);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  async function saveTitle() {
    if (!conversationId || isSaving) return;

    const trimmedTitle = draft.trim();
    if (!trimmedTitle || trimmedTitle === title) {
      setDraft(title);
      setIsEditing(false);
      return;
    }

    setIsSaving(true);

    const response = await fetch(`/api/conversations/${conversationId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: trimmedTitle }),
    });

    setIsSaving(false);

    if (!response.ok) {
      setDraft(title);
      setIsEditing(false);
      return;
    }

    const conversation = await response.json();
    onTitleChange(conversationId, conversation.title);
    setIsEditing(false);
  }

  if (!conversationId) {
    return <h1 className="text-sm font-medium">{t("app.title")}</h1>;
  }

  if (isEditing) {
    return (
      <Input
        ref={inputRef}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        disabled={isSaving}
        className="h-8 max-w-sm text-sm font-medium"
        onBlur={() => {
          void saveTitle();
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            void saveTitle();
          }

          if (event.key === "Escape") {
            setDraft(title);
            setIsEditing(false);
          }
        }}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setIsEditing(true)}
      className={cn(
        "group flex max-w-sm items-center gap-2 rounded-md px-2 py-1 text-left text-sm font-medium transition-colors",
        "hover:bg-muted",
      )}
    >
      <span className="truncate">{title}</span>
      <PencilIcon className="size-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
    </button>
  );
}
