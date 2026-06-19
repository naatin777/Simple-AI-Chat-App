"use client";

import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useDirectorySelection } from "@/hooks/use-directory-selection";
import {
  filterSlashCommandSuggestions,
  type SlashCommand,
} from "@/lib/directory-selection/slash-commands";
import { cn } from "@/lib/utils";
import {
  filterReferenceSuggestions,
  getRegisteredReferencePaths,
  type ActiveReferenceTrigger,
} from "@/lib/directory-selection/reference-path";

type FileReferenceAutocompleteProps = {
  trigger: ActiveReferenceTrigger;
  selectedIndex: number;
  onSelect: (suggestion: string) => void;
};

function getHeaderKey(trigger: ActiveReferenceTrigger["trigger"]): string {
  if (trigger === "@") {
    return "chat.referenceInclude";
  }

  if (trigger === "#") {
    return "chat.referenceExclude";
  }

  return "chat.referenceSlash";
}

export function FileReferenceAutocomplete({
  trigger,
  selectedIndex,
  onSelect,
}: FileReferenceAutocompleteProps) {
  const { t } = useTranslation();
  const { items } = useDirectorySelection();

  const pathSuggestions = useMemo(() => {
    if (trigger.trigger !== "@" && trigger.trigger !== "#") {
      return [];
    }

    const paths = getRegisteredReferencePaths(items);
    return filterReferenceSuggestions(paths, trigger.query);
  }, [items, trigger.query, trigger.trigger]);

  const slashSuggestions = useMemo(() => {
    if (trigger.trigger !== "/") {
      return [];
    }

    return filterSlashCommandSuggestions(trigger.query);
  }, [trigger.query, trigger.trigger]);

  const isSlash = trigger.trigger === "/";
  const suggestions = isSlash ? slashSuggestions : pathSuggestions;

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className="absolute bottom-full left-0 right-0 z-30 mb-2 overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md">
      <p className="border-b px-3 py-1.5 text-xs text-muted-foreground">
        {t(getHeaderKey(trigger.trigger))}
      </p>
      <ul className="max-h-48 overflow-auto py-1">
        {isSlash
          ? (suggestions as SlashCommand[]).map((command, index) => (
              <li key={command.id}>
                <button
                  type="button"
                  className={cn(
                    "flex w-full flex-col px-3 py-1.5 text-left hover:bg-accent",
                    index === selectedIndex && "bg-accent",
                  )}
                  onMouseDown={(event) => {
                    event.preventDefault();
                    onSelect(command.id);
                  }}
                >
                  <span className="text-sm">/{command.id}</span>
                  <span className="text-xs text-muted-foreground">
                    {t(command.descriptionKey)}
                  </span>
                </button>
              </li>
            ))
          : (suggestions as string[]).map((suggestion, index) => (
              <li key={suggestion}>
                <button
                  type="button"
                  className={cn(
                    "w-full px-3 py-1.5 text-left text-sm hover:bg-accent",
                    index === selectedIndex && "bg-accent",
                  )}
                  onMouseDown={(event) => {
                    event.preventDefault();
                    onSelect(suggestion);
                  }}
                >
                  {trigger.trigger}
                  {suggestion}
                </button>
              </li>
            ))}
      </ul>
    </div>
  );
}
