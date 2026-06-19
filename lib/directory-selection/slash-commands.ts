export interface SlashCommand {
  id: string;
  /** i18n key for the description shown in autocomplete */
  descriptionKey: string;
}

/** Extensible list of `/` slash commands (autocomplete applies to checkboxes only). */
export const SLASH_COMMANDS: SlashCommand[] = [
  { id: "all", descriptionKey: "chat.slashAll" },
  { id: "none", descriptionKey: "chat.slashNone" },
];

export function filterSlashCommandSuggestions(
  query: string,
  limit = 12,
): SlashCommand[] {
  const normalizedQuery = query.toLowerCase();

  return SLASH_COMMANDS.filter((command) => {
    if (normalizedQuery === "") {
      return true;
    }

    return command.id.startsWith(normalizedQuery);
  }).slice(0, limit);
}

export function isSlashCommandId(value: string): value is SlashCommand["id"] {
  return SLASH_COMMANDS.some((command) => command.id === value);
}
