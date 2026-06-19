const BASE_SYSTEM_PROMPT = "You are a helpful assistant.";

const WEB_SEARCH_INSTRUCTIONS = `You can search the web with the webSearch tool when the user needs current events, live data, or information that may not be in the provided file context.
Use web search proactively for time-sensitive questions. Cite URLs from search results when they support your answer.`;

type BuildSystemPromptOptions = {
  ragContext?: string | null;
  webSearchEnabled?: boolean;
};

export function buildSystemPrompt(
  ragContextOrOptions: string | null | BuildSystemPromptOptions = null,
): string {
  const options: BuildSystemPromptOptions =
    typeof ragContextOrOptions === "string" || ragContextOrOptions === null
      ? { ragContext: ragContextOrOptions }
      : ragContextOrOptions;

  const { ragContext = null, webSearchEnabled = false } = options;
  const sections = [BASE_SYSTEM_PROMPT];

  if (webSearchEnabled) {
    sections.push(WEB_SEARCH_INSTRUCTIONS);
  }

  if (ragContext) {
    sections.push(`Answer using the provided context from user-selected files. When you use a context block, cite its label (for example [1], [2]) in your answer. If the context is insufficient, say so.

<context>
${ragContext}
</context>`);
  }

  return sections.join("\n\n");
}
